const mongoose = require('mongoose');

const TemplateExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, required: true, default: 3 },
  targetReps: { type: Number, required: true, default: 10 },
  weight: { type: Number, default: 0 },
  restSeconds: { type: Number, default: 60 },
  notes: { type: String, default: '' },
}, { _id: false });

const WorkoutTemplateSchema = new mongoose.Schema({
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
  exercises: [TemplateExerciseSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

WorkoutTemplateSchema.pre('save', function () {
  this.updatedAt = new Date();
});

module.exports = mongoose.model('WorkoutTemplate', WorkoutTemplateSchema);
