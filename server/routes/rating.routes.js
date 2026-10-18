const express = require('express');
const jwt = require('jsonwebtoken');
const Rating = require('../models/Rating');
const Recipe = require('../models/Recipe');

const router = express.Router();

// Inline requireAdmin middleware for PUT / DELETE
const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
    }
    const token = authHeader.split(' ')[1];
    const secret = process.env.ADMIN_JWT_SECRET || 'forgeai-admin-secret-change-me';
    const decoded = jwt.verify(token, secret);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired admin token' });
  }
};

// Helper function to update recipe average rating
const updateRecipeAvgRating = async (recipeId) => {
  try {
    const ratings = await Rating.find({ recipeId });
    if (ratings.length === 0) {
      await Recipe.findByIdAndUpdate(recipeId, { avgRating: 0 });
      return;
    }
    const sum = ratings.reduce((acc, curr) => acc + (curr.stars || 0), 0);
    const avg = Number((sum / ratings.length).toFixed(1));
    await Recipe.findByIdAndUpdate(recipeId, { avgRating: avg });
  } catch (e) {
    console.error('Failed to update average rating on recipe:', e);
  }
};

// GET /api/ratings - List all ratings (optional filter by recipeId)
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.recipeId) {
      filter.recipeId = req.query.recipeId;
    }
    const ratings = await Rating.find(filter).sort({ createdAt: -1 });
    res.json(ratings);
  } catch (err) {
    next(err);
  }
});

// GET /api/ratings/:id - Get single rating by ID
router.get('/:id', async (req, res, next) => {
  try {
    const rating = await Rating.findById(req.params.id);
    if (!rating) {
      return res.status(404).json({ error: 'Rating not found' });
    }
    res.json(rating);
  } catch (err) {
    next(err);
  }
});

// POST /api/ratings - Create a rating (PUBLIC)
router.post('/', async (req, res, next) => {
  try {
    const { recipeId, stars, comment, userName } = req.body;

    if (!recipeId) {
      return res.status(400).json({ error: 'recipeId is required' });
    }
    const parsedStars = Number(stars);
    if (isNaN(parsedStars) || parsedStars < 1 || parsedStars > 5) {
      return res.status(400).json({ error: 'stars must be a number between 1 and 5' });
    }

    const rating = new Rating({
      recipeId,
      stars: parsedStars,
      comment: comment || '',
      userName: userName || 'Anonymous Foodie',
      createdAt: new Date()
    });

    const saved = await rating.save();

    // Recalculate average rating for the target recipe asynchronously
    await updateRecipeAvgRating(recipeId);

    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
});

// PUT /api/ratings/:id - Update rating (requireAdmin)
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const updated = await Rating.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    if (updated.recipeId) {
      await updateRecipeAvgRating(updated.recipeId);
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/ratings/:id - Delete rating (requireAdmin)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const rating = await Rating.findById(req.params.id);
    if (!rating) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    const recipeId = rating.recipeId;
    await Rating.findByIdAndDelete(req.params.id);

    if (recipeId) {
      await updateRecipeAvgRating(recipeId);
    }

    res.json({ message: 'Rating deleted successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;