import SkillEvidenceGraph from '../models/SkillEvidenceGraph.js';
import { cosineSimilarity } from './embeddings.js';

/**
 * Search SEG entries using Atlas Vector Search.
 * Falls back to in-memory cosine similarity if the vector index doesn't exist.
 */
export async function vectorSearchSEG(queryEmbedding, filters = {}, limit = 20) {
  const isValidEmbedding = Array.isArray(queryEmbedding) &&
    queryEmbedding.length === 384 &&
    queryEmbedding.some(v => v !== 0);

  if (!isValidEmbedding) {
    return [];
  }

  try {
    const results = await SkillEvidenceGraph.aggregate([
      {
        $vectorSearch: {
          index: 'seg_vector_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 150,
          limit,
          filter: filters,
        },
      },
      {
        $project: {
          studentId: 1,
          skillId: 1,
          skillLabel: 1,
          skillCategory: 1,
          confidenceScore: 1,
          evidenceType: 1,
          evidenceWeight: 1,
          verifiedAt: 1,
          verificationMethod: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ]);

    return results;
  } catch (error) {
    if (error.message?.includes('vectorSearch') ||
        error.message?.includes('index') ||
        error.codeName === 'InvalidPipelineOperator') {
      console.warn('Atlas Vector Search unavailable, using cosine similarity fallback');
      return fallbackVectorSearch(queryEmbedding, filters, limit);
    }
    throw error;
  }
}

/**
 * Fallback: in-memory cosine similarity search.
 * Fetches SEG entries matching filters, computes similarity, returns ranked results.
 */
async function fallbackVectorSearch(queryEmbedding, filters = {}, limit = 20) {
  const mongoFilter = { ...filters };
  mongoFilter.embedding = { $exists: true, $ne: [] };

  const entries = await SkillEvidenceGraph.find(mongoFilter)
    .select('studentId skillId skillLabel skillCategory confidenceScore evidenceType evidenceWeight verifiedAt verificationMethod embedding')
    .limit(500)
    .lean();

  const scored = entries
    .map(entry => {
      const similarity = cosineSimilarity(queryEmbedding, entry.embedding);
      return {
        studentId: entry.studentId,
        skillId: entry.skillId,
        skillLabel: entry.skillLabel,
        skillCategory: entry.skillCategory,
        confidenceScore: entry.confidenceScore,
        evidenceType: entry.evidenceType,
        evidenceWeight: entry.evidenceWeight,
        verifiedAt: entry.verifiedAt,
        verificationMethod: entry.verificationMethod,
        score: similarity,
      };
    })
    .filter(r => r.score > 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

/**
 * Search candidates by semantic similarity to a job description.
 * Groups results by student and computes aggregate match scores.
 */
export async function semanticCandidateSearch(queryEmbedding, structuredFilters = {}, limit = 20) {
  const vectorResults = await vectorSearchSEG(queryEmbedding, {}, limit * 5);

  const studentMap = {};
  for (const result of vectorResults) {
    const sid = String(result.studentId);
    if (!studentMap[sid]) {
      studentMap[sid] = {
        studentId: result.studentId,
        matchedSkills: [],
        totalScore: 0,
        count: 0,
      };
    }
    studentMap[sid].matchedSkills.push({
      skillId: result.skillId,
      skillLabel: result.skillLabel,
      confidenceScore: result.confidenceScore,
      vectorScore: result.score,
    });
    studentMap[sid].totalScore += result.score * (result.confidenceScore / 100);
    studentMap[sid].count += 1;
  }

  const candidates = Object.values(studentMap)
    .map(c => ({
      ...c,
      matchScore: c.count > 0 ? Math.round((c.totalScore / c.count) * 100) : 0,
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return candidates;
}

export default { vectorSearchSEG, semanticCandidateSearch };
