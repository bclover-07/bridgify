import SkillEvidenceGraph from '../models/SkillEvidenceGraph.js';
import User from '../models/User.js';

export async function aggregateCohortHeatmap(courseId) {
  const mongoose = (await import('mongoose')).default;
  const courseObjectId = mongoose.Types.ObjectId.createFromHexString(String(courseId));

  const heatmapData = await SkillEvidenceGraph.aggregate([
    { $match: { courseId: courseObjectId } },
    {
      $group: {
        _id: { studentId: '$studentId', skillId: '$skillId' },
        avgConfidence: { $avg: '$confidenceScore' },
        maxConfidence: { $max: '$confidenceScore' },
        skillLabel: { $first: '$skillLabel' },
      },
    },
    {
      $group: {
        _id: '$_id.skillId',
        skillLabel: { $first: '$skillLabel' },
        students: {
          $push: {
            studentId: '$_id.studentId',
            confidence: '$maxConfidence',
          },
        },
        cohortAvg: { $avg: '$maxConfidence' },
      },
    },
    { $sort: { cohortAvg: 1 } },
  ]);

  const studentIds = [...new Set(heatmapData.flatMap((s) => s.students.map((st) => String(st.studentId))))];
  const studentNames = await User.find({ _id: { $in: studentIds } }).select('name student.rollNo').lean();
  const nameMap = {};
  for (const s of studentNames) {
    nameMap[String(s._id)] = s.name;
  }

  return heatmapData.map((skill) => ({
    ...skill,
    students: skill.students.map((st) => ({
      ...st,
      name: nameMap[String(st.studentId)] || 'Unknown',
    })),
    cohortAvg: Math.round(skill.cohortAvg),
  }));
}
