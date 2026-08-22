import { otariCallWithRetry } from './otariCall.js';
import { callEmbedding } from '../config/otari.js';

/**
 * Generate a 384-dimensional embedding for the given text.
 * Uses HuggingFace sentence-transformers/all-MiniLM-L6-v2 via Otari routing.
 * @param {string} text - Text to embed
 * @param {string} [userId] - Optional userId for AgentRun logging
 * @returns {Promise<number[]>} 384-dim embedding vector
 */
export async function embedText(text, userId = null) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return new Array(384).fill(0);
  }

  try {
    if (userId) {
      const result = await otariCallWithRetry({
        route: 'embedding.generate',
        prompt: text.trim().substring(0, 1000),
        userId,
        maxRetries: 1,
      });
      return result.embedding || new Array(384).fill(0);
    }

    const embedding = await callEmbedding(text.trim().substring(0, 1000));

    if (Array.isArray(embedding) && embedding.length === 384) {
      return embedding;
    }
    if (Array.isArray(embedding) && Array.isArray(embedding[0])) {
      return embedding[0];
    }
    return new Array(384).fill(0);
  } catch (error) {
    console.error('embedText failed:', error.message);
    return new Array(384).fill(0);
  }
}

/**
 * Compose a SEG embedding string from skill evidence fields.
 * This standardized format makes vector search meaningful.
 */
export function composeSEGEmbeddingText(entry) {
  const parts = [
    entry.skillLabel || '',
    entry.skillCategory || '',
    entry.skillDomain || '',
    entry.evidenceType || '',
    `confidence:${entry.confidenceScore || 0}`,
    entry.nsqfLevel ? `nsqf:${entry.nsqfLevel}` : '',
  ].filter(Boolean);

  return parts.join(' ');
}

/**
 * Compute cosine similarity between two vectors.
 * Used as fallback when Atlas Vector Search index is not available.
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
}

export default { embedText, composeSEGEmbeddingText, cosineSimilarity };
