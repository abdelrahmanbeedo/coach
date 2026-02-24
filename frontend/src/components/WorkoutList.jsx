import { useState } from 'react';
import { workoutAPI } from '../utils/api';
import WorkoutDetail from './WorkoutDetail';

export default function WorkoutList({ workouts, loading, onRefresh }) {
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  if (loading) {
    return <div className="loading-container">Loading workouts...</div>;
  }

  if (workouts.length === 0) {
    return (
      <div className="empty-state">
        <p>No workouts assigned yet. Check back later!</p>
      </div>
    );
  }

  return (
    <div className="workout-list">
      {selectedWorkout ? (
        <WorkoutDetail
          workout={selectedWorkout}
          onBack={() => setSelectedWorkout(null)}
          onUpdate={onRefresh}
        />
      ) : (
        <>
          <h2>My Workouts</h2>
          <div className="workouts-grid">
            {workouts.map((workout) => (
              <div
                key={workout._id}
                className={`workout-card ${workout.completed ? 'completed' : ''}`}
                onClick={() => setSelectedWorkout(workout)}
              >
                <div className="workout-card-header">
                  <h3>{workout.name}</h3>
                  <span className={`status-badge ${workout.completed ? 'completed' : 'pending'}`}>
                    {workout.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>
                <p className="workout-date">
                  {new Date(workout.date).toLocaleDateString()}
                </p>
                <p className="workout-exercises">
                  {workout.exercises?.length || 0} exercises
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

