import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { workoutAPI } from '../utils/api';
import WorkoutList from './WorkoutList';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const clientId = user?.id ?? user?._id;
  const clientIdStr = clientId != null ? String(clientId) : null;

  useEffect(() => {
    if (clientIdStr) loadWorkouts();
    else setWorkouts([]);
  }, [clientIdStr]);

  const loadWorkouts = async () => {
    if (!clientIdStr) return;
    try {
      setLoading(true);
      const response = await workoutAPI.getByClient(clientIdStr);
      setWorkouts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading workouts:', error);
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-dashboard">
      <div className="tab-content">
        <WorkoutList workouts={workouts} loading={loading} onRefresh={loadWorkouts} />
      </div>
    </div>
  );
}

