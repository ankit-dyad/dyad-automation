import type { Page } from '@playwright/test';

export interface PdfContentResult {
  total: number;
  pages: { num: number; text: string }[];
  text: string;
}

/**
 * Downloads a PDF buffer using the browser context's authenticated request handler.
 * If no explicit url is passed, uses page.url().
 */
export async function downloadPdfBuffer(page: Page, url?: string): Promise<Buffer> {
  const targetUrl = url ?? page.url();
  console.log(`[PDF] Downloading PDF buffer from: ${targetUrl}`);
  const response = await page.context().request.get(targetUrl);
  if (!response.ok()) {
    throw new Error(`Failed to download PDF from ${targetUrl}: HTTP ${response.status()} ${response.statusText()}`);
  }
  console.log(`[PDF] Successfully downloaded PDF buffer from: ${targetUrl}`);
  return Buffer.from(await response.body());
}

/**
 * Parses the provided PDF buffer and extracts text across all pages.
 */
export async function extractPdfText(pdfBuffer: Buffer): Promise<PdfContentResult> {
  console.log(`[PDF] Parsing PDF buffer (${pdfBuffer.length} bytes)...`);
  // pdfjs-dist (used by pdf-parse) expects browser DOM APIs that Node does not provide.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { DOMMatrix, ImageData, Path2D } = require('@napi-rs/canvas');
  Object.assign(globalThis, {
    DOMMatrix: globalThis.DOMMatrix ?? DOMMatrix,
    ImageData: globalThis.ImageData ?? ImageData,
    Path2D: globalThis.Path2D ?? Path2D,
  });
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PDFParse } = require('pdf-parse');
  const parser = new PDFParse({ data: pdfBuffer });
  let result;
  try {
    result = await parser.getText();
  } finally {
    await parser.destroy();
  }
  console.log(`[PDF] Successfully extracted text from PDF (${result.total} pages).`);
  return {
    total: result.total,
    pages: result.pages,
    text: result.text,
  };
}

/**
 * Returns the extracted text of a specific 1-indexed page from a PDF buffer.
 */
export async function getPdfPageText(pdfBuffer: Buffer, pageNumber: number): Promise<string> {
  console.log(`[PDF] Extracting text for PDF page ${pageNumber}...`);
  const { pages, total } = await extractPdfText(pdfBuffer);
  const page = pages.find((p) => p.num === pageNumber);
  if (!page) {
    throw new Error(`Page ${pageNumber} not found in PDF (document has ${total} pages).`);
  }
  console.log(`[PDF] Successfully extracted ${page.text.length} characters from PDF page ${pageNumber}.`);
  return page.text;
}
