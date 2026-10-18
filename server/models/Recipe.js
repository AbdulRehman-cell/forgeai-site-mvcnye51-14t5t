const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    cuisine: {
      type: String,
      required: true,
      trim: true,
      default: 'International',
    },
    category: {
      type: String,
      required: true,
      trim: true,
      default: 'Main Course',
    },
    ingredients: {
      type: String,
      required: true,
      trim: true,
    },
    instructions: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: 'https://picsum.photos/seed/food1/800/600',
    },
    youtubeUrl: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      default: 'TheMealDB / Community',
    },
    status: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'approved',
    },
    mealDbId: {
      type: String,
      sparse: true,
      unique: true,
    },
    avgRating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Recipe', recipeSchema);