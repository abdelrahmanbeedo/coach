const express = require('express');
const Workout = require('../models/Workout');
const WorkoutTemplate = require('../models/WorkoutTemplate');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Assign template to client (create workout from template)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { templateId, clientId, date } = req.body;
    if (!templateId || !clientId || !date) {
      return res.status(400).json({ message: 'templateId, clientId, and date are required' });
    }
    const template = await WorkoutTemplate.findOne({ _id: templateId, coachId: req.user.userId });
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    const workout = new Workout({
      templateId: template._id,
      clientId,
      coachId: req.user.userId,
      name: template.name,
      date: new Date(date),
      exercises: template.exercises.map((e) => ({
        name: e.name,
        sets: e.sets,
        targetReps: e.targetReps,
        weight: e.weight,
        restSeconds: e.restSeconds,
        notes: e.notes || '',
      })),
    });
    await workout.save();
    res.status(201).json(workout);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all workouts for a client (clients can only fetch their own)
router.get('/client/:clientId', authMiddleware, async (req, res) => {
  try {
    const { clientId } = req.params;
    if (req.user.role === 'client' && String(clientId) !== String(req.user.userId)) {
      return res.status(403).json({ message: 'You can only view your own workouts' });
    }
    const workouts = await Workout.find({ clientId })
      .sort({ date: -1 })
      .lean();
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get single workout
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    res.json(workout);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Update workout (client logs exercises)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { completedExercises, completed } = req.body;

    const workout = await Workout.findByIdAndUpdate(
      req.params.id,
      { completedExercises, completed },
      { new: true }
    );

    res.json(workout);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Delete workout
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Workout.findByIdAndDelete(req.params.id);
    res.json({ message: 'Workout deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
