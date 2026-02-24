const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ExerciseSchema.index({ coachId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Exercise', ExerciseSchema);
