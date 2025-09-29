import { Blob } from 'buffer'; // Use Blob from buffer for Node.js environments
import { Chromiumly, LibreOffice } from 'chromiumly';

// 1. Configure Chromiumly once at the module level.
// This is cleaner than manually creating auth headers for each request.
const GOTENBERG_ENDPOINT = process.env.GOTENBERG_URL ?? '';
const GOTENBERG_USERNAME = process.env.GOTENBERG_USERNAME ?? '';
const GOTENBERG_PASSWORD = process.env.GOTENBERG_PASSWORD ?? '';

Chromiumly.configure({
  endpoint: GOTENBERG_ENDPOINT,
  username: GOTENBERG_USERNAME,
  password: GOTENBERG_PASSWORD,
});

// Helper to convert input content (Blob or Buffer) into a Buffer.
const contentToBuffer = async (content: Blob | Buffer): Promise<Buffer> => {
  let buffer: Buffer;

  if (content instanceof Blob) {
    const arrayBuffer = await content.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } else {
    buffer = content;
  }

  return buffer;
};

// Mapping of mime types to file extensions remains the same.
const mimeTypeToExtension = {
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    'pptx',
  'text/plain': 'txt',
  'text/csv': 'csv',
  'text/html': 'html',
  'application/rtf': 'rtf',
  'application/vnd.oasis.opendocument.text': 'odt',
  'application/vnd.oasis.opendocument.spreadsheet': 'ods',
  'application/vnd.oasis.opendocument.presentation': 'odp',
  'application/pdf': 'pdf',
} as const;

/**
 * PDF conversion client using Chromiumly to interact with Gotenberg.
 * Compatible with Gotenberg 8.
 */
export const GotenbergClient = {
  /**
   * Convert an Office document to a PDF Buffer.
   * @param content Document content as Blob or Buffer.
   * @param mimeType MIME type of the document.
   * @returns PDF content as a Buffer.
   */
  convertOfficeToPdf: async (
    content: Blob | Buffer,
    mimeType: string
  ): Promise<Buffer> => {
    // Get file extension based on MIME type.
    const extension =
      mimeTypeToExtension[mimeType as keyof typeof mimeTypeToExtension];
    if (!extension) {
      throw new Error(`Unsupported MIME type: ${mimeType}`);
    }

    // Convert the input content to a Buffer for Chromiumly.
    const fileBuffer = await contentToBuffer(content);

    // 2. Use the direct 'LibreOffice.convert' method.
    // The API is straightforward: provide an array of file objects.
    const pdfBuffer = await LibreOffice.convert({
      files: [{ data: fileBuffer, ext: extension }],
    });

    return pdfBuffer;
  },

  /**
   * Convert a PDF Buffer to a Blob for client-side use (e.g., downloading).
   * @param buffer PDF buffer from a conversion.
   * @returns PDF content as a Blob.
   */
  bufferToBlob: (buffer: Buffer): Blob => {
    return new Blob([buffer], { type: 'application/pdf' });
  },
};

// Export the list of supported formats for convenience.
export const SUPPORTED_OFFICE_FORMATS = Object.keys(mimeTypeToExtension).filter(
  (type) => type !== 'application/pdf' && type !== 'text/html'
);
