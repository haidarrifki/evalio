import { GoogleGenAI } from '@google/genai';
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
      },
    });

    if (!result.text) {
      throw new Error('Model response did not contain text.');
    }

    const responseJson = JSON.parse(result.text);
    return responseJson;
  }
}
