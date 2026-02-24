const express = require('express');
const Exercise = require('../models/Exercise');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

function requireCoach(req, res, next) {
  if (req.user.role !== 'coach') {
    return res.status(403).json({ message: 'Only coaches can access the exercise library' });
  }
  next();
}

// List (with optional search)
router.get('/', requireCoach, async (req, res) => {
  try {
    const { q } = req.query;
    const filter = { coachId: req.user.userId };
    if (q && q.trim()) {
      filter.name = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }
    const exercises = await Exercise.find(filter).sort({ name: 1 });
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create
router.post('/', requireCoach, async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Exercise name is required' });
    }
    const exercise = new Exercise({
      coachId: req.user.userId,
      name: name.trim(),
      category: (category || '').trim(),
    });
    await exercise.save();
    res.status(201).json(exercise);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'An exercise with this name already exists' });
    }
    res.status(500).json({ message: err.message });
  }
});

// Update
router.put('/:id', requireCoach, async (req, res) => {
  try {
    const { name, category } = req.body;
    const exercise = await Exercise.findOne({ _id: req.params.id, coachId: req.user.userId });
    if (!exercise) return res.status(404).json({ message: 'Exercise not found' });
    if (name !== undefined) exercise.name = (name || '').trim();
    if (category !== undefined) exercise.category = (category || '').trim();
    await exercise.save();
    res.json(exercise);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'An exercise with this name already exists' });
    }
    res.status(500).json({ message: err.message });
  }
});

// Delete
router.delete('/:id', requireCoach, async (req, res) => {
  try {
    const result = await Exercise.findOneAndDelete({ _id: req.params.id, coachId: req.user.userId });
    if (!result) return res.status(404).json({ message: 'Exercise not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
