import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: [true, 'Institution ID is required'],
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Faculty ID is required'],
    },
    code: {
      type: String,
      required: [true, 'Course code is required'],
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: 200,
    },
    description: { type: String, trim: true, default: '' },
    department: { type: String, trim: true, default: '' },
    semester: { type: Number, min: 1, max: 12, default: 1 },
    year: { type: Number, min: 1, max: 6, default: 1 },
    syllabus: {
      topics: [
        {
          name: { type: String, required: true, trim: true },
          weight: { type: Number, min: 0, max: 100, default: 10 },
          subtopics: [{ type: String, trim: true }],
          skillIds: [{ type: String }],
        },
      ],
    },
    enrolledStudentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    resources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FacultyResource',
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

courseSchema.index({ institutionId: 1, code: 1 }, { unique: true });
courseSchema.index({ facultyId: 1 });

const Course = mongoose.model('Course', courseSchema);
export default Course;
