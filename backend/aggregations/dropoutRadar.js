import User from '../models/User.js';

export async function aggregateDropoutRadar(courseId) {
  const mongoose = (await import('mongoose')).default;
  const courseObjectId = mongoose.Types.ObjectId.createFromHexString(String(courseId));

  const pipeline = [
    // 1. Match students enrolled in the course
    {
      $match: { role: 'student', isActive: true, 'student.placementStatus': { $ne: 'placed' } },
    },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: 'enrolledStudentIds',
        as: 'enrolledCourses',
      },
    },
    {
      $match: { 'enrolledCourses._id': courseObjectId },
    },
    // 2. Lookup attendance
    {
      $lookup: {
        from: 'attendances',
        let: { studentId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$studentId', '$$studentId'] },
                  { $eq: ['$courseId', courseObjectId] },
                  // filter last 30 days
                  { $gte: ['$date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] }
                ]
              }
            }
          }
        ],
        as: 'recentAttendance'
      }
    },
    // 3. Lookup submissions
    {
      $lookup: {
        from: 'submissions',
        let: { studentId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$studentId', '$$studentId'] } } },
          {
            $lookup: {
              from: 'assessments',
              localField: 'assessmentId',
              foreignField: '_id',
              as: 'assessment'
            }
          },
          { $unwind: '$assessment' },
          { $match: { 'assessment.courseId': courseObjectId } },
          { $sort: { submittedAt: -1 } }
        ],
        as: 'courseSubmissions'
      }
    },
    // Lookup total published assessments in this course
    {
      $lookup: {
        from: 'assessments',
        pipeline: [
          { $match: { courseId: courseObjectId, status: 'published' } }
        ],
        as: 'totalAssessments'
      }
    },
    // 4. Lookup SEG
    {
      $lookup: {
        from: 'skillevidencegraphs',
        let: { studentId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$studentId', '$$studentId'] },
                  { $eq: ['$courseId', courseObjectId] }
                ]
              }
            }
          }
        ],
        as: 'segEntries'
      }
    },
    // 5. Add fields to compute base metrics
    {
      $addFields: {
        totalDays: { $max: [{ $size: '$recentAttendance' }, 1] },
        presentDays: {
          $size: {
            $filter: { input: '$recentAttendance', as: 'a', cond: '$$a.isPresent' }
          }
        },
        recentScores: {
          $map: {
            input: { $slice: ['$courseSubmissions', 0, 3] },
            as: 'sub',
            in: '$$sub.percentage'
          }
        },
        olderScores: {
          $map: {
            input: { $slice: ['$courseSubmissions', 3, 3] },
            as: 'sub',
            in: '$$sub.percentage'
          }
        },
        submissionCount: { $size: '$courseSubmissions' },
        totalPublishedAssessments: { $size: '$totalAssessments' },
        avgConfidence: {
          $cond: {
            if: { $gt: [{ $size: '$segEntries' }, 0] },
            then: { $avg: '$segEntries.confidenceScore' },
            else: 0
          }
        }
      }
    },
    // 6. Compute derived signals (attendance_drop, score_decline, submission_gap, engagement_drop)
    {
      $addFields: {
        attendanceRate: { $divide: ['$presentDays', '$totalDays'] },
        attendanceDrop: { $subtract: [1, { $divide: ['$presentDays', '$totalDays'] }] },
        recentAvg: {
          $cond: {
            if: { $gt: [{ $size: '$recentScores' }, 0] },
            then: { $avg: '$recentScores' },
            else: 50
          }
        },
        olderAvg: {
          $cond: {
            if: { $gt: [{ $size: '$olderScores' }, 0] },
            then: { $avg: '$olderScores' },
            else: 50
          }
        },
        submissionGap: {
          $cond: {
            if: { $gt: ['$totalPublishedAssessments', 0] },
            then: { $max: [0, { $subtract: [1, { $divide: ['$submissionCount', '$totalPublishedAssessments'] }] }] },
            else: 0
          }
        },
        engagementDrop: { $max: [0, { $subtract: [1, { $divide: ['$avgConfidence', 100] }] }] },
        financialStressFlag: 0 // Placeholder
      }
    },
    // 7. Compute score decline
    {
      $addFields: {
        scoreDecline: {
          $max: [0, { $divide: [{ $subtract: ['$olderAvg', '$recentAvg'] }, 100] }]
        }
      }
    },
    // 8. Apply exact risk formula
    {
      $addFields: {
        riskScoreRaw: {
          $add: [
            { $multiply: [0.35, '$attendanceDrop'] },
            { $multiply: [0.25, '$scoreDecline'] },
            { $multiply: [0.20, '$submissionGap'] },
            { $multiply: [0.15, '$engagementDrop'] },
            { $multiply: [0.05, '$financialStressFlag'] }
          ]
        }
      }
    },
    // 9. Format output
    {
      $project: {
        studentId: '$_id',
        name: 1,
        email: 1,
        rollNo: '$student.rollNo',
        branch: '$student.branch',
        cgpa: '$student.cgpa',
        riskPercentage: { $round: [{ $multiply: ['$riskScoreRaw', 100] }, 0] },
        riskLevel: {
          $switch: {
            branches: [
              { case: { $gte: [{ $multiply: ['$riskScoreRaw', 100] }, 70] }, then: 'HIGH' },
              { case: { $gte: [{ $multiply: ['$riskScoreRaw', 100] }, 40] }, then: 'MEDIUM' }
            ],
            default: 'LOW'
          }
        },
        signals: {
          attendanceDrop: { $round: [{ $multiply: ['$attendanceDrop', 100] }, 0] },
          scoreDecline: { $round: [{ $multiply: ['$scoreDecline', 100] }, 0] },
          submissionGap: { $round: [{ $multiply: ['$submissionGap', 100] }, 0] },
          engagementDrop: { $round: [{ $multiply: ['$engagementDrop', 100] }, 0] },
          financialStress: { $literal: 0 }
        },
        attendanceRate: { $round: [{ $multiply: ['$attendanceRate', 100] }, 0] },
        recentAvgScore: { $round: ['$recentAvg', 0] }
      }
    },
    { $sort: { riskPercentage: -1 } }
  ];

  return User.aggregate(pipeline);
}
