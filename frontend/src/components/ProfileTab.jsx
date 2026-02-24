import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function ProfileTab() {
  const { user, setUserFromToken } = useAuth();
  const [form, setForm] = useState({ username: '', bio: '', weight: '', height: '', avatarUrl: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || '',
        bio: user.bio || '',
        weight: user.weight || '',
        height: user.height || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await api.put('/users/me', {
        username: form.username,
        bio: form.bio,
        weight: form.weight ? Number(form.weight) : undefined,
        height: form.height ? Number(form.height) : undefined,
        avatarUrl: form.avatarUrl,
      });
      setMessage('Profile updated');
      // Refresh auth context user (best-effort)
      if (setUserFromToken) setUserFromToken();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-tab">
      <h2>Profile</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-row">
          <div className="form-group">
            <label>Display name</label>
            <input name="username" value={form.username} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Avatar URL</label>
            <input name="avatarUrl" value={form.avatarUrl} onChange={handleChange} placeholder="https://..." />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Weight (kg)</label>
            <input name="weight" type="number" value={form.weight} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Height (cm)</label>
            <input name="height" type="number" value={form.height} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} />
        </div>

        <div className="form-group align-end">
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</button>
        </div>
        {message && <div className="hint">{message}</div>}
      </form>
    </div>
  );
}
