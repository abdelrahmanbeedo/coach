import { useState } from 'react';
import { workoutAPI } from '../utils/api';

export default function WorkoutDetail({ workout, onBack, onUpdate }) {
  const [completedExercises, setCompletedExercises] = useState(
    workout.completedExercises || []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleExerciseLog = (exerciseName, index) => {
    const existing = completedExercises.findIndex(
      (ex) => ex.exerciseName === exerciseName
    );

    const newLog = {
      exerciseName,
      setsCompleted: workout.exercises[index].sets,
      actualWeight: workout.exercises[index].weight,
      actualReps: workout.exercises[index].targetReps,
      completedAt: new Date(),
    };

    if (existing >= 0) {
      const updated = [...completedExercises];
      updated[existing] = newLog;
      setCompletedExercises(updated);
    } else {
      setCompletedExercises([...completedExercises, newLog]);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await workoutAPI.update(workout._id, {
        completedExercises,
        completed: completedExercises.length === workout.exercises.length,
      });
      setSuccess('Workout logged successfully!');
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save workout');
    } finally {
      setLoading(false);
    }
  };

  const isExerciseCompleted = (exerciseName) => {
    return completedExercises.some((ex) => ex.exerciseName === exerciseName);
  };

  return (
    <div className="workout-detail">
      <div className="workout-detail-header">
        <button onClick={onBack} className="btn-secondary">
          ← Back
        </button>
        <h2>{workout.name}</h2>
        <p className="workout-date">
          {new Date(workout.date).toLocaleDateString()}
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="exercises-list">
        {workout.exercises?.map((exercise, index) => (
          <div
            key={index}
            className={`exercise-item ${isExerciseCompleted(exercise.name) ? 'completed' : ''}`}
          >
            <div className="exercise-info">
              <h3>{exercise.name}</h3>
              <div className="exercise-specs">
                <span>Sets: {exercise.sets}</span>
                <span>Reps: {exercise.targetReps}</span>
                {exercise.weight > 0 && <span>Weight: {exercise.weight} lbs</span>}
                {exercise.restSeconds > 0 && (
                  <span>Rest: {exercise.restSeconds}s</span>
                )}
              </div>
              {exercise.notes && <p className="exercise-notes">{exercise.notes}</p>}
            </div>
            <button
              onClick={() => handleExerciseLog(exercise.name, index)}
              className={`btn-exercise ${isExerciseCompleted(exercise.name) ? 'completed' : ''}`}
            >
              {isExerciseCompleted(exercise.name) ? '✓ Completed' : 'Mark Complete'}
            </button>
          </div>
        ))}
      </div>

      <div className="workout-actions">
        <button
          onClick={handleSave}
          disabled={loading || completedExercises.length === 0}
          className="btn-primary"
        >
          {loading ? 'Saving...' : 'Save Workout'}
        </button>
      </div>
    </div>
  );
}

