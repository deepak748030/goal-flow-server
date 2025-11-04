const mongoose = require('mongoose');

const onboardingDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    profession: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: String,
      required: true,
      trim: true,
    },
    industry: {
      type: String,
      required: true,
      trim: true,
    },
    goals: {
      type: String,
      required: true,
    },
    timeline: {
      type: String,
      required: true,
      trim: true,
    },
    currentSkills: {
      type: String,
      required: true,
    },
    learningStyle: {
      type: String,
      required: true,
    },
    weeklyHours: {
      type: String,
      required: true,
      trim: true,
    },
    motivation: {
      type: String,
      required: true,
    },
    tasksGenerated: {
      type: Boolean,
      default: false,
    },
    recommendationsGenerated: {
      type: Boolean,
      default: false,
    },
    aiGeneratedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('OnboardingData', onboardingDataSchema);