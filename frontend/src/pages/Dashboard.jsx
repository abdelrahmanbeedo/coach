import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workoutAPI } from '../utils/api';
import CoachDashboard from '../components/CoachDashboard';
import ClientDashboard from '../components/ClientDashboard';

export default function Dashboard() {
  const { user, loading: authLoading, isCoach, isClient, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (user) {
      setLoading(false);
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Welcome, {user?.username}!</h1>
          <div className="user-info">
            <p className="role-badge">{user?.role}</p>
            <p className="user-id">ID: {user?.id}</p>
          </div>
        </div>
        <button onClick={logout} className="btn-secondary">
          Logout
        </button>
      </header>

      {isCoach && <CoachDashboard />}
      {isClient && <ClientDashboard />}
    </div>
  );
}

