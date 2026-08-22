import User from '../models/User.js';

export async function aggregateFullStudentProfile(studentId) {
  const mongoose = (await import('mongoose')).default;
  const studentObjectId = mongoose.Types.ObjectId.createFromHexString(String(studentId));

  const pipeline = [
    { $match: { _id: studentObjectId } },
    { $project: { passwordHash: 0 } },
    {
      $lookup: {
        from: 'institutions',
        localField: 'institutionId',
        foreignField: '_id',
        as: 'institution',
      },
    },
    { $unwind: { path: '$institution', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'skillevidencegraphs',
        let: { sid: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$studentId', '$$sid'] } } },
          { $sort: { confidenceScore: -1 } },
          {
            $lookup: {
              from: 'courses',
              localField: 'courseId',
              foreignField: '_id',
              as: 'course',
            },
          },
          { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
        ],
        as: 'seg',
      },
    },
    {
      $lookup: {
        from: 'submissions',
        let: { sid: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$studentId', '$$sid'] } } },
          { $sort: { createdAt: -1 } },
          {
            $lookup: {
              from: 'assessments',
              localField: 'assessmentId',
              foreignField: '_id',
              as: 'assessment',
            },
          },
          { $unwind: { path: '$assessment', preserveNullAndEmptyArrays: true } },
        ],
        as: 'submissions',
      },
    },
    {
      $lookup: {
        from: 'attendances',
        let: { sid: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$studentId', '$$sid'] } } },
          {
            $group: {
              _id: '$courseId',
              total: { $sum: 1 },
              present: { $sum: { $cond: ['$isPresent', 1, 0] } },
            },
          },
        ],
        as: 'attendance',
      },
    },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: 'enrolledStudentIds',
        as: 'courses',
      },
    },
    {
      $lookup: {
        from: 'notifications',
        let: { sid: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$userId', '$$sid'] } } },
          { $sort: { createdAt: -1 } },
          { $limit: 20 },
        ],
        as: 'notifications',
      },
    },
  ];

  const results = await User.aggregate(pipeline);
  return results[0] || null;
}
