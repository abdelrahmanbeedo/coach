const express = require('express');
const ClientCoach = require('../models/ClientCoach');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all clients for a coach
router.get('/my-clients', authMiddleware, async (req, res) => {
  try {
    const relationships = await ClientCoach.find({ 
      coachId: req.user.userId,
      status: 'active'
    }).populate('clientId', 'username email role createdAt');
    
    const clients = relationships.map(rel => ({
      ...rel.clientId.toObject(),
      relationshipId: rel._id,
      addedAt: rel.createdAt,
    }));
    
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a client by email
router.post('/add-client', authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (req.user.role !== 'coach') {
      return res.status(403).json({ message: 'Only coaches can add clients' });
    }
    
    const client = await User.findOne({ email, role: 'client' });
    if (!client) {
      return res.status(404).json({ message: 'Client not found with this email' });
    }
    
    // Check if relationship already exists
    const existing = await ClientCoach.findOne({
      coachId: req.user.userId,
      clientId: client._id,
    });
    
    if (existing) {
      if (existing.status === 'active') {
        return res.status(400).json({ message: 'Client already added' });
      } else {
        existing.status = 'active';
        await existing.save();
        return res.json({ message: 'Client re-added successfully', client });
      }
    }
    
    const relationship = new ClientCoach({
      coachId: req.user.userId,
      clientId: client._id,
    });
    
    await relationship.save();
    res.status(201).json({ message: 'Client added successfully', client });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Client already added' });
    }
    res.status(500).json({ message: err.message });
  }
});

// Remove a client
router.delete('/remove-client/:clientId', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'coach') {
      return res.status(403).json({ message: 'Only coaches can remove clients' });
    }
    
    const relationship = await ClientCoach.findOneAndUpdate(
      {
        coachId: req.user.userId,
        clientId: req.params.clientId,
      },
      { status: 'inactive' },
      { new: true }
    );
    
    if (!relationship) {
      return res.status(404).json({ message: 'Client relationship not found' });
    }
    
    res.json({ message: 'Client removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my coach (for clients)
router.get('/my-coach', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Only clients can view their coach' });
    }
    
    const relationship = await ClientCoach.findOne({
      clientId: req.user.userId,
      status: 'active',
    }).populate('coachId', 'username email');
    
    if (!relationship) {
      return res.status(404).json({ message: 'No coach assigned' });
    }
    
    res.json(relationship.coachId);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

