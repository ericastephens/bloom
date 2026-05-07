export const DAILY_TARGETS_PREGNANCY = {
  iron: 27, folate: 600, calcium: 1000, vitaminD: 600, omega3: 200, calories: 2200,
};
export const DAILY_TARGETS_POSTPARTUM = {
  iron: 18, folate: 500, calcium: 1000, vitaminD: 600, omega3: 200, calories: 2500,
};

export const NUTRIENT_META = [
  { key: "iron",     label: "Iron",      unit: "mg"  },
  { key: "folate",   label: "Folate",    unit: "mcg" },
  { key: "calcium",  label: "Calcium",   unit: "mg"  },
  { key: "vitaminD", label: "Vitamin D", unit: "IU"  },
  { key: "omega3",   label: "Omega-3",   unit: "mg"  },
  { key: "calories", label: "Calories",  unit: "cal" },
];

export const CULTURAL_FOODS = {
  "West African": [
    { name: "Egusi Soup",    emoji: "🥘", iron: 4.2, folate: 42,  calcium: 85,  vitaminD: 0, omega3: 0, calories: 320, serving: "1 cup" },
    { name: "Jollof Rice",   emoji: "🍚", iron: 1.8, folate: 28,  calcium: 30,  vitaminD: 0, omega3: 0, calories: 280, serving: "1 cup" },
    { name: "Suya (beef)",   emoji: "🍖", iron: 3.1, folate: 8,   calcium: 15,  vitaminD: 3, omega3: 0, calories: 240, serving: "3oz"   },
    { name: "Akara",         emoji: "🫘", iron: 3.5, folate: 140, calcium: 60,  vitaminD: 0, omega3: 0, calories: 190, serving: "3 cakes"},
    { name: "Groundnut Soup",emoji: "🥜", iron: 2.8, folate: 55,  calcium: 40,  vitaminD: 0, omega3: 0, calories: 380, serving: "1 cup" },
    { name: "Ogbono Soup",   emoji: "🍲", iron: 3.6, folate: 38,  calcium: 70,  vitaminD: 0, omega3: 0, calories: 290, serving: "1 cup" },
    { name: "Fufu",          emoji: "🫓", iron: 0.6, folate: 14,  calcium: 18,  vitaminD: 0, omega3: 0, calories: 330, serving: "1 cup" },
    { name: "Sardines",      emoji: "🐟", iron: 2.5, folate: 10,  calcium: 325, vitaminD: 193, omega3: 1100, calories: 190, serving: "3oz" },
  ],
  "Caribbean": [
    { name: "Callaloo",      emoji: "🥬", iron: 5.8, folate: 88,  calcium: 140, vitaminD: 0, omega3: 0, calories: 65,  serving: "1 cup" },
    { name: "Ackee & Saltfish",emoji:"🍳",iron: 2.2, folate: 20,  calcium: 50,  vitaminD: 6, omega3: 120, calories: 310, serving: "1 cup"},
    { name: "Rice & Peas",   emoji: "🍚", iron: 2.0, folate: 80,  calcium: 45,  vitaminD: 0, omega3: 0, calories: 260, serving: "1 cup" },
    { name: "Plantain",      emoji: "🍌", iron: 0.9, folate: 22,  calcium: 4,   vitaminD: 0, omega3: 0, calories: 180, serving: "1 med" },
    { name: "Doubles",       emoji: "🥙", iron: 2.8, folate: 95,  calcium: 80,  vitaminD: 0, omega3: 0, calories: 350, serving: "2 pieces"},
    { name: "Pelau",         emoji: "🍲", iron: 2.5, folate: 45,  calcium: 40,  vitaminD: 4, omega3: 80, calories: 380, serving: "1 cup"},
    { name: "Breadfruit",    emoji: "🌿", iron: 1.0, folate: 14,  calcium: 17,  vitaminD: 0, omega3: 0, calories: 227, serving: "1 cup" },
  ],
  "Latin American": [
    { name: "Lentil Soup",   emoji: "🍲", iron: 6.6, folate: 180, calcium: 38,  vitaminD: 0, omega3: 0, calories: 230, serving: "1 cup" },
    { name: "Black Beans",   emoji: "🫘", iron: 3.6, folate: 256, calcium: 46,  vitaminD: 0, omega3: 0, calories: 220, serving: "1 cup" },
    { name: "Ceviche",       emoji: "🦐", iron: 1.8, folate: 15,  calcium: 60,  vitaminD: 8, omega3: 380, calories: 130, serving: "1 cup"},
    { name: "Tamales",       emoji: "🌽", iron: 2.4, folate: 52,  calcium: 65,  vitaminD: 0, omega3: 0, calories: 285, serving: "1 piece"},
    { name: "Pupusas",       emoji: "🫓", iron: 1.6, folate: 40,  calcium: 120, vitaminD: 0, omega3: 0, calories: 240, serving: "1 piece"},
    { name: "Chiles Rellenos",emoji:"🌶️",iron: 2.1, folate: 35,  calcium: 95,  vitaminD: 0, omega3: 0, calories: 320, serving: "1 piece"},
    { name: "Arroz con Leche",emoji:"🥛",iron: 0.8, folate: 12,  calcium: 210, vitaminD: 40, omega3: 0, calories: 280, serving: "1 cup"},
  ],
  "Soul Food": [
    { name: "Collard Greens",emoji: "🥬", iron: 2.5, folate: 88,  calcium: 268, vitaminD: 0, omega3: 0, calories: 62,  serving: "1 cup" },
    { name: "Blackeyed Peas",emoji: "🫘", iron: 4.3, folate: 210, calcium: 41,  vitaminD: 0, omega3: 0, calories: 200, serving: "1 cup" },
    { name: "Sweet Potato",  emoji: "🍠", iron: 1.4, folate: 12,  calcium: 43,  vitaminD: 0, omega3: 0, calories: 180, serving: "1 med" },
    { name: "Catfish",       emoji: "🐟", iron: 0.9, folate: 14,  calcium: 37,  vitaminD: 425, omega3: 280, calories: 195, serving: "3oz"},
    { name: "Okra",          emoji: "🌿", iron: 0.4, folate: 46,  calcium: 82,  vitaminD: 0, omega3: 0, calories: 33,  serving: "1 cup" },
    { name: "Cornbread",     emoji: "🍞", iron: 1.5, folate: 28,  calcium: 90,  vitaminD: 15, omega3: 0, calories: 260, serving: "1 piece"},
    { name: "Mac & Cheese",  emoji: "🧀", iron: 1.0, folate: 22,  calcium: 200, vitaminD: 25, omega3: 0, calories: 380, serving: "1 cup"},
  ],
  "South Asian": [
    { name: "Dal (lentils)", emoji: "🍲", iron: 6.6, folate: 180, calcium: 38,  vitaminD: 0, omega3: 0, calories: 230, serving: "1 cup" },
    { name: "Saag Paneer",   emoji: "🥬", iron: 3.8, folate: 65,  calcium: 290, vitaminD: 0, omega3: 0, calories: 310, serving: "1 cup" },
    { name: "Chana Masala",  emoji: "🫘", iron: 4.7, folate: 160, calcium: 80,  vitaminD: 0, omega3: 0, calories: 270, serving: "1 cup" },
    { name: "Khichdi",       emoji: "🍚", iron: 2.8, folate: 120, calcium: 55,  vitaminD: 0, omega3: 0, calories: 240, serving: "1 cup" },
    { name: "Lassi",         emoji: "🥛", iron: 0.2, folate: 18,  calcium: 300, vitaminD: 40, omega3: 0, calories: 150, serving: "1 cup"},
    { name: "Roti",          emoji: "🫓", iron: 1.8, folate: 30,  calcium: 30,  vitaminD: 0, omega3: 0, calories: 120, serving: "1 piece"},
    { name: "Biryani",       emoji: "🍛", iron: 2.4, folate: 42,  calcium: 60,  vitaminD: 8, omega3: 0, calories: 420, serving: "1 cup" },
  ],
  "Everyday": [
    { name: "Oatmeal",       emoji: "🥣", iron: 3.4, folate: 18,  calcium: 20,  vitaminD: 0, omega3: 0, calories: 170, serving: "1 cup" },
    { name: "Eggs (2)",      emoji: "🥚", iron: 1.8, folate: 44,  calcium: 56,  vitaminD: 82, omega3: 80, calories: 140, serving: "2 eggs"},
    { name: "Salmon",        emoji: "🐟", iron: 0.9, folate: 38,  calcium: 14,  vitaminD: 570, omega3: 1800, calories: 235, serving: "3oz"},
    { name: "Spinach",       emoji: "🥬", iron: 6.4, folate: 263, calcium: 245, vitaminD: 0, omega3: 0, calories: 41,  serving: "1 cup cooked"},
    { name: "Greek Yogurt",  emoji: "🥛", iron: 0.2, folate: 18,  calcium: 200, vitaminD: 40, omega3: 0, calories: 130, serving: "1 cup"},
    { name: "Almonds",       emoji: "🌰", iron: 1.0, folate: 14,  calcium: 76,  vitaminD: 0, omega3: 0, calories: 164, serving: "1oz"  },
    { name: "Lentils",       emoji: "🫘", iron: 6.6, folate: 358, calcium: 38,  vitaminD: 0, omega3: 0, calories: 230, serving: "1 cup" },
    { name: "Banana",        emoji: "🍌", iron: 0.3, folate: 20,  calcium: 6,   vitaminD: 0, omega3: 0, calories: 105, serving: "1 med" },
    { name: "Sweet Potato",  emoji: "🍠", iron: 1.2, folate: 14,  calcium: 40,  vitaminD: 0, omega3: 0, calories: 112, serving: "1 med" },
    { name: "Avocado",       emoji: "🥑", iron: 0.6, folate: 81,  calcium: 12,  vitaminD: 0, omega3: 160, calories: 160, serving: "1/2 fruit" },
    { name: "Chicken Breast",emoji: "🍗", iron: 0.9, folate: 5,   calcium: 11,  vitaminD: 1, omega3: 20, calories: 165, serving: "3oz" },
    { name: "Quinoa",        emoji: "🍚", iron: 2.8, folate: 78,  calcium: 31,  vitaminD: 0, omega3: 0, calories: 222, serving: "1 cup" },
    { name: "Blueberries",   emoji: "🫐", iron: 0.4, folate: 9,   calcium: 9,   vitaminD: 0, omega3: 0, calories: 84,  serving: "1 cup" },
    { name: "Chickpeas",     emoji: "🥙", iron: 4.7, folate: 282, calcium: 80,  vitaminD: 0, omega3: 0, calories: 269, serving: "1 cup" },
    { name: "Tofu",          emoji: "🍱", iron: 3.4, folate: 31,  calcium: 253, vitaminD: 0, omega3: 220, calories: 176, serving: "3oz" },
  ],
};
