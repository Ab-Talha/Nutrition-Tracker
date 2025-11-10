import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { foodService } from '../../services/foodService';
import { calculateNutritionTotals } from '../../utils/helpers';
import { Button } from '../Common/Button';
import Sidebar from '../Navigation/Sidebar';

const MealEntryApp = ({ user, onNavigate = () => {} }) => {
  const { logout } = useAuth();
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [foodOptions, setFoodOptions] = useState([]);
  const [allFoods, setAllFoods] = useState([]);
  const [presets, setPresets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mealType, setMealType] = useState('Breakfast');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logTime, setLogTime] = useState('08:00');
  const [loading, setLoading] = useState(false);
  const [foodDataCache, setFoodDataCache] = useState({});
  const [nutritionTheme, setNutritionTheme] = useState('modern');

  useEffect(() => {
    const loadFoods = async () => {
      const foods = await foodService.getAllFoods();
      setAllFoods(foods);
      setFoodOptions(foods);
      const cache = {};
      foods.forEach(food => {
        cache[food.FoodID] = food;
      });
      setFoodDataCache(cache);
    };
    loadFoods();
    loadPresets();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!searchTerm.trim()) {
        setFoodOptions(allFoods);
      } else {
        const filtered = allFoods.filter(food =>
          food.FoodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          food.BrandName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFoodOptions(filtered);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, allFoods]);

  const totals = calculateNutritionTotals(selectedFoods);

  const addFood = (food) => {
    if (selectedFoods.find(f => f.FoodID === food.FoodID)) {
      alert('Already added!');
      return;
    }
    setSelectedFoods([...selectedFoods, { ...food, Quantity: 100 }]);
  };

  const removeFood = (foodId) => {
    setSelectedFoods(selectedFoods.filter(f => f.FoodID !== foodId));
  };

  const updateQuantity = (foodId, qty) => {
    setSelectedFoods(selectedFoods.map(f =>
      f.FoodID === foodId ? { ...f, Quantity: parseInt(qty) || 0 } : f
    ));
  };

  const logMeal = async () => {
    if (selectedFoods.length === 0) {
      alert('Add at least one food!');
      return;
    }
    setLoading(true);
    try {
      const response = await foodService.logMeal(
        user.UserID,
        mealType,
        `${logDate}T${logTime}:00`,
        selectedFoods.map(f => ({ FoodID: f.FoodID, Quantity: f.Quantity }))
      );
      if (response.success) {
        alert('Logged successfully!');
        setSelectedFoods([]);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const savePreset = async () => {
    if (selectedFoods.length === 0) {
      alert('Add at least one food!');
      return;
    }
    const name = prompt('Preset name:');
    if (!name) return;
    
    setLoading(true);
    try {
      const response = await foodService.createPreset(
        user.UserID,
        name,
        mealType,
        selectedFoods.map(f => ({ FoodID: f.FoodID, Quantity: f.Quantity }))
      );
      if (response.success) {
        alert('Preset saved!');
        loadPresets();
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPresets = async () => {
    const presetsData = await foodService.getPresets(user.UserID);
    setPresets(presetsData);
  };

  const logPreset = async (presetId) => {
    setLoading(true);
    try {
      const preset = await foodService.getPresetById(presetId);
      if (preset) {
        const response = await foodService.logMeal(
          user.UserID,
          mealType,
          `${logDate}T${logTime}:00`,
          preset.Foods
        );
        if (response.success) {
          alert('Preset logged!');
        }
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deletePreset = async (presetId) => {
    if (!window.confirm('Delete this preset?')) return;
    try {
      await foodService.deletePreset(presetId);
      alert('Deleted!');
      loadPresets();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const getPresetTotals = (preset) => {
    const foods = preset.Foods.map(f => ({
      ...foodDataCache[f.FoodID],
      Quantity: f.Quantity
    })).filter(f => f.FoodID);
    return calculateNutritionTotals(foods);
  };

  const renderNutrition = () => {
    if (nutritionTheme === 'modern') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14.4px', marginBottom: '14.4px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '19.2px', textAlign: 'center' }}>
            <div style={{ fontSize: '13.2px', opacity: 0.8, marginBottom: '9.6px' }}>Total Calories</div>
            <div style={{ fontSize: '33.6px', fontWeight: 'bold', color: '#fca5a5' }}>{Math.round(totals.calories)}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9.6px' }}>
            <div style={{ background: 'rgba(132, 204, 22, 0.15)', border: '1px solid rgba(132, 204, 22, 0.2)', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '14.4px' }}>
              <span>Protein</span>
              <span style={{ fontWeight: 'bold' }}>{Math.round(totals.protein)}g</span>
            </div>
            <div style={{ background: 'rgba(34, 211, 238, 0.15)', border: '1px solid rgba(34, 211, 238, 0.2)', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '14.4px' }}>
              <span>Carbs</span>
              <span style={{ fontWeight: 'bold' }}>{Math.round(totals.carbs)}g</span>
            </div>
          </div>
        </div>
      );
    }

    if (nutritionTheme === 'linear') {
      const nutrients = [
        { label: 'Calories', value: Math.round(totals.calories), unit: '', color: '#fca5a5', max: 2500 },
        { label: 'Protein', value: Math.round(totals.protein), unit: 'g', color: '#86efac', max: 150 },
        { label: 'Carbs', value: Math.round(totals.carbs), unit: 'g', color: '#7dd3fc', max: 300 },
        { label: 'Fat', value: Math.round(totals.fat), unit: 'g', color: '#fdba74', max: 80 },
        { label: 'Fiber', value: Math.round(totals.fiber), unit: 'g', color: '#fde047', max: 35 },
        { label: 'Sugar', value: Math.round(totals.sugar), unit: 'g', color: '#f472b6', max: 50 }
      ];

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {nutrients.map(nut => {
            const percentage = Math.min((nut.value / nut.max) * 100, 100);
            return (
              <div key={nut.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                  <span>{nut.label}</span>
                  <span style={{ fontWeight: 'bold', color: nut.color }}>{nut.value}{nut.unit}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${percentage}%`, height: '100%', background: nut.color, borderRadius: '4px', transition: 'width 0.3s' }} />
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (nutritionTheme === 'glass') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', padding: '16px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>Calories</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fca5a5' }}>{Math.round(totals.calories)}</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', padding: '16px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>Protein</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#86efac' }}>{Math.round(totals.protein)}g</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', padding: '16px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>Carbs</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#7dd3fc' }}>{Math.round(totals.carbs)}g</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', padding: '16px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>Fat</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fdba74' }}>{Math.round(totals.fat)}g</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', padding: '16px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>Fiber</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fde047' }}>{Math.round(totals.fiber)}g</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', padding: '16px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>Sugar</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f472b6' }}>{Math.round(totals.sugar)}g</div>
          </div>
        </div>
      );
    }

    // Gradient theme
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.1) 100%)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '18px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>Calories</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fca5a5' }}>{Math.round(totals.calories)}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, rgba(132, 204, 22, 0.3) 0%, rgba(132, 204, 22, 0.1) 100%)', border: '1px solid rgba(132, 204, 22, 0.3)', borderRadius: '12px', padding: '18px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>Protein</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#86efac' }}>{Math.round(totals.protein)}g</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.3) 0%, rgba(34, 211, 238, 0.1) 100%)', border: '1px solid rgba(34, 211, 238, 0.3)', borderRadius: '12px', padding: '18px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>Carbs</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#7dd3fc' }}>{Math.round(totals.carbs)}g</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.3) 0%, rgba(251, 146, 60, 0.1) 100%)', border: '1px solid rgba(251, 146, 60, 0.3)', borderRadius: '12px', padding: '18px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>Fat</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fdba74' }}>{Math.round(totals.fat)}g</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.3) 0%, rgba(250, 204, 21, 0.1) 100%)', border: '1px solid rgba(250, 204, 21, 0.3)', borderRadius: '12px', padding: '18px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>Fiber</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fde047' }}>{Math.round(totals.fiber)}g</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.3) 0%, rgba(236, 72, 153, 0.1) 100%)', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '12px', padding: '18px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>Sugar</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f472b6' }}>{Math.round(totals.sugar)}g</div>
        </div>
      </div>
    );
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <Sidebar activePage="meal-entry" onNavigate={onNavigate} onLogout={logout} />
      
      <div style={{ flex: 1, padding: '24px', marginLeft: '100px', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '0 20px' }}>
          <h1 style={{ fontSize: '33.6px', color: '#4ade80', margin: 0 }}>🍽️ MetaFit</h1>
          <span style={{ fontSize: '16.8px' }}>Welcome, {user.Name}!</span>
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '384px 480px 1fr', gap: '24px', maxWidth: '1920px', margin: '0 auto' }}>
          {/* Column 1: Food Search */}
          <div style={cardStyle}>
            <h2 style={{ marginBottom: '19.2px', fontSize: '24px', fontWeight: 'bold', margin: '0 0 19.2px 0' }}>🔍 Food Search</h2>
            <input
              type="text"
              placeholder="Search foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '14.4px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', color: '#fff', marginBottom: '14.4px', boxSizing: 'border-box', fontSize: '14.4px' }}
            />
            <div style={{ height: '720px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '9.6px' }}>
              {foodOptions.slice(0, 30).map(food => (
                <div
                  key={food.FoodID}
                  onClick={() => addFood(food)}
                  style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '14.4px', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '14.4px', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '15.6px' }}>{food.FoodName}</div>
                  <div style={{ fontSize: '13.2px', opacity: 0.7 }}>{food.Calories} cal/100g</div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Meal Entry */}
          <div style={cardStyle}>
            <h2 style={{ marginBottom: '19.2px', fontSize: '24px', fontWeight: 'bold', margin: '0 0 19.2px 0' }}>🥘 Meal Entry</h2>
            
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', color: '#fff', marginBottom: '14.4px', boxSizing: 'border-box', fontSize: '14.4px' }}
            >
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
              <option>Snack</option>
            </select>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '14.4px' }}>
              <input
                type="time"
                value={logTime}
                onChange={(e) => setLogTime(e.target.value)}
                style={{ flex: 1, padding: '12px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', fontSize: '14.4px' }}
              />
              <input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                style={{ flex: 1, padding: '12px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', fontSize: '14.4px' }}
              />
            </div>

            <div style={{ fontSize: '15.6px', fontWeight: 'bold', marginBottom: '9.6px' }}>Items Quantity (g)</div>

            <div style={{ height: '540px', overflowY: 'auto', marginBottom: '14.4px', paddingRight: '9.6px' }}>
              {selectedFoods.map(food => (
                <div
                  key={food.FoodID}
                  style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '12px', marginBottom: '9.6px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '15.6px', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                >
                  <span>{food.FoodName}</span>
                  <input
                    type="number"
                    value={food.Quantity}
                    onChange={(e) => updateQuantity(food.FoodID, e.target.value)}
                    style={{ width: '84px', padding: '6px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '5px', color: '#fff', margin: '0 12px', textAlign: 'right', fontSize: '14.4px', boxSizing: 'border-box' }}
                  />
                  <button
                    onClick={() => removeFood(food.FoodID)}
                    style={{ background: 'rgba(239, 68, 68, 0.3)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '14.4px' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button onClick={logMeal} disabled={loading} variant="primary">
                {loading ? 'Logging...' : 'Log Meals'}
              </Button>
              <Button onClick={savePreset} disabled={loading} variant="primary">
                {loading ? 'Saving...' : 'Save as Preset'}
              </Button>
            </div>
          </div>

          {/* Column 3: Presets & Nutrition */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Presets */}
            <div style={cardStyle}>
              <h2 style={{ marginBottom: '19.2px', fontSize: '24px', fontWeight: 'bold', margin: '0 0 19.2px 0' }}>⭐ Preset Meals</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14.4px', maxHeight: '432px', overflowY: 'auto' }}>
                {presets.map(preset => {
                  const pTotals = getPresetTotals(preset);
                  return (
                    <div
                      key={preset.id}
                      style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '16.8px', border: '1px solid rgba(255, 255, 255, 0.15)', display: 'flex', flexDirection: 'column', minHeight: '360px', backdropFilter: 'blur(10px)', transition: 'all 0.3s ease' }}
                    >
                      <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#fff', borderBottom: '1px solid rgba(132, 204, 23, 0.2)', paddingBottom: '9.6px' }}>
                        {preset.Name}
                      </div>

                      <div style={{ maxHeight: '60px', overflowY: 'auto', marginBottom: '12px', fontSize: '13.2px', paddingRight: '4px' }}>
                        {preset.Foods.map(food => (
                          <div key={food.FoodID} style={{ padding: '3.6px 0', opacity: 0.75, lineHeight: '1.3' }}>
                            • {foodDataCache[food.FoodID]?.FoodName || `Food ${food.FoodID}`} <span style={{opacity: 0.6}}>({food.Quantity}g)</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', padding: '12px', marginBottom: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9.6px', fontSize: '14.4px' }}>
                        <div style={{textAlign: 'center', paddingBottom: '9.6px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>
                          <div style={{fontSize: '13.2px', opacity: 0.7}}>Calories</div>
                          <div style={{fontSize: '19.2px', fontWeight: 'bold', color: '#fca5a5'}}>{Math.round(pTotals.calories)}</div>
                        </div>
                        <div style={{textAlign: 'center', paddingBottom: '9.6px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>
                          <div style={{fontSize: '13.2px', opacity: 0.7}}>Protein</div>
                          <div style={{fontSize: '19.2px', fontWeight: 'bold', color: '#86efac'}}>{Math.round(pTotals.protein)}g</div>
                        </div>
                        <div style={{textAlign: 'center'}}>
                          <div style={{fontSize: '13.2px', opacity: 0.7}}>Carbs</div>
                          <div style={{fontSize: '19.2px', fontWeight: 'bold', color: '#7dd3fc'}}>{Math.round(pTotals.carbs)}g</div>
                        </div>
                        <div style={{textAlign: 'center'}}>
                          <div style={{fontSize: '13.2px', opacity: 0.7}}>Fat</div>
                          <div style={{fontSize: '19.2px', fontWeight: 'bold', color: '#fdba74'}}>{Math.round(pTotals.fat)}g</div>
                        </div>
                        <div style={{textAlign: 'center'}}>
                          <div style={{fontSize: '13.2px', opacity: 0.7}}>Fiber</div>
                          <div style={{fontSize: '16.8px', fontWeight: 'bold', color: '#fde047'}}>{Math.round(pTotals.fiber)}g</div>
                        </div>
                        <div style={{textAlign: 'center'}}>
                          <div style={{fontSize: '13.2px', opacity: 0.7}}>Sugar</div>
                          <div style={{fontSize: '16.8px', fontWeight: 'bold', color: '#f472b6'}}>{Math.round(pTotals.sugar)}g</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '7.2px', marginTop: 'auto' }}>
                        <button
                          onClick={() => logPreset(preset.id)}
                          style={{ flex: 1, padding: '7.2px 12px', background: '#85cc17', color: '#0f172a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13.2px', fontWeight: 'bold' }}
                        >
                          Log Meal
                        </button>
                        <button
                          onClick={() => deletePreset(preset.id)}
                          style={{ flex: 1, padding: '7.2px 12px', background: 'rgba(239, 68, 68, 0.5)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13.2px', fontWeight: 'bold' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Nutrition Summary */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>📊 Nutrition</h2>
                <select
                  value={nutritionTheme}
                  onChange={(e) => setNutritionTheme(e.target.value)}
                  style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '6px', color: '#fff', fontSize: '12px', cursor: 'pointer' }}
                >
                  <option value="modern">Modern</option>
                  <option value="circular">Circular</option>
                  <option value="linear">Linear</option>
                  <option value="glass">Glass</option>
                  <option value="gradient">Gradient</option>
                </select>
              </div>

              {renderNutrition()}

              {nutritionTheme !== 'linear' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '12px' }}>
                  <div style={{ background: 'rgba(251, 146, 60, 0.15)', border: '1px solid rgba(251, 146, 60, 0.2)', borderRadius: '8px', padding: '12px', textAlign: 'center', fontSize: '14.4px' }}>
                    <div style={{ opacity: 0.8, marginBottom: '4.8px' }}>Fat</div>
                    <div style={{ fontWeight: 'bold', fontSize: '16.8px' }}>{Math.round(totals.fat)}g</div>
                  </div>
                  <div style={{ background: 'rgba(250, 204, 21, 0.15)', border: '1px solid rgba(250, 204, 21, 0.2)', borderRadius: '8px', padding: '12px', textAlign: 'center', fontSize: '14.4px' }}>
                    <div style={{ opacity: 0.8, marginBottom: '4.8px' }}>Fiber</div>
                    <div style={{ fontWeight: 'bold', fontSize: '16.8px' }}>{Math.round(totals.fiber)}g</div>
                  </div>
                  <div style={{ background: 'rgba(236, 72, 153, 0.15)', border: '1px solid rgba(236, 72, 153, 0.2)', borderRadius: '8px', padding: '12px', textAlign: 'center', fontSize: '14.4px' }}>
                    <div style={{ opacity: 0.8, marginBottom: '4.8px' }}>Sugar</div>
                    <div style={{ fontWeight: 'bold', fontSize: '16.8px' }}>{Math.round(totals.sugar)}g</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealEntryApp;