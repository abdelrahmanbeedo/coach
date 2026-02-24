import { useState, useEffect } from 'react';
import { templatesAPI, getApiErrorMessage } from '../utils/api';

export default function TemplateList({ onEditTemplate, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await templatesAPI.list();
      setTemplates(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load templates'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete template "${name}"?`)) return;
    try {
      await templatesAPI.delete(id);
      load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete'));
    }
  };

  return (
    <div className="template-list">
      <div className="section-header">
        <h2>Workout Templates</h2>
        <button type="button" className="btn-primary" onClick={() => onEditTemplate(null)}>
          + New Template
        </button>
      </div>
      {error && (
        <div className="error-message error-with-retry">
          <span>{error}</span>
          <button type="button" className="btn-secondary" onClick={() => load()}>
            Retry
          </button>
        </div>
      )}
      {!error && loading && <div className="loading-container">Loading...</div>}
      {!error && !loading && templates.length === 0 && (
        <div className="empty-state">
          <p>No templates yet. Create a template from the Exercise Library, then assign it to clients.</p>
        </div>
      )}
      {!error && !loading && templates.length > 0 && (
        <ul className="template-list-ul">
          {templates.map((t) => (
            <li key={t._id} className="template-list-item">
              <div className="template-list-info">
                <span className="template-name">{t.name}</span>
                <span className="template-meta">{t.exercises?.length || 0} exercises</span>
              </div>
              <div className="template-list-actions">
                <button type="button" className="btn-secondary small" onClick={() => onEditTemplate(t)}>Edit</button>
                <button type="button" className="btn-danger small" onClick={() => handleDelete(t._id, t.name)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
