const express = require('express');
const WorkoutTemplate = require('../models/WorkoutTemplate');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

function requireCoach(req, res, next) {
  if (req.user.role !== 'coach') {
    return res.status(403).json({ message: 'Only coaches can access templates' });
  }
  next();
}

// List
router.get('/', requireCoach, async (req, res) => {
  try {
    const templates = await WorkoutTemplate.find({ coachId: req.user.userId }).sort({ updatedAt: -1 });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one
router.get('/:id', requireCoach, async (req, res) => {
  try {
    const template = await WorkoutTemplate.findOne({ _id: req.params.id, coachId: req.user.userId });
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json(template);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create
router.post('/', requireCoach, async (req, res) => {
  try {
    const { name, exercises } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Template name is required' });
    }
    const template = new WorkoutTemplate({
      coachId: req.user.userId,
      name: name.trim(),
      exercises: Array.isArray(exercises) ? exercises : [],
    });
    await template.save();
    res.status(201).json(template);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update
router.put('/:id', requireCoach, async (req, res) => {
  try {
    const { name, exercises } = req.body;
    const template = await WorkoutTemplate.findOne({ _id: req.params.id, coachId: req.user.userId });
    if (!template) return res.status(404).json({ message: 'Template not found' });
    if (name !== undefined) template.name = (name || '').trim();
    if (Array.isArray(exercises)) template.exercises = exercises;
    await template.save();
    res.json(template);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete
router.delete('/:id', requireCoach, async (req, res) => {
  try {
    const result = await WorkoutTemplate.findOneAndDelete({ _id: req.params.id, coachId: req.user.userId });
    if (!result) return res.status(404).json({ message: 'Template not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
