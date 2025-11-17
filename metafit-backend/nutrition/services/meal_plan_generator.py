# nutrition/services/meal_plan_generator.py

import random
from datetime import datetime, timedelta
from .macro_calculator import MacroCalculator
from .variety_manager import VarietyManager
from .constraint_validator import ConstraintValidator


class MealPlanGenerator:
    """
    Generates an optimized 7-day meal plan using greedy algorithm with variety constraints.
    """

    MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']
    CALORIES_PER_MEAL = {
        'breakfast': 0.25,  # 25% of daily calories
        'lunch': 0.35,      # 35% of daily calories
        'dinner': 0.30,     # 30% of daily calories
        'snack': 0.10       # 10% of daily calories
    }

    def __init__(self, foods_list, calorie_target, gender, custom_macros=None):
        """
        Initialize meal plan generator.

        Args:
            foods_list (list): List of food dictionaries from database
            calorie_target (int): Daily calorie target
            gender (str): 'male' or 'female'
            custom_macros (dict): Optional custom macro targets
        """
        self.foods_list = foods_list
        self.calorie_target = calorie_target
        self.gender = gender
        self.custom_macros = custom_macros
        
        # Calculate targets
        self.target_macros = MacroCalculator.calculate_macros(
            calorie_target, gender, custom_macros
        )
        
        # Initialize variety manager
        self.variety_manager = VarietyManager(
            max_repetitions=3,
            consecutive_day_gap=1
        )
        
        # Store results
        self.meal_plan = []
        self.daily_results = []

    def generate(self, start_date=None):
        """
        Generate a complete 7-day meal plan.

        Args:
            start_date (datetime): Start date for the plan (default: today)

        Returns:
            dict: Complete meal plan with validation results
        """
        if start_date is None:
            start_date = datetime.now()

        # Generate for each day
        for day in range(1, 8):
            current_date = start_date + timedelta(days=day-1)
            self.variety_manager.start_day(day)
            
            day_plan = self._generate_day(day, current_date)
            self.meal_plan.append(day_plan)
            self.daily_results.append(day_plan['validation'])

        # Generate weekly summary
        weekly_summary = ConstraintValidator.validate_weekly_plan(
            self.daily_results,
            self.target_macros
        )

        return {
            'success': True,
            'meal_plan': self.meal_plan,
            'weekly_summary': weekly_summary,
            'target_macros': self.target_macros,
            'variety_stats': self.variety_manager.get_food_usage_summary()
        }

    def _generate_day(self, day_number, date):
        """
        Generate meals for a single day with post-generation adjustment.

        Args:
            day_number (int): Day 1-7
            date (datetime): Date for this day

        Returns:
            dict: Day's meal plan with validation
        """
        day_meals = {
            'day': day_number,
            'date': date.strftime('%Y-%m-%d'),
            'meals': {}
        }

        all_meals_items = []
        meal_attempts = 0
        max_attempts = 3

        # Keep trying until we get within ±50 kcal tolerance
        while meal_attempts < max_attempts:
            all_meals_items = []

            # Generate each meal type
            for meal_type in self.MEAL_TYPES:
                meal_calories_target = self.calorie_target * self.CALORIES_PER_MEAL[meal_type]
                
                meal_items = self._generate_meal(
                    meal_type,
                    meal_calories_target,
                    day_number
                )
                
                day_meals['meals'][meal_type] = meal_items
                all_meals_items.extend(meal_items)

            # Calculate total
            total_calories = sum(item['calories'] for item in all_meals_items)
            
            # Check if within tolerance (±50 kcal)
            tolerance = 50
            if abs(total_calories - self.calorie_target) <= tolerance:
                # GOOD! Within range
                break
            
            # Not within range - try to adjust
            if meal_attempts < max_attempts - 1:
                # If too high, reduce last item's quantity
                if total_calories > self.calorie_target and all_meals_items:
                    excess = total_calories - self.calorie_target
                    last_item = all_meals_items[-1]
                    
                    # Reduce last item quantity by percentage
                    reduction_factor = 1 - (excess / last_item['calories']) * 0.5
                    reduction_factor = max(0.5, min(1.0, reduction_factor))
                    
                    last_item['quantity'] *= reduction_factor
                    for key in ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar']:
                        last_item[key] *= reduction_factor
                        last_item[key] = round(last_item[key], 2)
                
                # If too low, try regenerating with different foods
                elif total_calories < self.calorie_target:
                    # Clear and regenerate
                    self.variety_manager.reset()
                    for day in range(1, day_number + 1):
                        self.variety_manager.start_day(day)
            
            meal_attempts += 1

        # Validate the day
        validation = ConstraintValidator.validate_daily_meal(
            all_meals_items,
            self.target_macros
        )

        day_meals['daily_totals'] = validation['totals']
        day_meals['validation'] = validation

        return day_meals

    def _generate_meal(self, meal_type, calories_target, day_number, max_items=2):
        """
        Generate a single meal using 2 foods to match calorie target.

        Args:
            meal_type (str): 'breakfast', 'lunch', 'dinner', 'snack'
            calories_target (float): Target calories for this meal
            day_number (int): Current day (1-7)
            max_items (int): Maximum food items per meal

        Returns:
            list: List of food items for the meal
        """
        meal_items = []
        remaining_calories = calories_target
        items_added = 0

        # Get available foods (respecting variety constraints)
        available_food_ids = self.variety_manager.get_available_foods(
            [f['FoodID'] for f in self.foods_list],
            day_number
        )

        # Filter foods that aren't already used in this day
        used_today = self.variety_manager.get_day_foods(day_number)
        available_food_ids = [fid for fid in available_food_ids if fid not in used_today]

        # Filter out ultra-dense foods for snacks (> 6 cal/gram)
        if meal_type == 'snack':
            available_food_ids = [
                fid for fid in available_food_ids
                if self._get_calorie_density(fid) < 6.0
            ]

        if not available_food_ids:
            return meal_items

        # Add up to 2 foods to meal
        while items_added < max_items and remaining_calories > 80 and available_food_ids:
            # Score all available foods
            food_scores = []
            
            for food_id in available_food_ids:
                food = next((f for f in self.foods_list if f['FoodID'] == food_id), None)
                if not food:
                    continue

                score = self._score_food(food, remaining_calories, day_number)
                food_scores.append((food_id, food, score))

            if not food_scores:
                break

            # Sort by score and pick the best food
            food_scores.sort(key=lambda x: x[2], reverse=True)
            best_food_id, best_food, _ = food_scores[0]

            # STRICT: Don't exceed remaining calories
            # If this is last item, use all remaining. Otherwise use 50%
            if items_added == max_items - 1:
                target_for_item = remaining_calories
            else:
                target_for_item = remaining_calories * 0.5

            quantity = self._calculate_quantity(best_food, target_for_item)

            if quantity > 0:
                meal_item = self._create_meal_item(best_food, quantity)
                
                # CRITICAL: If this item exceeds remaining, skip it
                if meal_item['calories'] > remaining_calories:
                    available_food_ids.remove(best_food_id)
                    continue
                
                meal_items.append(meal_item)
                remaining_calories -= meal_item['calories']
                items_added += 1
                
                # Register food usage
                self.variety_manager.register_food(best_food_id, day_number)
                available_food_ids.remove(best_food_id)
            else:
                available_food_ids.remove(best_food_id)

        return meal_items

    def _get_calorie_density(self, food_id):
        """Get calorie density (cal/gram) for a food."""
        food = next((f for f in self.foods_list if f['FoodID'] == food_id), None)
        if not food:
            return 0
        
        food_calories = float(food['Calories'])
        food_quantity = float(food['Quantity'])
        
        if food_quantity <= 0:
            return 0
        
        return food_calories / food_quantity

    def _score_food(self, food, remaining_calories, day_number):
        """
        Score a food based on how well it fits current needs.

        Args:
            food (dict): Food item from database
            remaining_calories (float): Remaining calories for meal
            day_number (int): Current day

        Returns:
            float: Score (higher is better)
        """
        # Score 1: Calorie fit (0-1, closer to target is better)
        food_calories = float(food['Calories'])  # Convert Decimal to float
        remaining = float(remaining_calories)
        calorie_fit = 1.0 - abs(food_calories - remaining) / (remaining + 1)
        calorie_fit = max(0, min(1, calorie_fit))

        # Score 2: Variety bonus (0-1, less-used foods score higher)
        variety_score = VarietyManager.calculate_variety_score(
            food['FoodID'],
            self.variety_manager,
            len(self.foods_list)
        )

        # Combined score (60% calorie fit, 40% variety)
        final_score = (calorie_fit * 0.6) + (variety_score * 0.4)

        return final_score

    def _calculate_quantity(self, food, target_calories):
        """
        Calculate quantity of food needed to reach target calories.
        Handles high-density foods intelligently.

        Args:
            food (dict): Food item
            target_calories (float): Target calories

        Returns:
            float: Quantity in grams (or unit)
        """
        food_calories = float(food['Calories'])  # Convert Decimal to float
        food_quantity = float(food['Quantity'])
        
        if food_calories <= 0:
            return 0

        # Calculate: if food has 579 cal per 100g, and we need 625 cal
        # quantity = (625 / 579) * 100 = 107.95g
        quantity = (target_calories / food_calories) * food_quantity
        
        # Smart limits:
        # - For normal foods (< 4 cal/gram): min 20g, max 500g
        # - For dense foods (>= 4 cal/gram): min 5g, max 100g
        
        calories_per_gram = food_calories / food_quantity
        
        if calories_per_gram >= 4.0:
            # Dense food (like oils, nuts, sweets): limit portions
            quantity = max(5, min(100, quantity))
        else:
            # Normal food: standard limits
            quantity = max(20, min(500, quantity))
        
        return round(quantity, 2)

    def _create_meal_item(self, food, quantity):
        """
        Create a meal item with scaled nutrition values.

        Args:
            food (dict): Food item from database
            quantity (float): Quantity to use

        Returns:
            dict: Meal item with scaled nutrition
        """
        food_quantity = float(food['Quantity'])
        scale_factor = quantity / food_quantity

        return {
            'food_id': food['FoodID'],
            'food_name': food['FoodName'],
            'brand': food['BrandName'],
            'quantity': round(quantity, 2),
            'unit': food['Unit'],
            'calories': round(float(food['Calories']) * scale_factor, 2),
            'protein': round(float(food['Protein']) * scale_factor, 2),
            'carbs': round(float(food['Carbs']) * scale_factor, 2),
            'fat': round(float(food['Fat']) * scale_factor, 2),
            'fiber': round(float(food['Fiber']) * scale_factor, 2),
            'sugar': round(float(food['Sugar']) * scale_factor, 2)
        }


# Example usage (for testing):
if __name__ == "__main__":
    # This would be called from views.py with actual food data
    pass