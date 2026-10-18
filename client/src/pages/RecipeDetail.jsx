import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Button, Card, Badge, Spinner, Alert, Textarea, Input, Stat } from '../components/ui';

export default function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [relatedRecipes, setRelatedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Ingredient check-off state
  const [checkedIngredients, setCheckedIngredients] = useState({});

  // Rating & Comment Form State
  const [stars, setStars] = useState(5);
  const [userName, setUserName] = useState('');
  const [comment, setComment] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchRecipeData = async () => {
      setLoading(true);
      setError('');
      try {
        // 1. Fetch main recipe
        const res = await axios.get(`/api/recipes/${id}`);
        if (!isMounted) return;
        const currentRecipe = res.data;
        setRecipe(currentRecipe);

        // Reset checkable ingredients list
        setCheckedIngredients({});

        // 2. Fetch comments/ratings for this recipe
        const ratingsRes = await axios.get(`/api/ratings?recipeId=${id}`);
        if (isMounted) {
          setRatings(Array.isArray(ratingsRes.data) ? ratingsRes.data : []);
        }

        // 3. Fetch related recipes in same cuisine or category
        if (currentRecipe?.cuisine) {
          const relatedRes = await axios.get(`/api/recipes?cuisine=${encodeURIComponent(currentRecipe.cuisine)}`);
          if (isMounted && Array.isArray(relatedRes.data)) {
            const filtered = relatedRes.data.filter(r => r._id !== id).slice(0, 3);
            setRelatedRecipes(filtered);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error || 'Failed to load recipe details. Please check your connection.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRecipeData();
    window.scrollTo(0, 0);

    return () => {
      isMounted = false;
    };
  }, [id]);

  const toggleIngredient = (index) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setSubmitError('Please write a short note or comment about how your dish turned out!');
      return;
    }

    setSubmitLoading(true);
    setSubmitError('');

    try {
      const payload = {
        recipeId: id,
        stars: Number(stars),
        userName: userName.trim() || 'Anonymous Home Chef',
        comment: comment.trim()
      };

      const res = await axios.post('/api/ratings', payload);

      setSubmitSuccess(true);
      setRatings(prev => [res.data, ...prev]);

      // Re-fetch recipe to sync avgRating if updated on backend
      const updatedRecipeRes = await axios.get(`/api/recipes/${id}`);
      if (updatedRecipeRes.data) {
        setRecipe(updatedRecipeRes.data);
      }

      setComment('');
      setUserName('');
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to post your review. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Helper function to extract YouTube Embed ID safely
  const getEmbedYoutubeUrl = (url) => {
    if (!url) return null;
    let videoId = '';
    if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <Spinner size="lg" color="primary" />
        <p className="hero-subtitle" style={{ marginTop: '16px' }}>
          Simmering recipe secrets from around the globe...
        </p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="container" style={{ padding: '64px 0' }}>
        <Alert variant="error" title="Recipe Not Found">
          {error || "We couldn't locate this recipe in our global atlas collection."}
        </Alert>
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link to="/recipes" className="btn-primary">
            ← Explore All Recipes
          </Link>
        </div>
      </div>
    );
  }

  // Parse ingredients array safely
  const ingredientsList = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : typeof recipe.ingredients === 'string'
    ? recipe.ingredients.split('\n').filter(Boolean).map(item => ({ name: item, quantity: '' }))
    : [];

  // Parse instructions array safely
  const instructionsList = Array.isArray(recipe.instructions)
    ? recipe.instructions
    : typeof recipe.instructions === 'string'
    ? recipe.instructions.split('\n').filter(Boolean)
    : [];

  const embedUrl = getEmbedYoutubeUrl(recipe.youtubeUrl);

  return (
    <div className="recipe-detail-page">
      {/* 1. Recipe Detail Header & Compact Hero */}
      <section className="section" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
        <div className="container" style={{ maxWidth: '1080px' }}>
          <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link to="/recipes" className="btn-ghost" style={{ paddingLeft: 0, textDecoration: 'none' }}>
              ← Back to World Atlas
            </Link>
            <span style={{ color: 'var(--muted)' }}>/</span>
            <Badge variant="primary">{recipe.cuisine || 'Global'}</Badge>
            <Badge variant="neutral">{recipe.category || 'Dish'}</Badge>
          </div>

          <span className="eyebrow">Straight From {recipe.cuisine || 'World'}'s Kitchen Table</span>
          <h1 style={{ marginTop: '8px', marginBottom: '16px' }}>
            {recipe.name}{' '}
            <span className="gradient-text" style={{ fontStyle: 'italic', fontWeight: 500 }}>
              Delight
            </span>
          </h1>

          <div className="recipe-meta-strip" style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--accent)', fontSize: '1.25rem' }}>★</span>
              <strong style={{ fontSize: '1.1rem' }}>
                {recipe.avgRating ? recipe.avgRating.toFixed(1) : '5.0'}
              </strong>
              <span style={{ color: 'var(--muted)' }}>({ratings.length} community reviews)</span>
            </div>
            <div style={{ color: 'var(--muted)' }}>•</div>
            <div>
              <strong>Origin:</strong> {recipe.cuisine || 'International'}
            </div>
            <div style={{ color: 'var(--muted)' }}>•</div>
            <div>
              <strong>Source:</strong> {recipe.source === 'mealdb' ? 'TheMealDB Master Vault' : 'Community Submitted'}
            </div>
          </div>

          <div className="recipe-hero-image-wrapper" style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
            <img
              src={recipe.imageUrl || 'https://picsum.photos/seed/recipe1/1200/600'}
              alt={recipe.name}
              className="img-cover"
              style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* 2. Two-Column Layout: Ingredients Checklist (Sticky Sidebar) + Numbered Steps */}
      <section className="section" style={{ backgroundColor: 'var(--surface-2)', borderTop: '2px dashed var(--border)', borderBottom: '2px dashed var(--border)' }}>
        <div className="container" style={{ maxWidth: '1080px' }}>
          <div className="grid grid-2" style={{ gridTemplateColumns: '1fr 1.6fr', gap: '36px', alignItems: 'start' }}>
            
            {/* Sticky Ingredients Checklist */}
            <div className="card card-white" style={{ position: 'sticky', top: '90px' }}>
              <span className="eyebrow" style={{ color: 'var(--primary)' }}>Pantry Checklist</span>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>What You'll Need</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Tap items to check them off as you prep your workstation:
              </p>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {ingredientsList.length > 0 ? (
                  ingredientsList.map((ing, idx) => {
                    const isChecked = !!checkedIngredients[idx];
                    const name = typeof ing === 'string' ? ing : ing.name;
                    const qty = typeof ing === 'object' && ing.quantity ? ing.quantity : '';

                    return (
                      <li
                        key={idx}
                        onClick={() => toggleIngredient(idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 0',
                          borderBottom: idx === ingredientsList.length - 1 ? 'none' : '1px solid var(--border)',
                          cursor: 'pointer',
                          textDecoration: isChecked ? 'line-through' : 'none',
                          opacity: isChecked ? 0.5 : 1,
                          transition: 'all 0.18s ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Handled by li click
                          style={{ accentColor: 'var(--primary)', width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                          {qty && <span style={{ color: 'var(--primary)', marginRight: '6px' }}>{qty}</span>}
                          {name}
                        </span>
                      </li>
                    );
                  })
                ) : (
                  <li style={{ color: 'var(--muted)' }}>No listed ingredients available.</li>
                )}
              </ul>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="instructions-container">
              <span className="eyebrow">Culinary Method</span>
              <h2 style={{ marginBottom: '20px' }}>How It Comes Together</h2>

              {instructionsList.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {instructionsList.map((step, idx) => (
                    <div
                      key={idx}
                      className="card"
                      style={{
                        display: 'flex',
                        gap: '20px',
                        alignItems: 'flex-start',
                        backgroundColor: 'var(--surface)',
                        borderRadius: '16px'
                      }}
                    >
                      <div
                        className="step-num"
                        style={{
                          background: 'var(--primary)',
                          color: '#fff',
                          minWidth: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '1.1rem',
                          boxShadow: '0 4px 12px rgba(232,85,44,0.3)'
                        }}
                      >
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Step {idx + 1}</h3>
                        <p style={{ margin: 0, lineHeight: 1.65, color: 'var(--text)' }}>{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Card>
                  <p>Follow standard preparation methods or consult video walkthrough below.</p>
                </Card>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 3. Embedded Video Walkthrough (if available) */}
      {embedUrl && (
        <section className="section">
          <div className="container" style={{ maxWidth: '1080px' }}>
            <div className="section-head" style={{ textAlign: 'center', marginBottom: '32px' }}>
              <span className="eyebrow">Visual Chef Guide</span>
              <h2>Watch It Happen</h2>
              <p className="hero-subtitle">
                Sometimes a video says what a written recipe card can't. Follow along in real time!
              </p>
            </div>

            <div
              className="video-embed aspect-hero"
              style={{
                position: 'relative',
                paddingBottom: '56.25%', // 16:9 aspect ratio
                height: 0,
                overflow: 'hidden',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <iframe
                src={embedUrl}
                title={`${recipe.name} Walkthrough`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 0
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/* 4. Ratings & Comments Section */}
      <section className="section" style={{ backgroundColor: 'var(--surface-2)', borderTop: '2px dashed var(--border)' }}>
        <div className="container" style={{ maxWidth: '1080px' }}>
          <div className="grid grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
            
            {/* Form Column */}
            <div>
              <span className="eyebrow">Kitchen Feedback</span>
              <h2>Did You Make This?</h2>
              <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
                Tell us if it worked, what you changed, or what your kitchen smelled like while cooking!
              </p>

              {submitSuccess ? (
                <Alert variant="success" title="Review Published!">
                  ✓ Thank you! Your rating and comments have been added to this recipe's community feed.
                  <div style={{ marginTop: '12px' }}>
                    <Button size="sm" variant="ghost" onClick={() => setSubmitSuccess(false)}>
                      Submit Another Comment
                    </Button>
                  </div>
                </Alert>
              ) : (
                <form onSubmit={handleSubmitRating} className="card card-white">
                  {submitError && (
                    <div style={{ marginBottom: '16px' }}>
                      <Alert variant="error">{submitError}</Alert>
                    </div>
                  )}

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
                      Your Rating (1 to 5 Stars)
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setStars(star)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.8rem',
                            cursor: 'pointer',
                            color: star <= stars ? 'var(--accent)' : '#ccc',
                            padding: '2px',
                            transition: 'transform 0.1s ease'
                          }}
                        >
                          ★
                        </button>
                      ))}
                      <span style={{ marginLeft: '12px', fontWeight: '600', color: 'var(--text)' }}>
                        {stars} / 5 Stars
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <Input
                      label="Your Name or Chef Alias"
                      placeholder="e.g. Chef Marco or Hungry Traveler"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <Textarea
                      label="Your Cooking Notes & Tasting Experience"
                      placeholder="Did you swap any ingredients? How was the spice level?"
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={submitLoading}
                  >
                    Submit Your Rating 🌟
                  </Button>
                </form>
              )}
            </div>

            {/* Comments List Column */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
                <h2>Community Reviews</h2>
                <Badge variant="primary">{ratings.length} Total</Badge>
              </div>

              {ratings.length === 0 ? (
                <Card padding="md">
                  <p style={{ margin: 0, color: 'var(--muted)', textAlign: 'center' }}>
                    No reviews left yet for this recipe. Be the very first home chef to test it out!
                  </p>
                </Card>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {ratings.map((rev) => (
                    <div key={rev._id || Math.random()} className="card card-white" style={{ borderRadius: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <strong style={{ fontSize: '1rem', color: 'var(--text)' }}>
                          {rev.userName || 'Anonymous Home Chef'}
                        </strong>
                        <div style={{ color: 'var(--accent)', fontSize: '0.95rem' }}>
                          {'★'.repeat(rev.stars || 5)}
                          <span style={{ color: '#ccc' }}>{'★'.repeat(5 - (rev.stars || 5))}</span>
                        </div>
                      </div>
                      <p style={{ margin: 0, color: 'var(--text)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        "{rev.comment}"
                      </p>
                      <small style={{ color: 'var(--muted)', display: 'block', marginTop: '8px' }}>
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recently posted'}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 5. You Might Also Like / Related Recipes */}
      {relatedRecipes.length > 0 && (
        <section className="section">
          <div className="container" style={{ maxWidth: '1080px' }}>
            <div className="section-head">
              <span className="eyebrow">Explore Similar Flavors</span>
              <h2>More From {recipe.cuisine || 'This Cuisine'}</h2>
              <p className="hero-subtitle">Expand your menu with these matching authentic recipes.</p>
            </div>

            <div className="grid grid-3" style={{ marginTop: '32px' }}>
              {relatedRecipes.map((rel) => (
                <div key={rel._id} className="card recipe-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ position: 'relative' }}>
                    <img
                      src={rel.imageUrl || 'https://picsum.photos/seed/rel/600/400'}
                      alt={rel.name}
                      style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-14px',
                        left: '16px',
                        backgroundColor: '#fff',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        boxShadow: '0 6px 16px rgba(0,0,0,.12)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.85rem',
                        fontWeight: 700
                      }}
                    >
                      <span style={{ color: 'var(--accent)' }}>★</span>
                      <span>{rel.avgRating ? rel.avgRating.toFixed(1) : '5.0'}</span>
                    </div>
                  </div>

                  <div style={{ padding: '24px 20px 20px' }}>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                      <Badge size="sm" variant="primary">{rel.cuisine}</Badge>
                      <Badge size="sm" variant="neutral">{rel.category}</Badge>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', margin: '6px 0 12px', lineHeight: 1.3 }}>{rel.name}</h3>
                    <Link to={`/recipes/${rel._id}`} className="btn-secondary btn-sm" style={{ width: '100%', textAlign: 'center' }}>
                      View Recipe →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Bottom Banner CTA */}
      <section className="cta-section" style={{ margin: '32px 0 0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <span className="eyebrow" style={{ color: '#fff' }}>Join The Global Table</span>
          <h2 style={{ color: '#fff', fontSize: '2.4rem', marginTop: '8px' }}>
            Got a Family Recipe Nobody Outside Your Family Knows?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '28px', fontSize: '1.1rem' }}>
            Put your grandmother's secret sauce or regional specialty on the map. Submit it to our culinary testing queue!
          </p>
          <Link to="/submit" className="btn-primary" style={{ backgroundColor: 'var(--accent)', color: 'var(--text)', fontWeight: 700 }}>
            Submit Your Recipe Now 📌
          </Link>
        </div>
      </section>
    </div>
  );
}