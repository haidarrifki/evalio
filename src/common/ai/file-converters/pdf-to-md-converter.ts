import { GoogleGenAI, type Part } from '@google/genai';
import { env } from '@/common/utils/envConfig';

const pdfToMdSystemPrompt = `\
You are an expert AI specializing in converting structured documents like CVs, resumes, and technical reports into precise Markdown. Your primary goal is to understand and preserve the logical flow and semantic hierarchy of the document, not just its visual, multi-column layout.

- **Logical Section Ordering:** Identify distinct sections (e.g., Profile, Skills, Experience, Education, Projects) and ensure they are presented in a coherent, logical order in the final Markdown. All entries within a single section, like 'Experience', must be grouped together.
- **Text Content:** Extract all text and format it cleanly, maintaining paragraphs and lists.
- **Headings:** Use correct Markdown heading syntax (#, ##, etc.) reflecting the document's hierarchy.
- **Lists:** Convert all bulleted and numbered lists accurately.
- **Text Formatting:** Preserve bold, italic, and other text formatting.
- **Links:** Convert hyperlinks into proper Markdown format.
- **Images:** For each image, use an HTML <img> tag:
  - Use \`src="[image-placeholder]"\`.
  - Write a concise, descriptive executive summary of the image's content for the \`alt\` attribute. For graphs, summarize the data and its key takeaways.
- **Tables:** Convert tables into Markdown format with correct alignment.
- **Clarity and Syntax:** Use standard, readable Markdown. Do not add any personal opinions, commentary, or text that wasn't in the original document.

VERY IMPORTANT: The output must be ONLY the raw Markdown content. DO NOT wrap the output in triple backticks (\`\`\`) under any circumstances.
`;

export class PdfToMarkdownConverter {
  private readonly ai = new GoogleGenAI({
    apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY!,
  });

  /**
   * Removes any triple backticks that might be surrounding the markdown content
   */
  private postProcessMarkdown(text: string): string {
    const trimmedText = text.trim();
    if (
      (trimmedText.startsWith('```markdown') ||
        trimmedText.startsWith('```md')) &&
      trimmedText.endsWith('```')
    ) {
      return trimmedText
        .substring(
          trimmedText.indexOf('\n') + 1,
          trimmedText.lastIndexOf('```')
        )
        .trim();
    }
    if (trimmedText.startsWith('```') && trimmedText.endsWith('```')) {
      return trimmedText.substring(3, trimmedText.length - 3).trim();
    }
    return text;
  }

  async convert(pdfBlob: Blob): Promise<string> {
    try {
      if (pdfBlob.type !== 'application/pdf') {
        throw new Error('Input must be a PDF Blob.');
      }

      const pdfArrayBuffer = await pdfBlob.arrayBuffer();
      const pdfBase64 = Buffer.from(pdfArrayBuffer).toString('base64');

      const parts: Part[] = [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: pdfBase64,
          },
        },
        {
          text: 'Convert this CV PDF into a clean, well-structured Markdown document. Pay close attention to the logical order of all sections.',
        },
      ];

      const result = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: parts,
        config: {
          systemInstruction: pdfToMdSystemPrompt,
        },
      });

      // Check if response text exists
      if (!result.text) {
        throw new Error('Model response did not contain text.');
      }

      // Apply post-processing to remove any triple backticks
      const processedText = this.postProcessMarkdown(result.text);

      return processedText;
    } catch (error) {
      console.error('Error converting PDF to markdown:', error);
      throw error;
    }
  }
}
