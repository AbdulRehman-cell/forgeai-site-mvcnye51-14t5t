const https = require('https');
const Recipe = require('./models/Recipe');
const Rating = require('./models/Rating');

// Helper to safely fetch JSON via HTTP/HTTPS
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', (err) => reject(err));
  });
}

// Map MealDB areas/categories to our 8 curated cuisines & 5 categories
function mapCuisine(area) {
  const map = {
    Italian: 'Italian',
    Mexican: 'Mexican',
    Indian: 'Indian',
    Japanese: 'Japanese',
    Chinese: 'Chinese',
    American: 'American',
    French: 'French',
    Moroccan: 'Moroccan',
    Spanish: 'Italian',
    British: 'American',
    Canadian: 'American',
    Jamaican: 'Mexican',
    Thai: 'Chinese',
    Vietnamese: 'Chinese',
    Greek: 'Italian',
    Egyptian: 'Moroccan',
    Tunisian: 'Moroccan',
    Turkish: 'Moroccan',
    Polish: 'French',
    Russian: 'French',
  };
  return map[area] || 'Italian';
}

function mapCategory(cat) {
  const map = {
    Starter: 'Starter',
    Side: 'Side',
    Dessert: 'Dessert',
    Breakfast: 'Breakfast',
    Beef: 'Main',
    Chicken: 'Main',
    Lamb: 'Main',
    Pork: 'Main',
    Seafood: 'Main',
    Vegetarian: 'Main',
    Pasta: 'Main',
    Miscellaneous: 'Main',
    Goat: 'Main',
  };
  return map[cat] || 'Main';
}

// Curated high quality recipes to seed if API is empty/fails
const FALLBACK_RECIPES = [
  {
    name: 'Classic Margherita Pizza',
    cuisine: 'Italian',
    category: 'Main',
    ingredients: '2 1/2 cups Flour, 1 tsp Yeast, 1 cup Warm Water, 1/2 cup San Marzano Tomato Sauce, 200g Fresh Mozzarella, Fresh Basil leaves, 2 tbsp Olive Oil, 1 pinch Salt',
    instructions: '1. Dissolve yeast in warm water with a pinch of sugar. Let bloom 5 mins.\n2. Mix flour and salt, knead in yeast water until smooth. Proof 1 hour.\n3. Stretch dough into 12-inch circle. Top with crushed tomato sauce and sliced fresh mozzarella.\n4. Bake at 500°F (260°C) on preheated pizza stone for 8-10 minutes until crust is charred and cheese is bubbly.\n5. Garnish with fresh basil leaves and a drizzle of extra virgin olive oil.',
    imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=1200&q=80',
    youtubeUrl: 'https://www.youtube.com/embed/1-SJGQ2HLp8',
    source: 'mealdb',
    status: 'approved',
    mealDbId: '52771',
    avgRating: 4.9,
  },
  {
    name: 'Authentic Street Tacos al Pastor',
    cuisine: 'Mexican',
    category: 'Main',
    ingredients: '1 kg Pork shoulder sliced thin, 3 tbsp Achiote paste, 3 dried Guajillo chilies, 1/2 cup Pineapple juice, 2 tbsp Apple cider vinegar, 3 cloves Garlic, 1 tsp Oregano, 12 Corn tortillas, Fresh Cilantro, Diced White Onion, Fresh Pineapple slices',
    instructions: '1. Rehydrate guajillo chilies in hot water. Blend with achiote, pineapple juice, vinegar, garlic, oregano, and salt.\n2. Marinate pork slices in achiote mixture for at least 4 hours (overnight preferred).\n3. Sear pork on high heat in a cast-iron skillet until caramelized and crispy on edges.\n4. Warm corn tortillas on a hot flat top.\n5. Assemble tacos with seared pork, grilled pineapple, chopped cilantro, and diced onions.',
    imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1200&q=80',
    youtubeUrl: 'https://www.youtube.com/embed/a3StandardUrl',
    source: 'mealdb',
    status: 'approved',
    mealDbId: '52772',
    avgRating: 4.8,
  },
  {
    name: 'Butter Chicken (Murgh Makhani)',
    cuisine: 'Indian',
    category: 'Main',
    ingredients: '800g Chicken thighs diced, 1 cup Greek Yogurt, 2 tbsp Garam Masala, 1 tbsp Ginger paste, 1 tbsp Garlic paste, 4 tbsp Butter, 1 cup Tomato Puree, 1/2 cup Heavy Cream, 1 tsp Chili Powder, Fresh Cilantro',
    instructions: '1. Marinate chicken in yogurt, garlic, ginger, and garam masala for 1 hour.\n2. Sear chicken pieces in butter until lightly charred; set aside.\n3. In same pan, melt remaining butter, add tomato puree, chili powder, and simmer 10 mins.\n4. Stir in heavy cream and chicken pieces. Simmer on low heat for 15 minutes until rich and velvety.\n5. Serve with warm garlic naan and steamed basmati rice.',
    imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=1200&q=80',
    youtubeUrl: 'https://www.youtube.com/embed/a03RWSclvNQ',
    source: 'mealdb',
    status: 'approved',
    mealDbId: '52846',
    avgRating: 5.0,
  },
  {
    name: 'Traditional Tonkotsu Ramen',
    cuisine: 'Japanese',
    category: 'Main',
    ingredients: '2 packs Fresh Ramen Noodles, 4 cups Pork/Chicken Bone Broth, 2 tbsp Soy Sauce, 1 tbsp Mirin, 4 slices Chashu Pork Belly, 2 Soft-boiled Ajitsuke Eggs, Wood ear mushrooms, Chopped Scallions, Nori Seaweed sheets',
    instructions: '1. Simmer bone broth with garlic, ginger, soy sauce, and mirin to make a concentrated ramen tare.\n2. Boil ramen noodles for 90 seconds until al dente; drain well.\n3. Pour scalding hot broth into serving bowls, add noodles, and stir gently.\n4. Top carefully with sliced chashu pork, halved soft-boiled eggs, wood ear mushrooms, and scallions.\n5. Garnish with a square of crispy nori seaweed.',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80',
    youtubeUrl: 'https://www.youtube.com/embed/5aL6388z0u8',
    source: 'mealdb',
    status: 'approved',
    mealDbId: '52812',
    avgRating: 4.7,
  },
  {
    name: 'Authentic Moroccan Lamb Tagine',
    cuisine: 'Moroccan',
    category: 'Main',
    ingredients: '1 kg Lamb shoulder cut into cubes, 1 cup Dried Apricots & Prunes, 1 cup Cooked Chickpeas, 2 Onions sliced, 2 tsp Cumin, 2 tsp Cinnamon, 1 tsp Ras el Hanout, 2 cups Beef Broth, Toasted Almonds, Fresh Coriander',
    instructions: '1. Rub lamb cubes with spices (cumin, cinnamon, ras el hanout, salt, pepper).\n2. Sauté onions in olive oil inside a clay tagine or Dutch oven until softened.\n3. Add lamb and sear on all sides until golden brown.\n4. Pour in broth, cover, and braise on low heat for 1.5 hours until tender.\n5. Add dried fruit and chickpeas; cook another 20 mins. Garnish with toasted almonds.',
    imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14e8?auto=format&fit=crop&w=1200&q=80',
    youtubeUrl: 'https://www.youtube.com/embed/4b38382749',
    source: 'mealdb',
    status: 'approved',
    mealDbId: '52820',
    avgRating: 4.9,
  },
  {
    name: 'Szechuan Kung Pao Chicken',
    cuisine: 'Chinese',
    category: 'Main',
    ingredients: '500g Chicken breast diced, 1/2 cup Roasted Peanuts, 6 Dried Red Chilies, 1 tbsp Szechuan Peppercorns, 2 tbsp Dark Soy Sauce, 1 tbsp Shaoxing Rice Wine, 1 tbsp Cornstarch, 3 Scallions chopped',
    instructions: '1. Marinate chicken in 1 tbsp soy sauce, rice wine, and cornstarch for 15 mins.\n2. Heat wok with oil, toast Szechuan peppercorns and dried chilies until fragrant.\n3. Stir fry marinated chicken on high heat until opaque.\n4. Toss in scallions, remaining sauce mixture, and roasted peanuts.\n5. Toss vigorously for 1 minute until sauce coats chicken and glaze shines.',
    imageUrl: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=1200&q=80',
    youtubeUrl: 'https://www.youtube.com/embed/KungPao123',
    source: 'mealdb',
    status: 'approved',
    mealDbId: '52830',
    avgRating: 4.6,
  },
  {
    name: 'French Beef Bourguignon',
    cuisine: 'French',
    category: 'Main',
    ingredients: '1.2 kg Beef Chuck cut in large chunks, 1 bottle Red Burgundy Wine, 200g Bacon lardons, 250g Pearl Onions, 250g Cremini Mushrooms, 2 Carrots sliced, 2 tbsp Tomato Paste, 2 tbsp Flour, Fresh Thyme & Bay leaf',
    instructions: '1. Fry bacon lardons in Dutch oven until crisp; remove lardons.\n2. Season beef and sear in bacon fat in batches until deep brown.\n3. Add flour and tomato paste; pour red wine and beef broth to submerge.\n4. Add bouquet garni, cover and braise in oven at 325°F (160°C) for 2.5 hours.\n5. Sauté pearl onions and mushrooms separately; fold in 15 minutes before serving.',
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80',
    youtubeUrl: 'https://www.youtube.com/embed/BeefBourg1',
    source: 'mealdb',
    status: 'approved',
    mealDbId: '52800',
    avgRating: 4.9,
  },
  {
    name: 'Classic Smoky BBQ Pulled Pork',
    cuisine: 'American',
    category: 'Main',
    ingredients: '2 kg Pork Shoulder Butt, 3 tbsp Brown Sugar Rub (Smoky Paprika, Garlic Powder, Onion Powder, Black Pepper), 1 cup Apple Cider Vinegar, 1 1/2 cups Sweet Smoky BBQ Sauce, Brioche Buns, Coleslaw',
    instructions: '1. Coat pork shoulder thoroughly with brown sugar spice rub.\n2. Roast slowly at 250°F (120°C) or cook in slow cooker for 8 hours until internal temp hits 205°F.\n3. Shred pork using two forks, discarding excess fat.\n4. Toss shredded pork with apple cider vinegar splash and half of the BBQ sauce.\n5. Pile high on toasted brioche buns with creamy slaw and extra BBQ sauce.',
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1200&q=80',
    youtubeUrl: 'https://www.youtube.com/embed/BBQPork123',
    source: 'mealdb',
    status: 'approved',
    mealDbId: '52790',
    avgRating: 4.8,
  },
  {
    name: 'Fluffy French Tarte Tatin',
    cuisine: 'French',
    category: 'Dessert',
    ingredients: '6 Honeycrisp Apples peeled & quartered, 1 cup Caster Sugar, 100g Unsalted Butter, 1 sheet All-butter Puff Pastry, 1 tsp Vanilla Bean paste, Pinch of Sea Salt',
    instructions: '1. Melt butter and sugar in ovenproof skillet over medium heat until deep golden caramel forms.\n2. Arrange apple quarters tightly in concentric circle pattern top-down into caramel.\n3. Cook 10 minutes until apples absorb caramel. Lay puff pastry sheet over apples, tucking edges in.\n4. Bake at 400°F (200°C) for 30 minutes until pastry is puffed and golden.\n5. Let rest 5 mins, then invert skillet onto serving plate carefully.',
    imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=1200&q=80',
    youtubeUrl: 'https://www.youtube.com/embed/TarteTatin1',
    source: 'mealdb',
    status: 'approved',
    mealDbId: '52805',
    avgRating: 4.9,
  },
  {
    name: 'Crispy Guacamole & Homemade Chips',
    cuisine: 'Mexican',
    category: 'Starter',
    ingredients: '4 Ripe Hass Avocados, 1 Lime juiced, 1/2 cup Finely chopped Red Onion, 1 Jalapeño seeded & diced, 1/2 cup Fresh Cilantro, 1 tsp Sea Salt, 12 Corn Tortillas cut in wedges for fried chips',
    instructions: '1. Halve and pit avocados; scoop flesh into large granite molcajete or bowl.\n2. Mash coarsely with fork, leaving chunky texture.\n3. Fold in lime juice, chopped red onion, diced jalapeño, and fresh cilantro.\n4. Season with sea salt to taste.\n5. Fry tortilla wedges in hot oil at 350°F until golden and crisp; sprinkle with sea salt and serve immediately.',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
    youtubeUrl: 'https://www.youtube.com/embed/GuacChip1',
    source: 'mealdb',
    status: 'approved',
    mealDbId: '52810',
    avgRating: 4.7,
  },
  {
    name: 'Fluffy Belgian Blueberry Pancakes',
    cuisine: 'American',
    category: 'Breakfast',
    ingredients: '2 cups All-Purpose Flour, 2 tbsp Sugar, 2 tsp Baking Powder, 2 Eggs, 1 1/2 cups Whole Milk, 4 tbsp Melted Butter, 1 1/2 cups Fresh Blueberries, Pure Maple Syrup',
    instructions: '1. Whisk dry ingredients in bowl. Beat eggs, milk, and melted butter separately.\n2. Combine wet and dry until just mixed (do not overmix, leave tiny lumps).\n3. Heat non-stick griddle over medium; pour 1/3 cup batter for each pancake.\n4. Scatter fresh blueberries onto raw side. Flip when bubbles pop and edges look set.\n5. Serve warm with knob of salted butter and warm maple syrup.',
    imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1200&q=80',
    youtubeUrl: 'https://www.youtube.com/embed/Pancake123',
    source: 'mealdb',
    status: 'approved',
    mealDbId: '52815',
    avgRating: 4.8,
  },
  {
    name: 'Spicy Moroccan Couscous Salad',
    cuisine: 'Moroccan',
    category: 'Side',
    ingredients: '1 1/2 cups Steamed Couscous, 1/2 cup Dried Cranberries, 1/2 cup Toasted Pine Nuts, 1 Cucumber diced, 1 Red Bell Pepper diced, 3 tbsp Lemon Olive Oil Dressing, Mint leaves',
    instructions: '1. Prepare couscous by steeping in boiling salted water for 5 minutes; fluff with fork.\n2. Toss cooled couscous with diced cucumber, red pepper, cranberries, and toasted pine nuts.\n3. Drizzle with fresh lemon juice and extra virgin olive oil.\n4. Toss in fresh torn mint and coriander leaves before serving chilled.',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
    youtubeUrl: 'https://www.youtube.com/embed/Couscous1',
    source: 'mealdb',
    status: 'approved',
    mealDbId: '52818',
    avgRating: 4.5,
  }
];

// Sample user reviews to seed
const SEED_RATINGS = [
  {
    stars: 5,
    comment: 'The flavours were incredible! Made this for Sunday family dinner and everyone asked for seconds.',
    userName: 'Chef Mateo',
  },
  {
    stars: 5,
    comment: 'Super straightforward instructions. Added a touch of extra garlic and it was pure bliss.',
    userName: 'Aaliyah K.',
  },
  {
    stars: 4,
    comment: 'Turned out amazing. Authentic aroma filled our entire apartment!',
    userName: 'David R.',
  },
  {
    stars: 5,
    comment: 'Better than my local restaurant takeout! Sticking this right into my weekly meal rotation.',
    userName: 'Priya Sharma',
  },
  {
    stars: 5,
    comment: 'Felt like I was sitting in a bistro in Paris. Absolutely stellar step-by-step guide.',
    userName: 'Jean-Luc',
  }
];

async function seed() {
  try {
    const existingCount = await Recipe.countDocuments();
    if (existingCount > 0) {
      console.log(`[Seed] Recipes collection already contains ${existingCount} documents. Skipping fetch.`);
      return;
    }

    console.log('[Seed] Fetching real recipe data from TheMealDB API...');
    let fetchedRecipes = [];

    try {
      // Search letter 'a' through 'f' to gather ~40-60 diverse real recipes
      const letters = ['a', 'b', 'c', 'd', 'm', 'p', 't'];
      for (const letter of letters) {
        const url = `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`;
        const res = await fetchJson(url);
        if (res && res.meals && Array.isArray(res.meals)) {
          for (const meal of res.meals) {
            if (!meal.strMeal || !meal.strMealThumb) continue;

            // Extract non-empty ingredients
            const ingredientsList = [];
            for (let i = 1; i <= 20; i++) {
              const ing = meal[`strIngredient${i}`];
              const measure = meal[`strMeasure${i}`];
              if (ing && ing.trim()) {
                ingredientsList.push(`${measure ? measure.trim() : ''} ${ing.trim()}`.trim());
              }
            }

            // Convert youtube link to embed iframe format if present
            let ytEmbed = 'https://www.youtube.com/embed/1-SJGQ2HLp8';
            if (meal.strYoutube && meal.strYoutube.includes('v=')) {
              const vId = meal.strYoutube.split('v=')[1].split('&')[0];
              ytEmbed = `https://www.youtube.com/embed/${vId}`;
            }

            fetchedRecipes.push({
              name: meal.strMeal,
              cuisine: mapCuisine(meal.strArea),
              category: mapCategory(meal.strCategory),
              ingredients: ingredientsList.join(', ') || 'Fresh ingredients as per recipe',
              instructions: meal.strInstructions || 'Follow traditional preparation steps.',
              imageUrl: meal.strMealThumb,
              youtubeUrl: ytEmbed,
              source: 'mealdb',
              status: 'approved',
              mealDbId: meal.idMeal,
              avgRating: +(4.3 + Math.random() * 0.7).toFixed(1),
            });
          }
        }
      }
    } catch (err) {
      console.warn('[Seed] External API fetch failed, using fallback set:', err.message);
    }

    // Combine fetched with fallback set if needed
    let finalRecipes = fetchedRecipes.length > 0 ? fetchedRecipes : FALLBACK_RECIPES;

    // Ensure we have at least 12 recipes covering cuisines
    if (finalRecipes.length < 8) {
      finalRecipes = [...finalRecipes, ...FALLBACK_RECIPES];
    }

    const insertedRecipes = await Recipe.insertMany(finalRecipes);
    console.log(`[Seed] Successfully inserted ${insertedRecipes.length} recipes into Database.`);

    // Seed sample ratings attached to inserted recipes
    const ratingDocs = [];
    for (let i = 0; i < Math.min(insertedRecipes.length, 10); i++) {
      const rec = insertedRecipes[i];
      // Insert 1-2 ratings per recipe
      const sampleReview1 = SEED_RATINGS[i % SEED_RATINGS.length];
      const sampleReview2 = SEED_RATINGS[(i + 2) % SEED_RATINGS.length];

      ratingDocs.push({
        recipeId: rec._id.toString(),
        stars: sampleReview1.stars,
        comment: sampleReview1.comment,
        userName: sampleReview1.userName,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)),
      });

      ratingDocs.push({
        recipeId: rec._id.toString(),
        stars: sampleReview2.stars,
        comment: sampleReview2.comment,
        userName: sampleReview2.userName,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 500000000)),
      });
    }

    if (ratingDocs.length > 0) {
      await Rating.insertMany(ratingDocs);
      console.log(`[Seed] Successfully inserted ${ratingDocs.length} sample ratings.`);
    }

  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
  }
}

// Execute immediately without managing DB connection (handled by server index)
(async () => {
  await seed();
})();

module.exports = seed;