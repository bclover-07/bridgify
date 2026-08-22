import DriveEvent from '../models/DriveEvent.js';
import User from '../models/User.js';

export async function aggregatePlacementCC(institutionId) {
  const mongoose = (await import('mongoose')).default;
  const instObjectId = mongoose.Types.ObjectId.createFromHexString(String(institutionId));

  const pipeline = [
    { $match: { institutionId: instObjectId } },
    { $unwind: '$registrations' },
    {
      $group: {
        _id: '$registrations.stage',
        count: { $sum: 1 },
        students: { $push: '$registrations.studentId' },
      },
    },
  ];

  const stageCounts = await DriveEvent.aggregate(pipeline);

  const formattedPipeline = {
    not_ready: 0, ready: 0, applied: 0, shortlisted: 0, interview: 0, offered: 0, placed: 0, rejected: 0,
  };

  for (const st of stageCounts) {
    if (formattedPipeline[st._id] !== undefined) {
      formattedPipeline[st._id] = st.count;
    }
  }

  // Also get the active drives with recruiter details
  const drives = await DriveEvent.find({ institutionId: instObjectId })
    .sort({ driveDate: -1 })
    .populate('recruiterId', 'name recruiter.company')
    .lean();

  return { pipeline: formattedPipeline, totalDrives: drives.length, drives };
}
