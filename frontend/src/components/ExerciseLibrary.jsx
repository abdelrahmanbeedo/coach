import { useState, useEffect } from 'react';
import { exercisesAPI, getApiErrorMessage } from '../utils/api';

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadExercises = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await exercisesAPI.list(search);
      setExercises(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load exercises'));
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = formName.trim();
    if (!name) return;
    setError('');
    setSaving(true);
    try {
      if (editingId) {
        await exercisesAPI.update(editingId, { name, category: formCategory.trim() });
        setEditingId(null);
      } else {
        await exercisesAPI.create({ name, category: formCategory.trim() });
        setShowAdd(false);
      }
      setFormName('');
      setFormCategory('');
      loadExercises();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (ex) => {
    setEditingId(ex._id);
    setFormName(ex.name);
    setFormCategory(ex.category || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormName('');
    setFormCategory('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exercise?')) return;
    try {
      await exercisesAPI.delete(id);
      loadExercises();
      if (editingId === id) cancelEdit();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete'));
    }
  };

  return (
    <div className="exercise-library">
      <div className="section-header">
        <h2>Exercise Library</h2>
        <button type="button" className="btn-primary" onClick={() => { setShowAdd(true); cancelEdit(); }}>
          + Add Exercise
        </button>
      </div>

      <div className="toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="error-message error-with-retry">
          <span>{error}</span>
          <button type="button" className="btn-secondary" onClick={() => loadExercises()}>
            Retry
          </button>
        </div>
      )}

      {(showAdd || editingId) && (
        <form onSubmit={handleSubmit} className="inline-form">
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Exercise name"
            required
          />
          <input
            type="text"
            value={formCategory}
            onChange={(e) => setFormCategory(e.target.value)}
            placeholder="Category (optional)"
          />
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => { setShowAdd(false); cancelEdit(); }}>
            Cancel
          </button>
        </form>
      )}

      {!error && loading && <div className="loading-container">Loading...</div>}
      {!error && !loading && exercises.length === 0 && (
        <div className="empty-state">
          <p>No exercises yet. Add exercises to use them in workout templates.</p>
        </div>
      )}
      {!error && !loading && exercises.length > 0 && (
        <ul className="exercise-list">
          {exercises.map((ex) => (
            <li key={ex._id} className="exercise-list-item">
              {editingId === ex._id ? (
                <form onSubmit={handleSubmit} className="inline-form">
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Name"
                    required
                  />
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="Category"
                  />
                  <button type="submit" disabled={saving} className="btn-primary">Save</button>
                  <button type="button" className="btn-secondary" onClick={cancelEdit}>Cancel</button>
                </form>
              ) : (
                <>
                  <div className="exercise-list-info">
                    <span className="exercise-name">{ex.name}</span>
                    {ex.category && <span className="exercise-category">{ex.category}</span>}
                  </div>
                  <div className="exercise-list-actions">
                    <button type="button" className="btn-secondary small" onClick={() => startEdit(ex)}>Edit</button>
                    <button type="button" className="btn-danger small" onClick={() => handleDelete(ex._id)}>Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

