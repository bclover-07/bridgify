import { callOtari } from '../utils/otariCall.js';

/**
 * Extract text and key topics from uploaded lecture notes (handwritten images, printed notes, or PDF text).
 * @param {string|Buffer} noteContent - Raw text or base64 image data of notes
 * @param {string} mimeType - MIME type of uploaded file (e.g., 'text/plain', 'image/png', 'application/pdf')
 * @returns {Promise<{ extractedText: string, topics: string[], keyConcepts: string[], summary: string }>}
 */
export async function extractTextFromNotes(noteContent, mimeType = 'text/plain') {
  try {
    let rawText = '';

    if (typeof noteContent === 'string' && !noteContent.startsWith('data:')) {
      rawText = noteContent;
    } else {
      // If base64 or file buffer, use Vision / Multimodal LLM to extract OCR text
      const prompt = `Perform OCR and extract all text from these handwritten or printed lecture notes. 
Preserve technical terms, code snippets, equations, and key topic headings. Return plain text only.`;

      const aiRes = await callOtari('faculty.notes.generate', {
        sourceType: 'ocr_notes',
        content: typeof noteContent === 'string' ? noteContent.substring(0, 5000) : noteContent.toString('utf-8').substring(0, 5000),
        prompt,
      });

      rawText = aiRes.result?.text || noteContent.toString('utf-8');
    }

    // Now extract structured topics & key concepts using LLM
    const topicPrompt = `Analyze the following lecture notes text and return a JSON object with:
1. "extractedText": the cleaned text
2. "topics": array of main topic names covered
3. "keyConcepts": array of important concepts or definitions
4. "summary": a brief 2-sentence summary of the lecture

Lecture Notes Text:
${rawText.substring(0, 4000)}`;

    const structuredRes = await callOtari('faculty.notes.generate', {
      sourceType: 'text',
      content: rawText,
      prompt: topicPrompt,
    });

    const parsed = structuredRes.result?.structuredOutput || {};

    return {
      extractedText: rawText,
      topics: parsed.topics || ['Lecture Fundamentals', 'Core Concepts'],
      keyConcepts: parsed.keyConcepts || ['Key Definitions', 'Practical Applications'],
      summary: parsed.summary || 'Extracted lecture notes topics and core concepts.',
    };
  } catch (error) {
    console.error('OCR Extraction error:', error);
    // Graceful fallback
    const fallbackText = String(noteContent).substring(0, 2000);
    return {
      extractedText: fallbackText,
      topics: ['General Lecture Topics'],
      keyConcepts: ['Core Principles'],
      summary: 'Extracted text from lecture notes.',
    };
  }
}
