import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { workoutAPI } from '../utils/api';

export default function CreateWorkout({ clients = [], onWorkoutCreated }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    date: new Date().toISOString().split('T')[0],
    exercises: [{ name: '', sets: 3, targetReps: 10, weight: 0, restSeconds: 60, notes: '' }],
  });

  const handleExerciseChange = (index, field, value) => {
    const updatedExercises = [...formData.exercises];
    updatedExercises[index][field] = field === 'sets' || field === 'targetReps' || field === 'weight' || field === 'restSeconds' 
      ? Number(value) 
      : value;
    setFormData({ ...formData, exercises: updatedExercises });
  };

  const addExercise = () => {
    setFormData({
      ...formData,
      exercises: [...formData.exercises, { name: '', sets: 3, targetReps: 10, weight: 0, restSeconds: 60, notes: '' }],
    });
  };

  const removeExercise = (index) => {
    setFormData({
      ...formData,
      exercises: formData.exercises.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!formData.clientId) {
      setError('Please select a client');
      return;
    }
    
    if (!formData.name.trim()) {
      setError('Please enter a workout name');
      return;
    }

    setLoading(true);

    try {
      await workoutAPI.create(formData);
      setSuccess('Workout created successfully!');
      setFormData({
        clientId: '',
        name: '',
        date: new Date().toISOString().split('T')[0],
        exercises: [{ name: '', sets: 3, targetReps: 10, weight: 0, restSeconds: 60, notes: '' }],
      });
      if (onWorkoutCreated) onWorkoutCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create workout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-workout">
      <h2>Create Workout</h2>
      <form onSubmit={handleSubmit} className="workout-form">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-group">
          <label>Select Client</label>
          {clients.length === 0 ? (
            <div className="info-box">
              <p>No clients yet. Add clients first to create workouts.</p>
            </div>
          ) : (
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              required
            >
              <option value="">Choose a client...</option>
              {clients.map((client) => (
                <option key={client._id || client.id} value={client._id || client.id}>
                  {client.username} ({client.email})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="form-group">
          <label>Workout Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="e.g., Push Day, Leg Day"
          />
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div className="exercises-section">
          <h3>Exercises</h3>
          {formData.exercises.map((exercise, index) => (
            <div key={index} className="exercise-card">
              <div className="exercise-header">
                <h4>Exercise {index + 1}</h4>
                {formData.exercises.length > 1 && (
                  <button type="button" onClick={() => removeExercise(index)} className="btn-danger">
                    Remove
                  </button>
                )}
              </div>
              <div className="exercise-grid">
                <div className="form-group">
                  <label>Exercise Name</label>
                  <input
                    type="text"
                    value={exercise.name}
                    onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                    required
                    placeholder="e.g., Bench Press"
                  />
                </div>
                <div className="form-group">
                  <label>Sets</label>
                  <input
                    type="number"
                    value={exercise.sets}
                    onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Target Reps</label>
                  <input
                    type="number"
                    value={exercise.targetReps}
                    onChange={(e) => handleExerciseChange(index, 'targetReps', e.target.value)}
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Weight (lbs)</label>
                  <input
                    type="number"
                    value={exercise.weight}
                    onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                    min="0"
                    step="0.5"
                  />
                </div>
                <div className="form-group">
                  <label>Rest (seconds)</label>
                  <input
                    type="number"
                    value={exercise.restSeconds}
                    onChange={(e) => handleExerciseChange(index, 'restSeconds', e.target.value)}
                    min="0"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    value={exercise.notes}
                    onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                    placeholder="Additional instructions..."
                    rows="2"
                  />
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addExercise} className="btn-secondary">
            + Add Exercise
          </button>
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating...' : 'Create Workout'}
        </button>
      </form>
    </div>
  );
}

