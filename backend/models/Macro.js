const mongoose = require('mongoose');
const MacroEntrySchema = new mongoose.Schema({
clientId: {
type: mongoose.Schema.Types.ObjectId,
ref: 'User',
required: true,
},
date: {
type: Date,
required: true,
},
meals: [{
mealName: String,
protein: Number,
carbs: Number,
fats: Number,
calories: Number,
timestamp: Date,
}],
dailyTargets: {
protein: Number,
carbs: Number,
fats: Number,
calories: Number,
},
totalProtein: {
type: Number,
default: 0,
},
totalCarbs: {
type: Number,
default: 0,
},
totalFats: {
type: Number,
default: 0,
},
totalCalories: {
type: Number,
default: 0,
},
createdAt: {
type: Date,
default: Date.now,
},
});
module.exports = mongoose.model('Macro', MacroEntrySchema);