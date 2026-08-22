import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    isPresent: {
      type: Boolean,
      required: true,
      default: false,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({ studentId: 1, courseId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ courseId: 1, date: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
