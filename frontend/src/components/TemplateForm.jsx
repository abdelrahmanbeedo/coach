import { useState, useEffect } from 'react';
import { exercisesAPI, templatesAPI, getApiErrorMessage } from '../utils/api';

const defaultRow = () => ({ name: '', sets: 3, targetReps: 10, weight: 0, restSeconds: 60, notes: '' });

export default function TemplateForm({ template, onSaved, onCancel }) {
  const [name, setName] = useState(template?.name || '');
  const [exercises, setExercises] = useState(
    template?.exercises?.length
      ? template.exercises.map((e) => ({ ...e }))
      : []
  );
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadLibrary = async () => {
    try {
      setError('');
      const res = await exercisesAPI.list(exerciseSearch);
      setLibrary(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load exercises'));
      setLibrary([]);
    }
  };

  useEffect(() => {
    loadLibrary();
  }, [exerciseSearch]);

  const addFromLibrary = (ex) => {
    setExercises((prev) => [...prev, { name: ex.name, sets: 3, targetReps: 10, weight: 0, restSeconds: 60, notes: '' }]);
  };

  const updateRow = (index, field, value) => {
    setExercises((prev) => {
      const next = [...prev];
      const row = { ...next[index] };
      row[field] = ['sets', 'targetReps', 'weight', 'restSeconds'].includes(field) ? Number(value) : value;
      next[index] = row;
      return next;
    });
  };

  const removeRow = (index) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const moveUp = (index) => {
    if (index <= 0) return;
    setExercises((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index) => {
    if (index >= exercises.length - 1) return;
    setExercises((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const addBlankRow = () => {
    setExercises((prev) => [...prev, defaultRow()]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Template name is required');
      return;
    }
    setError('');
    setSaving(true);
    try {
      if (template?._id) {
        await templatesAPI.update(template._id, { name: trimmedName, exercises });
      } else {
        await templatesAPI.create({ name: trimmedName, exercises });
      }
      onSaved();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save template'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="template-form">
      <div className="section-header">
        <h2>{template ? 'Edit Template' : 'New Template'}</h2>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Template name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Push Day, Leg Day"
            required
          />
        </div>

        <div className="template-exercises-section">
          <h3>Exercises</h3>
          <div className="toolbar">
            <input
              type="text"
              className="search-input"
              placeholder="Search library to add..."
              value={exerciseSearch}
              onChange={(e) => setExerciseSearch(e.target.value)}
            />
          </div>
          {library.length > 0 && (
            <div className="library-pills">
              {library.map((ex) => (
                <button
                  key={ex._id}
                  type="button"
                  className="pill"
                  onClick={() => addFromLibrary(ex)}
                >
                  + {ex.name}
                </button>
              ))}
            </div>
          )}
          <button type="button" className="btn-secondary" onClick={addBlankRow}>
            + Add blank row
          </button>

          {exercises.length === 0 ? (
            <p className="hint">Add exercises from the library above or add a blank row.</p>
          ) : (
            <div className="template-rows">
              {exercises.map((row, index) => (
                <div key={index} className="template-row">
                  <div className="template-row-fields">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => updateRow(index, 'name', e.target.value)}
                      placeholder="Exercise name"
                    />
                    <input type="number" min="1" value={row.sets} onChange={(e) => updateRow(index, 'sets', e.target.value)} placeholder="Sets" />
                    <input type="number" min="1" value={row.targetReps} onChange={(e) => updateRow(index, 'targetReps', e.target.value)} placeholder="Reps" />
                    <input type="number" min="0" step="0.5" value={row.weight} onChange={(e) => updateRow(index, 'weight', e.target.value)} placeholder="Weight" />
                    <input type="number" min="0" value={row.restSeconds} onChange={(e) => updateRow(index, 'restSeconds', e.target.value)} placeholder="Rest (s)" />
                    <input type="text" value={row.notes} onChange={(e) => updateRow(index, 'notes', e.target.value)} placeholder="Notes" />
                  </div>
                  <div className="template-row-actions">
                    <button type="button" className="btn-icon" onClick={() => moveUp(index)} title="Move up">↑</button>
                    <button type="button" className="btn-icon" onClick={() => moveDown(index)} title="Move down">↓</button>
                    <button type="button" className="btn-danger small" onClick={() => removeRow(index)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Template'}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
