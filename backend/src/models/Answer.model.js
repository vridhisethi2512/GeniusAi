const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema(
  {
    score: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
    },
    correctness: {
      type: Number,
      min: 0,
      max: 10,
    },
    clarity: {
      type: Number,
      min: 0,
      max: 10,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 10,
    },
    feedback: {
      type: String,
      trim: true,
      required: true,
    },
    idealAnswerSummary: {
      type: String,
      trim: true,
      default: '',
    },
    missedPoints: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const answerSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewSession',
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    answerText: {
      type: String,
      required: [true, 'Answer text is required'],
      trim: true,
    },
    responseTimeInSeconds: {
      type: Number,
      min: 0,
    },
    evaluation: {
      type: evaluationSchema,
      default: undefined,
    },
    evaluationStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

answerSchema.index({ question: 1 }, { unique: true });
answerSchema.index({ session: 1, createdAt: 1 });
answerSchema.index({ user: 1 });

module.exports = mongoose.model('Answer', answerSchema);
