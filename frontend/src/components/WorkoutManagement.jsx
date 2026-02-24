import { useState, useEffect } from 'react';
import { workoutAPI, clientAPI } from '../utils/api';

export default function WorkoutManagement({ clients }) {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedClientId) {
      loadWorkouts();
    } else {
      setWorkouts([]);
    }
  }, [selectedClientId]);

  const loadWorkouts = async () => {
    if (!selectedClientId) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await workoutAPI.getByClient(selectedClientId);
      setWorkouts(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (workoutId) => {
    if (!window.confirm('Delete this workout? This cannot be undone.')) {
      return;
    }

    try {
      await workoutAPI.delete(workoutId);
      loadWorkouts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete workout');
    }
  };

  return (
    <div className="workout-management">
      <h2>Manage Workouts</h2>
      
      <div className="form-group">
        <label>Select Client</label>
        <select
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
        >
          <option value="">Choose a client...</option>
          {clients.map((client) => (
            <option key={client._id || client.id} value={client._id || client.id}>
              {client.username}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-container">Loading workouts...</div>
      ) : selectedClientId && workouts.length === 0 ? (
        <div className="empty-state">No workouts found for this client.</div>
      ) : (
        <div className="workouts-list">
          {workouts.map((workout) => (
            <div key={workout._id} className="workout-item">
              <div className="workout-item-info">
                <h3>{workout.name}</h3>
                <p className="workout-date">
                  {new Date(workout.date).toLocaleDateString()}
                </p>
                <p className="workout-exercises">
                  {workout.exercises?.length || 0} exercises
                  {workout.completed && <span className="status-badge completed">Completed</span>}
                </p>
              </div>
              <div className="workout-item-actions">
                <button
                  onClick={() => handleDelete(workout._id)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

