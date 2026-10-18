import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Spinner, EmptyState, Badge, Button } from '../components/ui';

const CUISINES = [
  { name: 'All Cuisines', code: 'all', flag: '🌐' },
  { name: 'Italian', code: 'Italian', flag: '🇮🇹' },
  { name: 'Mexican', code: 'Mexican', flag: '🇲🇽' },
  { name: 'Indian', code: 'Indian', flag: '🇮🇳' },
  { name: 'Japanese', code: 'Japanese', flag: '🇯🇵' },
  { name: 'Chinese', code: 'Chinese', flag: '🇨🇳' },
  { name: 'American', code: 'American', flag: '🇺🇸' },
  { name: 'French', code: 'French', flag: '🇫🇷' },
  { name: 'Moroccan', code: 'Moroccan', flag: '🇲🇦' }
];

const CATEGORIES = [
  { name: 'All Categories', code: 'all', icon: '🍽️' },
  { name: 'Starter', code: 'Starter', icon: '🥗' },
  { name: 'Main', code: 'Main', icon: '🍲' },
  { name: 'Dessert', code: 'Dessert', icon: '🍰' },
  { name: 'Side', code: 'Side', icon: '🥖' },
  { name: 'Breakfast', code: 'Breakfast', icon: '🍳' }
];

export default function Browse() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL
  const currentCuisine = searchParams.get('cuisine') || 'all';
  const currentCategory = searchParams.get('category') || 'all';
  const currentSearch = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sorting and Pagination
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'name', 'newest'
  const [displayCount, setDisplayCount] = useState(9);

  // Sync state if search input is edited manually
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Fetch recipes whenever filters change
  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('/api/recipes');
        const data = Array.isArray(res.data) ? res.data : [];
        
        // Only show approved recipes or recipes with source 'mealdb'
        const approved = data.filter(r => r.status === 'approved' || r.source === 'mealdb' || !r.status);
        setRecipes(approved);
      } catch (err) {
        console.error('Failed to fetch recipes:', err);
        setError('Failed to load global recipes. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Filter Logic
  const filteredRecipes = recipes.filter(r => {
    // Cuisine filter
    if (currentCuisine !== 'all' && (r.cuisine || '').toLowerCase() !== currentCuisine.toLowerCase()) {
      return false;
    }
    // Category filter
    if (currentCategory !== 'all' && (r.category || '').toLowerCase() !== currentCategory.toLowerCase()) {
      return false;
    }
    // Search filter (matches name, ingredients, or cuisine)
    if (currentSearch.trim() !== '') {
      const q = currentSearch.toLowerCase();
      const matchName = (r.name || '').toLowerCase().includes(q);
      const matchCuisine = (r.cuisine || '').toLowerCase().includes(q);
      const matchCat = (r.category || '').toLowerCase().includes(q);
      const matchIng = Array.isArray(r.ingredients) 
        ? r.ingredients.some(i => (i.name || i || '').toLowerCase().includes(q))
        : (r.ingredients || '').toLowerCase().includes(q);
      return matchName || matchCuisine || matchCat || matchIng;
    }
    return true;
  });

  // Sorting Logic
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    if (sortBy === 'rating') {
      return (b.avgRating || 4.5) - (a.avgRating || 4.5);
    }
    if (sortBy === 'name') {
      return (a.name || '').localeCompare(b.name || '');
    }
    if (sortBy === 'newest') {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
    return 0;
  });

  const visibleRecipes = sortedRecipes.slice(0, displayCount);

  // Update URL Query Params
  const updateFilters = (key, val) => {
    const params = new URLSearchParams(searchParams);
    if (val === 'all' || !val) {
      params.delete(key);
    } else {
      params.set(key, val);
    }
    setSearchParams(params);
    setDisplayCount(9);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters('q', searchInput);
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams({});
    setDisplayCount(9);
  };

  const activeFiltersCount = (currentCuisine !== 'all' ? 1 : 0) + 
                             (currentCategory !== 'all' ? 1 : 0) + 
                             (currentSearch ? 1 : 0);

  return (
    <div className="browse-page">
      {/* Header / Search Hero Section */}
      <section className="section bg-surface-2 hero-compact">
        <div className="container">
          <div className="section-head text-center">
            <span className="eyebrow">The World Dish Explorer</span>
            <h1 className="hero-title">
              Find Your <span className="gradient-text">Next</span> Favorite Recipe
            </h1>
            <p className="hero-subtitle">
              Narrow down your global search by origin, course, or secret ingredient.
            </p>

            {/* Global Search Bar */}
            <form onSubmit={handleSearchSubmit} className="search-form-bar">
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by dish name, spice, or ingredient (e.g., Tacos, Basil, Curry)..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                {searchInput && (
                  <button 
                    type="button" 
                    className="clear-search-btn" 
                    onClick={() => { setSearchInput(''); updateFilters('q', ''); }}
                  >
                    ✕
                  </button>
                )}
              </div>
              <button type="submit" className="btn-primary">
                Search Atlas
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Main Filter & Results Section */}
      <section className="section">
        <div className="container">
          {/* Cuisine Pill Filters */}
          <div className="filter-block">
            <h3 className="filter-title">Filter by Origin Cuisine:</h3>
            <div className="filter-chips-row">
              {CUISINES.map((c) => (
                <button
                  key={c.code}
                  className={`cuisine-pill-chip ${currentCuisine.toLowerCase() === c.code.toLowerCase() ? 'active' : ''}`}
                  onClick={() => updateFilters('cuisine', c.code)}
                >
                  <span className="chip-flag">{c.flag}</span>
                  <span className="chip-label">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Chip Filters */}
          <div className="filter-block mt-16">
            <h3 className="filter-title">Filter by Course / Meal:</h3>
            <div className="filter-chips-row">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.code}
                  className={`category-pill-chip ${currentCategory.toLowerCase() === cat.code.toLowerCase() ? 'active' : ''}`}
                  onClick={() => updateFilters('category', cat.code)}
                >
                  <span className="chip-icon">{cat.icon}</span>
                  <span className="chip-label">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Filter Bar & Controls */}
          <div className="results-control-bar">
            <div className="active-chips-summary">
              {activeFiltersCount > 0 ? (
                <>
                  <span className="summary-label">Active Filters:</span>
                  {currentCuisine !== 'all' && (
                    <span className="active-chip">
                      Cuisine: {currentCuisine}
                      <button onClick={() => updateFilters('cuisine', 'all')}>×</button>
                    </span>
                  )}
                  {currentCategory !== 'all' && (
                    <span className="active-chip">
                      Course: {currentCategory}
                      <button onClick={() => updateFilters('category', 'all')}>×</button>
                    </span>
                  )}
                  {currentSearch && (
                    <span className="active-chip">
                      Search: "{currentSearch}"
                      <button onClick={() => { setSearchInput(''); updateFilters('q', ''); }}>×</button>
                    </span>
                  )}
                  <button className="clear-all-link" onClick={clearAllFilters}>
                    Clear all filters
                  </button>
                </>
              ) : (
                <span className="summary-label">Showing all authentic recipes in the collection</span>
              )}
            </div>

            {/* Sort Selector */}
            <div className="sort-wrapper">
              <label htmlFor="sort-select" className="sort-label">Sort By:</label>
              <select
                id="sort-select"
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="rating">Highest Rated ⭐</option>
                <option value="name">Alphabetical (A-Z)</option>
                <option value="newest">Recently Added</option>
              </select>
            </div>
          </div>

          {/* Results State */}
          {loading ? (
            <div className="loading-container text-center">
              <Spinner size="lg" color="primary" />
              <p className="loading-text mt-16">Unlocking kitchen archives from around the globe...</p>
            </div>
          ) : error ? (
            <div className="alert alert-error">
              {error}
            </div>
          ) : sortedRecipes.length === 0 ? (
            <div className="empty-results-box">
              <EmptyState
                icon="🍲"
                title="No dishes found for this craving"
                description={`We couldn't find any recipes matching your specific criteria. Want to be the first to share one?`}
                action={
                  <div className="empty-actions">
                    <Button variant="secondary" onClick={clearAllFilters}>
                      Reset All Filters
                    </Button>
                    <Button variant="primary" onClick={() => navigate('/submit')}>
                      Submit Your Family Recipe
                    </Button>
                  </div>
                }
              />
            </div>
          ) : (
            <>
              {/* Recipe Cards Grid */}
              <div className="grid grid-3 recipe-results-grid">
                {visibleRecipes.map((recipe) => {
                  const rating = recipe.avgRating || 4.7;
                  const imgSrc = Array.isArray(recipe.imageUrl)
                    ? recipe.imageUrl[0]
                    : recipe.imageUrl || 'https://picsum.photos/seed/recipefallback/600/400';

                  return (
                    <div 
                      key={recipe._id || recipe.mealDbId || recipe.name} 
                      className="card recipe-card animate-in"
                      onClick={() => navigate(`/recipes/${recipe._id}`)}
                    >
                      <div className="card-image-wrap">
                        <img 
                          src={imgSrc} 
                          alt={recipe.name} 
                          className="recipe-card-img" 
                          loading="lazy"
                        />
                        <div className="rating-badge-overlap">
                          <span className="star">★</span>
                          <span className="score">{rating.toFixed(1)}</span>
                        </div>
                        {recipe.category && (
                          <div className="category-badge-top">
                            <Badge variant="neutral">{recipe.category}</Badge>
                          </div>
                        )}
                      </div>

                      <div className="card-body">
                        <div className="card-meta-header">
                          <span className="cuisine-badge-text">
                            📍 {recipe.cuisine || 'Global'}
                          </span>
                          {recipe.source === 'user' && (
                            <span className="community-tag">Community Pick</span>
                          )}
                        </div>

                        <h3 className="recipe-card-title">{recipe.name}</h3>

                        <p className="recipe-card-desc">
                          {recipe.instructions 
                            ? (typeof recipe.instructions === 'string' 
                                ? recipe.instructions.slice(0, 100) + '...'
                                : Array.isArray(recipe.instructions)
                                  ? recipe.instructions.join(' ').slice(0, 100) + '...'
                                  : 'An exquisite dish packed with authentic regional flavors and fresh spices.')
                            : 'An exquisite dish packed with authentic regional flavors and fresh spices.'}
                        </p>

                        <div className="card-footer-action">
                          <span className="btn-text-link">View Recipe & Steps →</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Pagination */}
              {visibleRecipes.length < sortedRecipes.length && (
                <div className="pagination-cta text-center mt-32">
                  <p className="recipes-count-text">
                    Showing {visibleRecipes.length} of {sortedRecipes.length} delicious possibilities
                  </p>
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={() => setDisplayCount(prev => prev + 9)}
                  >
                    Hungry for More? Load Next Recipes 🍲
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Related Cuisines Quick Navigation Strip */}
      <section className="section bg-surface section-divider-stitch">
        <div className="container">
          <div className="section-head text-center">
            <span className="eyebrow">Expanded Horizons</span>
            <h2>Didn't Find It? Try These World Kitchens</h2>
            <p>Explore neighbor cuisines and popular street food havens.</p>
          </div>

          <div className="grid grid-4 related-cuisines-grid mt-24">
            <div 
              className="feature-card cuisine-quick-card"
              onClick={() => updateFilters('cuisine', 'Italian')}
            >
              <div className="feature-icon">🇮🇹</div>
              <h3>Italian Kitchen</h3>
              <p>Handcrafted pastas, rich passata, and slow-roasted meats.</p>
              <span className="card-link-text">Browse Italian →</span>
            </div>

            <div 
              className="feature-card cuisine-quick-card"
              onClick={() => updateFilters('cuisine', 'Mexican')}
            >
              <div className="feature-icon">🇲🇽</div>
              <h3>Mexican Mercado</h3>
              <p>Zesty moles, flame-seared tacos, and smoky chile salsas.</p>
              <span className="card-link-text">Browse Mexican →</span>
            </div>

            <div 
              className="feature-card cuisine-quick-card"
              onClick={() => updateFilters('cuisine', 'Indian')}
            >
              <div className="feature-icon">🇮🇳</div>
              <h3>Indian Spice Route</h3>
              <p>Fragrant biryanis, velvety curries, and warm garlic naan.</p>
              <span className="card-link-text">Browse Indian →</span>
            </div>

            <div 
              className="feature-card cuisine-quick-card"
              onClick={() => updateFilters('cuisine', 'Japanese')}
            >
              <div className="feature-icon">🇯🇵</div>
              <h3>Japanese Izakaya</h3>
              <p>Comforting ramen broth, umami glazes, and crispy tempura.</p>
              <span className="card-link-text">Browse Japanese →</span>
            </div>
          </div>
        </div>
      </section>

      {/* Community Submit Callout */}
      <section className="section cta-section text-center">
        <div className="container">
          <span className="eyebrow text-white">Share Your Heritage</span>
          <h2 className="text-white">Is Your Signature Dish Missing?</h2>
          <p className="hero-subtitle text-white">
            We are constantly expanding our living atlas. Submit your family's secret recipe and put your hometown on our map.
          </p>
          <div className="hero-actions">
            <Button variant="secondary" size="lg" onClick={() => navigate('/submit')}>
              Submit a Recipe Now 📝
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}