const express = require('express');
const jwt = require('jsonwebtoken');
const Recipe = require('../models/Recipe');

const router = express.Router();
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'forgeai-admin-secret-change-me';

// Inline admin authorization middleware
const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
  }
};

// GET / - Public list of recipes with optional query filtering
router.get('/', async (req, res, next) => {
  try {
    const { status, cuisine, category, search, mealDbId, limit } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }
    if (cuisine) {
      query.cuisine = { $regex: new RegExp(`^${cuisine}$`, 'i') };
    }
    if (category) {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }
    if (mealDbId) {
      query.mealDbId = mealDbId;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { ingredients: { $regex: search, $options: 'i' } }
      ];
    }

    let reqQuery = Recipe.find(query).sort({ createdAt: -1 });
    if (limit) {
      reqQuery = reqQuery.limit(parseInt(limit, 10));
    }

    const recipes = await reqQuery.exec();
    // CRITICAL: Return plain JSON array
    res.json(recipes);
  } catch (err) {
    next(err);
  }
});

// GET /:id - Public single recipe fetch
router.get('/:id', async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    next(err);
  }
});

// POST / - Public endpoint to create/submit a recipe
router.post('/', async (req, res, next) => {
  try {
    const { name, cuisine, category, ingredients, instructions, imageUrl, youtubeUrl, source, status, mealDbId, avgRating } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Recipe name is required' });
    }

    const newRecipe = new Recipe({
      name: name.trim(),
      cuisine: cuisine || 'International',
      category: category || 'Miscellaneous',
      ingredients: ingredients || '',
      instructions: instructions || '',
      imageUrl: imageUrl || '',
      youtubeUrl: youtubeUrl || '',
      source: source || 'User Submitted',
      status: status || 'pending', // Default to pending for community submissions
      mealDbId: mealDbId || null,
      avgRating: typeof avgRating === 'number' ? avgRating : 0,
      createdAt: new Date()
    });

    const savedRecipe = await newRecipe.save();
    res.status(201).json(savedRecipe);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

// PUT /:id - Admin only recipe update
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const allowedUpdates = [
      'name', 'cuisine', 'category', 'ingredients', 
      'instructions', 'imageUrl', 'youtubeUrl', 'source', 
      'status', 'mealDbId', 'avgRating'
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        recipe[field] = req.body[field];
      }
    });

    const updatedRecipe = await recipe.save();
    res.json(updatedRecipe);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    next(err);
  }
});

// DELETE /:id - Admin only recipe deletion
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json({ message: 'Recipe successfully deleted', id: req.params.id });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    next(err);
  }
});

module.exports = router;