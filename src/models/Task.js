const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    estimatedDuration: {
      type: String,
      default: '1 week',
    },
    resources: [{
      type: String,
    }],
    generatedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
taskSchema.index({ userId: 1, completed: 1 });
taskSchema.index({ userId: 1, priority: 1 });

// Update completedAt when task is completed
taskSchema.pre('save', function(next) {
  if (this.isModified('completed')) {
    if (this.completed) {
      this.completedAt = new Date();
      this.percentage = 100;
    } else {
      this.completedAt = null;
    }
  }
  
  // Auto-complete when percentage reaches 100
  if (this.isModified('percentage') && this.percentage >= 100) {
    this.completed = true;
    this.completedAt = new Date();
  }
  
  next();
});

module.exports = mongoose.model('Task', taskSchema);