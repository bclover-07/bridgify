import mongoose from 'mongoose';

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true,
      maxlength: 200,
    },
    code: {
      type: String,
      required: [true, 'Institution code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 20,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      country: { type: String, default: 'India', trim: true },
    },
    naacGrade: {
      type: String,
      enum: ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C', 'Not Accredited', ''],
      default: '',
    },
    nirfRank: {
      type: Number,
      min: 0,
      default: null,
    },
    departments: [
      {
        name: { type: String, required: true, trim: true },
        code: { type: String, required: true, trim: true },
        hodName: { type: String, trim: true },
      },
    ],
    website: { type: String, trim: true },
    logo: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

institutionSchema.index({ name: 'text' });

const Institution = mongoose.model('Institution', institutionSchema);
export default Institution;
