import type { Code, Heading, List, Node, Paragraph, Root, Table } from 'mdast';
import { toString as mdastToString } from 'mdast-util-to-string';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import { splitGraphemes } from 'text-segmentation';

export const estimateJinaTokenCount = (text: string): number => {
  const words = countWords(text);
  return Math.ceil(words * 1.45);
};

const countWords = (text: string): number => {
  return splitGraphemes(text).join('').trim().split(/\s+/).filter(Boolean)
    .length;
};

// --- Interfaces and Options (unchanged) ---
interface HeaderPath {
  path: string[];
  level: number;
}

interface ChunkContext {
  headerPath: HeaderPath;
  buffer: Node[];
  wordCount: number;
  tokenCount: number;
  chunks: string[];
}
export interface ChunkerOptions {
  maxTokensPerChunk?: number;
  maxWordsPerChunk?: number;
  maxWordsHeader?: number;
  pathSeparator?: string;
}

const DEFAULT_OPTIONS: Required<ChunkerOptions> = {
  maxTokensPerChunk: 512,
  maxWordsPerChunk: 100,
  maxWordsHeader: 45,
  pathSeparator: ' > ',
};

// --- The Refactored Chunker Class ---
export class GFMSemanticChunker {
  private readonly options: Required<ChunkerOptions>;
  // REFACTORED: Use a single remark processor instance
  private readonly processor: any;

  constructor(options: ChunkerOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    // REFACTORED: Initialize the processor with GFM support
    this.processor = remark().use(remarkGfm);
  }

  public chunk(input: string | Root, pageTitle: string): string[] {
    if (!input || (typeof input === 'string' && !input.trim())) {
      return [];
    }
    try {
      // The tree is now parsed using the remark processor
      const tree: Root =
        typeof input === 'string'
          ? (this.processor.parse(input) as Root)
          : input;

      if (!tree?.children?.length) return [];

      const initialContext = this.createInitialContext(pageTitle);
      const processedContext = this.processNodes(tree.children, initialContext);
      const finalContext = this.finalizeChunk(processedContext);

      return finalContext.chunks.filter((chunk) => chunk?.trim().length > 0);
    } catch (error) {
      console.error('Error during chunking:', error);
      return [];
    }
  }

  public chunkWithinTokenLimit(
    documentContent: string,
    titlePath: string,
    chunkTokenLimit: number,
    batchTokenLimit: number
  ): string[][] {
    // 1. Create a temporary chunker with the smaller, dynamic token limit
    const chunkerWithOptions = new GFMSemanticChunker({
      ...this.options,
      maxTokensPerChunk: chunkTokenLimit,
    });

    // 2. Get the flat array of individual chunks
    const allChunks = chunkerWithOptions.chunk(documentContent, titlePath);

    // 3. Batch the chunks to respect the API's request limit
    const batches: string[][] = [];
    let currentBatch: string[] = [];
    let currentBatchTokens = 0;

    for (const chunk of allChunks) {
      const chunkTokens = estimateJinaTokenCount(chunk);

      // If a single chunk is larger than the batch limit, it's an error condition
      // handled by the retry loop in JinaEmbeddings.
      if (chunkTokens > batchTokenLimit) {
        // throw new TokenLimitError(chunkTokens, batchTokenLimit);
        throw new Error(
          `Individual chunk exceeds token limit: ${chunkTokens} > ${batchTokenLimit}`
        );
      }

      // If adding the next chunk would exceed the batch limit, finalize the current batch
      if (currentBatchTokens + chunkTokens > batchTokenLimit) {
        batches.push(currentBatch);
        currentBatch = [chunk];
        currentBatchTokens = chunkTokens;
      } else {
        // Otherwise, add the chunk to the current batch
        currentBatch.push(chunk);
        currentBatchTokens += chunkTokens;
      }
    }

    // Add the last remaining batch if it's not empty
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    return batches;
  }

  // REFACTORED: This method is now gone, as parsing is handled inline in chunk()
  // The logic is replaced by this.processor.parse()

  // REFACTORED: The stringifying method now uses the remark processor
  private createChunkText(nodes: Node[], headerPath: string[]): string | null {
    if (!nodes.length) return null;
    try {
      const rootNode: Root = {
        type: 'root',
        children: nodes as Root['children'],
      };
      const content = String(this.processor.stringify(rootNode)).trim();

      if (!content) return null;

      const formattedPath = this.formatHeaderPath(headerPath);
      return formattedPath ? `${formattedPath}\n\n${content}` : content;
    } catch (error) {
      console.error('Error creating chunk text:', error);
      return null;
    }
  }

  // --- ALL CORE CHUNKING LOGIC BELOW REMAINS IDENTICAL ---
  // The logic operates on the mdast tree, which remark provides,
  // so no changes are needed here.

  private processNodes(nodes: Node[], context: ChunkContext): ChunkContext {
    let currentContext = context;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]!;
      const nextNode = nodes[i + 1];
      const thirdNode = nodes[i + 2];

      if (this.isCvExperienceBlock(node, nextNode, thirdNode)) {
        currentContext = this.finalizeChunk(currentContext);
        const experienceGroup: Root = {
          type: 'root',
          children: [node, nextNode!, thirdNode!] as Root['children'],
        };
        currentContext = this.addToBuffer(experienceGroup, currentContext);
        i += 2;
        continue;
      }

      if (this.isHeading(node)) {
        currentContext = this.handleHeading(node, currentContext);
      } else if (this.isCodeBlock(node)) {
        currentContext = this.handleAtomicBlock(node, currentContext);
      } else if (this.isTable(node)) {
        currentContext = this.handleAtomicBlock(node, currentContext);
      } else if (this.isList(node)) {
        currentContext = this.handleList(node, currentContext);
      } else if ('children' in node) {
        currentContext = this.processNodes(
          (node as Root).children,
          currentContext
        );
      } else {
        currentContext = this.addToBuffer(node, currentContext);
      }
    }
    return currentContext;
  }

  private isCvExperienceBlock(
    node: Node,
    nextNode?: Node,
    thirdNode?: Node
  ): boolean {
    if (!node || !nextNode || !thirdNode) return false;
    return (
      node.type === 'paragraph' &&
      (node as Paragraph).children.length === 1 &&
      (node as Paragraph).children[0]?.type === 'strong' &&
      nextNode.type === 'paragraph' &&
      thirdNode.type === 'list'
    );
  }

  private handleHeading(node: Heading, context: ChunkContext): ChunkContext {
    const newContext = this.finalizeChunk(context);
    const headingText = mdastToString(node).trim();
    const level = node.depth;
    const newPath = newContext.headerPath.path.slice(0, level - 1);
    newPath.push(headingText);
    newContext.headerPath = { path: newPath, level };
    return this.addToBuffer(node, newContext);
  }

  private handleAtomicBlock(node: Node, context: ChunkContext): ChunkContext {
    const text = mdastToString(node);
    const words = countWords(text);
    const tokens = estimateJinaTokenCount(text);

    if (
      words > this.options.maxWordsPerChunk ||
      tokens > this.options.maxTokensPerChunk
    ) {
      const finalizedContext = this.finalizeChunk(context);
      const selfChunkContext = this.addToBuffer(node, finalizedContext);
      return this.finalizeChunk(selfChunkContext);
    }

    if (
      context.wordCount + words > this.options.maxWordsPerChunk ||
      context.tokenCount + tokens > this.options.maxTokensPerChunk
    ) {
      const finalizedContext = this.finalizeChunk(context);
      return this.addToBuffer(node, finalizedContext);
    }

    return this.addToBuffer(node, context);
  }

  private handleList(node: List, context: ChunkContext): ChunkContext {
    let currentContext = context;
    for (const item of node.children) {
      const listItem: List = { ...node, children: [item] };
      currentContext = this.addToBuffer(listItem, currentContext);
    }
    return currentContext;
  }

  private addToBuffer(node: Node, context: ChunkContext): ChunkContext {
    const text = mdastToString(node);
    if (!text.trim()) return context;

    const words = countWords(text);
    const tokens = estimateJinaTokenCount(text);

    if (
      context.buffer.length > 0 &&
      (context.wordCount + words > this.options.maxWordsPerChunk ||
        context.tokenCount + tokens > this.options.maxTokensPerChunk)
    ) {
      const newContext = this.finalizeChunk(context);
      return {
        ...newContext,
        buffer: [node],
        wordCount: words,
        tokenCount: tokens,
      };
    }

    return {
      ...context,
      buffer: [...context.buffer, node],
      wordCount: context.wordCount + words,
      tokenCount: context.tokenCount + tokens,
    };
  }

  private finalizeChunk(context: ChunkContext): ChunkContext {
    if (context.buffer.length === 0) {
      return context;
    }
    const chunkContent = this.createChunkText(
      context.buffer,
      context.headerPath.path
    );
    const newChunks = chunkContent
      ? [...context.chunks, chunkContent]
      : context.chunks;
    return {
      ...context,
      buffer: [],
      wordCount: 0,
      tokenCount: 0,
      chunks: newChunks,
    };
  }

  private createInitialContext = (pageTitle: string): ChunkContext => ({
    headerPath: { path: pageTitle ? [pageTitle] : [], level: 0 },
    buffer: [],
    wordCount: 0,
    tokenCount: 0,
    chunks: [],
  });

  private formatHeaderPath = (path: string[]): string => {
    if (!path.length) return '';
    const fullPath = path.join(this.options.pathSeparator);
    return countWords(fullPath) > this.options.maxWordsHeader
      ? [path[0], '...', ...path.slice(-2)].join(this.options.pathSeparator)
      : fullPath;
  };

  private isHeading = (node: Node): node is Heading => node.type === 'heading';
  private isTable = (node: Node): node is Table => node.type === 'table';
  private isList = (node: Node): node is List => node.type === 'list';
  private isCodeBlock = (node: Node): node is Code => node.type === 'code';
}
