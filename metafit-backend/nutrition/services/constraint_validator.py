# nutrition/services/constraint_validator.py

class ConstraintValidator:
    """
    Validates meal plans against nutritional constraints.
    Checks: calorie accuracy, fiber minimum, sugar maximum, macro targets.
    """

    # Acceptable variance for calorie matching (2%)
    CALORIE_VARIANCE_TOLERANCE = 0.02  # ±2%

    @staticmethod
    def validate_daily_meal(meal_items, target_macros):
        """
        Validate a single day's meals against targets.

        Args:
            meal_items (list): List of meal items with nutrition data
                [
                    {
                        'food_id': 42,
                        'food_name': 'Almonds',
                        'quantity': 50,
                        'calories': 289.5,
                        'protein': 10.5,
                        'carbs': 11,
                        'fat': 25,
                        'fiber': 6,
                        'sugar': 0.5
                    },
                    ...
                ]
            target_macros (dict): Daily targets from macro_calculator
                {
                    'calorie_target': 2500,
                    'protein': 150,
                    'carbs': 300,
                    'fat': 83,
                    'fiber_min': 30,
                    'sugar_max': 30
                }

        Returns:
            dict: Validation result
                {
                    'is_valid': True/False,
                    'errors': [],
                    'warnings': [],
                    'totals': {
                        'calories': 2450,
                        'protein': 155,
                        'carbs': 295,
                        'fat': 80,
                        'fiber': 28,
                        'sugar': 25
                    },
                    'variance': {
                        'calories': 1.2,  # percentage
                        'protein': 3.3,
                        'carbs': -1.7,
                        'fat': -3.6
                    }
                }
        """
        
        errors = []
        warnings = []
        
        # Calculate totals
        totals = ConstraintValidator._calculate_totals(meal_items)

        # Validate calories (±2%)
        calorie_check = ConstraintValidator._validate_calories(
            totals['calories'],
            target_macros['calorie_target']
        )
        if not calorie_check['valid']:
            errors.append(calorie_check['message'])
        else:
            warnings.append(calorie_check['message'])

        # Validate fiber (must meet minimum)
        fiber_check = ConstraintValidator._validate_fiber(
            totals['fiber'],
            target_macros['fiber_min']
        )
        if not fiber_check['valid']:
            errors.append(fiber_check['message'])
        elif fiber_check['warning']:
            warnings.append(fiber_check['message'])

        # Validate sugar (must not exceed maximum)
        sugar_check = ConstraintValidator._validate_sugar(
            totals['sugar'],
            target_macros['sugar_max']
        )
        if not sugar_check['valid']:
            errors.append(sugar_check['message'])
        elif sugar_check['warning']:
            warnings.append(sugar_check['message'])

        # Calculate macro variance
        variance = ConstraintValidator._calculate_variance(totals, target_macros)

        is_valid = len(errors) == 0

        return {
            'is_valid': is_valid,
            'errors': errors,
            'warnings': warnings,
            'totals': totals,
            'variance': variance
        }

    @staticmethod
    def _calculate_totals(meal_items):
        """Calculate total macros from meal items."""
        totals = {
            'calories': 0,
            'protein': 0,
            'carbs': 0,
            'fat': 0,
            'fiber': 0,
            'sugar': 0
        }

        for item in meal_items:
            totals['calories'] += item.get('calories', 0)
            totals['protein'] += item.get('protein', 0)
            totals['carbs'] += item.get('carbs', 0)
            totals['fat'] += item.get('fat', 0)
            totals['fiber'] += item.get('fiber', 0)
            totals['sugar'] += item.get('sugar', 0)

        # Round to 2 decimal places
        for key in totals:
            totals[key] = round(totals[key], 2)

        return totals

    @staticmethod
    def _validate_calories(actual, target):
        """
        Validate calorie accuracy (±2%).

        Returns:
            dict: {valid: bool, message: str}
        """
        if target == 0:
            return {'valid': True, 'message': 'Calorie target is 0'}

        variance = abs(actual - target) / target

        if variance <= ConstraintValidator.CALORIE_VARIANCE_TOLERANCE:
            percentage = round((variance * 100), 1)
            return {
                'valid': True,
                'message': f'Calories: {actual} kcal (Target: {target}, Variance: ±{percentage}%)'
            }
        else:
            percentage = round((variance * 100), 1)
            return {
                'valid': False,
                'message': f'Calories: {actual} kcal exceeds tolerance (Target: {target}, Variance: {percentage}%)'
            }

    @staticmethod
    def _validate_fiber(actual, minimum):
        """
        Validate fiber meets minimum requirement.

        Returns:
            dict: {valid: bool, warning: bool, message: str}
        """
        if actual >= minimum:
            return {
                'valid': True,
                'warning': False,
                'message': f'Fiber: {actual}g ✓ (Minimum: {minimum}g)'
            }
        else:
            deficit = round(minimum - actual, 1)
            return {
                'valid': False,
                'warning': True,
                'message': f'Fiber: {actual}g below minimum (Need {minimum}g, Short by {deficit}g)'
            }

    @staticmethod
    def _validate_sugar(actual, maximum):
        """
        Validate sugar does not exceed maximum.

        Returns:
            dict: {valid: bool, warning: bool, message: str}
        """
        if actual <= maximum:
            remaining = round(maximum - actual, 1)
            return {
                'valid': True,
                'warning': False,
                'message': f'Sugar: {actual}g ✓ (Maximum: {maximum}g, Remaining: {remaining}g)'
            }
        else:
            excess = round(actual - maximum, 1)
            return {
                'valid': False,
                'warning': True,
                'message': f'Sugar: {actual}g exceeds maximum (Limit: {maximum}g, Excess: {excess}g)'
            }

    @staticmethod
    def _calculate_variance(actual, target):
        """
        Calculate percentage variance for each macro.

        Returns:
            dict: {macro: variance_percentage, ...}
        """
        def calc_variance(actual_val, target_val):
            if target_val == 0:
                return 0
            return round(((actual_val - target_val) / target_val) * 100, 2)

        return {
            'calories': calc_variance(actual['calories'], target['calorie_target']),
            'protein': calc_variance(actual['protein'], target['protein']),
            'carbs': calc_variance(actual['carbs'], target['carbs']),
            'fat': calc_variance(actual['fat'], target['fat'])
        }

    @staticmethod
    def validate_weekly_plan(daily_results, target_macros):
        """
        Validate an entire 7-day plan.

        Args:
            daily_results (list): List of 7 daily validation results
            target_macros (dict): Daily target macros

        Returns:
            dict: Weekly validation summary
                {
                    'overall_valid': bool,
                    'days_valid': int,
                    'days_invalid': int,
                    'total_errors': int,
                    'total_warnings': int,
                    'weekly_totals': {...},
                    'weekly_averages': {...}
                }
        """
        
        valid_days = sum(1 for result in daily_results if result['is_valid'])
        invalid_days = 7 - valid_days
        total_errors = sum(len(result['errors']) for result in daily_results)
        total_warnings = sum(len(result['warnings']) for result in daily_results)

        # Calculate weekly totals
        weekly_totals = {
            'calories': 0,
            'protein': 0,
            'carbs': 0,
            'fat': 0,
            'fiber': 0,
            'sugar': 0
        }

        for result in daily_results:
            for macro, value in result['totals'].items():
                weekly_totals[macro] += value

        # Round totals
        for key in weekly_totals:
            weekly_totals[key] = round(weekly_totals[key], 2)

        # Calculate daily averages
        weekly_averages = {
            key: round(value / 7, 2) for key, value in weekly_totals.items()
        }

        return {
            'overall_valid': invalid_days == 0,
            'days_valid': valid_days,
            'days_invalid': invalid_days,
            'total_errors': total_errors,
            'total_warnings': total_warnings,
            'weekly_totals': weekly_totals,
            'weekly_averages': weekly_averages
        }


# Example usage (for testing):
if __name__ == "__main__":
    from nutrition.services.macro_calculator import MacroCalculator

    # Sample meal items
    meal_items = [
        {
            'food_id': 42,
            'food_name': 'Almonds',
            'quantity': 50,
            'calories': 289.5,
            'protein': 10.5,
            'carbs': 11,
            'fat': 25,
            'fiber': 6,
            'sugar': 0.5
        },
        {
            'food_id': 1,
            'food_name': 'Apple',
            'quantity': 100,
            'calories': 52,
            'protein': 0.3,
            'carbs': 14,
            'fat': 0.2,
            'fiber': 2.4,
            'sugar': 10
        }
    ]

    # Get targets
    targets = MacroCalculator.calculate_macros(2500, 'male')

    # Validate
    result = ConstraintValidator.validate_daily_meal(meal_items, targets)
    print("Validation result:", result)