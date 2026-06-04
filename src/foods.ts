export interface Food {
  name: string;
  calories: number;
  protein: number;
  category: string;
  restaurant: string;
}

export const foods: Food[] = [
  {
    name: "Big Mac",
    calories: 550,
    protein: 25,
    category: "Burger",
    restaurant: "McDonald's",
  },
  {
    name: "Quarter Pounder with Cheese",
    calories: 520,
    protein: 29,
    category: "Burger",
    restaurant: "McDonald's",
  },
  {
    name: "Chicken McNuggets (10 pc)",
    calories: 410,
    protein: 23,
    category: "Chicken",
    restaurant: "McDonald's",
  },
  {
    name: "McFlurry with M&M's",
    calories: 640,
    protein: 13,
    category: "Dessert",
    restaurant: "McDonald's",
  },
  {
    name: "Whopper",
    calories: 657,
    protein: 28,
    category: "Burger",
    restaurant: "Burger King",
  },
  {
    name: "Chicken Fries",
    calories: 280,
    protein: 13,
    category: "Chicken",
    restaurant: "Burger King",
  },
  {
    name: "Chalupa Supreme (Beef)",
    calories: 350,
    protein: 12,
    category: "Taco",
    restaurant: "Taco Bell",
  },
  {
    name: "Crunchwrap Supreme",
    calories: 530,
    protein: 16,
    category: "Wrap",
    restaurant: "Taco Bell",
  },
  {
    name: "Nachos BellGrande",
    calories: 740,
    protein: 16,
    category: "Sides",
    restaurant: "Taco Bell",
  },
  {
    name: "Chicken Burrito Bowl",
    calories: 470,
    protein: 41,
    category: "Bowl",
    restaurant: "Chipotle",
  },
  {
    name: "Steak Burrito",
    calories: 820,
    protein: 48,
    category: "Burrito",
    restaurant: "Chipotle",
  },
  {
    name: "Chips & Guacamole",
    calories: 770,
    protein: 9,
    category: "Sides",
    restaurant: "Chipotle",
  },
  {
    name: "Famous Bowl",
    calories: 710,
    protein: 25,
    category: "Bowl",
    restaurant: "KFC",
  },
  {
    name: "Original Recipe Chicken (2 pc)",
    calories: 510,
    protein: 36,
    category: "Chicken",
    restaurant: "KFC",
  },
  {
    name: "Chicken Sandwich",
    calories: 440,
    protein: 28,
    category: "Sandwich",
    restaurant: "Chick-fil-A",
  },
  {
    name: "Waffle Potato Fries (Medium)",
    calories: 420,
    protein: 5,
    category: "Sides",
    restaurant: "Chick-fil-A",
  },
  {
    name: "Spicy Chicken Sandwich",
    calories: 450,
    protein: 28,
    category: "Sandwich",
    restaurant: "Popeyes",
  },
  {
    name: "Cajun Fries (Regular)",
    calories: 260,
    protein: 4,
    category: "Sides",
    restaurant: "Popeyes",
  },
  {
    name: "Dave's Single",
    calories: 570,
    protein: 29,
    category: "Burger",
    restaurant: "Wendy's",
  },
  {
    name: "Baconator",
    calories: 950,
    protein: 57,
    category: "Burger",
    restaurant: "Wendy's",
  },
  {
    name: "Frosty (Medium)",
    calories: 470,
    protein: 13,
    category: "Dessert",
    restaurant: "Wendy's",
  },
  {
    name: "Italian B.M.T. Footlong",
    calories: 820,
    protein: 36,
    category: "Sandwich",
    restaurant: "Subway",
  },
  {
    name: 'Turkey Breast 6"',
    calories: 280,
    protein: 18,
    category: "Sandwich",
    restaurant: "Subway",
  },
  {
    name: "Pepperoni Pizza (Large slice)",
    calories: 320,
    protein: 14,
    category: "Pizza",
    restaurant: "Domino's",
  },
  {
    name: "Cheesy Bread",
    calories: 140,
    protein: 6,
    category: "Sides",
    restaurant: "Domino's",
  },
  {
    name: "Pepperoni Pizza (slice)",
    calories: 300,
    protein: 13,
    category: "Pizza",
    restaurant: "Pizza Hut",
  },
  {
    name: "Meat Lovers Pizza (slice)",
    calories: 380,
    protein: 17,
    category: "Pizza",
    restaurant: "Pizza Hut",
  },
  {
    name: "Orange Chicken",
    calories: 490,
    protein: 25,
    category: "Entree",
    restaurant: "Panda Express",
  },
  {
    name: "Beijing Beef",
    calories: 470,
    protein: 13,
    category: "Entree",
    restaurant: "Panda Express",
  },
  {
    name: "Fried Rice",
    calories: 520,
    protein: 11,
    category: "Sides",
    restaurant: "Panda Express",
  },
  {
    name: "Double-Double",
    calories: 670,
    protein: 37,
    category: "Burger",
    restaurant: "In-N-Out",
  },
  {
    name: "Animal Style Fries",
    calories: 750,
    protein: 18,
    category: "Sides",
    restaurant: "In-N-Out",
  },
  {
    name: "Burrito Supreme",
    calories: 390,
    protein: 15,
    category: "Burrito",
    restaurant: "Taco Bell",
  },
  {
    name: "Egg McMuffin",
    calories: 310,
    protein: 17,
    category: "Breakfast",
    restaurant: "McDonald's",
  },
  {
    name: "Grilled Chicken Sandwich",
    calories: 380,
    protein: 37,
    category: "Sandwich",
    restaurant: "McDonald's",
  },
  {
    name: "Cinnamon Twists",
    calories: 170,
    protein: 2,
    category: "Dessert",
    restaurant: "Taco Bell",
  },
  {
    name: "Quesarito",
    calories: 650,
    protein: 22,
    category: "Burrito",
    restaurant: "Taco Bell",
  },
  {
    name: "Chicken Caesar Salad",
    calories: 470,
    protein: 40,
    category: "Salad",
    restaurant: "Chipotle",
  },
  {
    name: "Cookies (3 pack)",
    calories: 210,
    protein: 2,
    category: "Dessert",
    restaurant: "Subway",
  },
  {
    name: "Honey Mustard BBQ Tender Wrap",
    calories: 350,
    protein: 14,
    category: "Wrap",
    restaurant: "KFC",
  },
];

export function pickRandomFood(): Food {
  return foods[Math.floor(Math.random() * foods.length)];
}

export function pickDailyFood(): Food {
  // Get today's date as YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];
  // Convert date string to a number for seeding
  const seed = today.split("-").reduce((acc, part) => acc + parseInt(part), 0);
  // Use modulo to get a consistent index for today
  const index = seed % foods.length;
  return foods[index];
}
