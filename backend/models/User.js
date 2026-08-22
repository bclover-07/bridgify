import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: ['student', 'faculty', 'admin', 'recruiter'],
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      default: null,
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
    onboarded: { type: Boolean, default: false },
    avatar: { type: String, default: '' },
    preferredLanguage: {
      type: String,
      enum: ['en', 'hi', 'mr', 'te', 'ta'],
      default: 'en',
    },

    student: {
      rollNo: { type: String, trim: true },
      branch: { type: String, trim: true },
      year: { type: Number, min: 1, max: 6 },
      semester: { type: Number, min: 1, max: 12 },
      cgpa: { type: Number, min: 0, max: 10, default: 0 },
      admissionDate: { type: Date },
      placementStatus: {
        type: String,
        enum: ['not_placed', 'placed', 'opted_out', 'higher_studies'],
        default: 'not_placed',
      },
      placedAt: { type: String, trim: true, default: '' },
      githubUsername: { type: String, trim: true, default: '' },
      linkedinUrl: { type: String, trim: true, default: '' },
      selfDeclaredSkills: [{ type: String }],
    },

    faculty: {
      department: { type: String, trim: true },
      designation: { type: String, trim: true },
      employeeId: { type: String, trim: true },
      courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
      specializations: [{ type: String }],
    },

    recruiter: {
      company: { type: String, trim: true },
      designation: { type: String, trim: true },
      verified: { type: Boolean, default: false },
      shortlistedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      savedSearches: [
        {
          name: { type: String },
          query: { type: mongoose.Schema.Types.Mixed },
          createdAt: { type: Date, default: Date.now },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ role: 1, institutionId: 1 });
userSchema.index({ 'student.branch': 1, 'student.year': 1 });
userSchema.index({ 'recruiter.company': 1 });

const User = mongoose.model('User', userSchema);
export default User;
