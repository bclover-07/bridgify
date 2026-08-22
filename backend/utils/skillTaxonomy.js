import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const taxonomyPath = join(__dirname, '..', 'data', 'skillTaxonomy.json');
const taxonomyData = JSON.parse(readFileSync(taxonomyPath, 'utf-8'));

const skills = taxonomyData.skills;
const roles = taxonomyData.roles;

export function getSkill(skillId) {
  const skill = skills[skillId];
  if (!skill) return null;
  return { id: skillId, ...skill };
}

export function getAllSkills() {
  return Object.entries(skills).map(([id, data]) => ({ id, ...data }));
}

export function getSkillsByCategory(category) {
  return Object.entries(skills)
    .filter(([, data]) => data.category === category)
    .map(([id, data]) => ({ id, ...data }));
}

export function getSkillsByDomain(domain) {
  return Object.entries(skills)
    .filter(([, data]) => data.domain === domain)
    .map(([id, data]) => ({ id, ...data }));
}

export function getRoleSkills(roleId) {
  const role = roles[roleId];
  if (!role) return null;
  return {
    roleId,
    label: role.label,
    skills: role.skills.map((rs) => {
      const skillData = skills[rs.skillId];
      return {
        skillId: rs.skillId,
        importance: rs.importance,
        label: skillData ? skillData.label : rs.skillId,
        category: skillData ? skillData.category : 'unknown',
        domain: skillData ? skillData.domain : 'unknown',
        nsqf: skillData ? skillData.nsqf : 0,
      };
    }),
  };
}

export function getAllRoles() {
  return Object.entries(roles).map(([roleId, data]) => ({
    roleId,
    label: data.label,
    skillCount: data.skills.length,
  }));
}

export function getImportanceWeight(importance) {
  const weights = {
    core: 1.0,
    important: 0.6,
    nice_to_have: 0.3,
  };
  return weights[importance] || 0.3;
}

export function searchSkills(query) {
  const lowerQuery = query.toLowerCase();
  return Object.entries(skills)
    .filter(
      ([id, data]) =>
        id.toLowerCase().includes(lowerQuery) ||
        data.label.toLowerCase().includes(lowerQuery) ||
        data.domain.toLowerCase().includes(lowerQuery)
    )
    .map(([id, data]) => ({ id, ...data }));
}

export default {
  getSkill,
  getAllSkills,
  getSkillsByCategory,
  getSkillsByDomain,
  getRoleSkills,
  getAllRoles,
  getImportanceWeight,
  searchSkills,
};
