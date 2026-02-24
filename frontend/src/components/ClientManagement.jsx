import { useState, useEffect } from 'react';
import { clientAPI } from '../utils/api';

export default function ClientManagement({ onClientsChange }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [clientEmail, setClientEmail] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await clientAPI.getMyClients();
      setClients(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!clientEmail.trim()) {
      setError('Please enter a client email');
      return;
    }

    try {
      await clientAPI.addClient(clientEmail.trim());
      setSuccess('Client added successfully!');
      setClientEmail('');
      setShowAddForm(false);
      loadClients();
      if (onClientsChange) onClientsChange();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add client');
    }
  };

  const handleRemoveClient = async (clientId) => {
    if (!window.confirm('Remove this client? You can add them back later.')) {
      return;
    }

    try {
      await clientAPI.removeClient(clientId);
      setSuccess('Client removed successfully');
      loadClients();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove client');
    }
  };

  if (loading) {
    return <div className="loading-container">Loading clients...</div>;
  }

  return (
    <div className="client-management">
      <div className="section-header">
        <h2>My Clients</h2>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
          {showAddForm ? 'Cancel' : '+ Add Client'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showAddForm && (
        <form onSubmit={handleAddClient} className="add-client-form">
          <div className="form-group">
            <label>Client Email</label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="Enter client's email address"
              required
            />
          </div>
          <button type="submit" className="btn-primary">Add Client</button>
        </form>
      )}

      {clients.length === 0 ? (
        <div className="empty-state">
          <p>No clients yet. Add a client by their email address to get started.</p>
          <p className="hint">Clients must register first with the email you provide.</p>
        </div>
      ) : (
        <div className="clients-grid">
          {clients.map((client) => (
            <div key={client._id || client.id} className="client-card">
              <div className="client-info">
                <h3>{client.username}</h3>
                <p className="client-email">{client.email}</p>
                <p className="client-added">Added: {new Date(client.addedAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => handleRemoveClient(client._id || client.id)}
                className="btn-danger"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

