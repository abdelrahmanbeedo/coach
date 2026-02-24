import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { workoutAPI } from '../utils/api';
import WorkoutList from './WorkoutList';
import MacroTracker from './MacroTracker';
import ProfileTab from './ProfileTab';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('workouts');
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
      <div className="dashboard-tabs">
        <button className={activeTab === 'workouts' ? 'active' : ''} onClick={() => setActiveTab('workouts')}>Workouts</button>
        <button className={activeTab === 'macros' ? 'active' : ''} onClick={() => setActiveTab('macros')}>Macros</button>
        <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>Profile</button>
      </div>

      <div className="tab-content">
        {activeTab === 'workouts' && <WorkoutList workouts={workouts} loading={loading} onRefresh={loadWorkouts} />}
        {activeTab === 'macros' && <MacroTracker />}
        {activeTab === 'profile' && <ProfileTab />}
      </div>
    </div>
  );
}

