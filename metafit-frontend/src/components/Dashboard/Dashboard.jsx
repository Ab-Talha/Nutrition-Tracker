import React, { useState } from 'react';
import Sidebar from '../Navigation/Sidebar';
import { useDashboardData } from '../hooks/useDashboardData';
import { Header } from './sections/Header';
import { TopGrid } from './sections/TopGrid';
import { BottomGrid } from './sections/BottomGrid';
import { MealsSection } from './sections/MealsSection';

function Dashboard({ user, onNavigate = () => {} }) {
  const {
    selectedDay,
    setSelectedDay,
    weightData,
    macroData,
    tdeeData,
    nutritionSummary,
    days
  } = useDashboardData();

  const [selectedDate, setSelectedDate] = useState(() => {
    // Initialize with today's date
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [refreshKey, setRefreshKey] = useState(0);

  // Callback when day button is clicked
  const handleDayChange = (day) => {
    setSelectedDay(day);
    // Update date based on day selection
    const today = new Date();
    
    const dayOffset = {
      'Monday': -today.getDay() + 1,
      'Tuesday': -today.getDay() + 2,
      'Wednesday': -today.getDay() + 3,
      'Thursday': -today.getDay() + 4,
      'Friday': -today.getDay() + 5,
      'Saturday': -today.getDay() + 6,
      'Sunday': -today.getDay() + 0
    };

    const date = new Date(today);
    date.setDate(date.getDate() + (dayOffset[day] || 0));
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  // Callback when date is picked from calendar
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    // Reset day selection when using date picker
    setSelectedDay(null);
  };

  // Callback when meal data is updated
  const handleMealUpdate = () => {
    // Trigger refresh of meal data
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <Sidebar activePage="dashboard" onNavigate={onNavigate} />
      
      <div style={{
        flex: 1,
        marginLeft: '100px',
        padding: '25px 30px',
        overflowY: 'auto'
      }}>
        <Header 
          user={user} 
          days={days} 
          selectedDay={selectedDay} 
          onDayChange={handleDayChange}
          onDateChange={handleDateChange}
        />
        
        <TopGrid 
          user={user} 
          tdeeData={tdeeData} 
          macroData={macroData}
        />
        
        <BottomGrid 
          weightData={weightData} 
          nutritionSummary={nutritionSummary}
        />
        
        <MealsSection 
          key={refreshKey}
          userId={user?.UserID} 
          selectedDate={selectedDate}
          onMealUpdate={handleMealUpdate}
        />
      </div>
    </div>
  );
}

export default Dashboard;