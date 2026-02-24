import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { macroAPI } from '../utils/api';

export default function MacroTracker() {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [macroData, setMacroData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMealForm, setShowMealForm] = useState(false);
  const [editingMealIndex, setEditingMealIndex] = useState(null);
  const [mealForm, setMealForm] = useState({
    mealName: '',
    protein: 0,
    carbs: 0,
    fats: 0,
    calories: 0,
  });

  useEffect(() => {
    loadMacroData();
  }, [date, user]);

  const loadMacroData = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const response = await macroAPI.getByDate(user.id, date);
      setMacroData(response.data);
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(err.response?.data?.message || 'Failed to load macro data');
      } else {
        setMacroData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const dailyTargets = macroData?.dailyTargets || {
        protein: 150,
        carbs: 200,
        fats: 65,
        calories: 2000,
      };

      if (editingMealIndex !== null && macroData && macroData._id) {
        // Update existing meal
        await macroAPI.updateMeal(macroData._id, editingMealIndex, {
          mealName: mealForm.mealName,
          protein: mealForm.protein,
          carbs: mealForm.carbs,
          fats: mealForm.fats,
          calories: mealForm.calories,
        });
      } else {
        // Add new meal
        await macroAPI.createOrUpdate({
          clientId: user.id,
          meals: [mealForm],
          dailyTargets,
        });
      }

      setMealForm({
        mealName: '',
        protein: 0,
        carbs: 0,
        fats: 0,
        calories: 0,
      });
      setShowMealForm(false);
      setEditingMealIndex(null);
      loadMacroData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save meal');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMeal = (meal, index) => {
    setMealForm({
      mealName: meal.mealName || '',
      protein: meal.protein || 0,
      carbs: meal.carbs || 0,
      fats: meal.fats || 0,
      calories: meal.calories || 0,
    });
    setEditingMealIndex(index);
    setShowMealForm(true);
  };

  const handleCancelEdit = () => {
    setMealForm({
      mealName: '',
      protein: 0,
      carbs: 0,
      fats: 0,
      calories: 0,
    });
    setEditingMealIndex(null);
    setShowMealForm(false);
  };

  const handleDeleteMeal = async (macroId, mealIndex) => {
    if (!window.confirm('Delete this meal?')) return;

    setLoading(true);
    try {
      await macroAPI.deleteMeal(macroId, mealIndex);
      loadMacroData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete meal');
    } finally {
      setLoading(false);
    }
  };

  const calculateCalories = () => {
    const calculated = mealForm.protein * 4 + mealForm.carbs * 4 + mealForm.fats * 9;
    setMealForm({ ...mealForm, calories: calculated });
  };

  useEffect(() => {
    calculateCalories();
  }, [mealForm.protein, mealForm.carbs, mealForm.fats]);

  const targets = macroData?.dailyTargets || {
    protein: 150,
    carbs: 200,
    fats: 65,
    calories: 2000,
  };

  const totals = macroData
    ? {
        protein: macroData.totalProtein || 0,
        carbs: macroData.totalCarbs || 0,
        fats: macroData.totalFats || 0,
        calories: macroData.totalCalories || 0,
      }
    : { protein: 0, carbs: 0, fats: 0, calories: 0 };

  const getProgress = (current, target) => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="macro-tracker">
      <div className="macro-header">
        <h2>Macro Tracker</h2>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="date-input"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && !macroData ? (
        <div className="loading-container">Loading...</div>
      ) : (
        <>
          <div className="macro-summary">
            <div className="macro-progress">
              <div className="macro-item">
                <div className="macro-label">
                  <span>Protein</span>
                  <span>{totals.protein}g / {targets.protein}g</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill protein"
                    style={{ width: `${getProgress(totals.protein, targets.protein)}%` }}
                  ></div>
                </div>
              </div>
              <div className="macro-item">
                <div className="macro-label">
                  <span>Carbs</span>
                  <span>{totals.carbs}g / {targets.carbs}g</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill carbs"
                    style={{ width: `${getProgress(totals.carbs, targets.carbs)}%` }}
                  ></div>
                </div>
              </div>
              <div className="macro-item">
                <div className="macro-label">
                  <span>Fats</span>
                  <span>{totals.fats}g / {targets.fats}g</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill fats"
                    style={{ width: `${getProgress(totals.fats, targets.fats)}%` }}
                  ></div>
                </div>
              </div>
              <div className="macro-item">
                <div className="macro-label">
                  <span>Calories</span>
                  <span>{totals.calories} / {targets.calories}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill calories"
                    style={{ width: `${getProgress(totals.calories, targets.calories)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="meals-section">
            <div className="meals-header">
              <h3>Meals</h3>
              <button
                onClick={() => showMealForm ? handleCancelEdit() : setShowMealForm(true)}
                className="btn-primary"
              >
                {showMealForm ? 'Cancel' : '+ Add Meal'}
              </button>
            </div>

            {showMealForm && (
              <form onSubmit={handleAddMeal} className="meal-form">
                {editingMealIndex !== null && (
                  <p className="edit-notice">Editing meal...</p>
                )}
                <div className="form-row">
                  <div className="form-group">
                    <label>Meal Name</label>
                    <input
                      type="text"
                      value={mealForm.mealName}
                      onChange={(e) => setMealForm({ ...mealForm, mealName: e.target.value })}
                      required
                      placeholder="e.g., Breakfast, Lunch"
                    />
                  </div>
                  <div className="form-group">
                    <label>Protein (g)</label>
                    <input
                      type="number"
                      value={mealForm.protein}
                      onChange={(e) => setMealForm({ ...mealForm, protein: Number(e.target.value) })}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div className="form-group">
                    <label>Carbs (g)</label>
                    <input
                      type="number"
                      value={mealForm.carbs}
                      onChange={(e) => setMealForm({ ...mealForm, carbs: Number(e.target.value) })}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div className="form-group">
                    <label>Fats (g)</label>
                    <input
                      type="number"
                      value={mealForm.fats}
                      onChange={(e) => setMealForm({ ...mealForm, fats: Number(e.target.value) })}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div className="form-group">
                    <label>Calories</label>
                    <input
                      type="number"
                      value={mealForm.calories}
                      onChange={(e) => setMealForm({ ...mealForm, calories: Number(e.target.value) })}
                      min="0"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary">
                  {editingMealIndex !== null ? 'Update Meal' : 'Add Meal'}
                </button>
              </form>
            )}

            <div className="meals-list">
              {macroData?.meals?.length > 0 ? (
                macroData.meals.map((meal, index) => (
                  <div key={index} className="meal-card">
                    <div className="meal-info">
                      <h4>{meal.mealName}</h4>
                      <div className="meal-macros">
                        <span>P: {meal.protein}g</span>
                        <span>C: {meal.carbs}g</span>
                        <span>F: {meal.fats}g</span>
                        <span>{meal.calories} cal</span>
                      </div>
                    </div>
                    <div className="meal-actions">
                      <button
                        onClick={() => handleEditMeal(meal, index)}
                        className="btn-secondary small"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMeal(macroData._id, index)}
                        className="btn-danger small"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state">No meals logged for this date</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

