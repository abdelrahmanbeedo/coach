import { useState, useEffect } from 'react';
import { workoutAPI, templatesAPI } from '../utils/api';

export default function AssignedWorkouts({ clients }) {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [workouts, setWorkouts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignTemplateId, setAssignTemplateId] = useState('');
  const [assignDate, setAssignDate] = useState(new Date().toISOString().split('T')[0]);

  const loadWorkouts = async () => {
    if (!selectedClientId) {
      setWorkouts([]);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await workoutAPI.getByClient(selectedClientId);
      setWorkouts(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const res = await templatesAPI.list();
      setTemplates(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, [selectedClientId]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedClientId || !assignTemplateId || !assignDate) {
      setError('Select a client, template, and date');
      return;
    }
    setError('');
    setSuccess('');
    setAssigning(true);
    try {
      await workoutAPI.assign(assignTemplateId, selectedClientId, assignDate);
      setSuccess('Workout assigned.');
      setAssignTemplateId('');
      setAssignDate(new Date().toISOString().split('T')[0]);
      loadWorkouts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign');
    } finally {
      setAssigning(false);
    }
  };

  const handleDelete = async (workoutId) => {
    if (!window.confirm('Remove this assigned workout?')) return;
    try {
      await workoutAPI.delete(workoutId);
      loadWorkouts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const selectedClient = clients.find((c) => (c._id || c.id) === selectedClientId);

  return (
    <div className="assigned-workouts">
      <h2>Assigned Workouts</h2>
      <p className="hint">Select a client to view and manage their assigned workouts. Assign a template with a date.</p>

      <div className="form-group">
        <label>Client</label>
        <select
          value={selectedClientId}
          onChange={(e) => { setSelectedClientId(e.target.value); setError(''); setSuccess(''); }}
        >
          <option value="">Choose a client...</option>
          {clients.map((c) => (
            <option key={c._id || c.id} value={c._id || c.id}>{c.username}</option>
          ))}
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {selectedClientId && (
        <>
          <form onSubmit={handleAssign} className="assign-form">
            <div className="assign-form-row">
              <div className="form-group">
                <label>Template</label>
                <select
                  value={assignTemplateId}
                  onChange={(e) => setAssignTemplateId(e.target.value)}
                  required
                >
                  <option value="">Select template...</option>
                  {templates.map((t) => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={assignDate}
                  onChange={(e) => setAssignDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group align-end">
                <button type="submit" disabled={assigning || templates.length === 0} className="btn-primary">
                  {assigning ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </div>
          </form>

          {loading ? (
            <div className="loading-container">Loading...</div>
          ) : workouts.length === 0 ? (
            <div className="empty-state">No workouts assigned yet for this client.</div>
          ) : (
            <div className="workouts-list">
              {workouts.map((w) => (
                <div key={w._id} className="workout-item">
                  <div className="workout-item-info">
                    <h3>{w.name}</h3>
                    <p className="workout-date">{new Date(w.date).toLocaleDateString()}</p>
                    <p className="workout-exercises">{w.exercises?.length || 0} exercises {w.completed && <span className="status-badge completed">Done</span>}</p>
                  </div>
                  <div className="workout-item-actions">
                    <button type="button" className="btn-danger" onClick={() => handleDelete(w._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
