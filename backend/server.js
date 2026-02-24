const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const app = express();
// Middleware
app.use(cors());
app.use(express.json());
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));
// Health check – confirms this server has the latest routes (open in browser: http://localhost:5000/api/health)
app.get('/api/health', (req, res) => {
  res.json({ ok: true, routes: ['exercises', 'templates', 'workouts', 'clients', 'users'] });
});

// Import Routes
const userRoutes = require('./routes/userRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const macroRoutes = require('./routes/macroRoutes');
const clientRoutes = require('./routes/clientRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const templateRoutes = require('./routes/templateRoutes');
// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/macros', macroRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/templates', templateRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Routes: /api/exercises, /api/templates, /api/workouts, /api/clients, /api/users');
});