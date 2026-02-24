const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name: String,
  sets: Number,
  targetReps: Number,
  weight: Number,
  restSeconds: Number,
  notes: String,
}, { _id: false });

const WorkoutSchema = new mongoose.Schema({
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutTemplate' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coachId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  date: { type: Date, required: true },
  exercises: [ExerciseSchema],
  completed: { type: Boolean, default: false },
  completedExercises: [{
    exerciseName: String,
    setsCompleted: Number,
    actualWeight: Number,
    actualReps: Number,
    completedAt: Date,
  }],
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Workout', WorkoutSchema);