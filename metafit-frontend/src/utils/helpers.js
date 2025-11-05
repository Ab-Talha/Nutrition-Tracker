export const calculateNutritionTotals = (foods) => {
  return foods.reduce((acc, food) => {
    const multiplier = food.Quantity / 100;
    return {
      calories: acc.calories + ((food.Calories || 0) * multiplier),
      protein: acc.protein + ((food.Protein || 0) * multiplier),
      carbs: acc.carbs + ((food.Carbs || 0) * multiplier),
      fat: acc.fat + ((food.Fat || 0) * multiplier),
      fiber: acc.fiber + ((food.Fiber || 0) * multiplier),
      sugar: acc.sugar + ((food.Sugar || 0) * multiplier),
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 });
};

export const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

export const formatTime = (date) => {
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};