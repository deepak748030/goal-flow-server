const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true, trim: true },
  position: { type: String, required: true, trim: true },
  duration: { type: String, required: true, trim: true },
  description: { type: String, required: true },
});

const educationSchema = new mongoose.Schema({
  school: { type: String, required: true, trim: true },
  degree: { type: String, required: true, trim: true },
  year: { type: String, required: true, trim: true },
});

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    personalInfo: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      phone: { type: String, trim: true },
      location: { type: String, trim: true },
      summary: { type: String },
    },
    experiences: [experienceSchema],
    education: [educationSchema],
    skills: {
      type: String,
      default: '',
    },
    template: {
      type: String,
      enum: ['modern', 'classic', 'creative'],
      default: 'modern',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Resume', resumeSchema);