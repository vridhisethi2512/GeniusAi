const mongoose = require('mongoose');

const overallFeedbackSchema = new mongoose.Schema(
  {
    averageScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    strengths: {
      type: [String],
      default: [],
    },
    areasForImprovement: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      required: [true, 'Target role is required for an interview session'],
      trim: true,
      maxlength: 100,
    },
    interviewType: {
      type: String,
      enum: ['technical', 'hr', 'behavioral', 'mixed'],
      default: 'mixed',
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    answers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Answer',
      },
    ],
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
    },
    overallFeedback: {
      type: overallFeedbackSchema,
      default: undefined,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    durationInSeconds: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

interviewSessionSchema.index({ user: 1, createdAt: -1 });
interviewSessionSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
