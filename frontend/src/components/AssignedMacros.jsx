import { useState, useEffect } from 'react';
import { macroAPI } from '../utils/api';

export default function AssignedMacros({ clients }) {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [macroData, setMacroData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadMacro = async () => {
    if (!selectedClientId) {
      setMacroData(null);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await macroAPI.getByDate(selectedClientId, date);
      setMacroData(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setMacroData(null);
      } else {
        setError(err.response?.data?.message || 'Failed to load macros');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMacro();
  }, [selectedClientId, date]);

  const handleSaveTargets = async (e) => {
    e.preventDefault();
    if (!selectedClientId) return setError('Select a client');
    const form = e.target;
    const targets = {
      protein: Number(form.protein.value) || 0,
      carbs: Number(form.carbs.value) || 0,
      fats: Number(form.fats.value) || 0,
      calories: Number(form.calories.value) || 0,
    };
    setSaving(true);
    setError('');
    try {
      // optimistic update: assume targets saved
      const prev = macroData;
      setMacroData((m) => ({ ...(m || {}), dailyTargets: targets }));
      await macroAPI.createOrUpdate({ clientId: selectedClientId, dailyTargets: targets, meals: [] });
      loadMacro();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save targets');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    if (!selectedClientId) return setError('Select a client');
    const form = e.target;
    const meal = {
      mealName: form.mealName.value || 'Meal',
      protein: Number(form.protein.value) || 0,
      carbs: Number(form.carbs.value) || 0,
      fats: Number(form.fats.value) || 0,
      calories: Number(form.calories.value) || 0,
    };
    setSaving(true);
    setError('');
    try {
      // optimistic update: append meal locally
      const prev = macroData;
      const optimistic = {
        ...(macroData || {}),
        meals: [...(macroData?.meals || []), meal],
        totalProtein: (macroData?.totalProtein || 0) + (meal.protein || 0),
        totalCarbs: (macroData?.totalCarbs || 0) + (meal.carbs || 0),
        totalFats: (macroData?.totalFats || 0) + (meal.fats || 0),
        totalCalories: (macroData?.totalCalories || 0) + (meal.calories || 0),
      };
      setMacroData(optimistic);
      await macroAPI.createOrUpdate({ clientId: selectedClientId, meals: [meal], dailyTargets: macroData?.dailyTargets || {} });
      form.reset();
      loadMacro();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add meal');
      // rollback by reloading
      loadMacro();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMeal = async (macroId, index) => {
    if (!window.confirm('Delete this meal?')) return;
    try {
      // optimistic remove
      const prev = macroData;
      const meals = [...(macroData?.meals || [])];
      const removed = meals.splice(index, 1)[0] || { protein:0, carbs:0, fats:0, calories:0 };
      setMacroData({
        ...(macroData || {}),
        meals,
        totalProtein: (macroData?.totalProtein || 0) - (removed.protein || 0),
        totalCarbs: (macroData?.totalCarbs || 0) - (removed.carbs || 0),
        totalFats: (macroData?.totalFats || 0) - (removed.fats || 0),
        totalCalories: (macroData?.totalCalories || 0) - (removed.calories || 0),
      });
      await macroAPI.deleteMeal(macroId, index);
      loadMacro();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete meal');
      loadMacro();
    }
  };

  return (
    <div className="assigned-macros">
      <h2>Assigned Macros</h2>
      <p className="hint">View or set daily macro targets and add meals for a client on a specific date.</p>

      <div className="form-group">
        <label>Client</label>
        <select value={selectedClientId} onChange={(e) => { setSelectedClientId(e.target.value); setError(''); }}>
          <option value="">Choose a client...</option>
          {clients.map((c) => (
            <option key={c._id || c.id} value={c._id || c.id}>{c.username}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="macro-targets">
        <h3>Daily Targets</h3>
        <form onSubmit={handleSaveTargets} className="targets-form">
          <div className="form-row">
            <div className="form-group">
              <label>Protein (g)</label>
              <input name="protein" defaultValue={macroData?.dailyTargets?.protein || ''} />
            </div>
            <div className="form-group">
              <label>Carbs (g)</label>
              <input name="carbs" defaultValue={macroData?.dailyTargets?.carbs || ''} />
            </div>
            <div className="form-group">
              <label>Fats (g)</label>
              <input name="fats" defaultValue={macroData?.dailyTargets?.fats || ''} />
            </div>
            <div className="form-group">
              <label>Calories</label>
              <input name="calories" defaultValue={macroData?.dailyTargets?.calories || ''} />
            </div>
            <div className="form-group align-end">
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Targets'}</button>
            </div>
          </div>
        </form>
      </div>

      <div className="add-meal">
        <h3>Add Meal</h3>
        <form onSubmit={handleAddMeal} className="add-meal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Meal Name</label>
              <input name="mealName" />
            </div>
            <div className="form-group">
              <label>Protein</label>
              <input name="protein" type="number" />
            </div>
            <div className="form-group">
              <label>Carbs</label>
              <input name="carbs" type="number" />
            </div>
            <div className="form-group">
              <label>Fats</label>
              <input name="fats" type="number" />
            </div>
            <div className="form-group">
              <label>Calories</label>
              <input name="calories" type="number" />
            </div>
            <div className="form-group align-end">
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Adding...' : 'Add Meal'}</button>
            </div>
          </div>
        </form>
      </div>

      <div className="macro-summary">
        <h3>Summary</h3>
        {loading ? (
          <div className="loading-container">Loading...</div>
        ) : !macroData ? (
          <div className="empty-state">No macro entry for this date.</div>
        ) : (
          <>
            <div className="targets-display">
              <div>Protein: {macroData.dailyTargets?.protein || 0}g</div>
              <div>Carbs: {macroData.dailyTargets?.carbs || 0}g</div>
              <div>Fats: {macroData.dailyTargets?.fats || 0}g</div>
              <div>Calories: {macroData.dailyTargets?.calories || 0}</div>
            </div>
            <div className="totals">
              <div>Protein: {macroData.totalProtein || 0}g</div>
              <div>Carbs: {macroData.totalCarbs || 0}g</div>
              <div>Fats: {macroData.totalFats || 0}g</div>
              <div>Calories: {macroData.totalCalories || 0}</div>
            </div>

            <div className="meals-list">
              {macroData.meals?.length > 0 ? (
                macroData.meals.map((m, i) => (
                  <div key={i} className="meal-item">
                    <div className="meal-info">
                      <strong>{m.mealName}</strong>
                      <div className="meal-macros">P {m.protein}g · C {m.carbs}g · F {m.fats}g · {m.calories} kcal</div>
                    </div>
                    <div className="meal-actions">
                      <button className="btn-danger" onClick={() => handleDeleteMeal(macroData._id, i)}>Delete</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">No meals logged.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
