const mongoose = require('mongoose');

const ClientCoachSchema = new mongoose.Schema({
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure one relationship per coach-client pair
ClientCoachSchema.index({ coachId: 1, clientId: 1 }, { unique: true });

module.exports = mongoose.model('ClientCoach', ClientCoachSchema);

