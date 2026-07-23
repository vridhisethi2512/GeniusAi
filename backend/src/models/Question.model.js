const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewSession',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['technical', 'hr', 'behavioral', 'situational', 'coding'],
      required: true,
    },
    topic: {
      type: String,
      trim: true,
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    idealAnswerPoints: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.index({ session: 1, order: 1 });
questionSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Question', questionSchema);
