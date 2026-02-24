const express = require('express');
const Macro = require('../models/Macro');
const authMiddleware = require('../middleware/auth');
const router = express.Router();
// Create or get macro entry for today
router.post('/', authMiddleware, async (req, res) => {
try {
const { clientId, meals, dailyTargets } = req.body;
const today = new Date().setHours(0, 0, 0, 0);
let macroEntry = await Macro.findOne({
clientId,
date: { $gte: today },
});
if (!macroEntry) {
macroEntry = new Macro({
clientId,
date: new Date(today),
meals: [],
dailyTargets,
});
}
if (meals && meals.length > 0) {
macroEntry.meals = [...macroEntry.meals, ...meals];
// Calculate totals
macroEntry.totalProtein = macroEntry.meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
macroEntry.totalCarbs = macroEntry.meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
macroEntry.totalFats = macroEntry.meals.reduce((sum, meal) => sum + (meal.fats || 0), 0);
macroEntry.totalCalories = macroEntry.meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
}
await macroEntry.save();
res.status(201).json(macroEntry);
} catch(err) {
res.status(500).json({ message: err.message });
}
});
// Get macro entry for a date
router.get('/:clientId/:date', authMiddleware, async (req, res) => {
try {
const startDate = new Date(req.params.date).setHours(0, 0, 0, 0);
const endDate = new Date(req.params.date).setHours(23, 59, 59, 999);
const macro = await Macro.findOne({
clientId: req.params.clientId,
date: { $gte: startDate, $lte: endDate },
});
if (!macro) {
return res.status(404).json({ message: 'No macro entry for this date' });
}
res.json(macro);
} catch(err) {
res.status(500).json({ message: err.message });
}
});
// Update meal in macro entry
router.put('/:id/meal/:mealIndex', authMiddleware, async (req, res) => {
try {
const macro = await Macro.findById(req.params.id);
if (!macro) {
return res.status(404).json({ message: 'Macro entry not found' });
}
const { mealName, protein, carbs, fats, calories } = req.body;
macro.meals[req.params.mealIndex] = {
mealName,
protein: Number(protein) || 0,
carbs: Number(carbs) || 0,
fats: Number(fats) || 0,
calories: Number(calories) || 0,
timestamp: new Date(),
};
// Recalculate totals
macro.totalProtein = macro.meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
macro.totalCarbs = macro.meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
macro.totalFats = macro.meals.reduce((sum, meal) => sum + (meal.fats || 0), 0);
macro.totalCalories = macro.meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
await macro.save();
res.json(macro);
} catch(err) {
res.status(500).json({ message: err.message });
}
});
// Delete meal from macro entry
router.delete('/:id/meal/:mealIndex', authMiddleware, async (req, res) => {
try {
const macro = await Macro.findById(req.params.id);
if (!macro) {
return res.status(404).json({ message: 'Macro entry not found' });
}
macro.meals.splice(req.params.mealIndex, 1);
// Recalculate totals
macro.totalProtein = macro.meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
macro.totalCarbs = macro.meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
macro.totalFats = macro.meals.reduce((sum, meal) => sum + (meal.fats || 0), 0);
macro.totalCalories = macro.meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
await macro.save();
res.json(macro);
} catch(err) {
res.status(500).json({ message: err.message });
}
});
module.exports = router;