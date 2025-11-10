import React from 'react';
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
    mealsData,
    macroData,
    tdeeData,
    nutritionSummary,
    days
  } = useDashboardData();

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
          onDayChange={setSelectedDay}
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
        
        <MealsSection mealsData={mealsData} />
      </div>
    </div>
  );
}

export default Dashboard;