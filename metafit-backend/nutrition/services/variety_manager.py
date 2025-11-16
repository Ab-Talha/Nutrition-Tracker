# nutrition/services/variety_manager.py

class VarietyManager:
    """
    Manages food variety across 7-day meal plan.
    Prevents food repetition on consecutive days and limits total usage.
    """

    def __init__(self, max_repetitions=3, consecutive_day_gap=1):
        """
        Initialize variety manager.

        Args:
            max_repetitions (int): Maximum times a food can appear in 7 days (default: 3)
            consecutive_day_gap (int): Minimum days between food appearances (default: 1)
        """
        self.max_repetitions = max_repetitions
        self.consecutive_day_gap = consecutive_day_gap
        
        # Track: {food_id: [day1, day2, ...]}
        self.food_usage = {}
        
        # Track: {day: [food_id1, food_id2, ...]}
        self.day_foods = {}
        
        self.current_day = None

    def start_day(self, day_number):
        """Mark the start of a new day."""
        self.current_day = day_number
        if day_number not in self.day_foods:
            self.day_foods[day_number] = []

    def can_use_food(self, food_id, day_number):
        """
        Check if a food can be used on a given day.

        Args:
            food_id (int): ID of the food
            day_number (int): Day number (1-7)

        Returns:
            bool: True if food can be used, False otherwise
        """
        
        # Check if food exceeds max repetitions
        usage_count = self.food_usage.get(food_id, [])
        if len(usage_count) >= self.max_repetitions:
            return False

        # Check consecutive day gap
        if food_id in self.food_usage:
            last_used_day = max(self.food_usage[food_id])
            days_since = day_number - last_used_day
            
            if days_since <= self.consecutive_day_gap:
                return False

        return True

    def register_food(self, food_id, day_number):
        """
        Register that a food is being used on a specific day.

        Args:
            food_id (int): ID of the food
            day_number (int): Day number (1-7)
        """
        if food_id not in self.food_usage:
            self.food_usage[food_id] = []
        
        self.food_usage[food_id].append(day_number)
        self.day_foods[day_number].append(food_id)

    def get_available_foods(self, all_food_ids, day_number):
        """
        Get list of foods that can be used on a given day.

        Args:
            all_food_ids (list): All available food IDs from database
            day_number (int): Day number (1-7)

        Returns:
            list: Food IDs that can be used without violating variety rules
        """
        available = []
        for food_id in all_food_ids:
            if self.can_use_food(food_id, day_number):
                available.append(food_id)
        
        return available

    def get_food_usage_summary(self):
        """
        Get summary of food usage across the plan.

        Returns:
            dict: {food_id: count, food_id: count, ...}
        """
        return {food_id: len(days) for food_id, days in self.food_usage.items()}

    def get_day_foods(self, day_number):
        """
        Get all foods used on a specific day.

        Args:
            day_number (int): Day number (1-7)

        Returns:
            list: Food IDs used on that day
        """
        return self.day_foods.get(day_number, [])

    def reset(self):
        """Reset all tracking data."""
        self.food_usage = {}
        self.day_foods = {}
        self.current_day = None

    def to_dict(self):
        """
        Export tracking data as dictionary.

        Returns:
            dict: Current state of variety manager
        """
        return {
            'food_usage': self.food_usage,
            'day_foods': self.day_foods,
            'max_repetitions': self.max_repetitions,
            'consecutive_day_gap': self.consecutive_day_gap
        }

    @staticmethod
    def calculate_variety_score(food_id, variety_manager, all_foods_count):
        """
        Calculate variety bonus score for a food.
        Less used foods get higher scores.

        Args:
            food_id (int): ID of the food
            variety_manager (VarietyManager): Instance of variety manager
            all_foods_count (int): Total number of foods in database

        Returns:
            float: Score between 0-1 (1 = most variety-friendly)
        """
        usage_count = len(variety_manager.food_usage.get(food_id, []))
        # Normalize: unused foods get 1.0, max-used get 0.0
        score = 1.0 - (usage_count / variety_manager.max_repetitions)
        return max(0, min(1, score))


# Example usage (for testing):
if __name__ == "__main__":
    # Initialize
    vm = VarietyManager(max_repetitions=3, consecutive_day_gap=1)
    
    # Simulate day 1
    vm.start_day(1)
    print("Day 1 - Can use food 42?", vm.can_use_food(42, 1))  # True
    vm.register_food(42, 1)  # Use food 42 on day 1
    
    # Simulate day 2
    vm.start_day(2)
    print("Day 2 - Can use food 42?", vm.can_use_food(42, 2))  # False (gap=1)
    print("Day 2 - Can use food 1?", vm.can_use_food(1, 2))   # True
    vm.register_food(1, 2)
    
    # Simulate day 3
    vm.start_day(3)
    print("Day 3 - Can use food 42?", vm.can_use_food(42, 3))  # True (gap met)
    vm.register_food(42, 3)
    
    # Summary
    print("\nFood usage summary:", vm.get_food_usage_summary())
    print("Variety score for food 42:", vm.calculate_variety_score(42, vm, 88))