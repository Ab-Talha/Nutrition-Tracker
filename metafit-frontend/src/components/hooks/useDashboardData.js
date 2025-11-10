import { useState } from 'react';

export const useDashboardData = () => {
  const [selectedDay, setSelectedDay] = useState('Monday');

  const weightData = [
    { day: 'Mon', weight: 71 },
    { day: 'Tue', weight: 70.5 },
    { day: 'Wed', weight: 71.2 },
    { day: 'Thu', weight: 70.8 },
    { day: 'Fri', weight: 70.6 },
    { day: 'Sat', weight: 70.3 },
    { day: 'Sun', weight: 70 }
  ];

  const mealsData = [
    {
      name: 'Breakfast',
      items: [
        { food: 'Chicken', quantity: '120g' },
        { food: 'Rice', quantity: '350g' },
        { food: 'Dal', quantity: '50g' }
      ]
    },
    {
      name: 'Lunch',
      items: [
        { food: 'Bread', quantity: '100g' },
        { food: 'Fish', quantity: '150g' },
        { food: 'Egg', quantity: '50g' },
        { food: 'Apple', quantity: '110g' },
        { food: 'Banana', quantity: '40g' }
      ]
    },
    {
      name: 'Dinner',
      items: [
        { food: 'Grilled Chicken', quantity: '200g' },
        { food: 'Sweet Potato', quantity: '150g' },
        { food: 'Broccoli', quantity: '100g' }
      ]
    },
    {
      name: 'Extra Meal',
      items: [
        { food: 'Protein Shake', quantity: '30g' },
        { food: 'Almonds', quantity: '50g' }
      ]
    }
  ];

  const macroData = [
    { name: 'Protein', percent: 52, current: '78.0', target: '150.0', color: 'rgba(132, 204, 22, 0.9)' },
    { name: 'Carbs', percent: 56, current: '250.0', target: '450.0', color: 'rgba(34, 211, 238, 0.9)' },
    { name: 'Fat', percent: 67, current: '20.0', target: '30.0', color: 'rgba(239, 68, 68, 0.9)' },
    { name: 'Fiber', percent: 87, current: '26.0', target: '30.0', color: 'rgba(251, 146, 60, 0.9)' },
    { name: 'Sugar', percent: 77, current: '23.0', target: '30.0', color: 'rgba(250, 204, 21, 0.9)' },
    { name: 'Water', percent: 65, current: '2.6', target: '4.0', color: 'rgba(14, 165, 233, 0.9)' }
  ];

  const tdeeData = [
    { percent: '5%', label: 'EAT', value: '200 Cal' },
    { percent: '10%', label: 'TEF', value: '500 Cal' },
    { percent: '15%', label: 'NEAT', value: '700 Cal' },
    { percent: '70%', label: 'BMR', value: '2000 Cal', isLarge: true }
  ];

  const nutritionSummary = {
    totalCalories: 2235,
    targetCalories: 2300,
    macros: [
      { label: 'Protein', value: '78.0' },
      { label: 'Carbs', value: '250.0' },
      { label: 'Fat', value: '20.0' }
    ]
  };

  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return {
    selectedDay,
    setSelectedDay,
    weightData,
    mealsData,
    macroData,
    tdeeData,
    nutritionSummary,
    days
  };
};