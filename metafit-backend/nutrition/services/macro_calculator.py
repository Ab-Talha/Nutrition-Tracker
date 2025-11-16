# nutrition/services/macro_calculator.py

class MacroCalculator:
    """
    Calculates daily macronutrient targets based on user parameters.
    Supports both default calculations and custom macro inputs.
    """

    # Constants for default macro calculations (per 100 kcal)
    MALE_PROTEIN_RATIO = 0.27  # 27% of calories
    MALE_CARBS_RATIO = 0.45    # 45% of calories
    MALE_FAT_RATIO = 0.28      # 28% of calories
    MALE_FIBER_RATIO = 0.012   # 1.2% of calories in grams (0.012 * kcal / 4)
    MALE_SUGAR_MAX_RATIO = 0.012  # 1.2% of calories in grams

    FEMALE_PROTEIN_RATIO = 0.23  # 23% of calories
    FEMALE_CARBS_RATIO = 0.47    # 47% of calories
    FEMALE_FAT_RATIO = 0.30      # 30% of calories
    FEMALE_FIBER_RATIO = 0.014   # 1.4% of calories in grams
    FEMALE_SUGAR_MAX_RATIO = 0.010  # 1.0% of calories in grams

    @staticmethod
    def calculate_macros(calorie_target, gender, custom_macros=None):
        """
        Calculate daily macro targets.

        Args:
            calorie_target (int): Daily calorie target (e.g., 2500)
            gender (str): 'male' or 'female'
            custom_macros (dict): Optional custom macro targets
                {
                    'protein': 150,
                    'carbs': 300,
                    'fat': 83
                }

        Returns:
            dict: Contains daily targets for protein, carbs, fat, fiber, sugar_max
            {
                'calorie_target': 2500,
                'protein': 150,
                'carbs': 300,
                'fat': 83,
                'fiber_min': 30,
                'sugar_max': 30,
                'gender': 'male',
                'is_custom': False
            }
        """
        
        if not isinstance(calorie_target, (int, float)) or calorie_target <= 0:
            raise ValueError("Calorie target must be a positive number")
        
        gender = gender.lower().strip()
        if gender not in ['male', 'female']:
            raise ValueError("Gender must be 'male' or 'female'")

        # If custom macros provided, use them
        if custom_macros and isinstance(custom_macros, dict):
            return {
                'calorie_target': calorie_target,
                'protein': float(custom_macros.get('protein', 0)),
                'carbs': float(custom_macros.get('carbs', 0)),
                'fat': float(custom_macros.get('fat', 0)),
                'fiber_min': MacroCalculator._calculate_fiber(calorie_target, gender),
                'sugar_max': MacroCalculator._calculate_sugar_max(calorie_target, gender),
                'gender': gender,
                'is_custom': True
            }

        # Calculate default macros based on gender
        if gender == 'male':
            protein = round(calorie_target * MacroCalculator.MALE_PROTEIN_RATIO / 4, 2)
            carbs = round(calorie_target * MacroCalculator.MALE_CARBS_RATIO / 4, 2)
            fat = round(calorie_target * MacroCalculator.MALE_FAT_RATIO / 9, 2)
        else:  # female
            protein = round(calorie_target * MacroCalculator.FEMALE_PROTEIN_RATIO / 4, 2)
            carbs = round(calorie_target * MacroCalculator.FEMALE_CARBS_RATIO / 4, 2)
            fat = round(calorie_target * MacroCalculator.FEMALE_FAT_RATIO / 9, 2)

        return {
            'calorie_target': calorie_target,
            'protein': protein,
            'carbs': carbs,
            'fat': fat,
            'fiber_min': MacroCalculator._calculate_fiber(calorie_target, gender),
            'sugar_max': MacroCalculator._calculate_sugar_max(calorie_target, gender),
            'gender': gender,
            'is_custom': False
        }

    @staticmethod
    def _calculate_fiber(calorie_target, gender):
        """Calculate minimum daily fiber target."""
        if gender == 'male':
            fiber = calorie_target * MacroCalculator.MALE_FIBER_RATIO / 4
        else:
            fiber = calorie_target * MacroCalculator.FEMALE_FIBER_RATIO / 4
        return round(fiber, 2)

    @staticmethod
    def _calculate_sugar_max(calorie_target, gender):
        """Calculate maximum daily sugar limit."""
        if gender == 'male':
            sugar_max = calorie_target * MacroCalculator.MALE_SUGAR_MAX_RATIO / 4
        else:
            sugar_max = calorie_target * MacroCalculator.FEMALE_SUGAR_MAX_RATIO / 4
        return round(sugar_max, 2)

    @staticmethod
    def calculate_macro_variance(target_macros, actual_macros):
        """
        Calculate the variance between target and actual macros.

        Args:
            target_macros (dict): Target values
            actual_macros (dict): Actual values

        Returns:
            dict: Variance percentages for each macro
            {
                'calories_variance': 1.2,  # percentage
                'protein_variance': 0.5,
                'carbs_variance': 2.1,
                'fat_variance': -1.5
            }
        """
        
        def calc_variance(target, actual):
            if target == 0:
                return 0
            return round(((actual - target) / target) * 100, 2)

        return {
            'calories_variance': calc_variance(target_macros['calorie_target'], actual_macros['calories']),
            'protein_variance': calc_variance(target_macros['protein'], actual_macros['protein']),
            'carbs_variance': calc_variance(target_macros['carbs'], actual_macros['carbs']),
            'fat_variance': calc_variance(target_macros['fat'], actual_macros['fat']),
            'fiber_achieved': actual_macros.get('fiber', 0),
            'sugar_consumed': actual_macros.get('sugar', 0)
        }


# Example usage (for testing):
if __name__ == "__main__":
    # Test 1: Default male macros
    result = MacroCalculator.calculate_macros(2500, 'male')
    print("Male 2500 kcal:", result)

    # Test 2: Default female macros
    result = MacroCalculator.calculate_macros(2000, 'female')
    print("Female 2000 kcal:", result)

    # Test 3: Custom macros
    custom = {'protein': 180, 'carbs': 280, 'fat': 70}
    result = MacroCalculator.calculate_macros(2500, 'male', custom)
    print("Custom macros:", result)

    # Test 4: Variance calculation
    target = MacroCalculator.calculate_macros(2500, 'male')
    actual = {'calories': 2450, 'protein': 155, 'carbs': 295, 'fat': 80, 'fiber': 28, 'sugar': 25}
    variance = MacroCalculator.calculate_macro_variance(target, actual)
    print("Variance:", variance)