// src/components/AutoMeal/AutoMeal.jsx

import React, { useState } from 'react';
import MealPlanGenerator from './pages/MealPlanGenerator';
import FoodBrowser from './pages/FoodBrowser';

function AutoMeal() {
  const [activeTab, setActiveTab] = useState('meal-plan');

  return (
    <div style={{
      marginLeft: '100px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
      paddingBottom: '40px'
    }}>
      {/* Render based on active tab - NO HEADER */}
      <div>
        {activeTab === 'meal-plan' && <MealPlanGenerator onSwitchTab={setActiveTab} />}
        {activeTab === 'food-browser' && <FoodBrowser onSwitchTab={setActiveTab} />}
      </div>
    </div>
  );
}

export default AutoMeal;