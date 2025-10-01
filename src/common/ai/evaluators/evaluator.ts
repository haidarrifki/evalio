import { GoogleGenAI } from '@google/genai';
import type {
  DetailedScore,
  DetailedScoreCreate,
} from '@/api/detailedScore/detailedScoreModel';
import { env } from '@/common/utils/envConfig';

export class Evaluator {
  private readonly ai = new GoogleGenAI({
    apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY!,
  });

  public async evaluateCv(
    parameter: string,
    details: { weight: number; description: string; scoring_guide: string },
    cvText: string,
    jobDescText: string
  ) {
    const systemInstruction =
      'You are an expert technical recruiter who always responds in valid, raw JSON format without markdown.';
    const prompt = `
      Evaluate the provided CV for the parameter: '${parameter}'.
      
      **Job Description Context:**
      ---
      ${jobDescText}
      ---

      **CV Content:**
      ---
      ${cvText}
      ---
      
      **Scoring Guide (1-5 scale):** ${details.scoring_guide}
      
      Return a single, valid JSON object with two keys: "score" (a number from 1 to 5) and "justification" (a brief string explaining the score).
    `;

    const result = await this.ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    if (!result.text) {
      throw new Error('Model response did not contain text.');
    }

    console.log('>>> EVALUATE CV');
    console.log(result.text);

    const responseJson = JSON.parse(result.text);
    return responseJson;
  }

  public async evaluateProject(
    parameter: string,
    details: { weight: number; description: string; scoring_guide: string },
    projectReportText: string,
    jobDescText: string
  ): Promise<{ score: number; justification: string }> {
    const systemInstruction =
      'You are an expert technical lead reviewing a project submission. Always respond in valid, raw JSON format without markdown.';

    const prompt = `
      Evaluate the provided Project Report for the parameter: '${parameter}'.
      The project was completed in the context of the following job description.

      **Parameter Description:** ${details.description}

      **Job Description Context:**
      ---
      ${jobDescText}
      ---

      **Project Report Content:**
      ---
      ${projectReportText}
      ---

      **Scoring Guide (1-5 scale):** ${details.scoring_guide}

      Return a single, valid JSON object with "score" (a number from 1 to 5) and "justification" (a brief explanation).
    `;
    const result = await this.ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    if (!result.text) {
      throw new Error('Model response did not contain text.');
    }

    const responseJson = JSON.parse(result.text);
    return responseJson;
  }

  // In your Evaluator class
  public async summarizeFeedback(
    detailedScores: DetailedScoreCreate[], // Should contain feedback property
    documentType: 'CV' | 'Project'
  ): Promise<string> {
    const systemInstruction =
      'You are a helpful recruiting assistant summarizing feedback.';

    const prompt = `
    Based on the following detailed feedback items for a candidate's ${documentType}, 
    write a one-sentence summary of the feedback. Focus on the most critical strength or area for improvement.

    **Detailed Feedback:**
    ---
    ${JSON.stringify(
      detailedScores.map((s) => s.justification),
      null,
      2
    )}
    ---

    Provide only the summary sentence as a raw string.
  `;

    const result = await this.ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    return result.text ?? 'No feedback summary could be generated.';
  }

  public async summarizeEvaluation(
    detailedScores: DetailedScoreCreate[]
  ): Promise<string> {
    const systemInstruction =
      'You are an expert hiring manager providing a final summary.';

    const prompt = `
      Based on the following detailed evaluation scores and justifications, write a concise, 3-5 sentence overall summary for the candidate. 
      Focus on their key strengths, notable gaps, and a final recommendation regarding their fit for the role.

      **Detailed Evaluation:**
      ---
      ${JSON.stringify(detailedScores, null, 2)}
      ---

      Provide only the summary text as a raw string.
    `;

    const result = await this.ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    if (!result.text) {
      throw new Error('Model response did not contain text.');
    }

    return result.text;
  }
}
