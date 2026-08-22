import SkillEvidenceGraph from '../models/SkillEvidenceGraph.js';
import { getRoleSkills, getImportanceWeight } from '../utils/skillTaxonomy.js';

/**
 * Compute readiness score for a student targeting a specific role.
 * Returns the overall weighted readiness percentage and per-skill breakdown.
 */
export async function computeReadiness(studentId, targetRole) {
  const roleData = getRoleSkills(targetRole);
  if (!roleData) {
    throw new Error(`Role "${targetRole}" not found in taxonomy`);
  }

  const segEntries = await SkillEvidenceGraph.find({ studentId });

  const skillMaxConfidence = {};
  for (const entry of segEntries) {
    if (!skillMaxConfidence[entry.skillId] || skillMaxConfidence[entry.skillId] < entry.confidenceScore) {
      skillMaxConfidence[entry.skillId] = entry.confidenceScore;
    }
  }

  let totalWeightedScore = 0;
  let totalWeight = 0;
  const skillBreakdown = [];

  for (const roleSkill of roleData.skills) {
    const weight = getImportanceWeight(roleSkill.importance);
    const currentScore = skillMaxConfidence[roleSkill.skillId] || 0;
    const gap = Math.max(0, 60 - currentScore);

    totalWeightedScore += currentScore * weight;
    totalWeight += 100 * weight;

    skillBreakdown.push({
      skillId: roleSkill.skillId,
      label: roleSkill.label,
      category: roleSkill.category,
      importance: roleSkill.importance,
      currentScore,
      gap,
      weight,
      improvementImpact: gap * weight,
    });
  }

  const overallReadiness = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) : 0;

  skillBreakdown.sort((a, b) => b.improvementImpact - a.improvementImpact);

  return {
    targetRole: roleData.roleId,
    roleLabel: roleData.label,
    overallReadiness,
    skillBreakdown,
    recommendations: skillBreakdown
      .filter(s => s.gap > 0)
      .slice(0, 5)
      .map(s => ({
        skillId: s.skillId,
        label: s.label,
        currentScore: s.currentScore,
        targetScore: 60,
        importance: s.importance,
        estimatedImpact: s.improvementImpact,
      })),
  };
}

/**
 * What-if readiness simulation without writing to DB.
 */
export async function computeWhatIfReadiness(studentId, targetRole, hypotheticalScores) {
  const roleData = getRoleSkills(targetRole);
  if (!roleData) {
    throw new Error(`Role "${targetRole}" not found in taxonomy`);
  }

  const segEntries = await SkillEvidenceGraph.find({ studentId });
  const skillMaxConfidence = {};
  for (const entry of segEntries) {
    if (!skillMaxConfidence[entry.skillId] || skillMaxConfidence[entry.skillId] < entry.confidenceScore) {
      skillMaxConfidence[entry.skillId] = entry.confidenceScore;
    }
  }

  let currentWeightedScore = 0;
  let whatIfWeightedScore = 0;
  let totalWeight = 0;

  for (const roleSkill of roleData.skills) {
    const weight = getImportanceWeight(roleSkill.importance);
    const currentScore = skillMaxConfidence[roleSkill.skillId] || 0;
    const whatIfScore = hypotheticalScores[roleSkill.skillId] !== undefined
      ? Math.max(currentScore, hypotheticalScores[roleSkill.skillId])
      : currentScore;

    currentWeightedScore += currentScore * weight;
    whatIfWeightedScore += whatIfScore * weight;
    totalWeight += 100 * weight;
  }

  const currentReadiness = totalWeight > 0 ? Math.round((currentWeightedScore / totalWeight) * 100) : 0;
  const whatIfReadiness = totalWeight > 0 ? Math.round((whatIfWeightedScore / totalWeight) * 100) : 0;

  return {
    currentReadiness,
    whatIfReadiness,
    improvement: whatIfReadiness - currentReadiness,
  };
}

export default { computeReadiness, computeWhatIfReadiness };
