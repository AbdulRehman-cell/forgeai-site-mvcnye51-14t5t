import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Card, Badge, Spinner, Alert } from '../components/ui';

const CUISINES = [
  { name: 'Italian', flag: '🇮🇹', image: 'https://picsum.photos/seed/italianfood1/600/400', desc: 'Handcrafted pasta, wood-fired crusts & rich basil pestos.' },
  { name: 'Mexican', flag: '🇲🇽', image: 'https://picsum.photos/seed/mexicanfood1/600/400', desc: 'Smoky chiles, slow-braised meats & freshly pressed tortillas.' },
  { name: 'Indian', flag: '🇮🇳', image: 'https://picsum.photos/seed/indianfood1/600/400', desc: 'Aromatic garam masalas, rich simmered curries & warm naan.' },
  { name: 'Japanese', flag: '🇯🇵', image: 'https://picsum.photos/seed/japanesefood1/600/400', desc: 'Umami-rich broths, precision sushi & crispy tempura.' },
  { name: 'Chinese', flag: '🇨🇳', image: 'https://picsum.photos/seed/chinesefood1/600/400', desc: 'Szechuan peppercorns, handmade dumplings & wok hei.' },
  { name: 'American', flag: '🇺🇸', image: 'https://picsum.photos/seed/americanfood1/600/400', desc: 'Smoky barbecue, loaded smash burgers & soulful comfort food.' },
  { name: 'French', flag: '🇫🇷', image: 'https://picsum.photos/seed/frenchfood1/600/400', desc: 'Butter-rich reductions, flaky pastries & classic técnica.' },
  { name: 'Moroccan', flag: '🇲🇦', image: 'https://picsum.photos/seed/moroccanfood1/600/400', desc: 'Fragrant tagines, spiced couscous, saffron & orange blossom.' }
];

const CATEGORIES = [
  { name: 'Starter', icon: '🥗', desc: 'Bite-sized appetizers to kickstart your appetite.' },
  { name: 'Main', icon: '🍲', desc: 'Hearty, soul-satisfying centerpieces for the table.' },
  { name: 'Dessert', icon: '🍰', desc: 'Sweet treats, delicate tarts & decadent indulgences.' },
  { name: 'Side', icon: '🥖', desc: 'The supporting stars that complete every feast.' },
  { name: 'Breakfast', icon: '🍳', desc: 'Morning remedies, fluffy pancakes & savory bakes.' }
];

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Newsletter form state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [submittingNewsletter, setSubmittingNewsletter] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        setLoading(true);
        const res = await axios.get('/api/recipes');
        if (Array.isArray(res.data)) {
          setRecipes(res.data);
        } else {
          setRecipes([]);
        }
      } catch (err) {
        console.error('Error loading recipes:', err);
        setError('Unable to load latest recipes right now. Check back soon!');
      } finally {
        setLoading(false);
      }
    }
    fetchRecipes();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/recipes?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/recipes');
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubmittingNewsletter(true);
    setTimeout(() => {
      setSubmittingNewsletter(false);
      setNewsletterSuccess(true);
      setNewsletterEmail('');
    }, 800);
  };

  // Recipe of the day (date-seeded logic)
  const todayPick = recipes.length > 0 
    ? recipes[new Date().getDate() % recipes.length] 
    : {
        _id: 'sample-1',
        name: 'Moroccan Chicken Tagine with Preserved Lemon',
        cuisine: 'Moroccan',
        category: 'Main',
        avgRating: 4.9,
        imageUrl: 'https://picsum.photos/seed/tagine/800/600',
        instructions: 'Slow-simmered chicken with saffron, green olives, and aromatic spices.'
      };

  return (
    <div className="page-wrapper">
      {/* SECTION 1: HERO */}
      <section className="hero">
        <img 
          className="hero-bg" 
          src="https://picsum.photos/seed/flatlayhero/1600/900" 
          alt="Overhead food spread" 
        />
        <div className="container">
          <span className="eyebrow">Zero Passport Required</span>
          <h1>
            Dinner just bought a <span className="gradient-text">one-way</span> ticket.
          </h1>
          <p className="hero-subtitle">
            Turn your kitchen into a layover in Marrakesh, Osaka, or Oaxaca. Explore authentic recipes, step-by-step videos, and kitchen secrets shared by global home chefs.
          </p>

          <form onSubmit={handleSearchSubmit} className="hero-search-form">
            <div className="hero-search-input-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="hero-search-input"
                placeholder="Type a dish, an ingredient, or a craving..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" variant="primary" size="lg">
                Search Atlas
              </Button>
            </div>
          </form>

          <div className="hero-actions">
            <Link to="/recipes" className="btn-primary">
              Start Cooking Now 🍲
            </Link>
            <a href="#recipe-of-the-day" className="btn-secondary">
              See Today's Pick ✨
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 2: RECIPE OF THE DAY */}
      <section id="recipe-of-the-day" className="section animate-in">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Daily Featured Ticket</span>
            <h2>Today's Ticket To... <span className="gradient-text">{todayPick.cuisine || 'Global'} Kitchen</span></h2>
            <p>One dish chosen fresh every morning by our culinary curators. Tomorrow it's someone else's turn.</p>
          </div>

          <div className="recipe-of-day-block">
            <div className="rotd-left">
              <span className="hand-stamp-badge">Today's Pick</span>
              <span className="rotd-cuisine">{todayPick.cuisine || 'Moroccan'} Special</span>
              <h3 className="rotd-title">{todayPick.name}</h3>
              <p className="rotd-desc">
                {todayPick.instructions 
                  ? `${todayPick.instructions.substring(0, 160)}...`
                  : 'An exceptional blend of spices, perfectly balanced for a weekday triumph or weekend feast.'}
              </p>
              <div className="rotd-meta">
                <span className="rotd-rating">★ {todayPick.avgRating ? todayPick.avgRating.toFixed(1) : '4.9'} / 5.0</span>
                <Badge variant="primary">{todayPick.category || 'Main Course'}</Badge>
              </div>
              <div style={{ marginTop: '24px' }}>
                <Link to={`/recipes/${todayPick._id}`} className="btn-primary">
                  Steal This Recipe ➔
                </Link>
              </div>
            </div>

            <div className="rotd-right">
              <img 
                src={todayPick.imageUrl || 'https://picsum.photos/seed/tagine/800/600'} 
                alt={todayPick.name}
                className="img-cover"
                style={{ width: '100%', height: '100%', minHeight: '340px' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: BROWSE BY CUISINE */}
      <section className="section animate-in">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Explore Destinations</span>
            <h2>Pick a Country, Not Just a Course</h2>
            <p>Eight vibrant kitchens, zero boarding passes. Click any destination to jump straight into traditional recipes.</p>
          </div>

          <div className="grid grid-4">
            {CUISINES.map((c) => (
              <Card 
                key={c.name} 
                interactive 
                onClick={() => navigate(`/recipes?cuisine=${encodeURIComponent(c.name)}`)}
                className="cuisine-tile-card"
              >
                <div style={{ position: 'relative', height: '180px', overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
                  <img src={c.image} alt={c.name} className="img-cover" />
                  <span className="cuisine-flag-chip">{c.flag} {c.name}</span>
                </div>
                <div style={{ padding: '16px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>{c.name} Cooking</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted)' }}>{c.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: BROWSE BY CATEGORY */}
      <section className="section section-alt animate-in">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Filter by Meal Type</span>
            <h2>Or Just Tell Us What Meal You're Missing</h2>
            <p>Late night cravings? Morning rush? Pick your course and let us handle the rest.</p>
          </div>

          <div className="category-pills-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                className="category-pill-btn"
                onClick={() => navigate(`/recipes?category=${encodeURIComponent(cat.name)}`)}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link to="/recipes" className="btn-secondary">
              View All Recipe Categories ➔
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 5: COMMUNITY SPOTLIGHT & RECENT RECIPES */}
      <section className="section animate-in">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Community Kitchen</span>
            <h2>Cooked Up By People Like You</h2>
            <p>Every recipe here started in someone’s actual kitchen — tested, family-approved, and loved globally.</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spinner size="lg" color="primary" />
              <p style={{ marginTop: '12px', color: 'var(--muted)' }}>Fetching delicious dishes...</p>
            </div>
          ) : error ? (
            <Alert variant="error">{error}</Alert>
          ) : recipes.length === 0 ? (
            <p style={{ textAlign: 'center' }}>No recipes found yet. Be the first to share one!</p>
          ) : (
            <div className="grid grid-3">
              {recipes.slice(0, 6).map((recipe) => (
                <Card 
                  key={recipe._id} 
                  interactive 
                  onClick={() => navigate(`/recipes/${recipe._id}`)}
                  className="recipe-card-custom"
                >
                  <div className="recipe-card-img-wrap">
                    <img 
                      src={recipe.imageUrl || 'https://picsum.photos/seed/fooditem/600/400'} 
                      alt={recipe.name} 
                      className="img-cover" 
                    />
                    <div className="recipe-rating-badge">
                      ★ {recipe.avgRating ? recipe.avgRating.toFixed(1) : '4.8'}
                    </div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <Badge variant="primary">{recipe.cuisine || 'Global'}</Badge>
                      <Badge variant="neutral">{recipe.category || 'Main'}</Badge>
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: 'var(--text)' }}>
                      {recipe.name}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: 0, lineClamp: 2 }}>
                      {recipe.instructions ? `${recipe.instructions.substring(0, 85)}...` : 'Tap to read full step-by-step instructions and ingredients.'}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 6: HOW IT WORKS / STATS BAND */}
      <section className="section section-alt animate-in">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">The Atlas Standard</span>
            <h2>From Nonna's Stove to Yours</h2>
            <p>Three simple steps to expanding your culinary horizons every single night.</p>
          </div>

          <div className="grid grid-3" style={{ marginBottom: '48px' }}>
            <div className="step-card">
              <div className="step-num">01</div>
              <h3>Explore & Pick</h3>
              <p>Filter by mood, ingredient, or nation. Find authentic recipes curated by real home cooks across 8 regions.</p>
            </div>
            <div className="step-card">
              <div className="step-num">02</div>
              <h3>Follow & Watch</h3>
              <p>Check off sticky ingredients, read clear steps, and stream full step-by-step video walkthroughs directly on page.</p>
            </div>
            <div className="step-card">
              <div className="step-num">03</div>
              <h3>Rate & Share</h3>
              <p>Cooked something grand? Leave a review, drop your kitchen tips, or publish your own secret family dish.</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="stats-banner">
            <div className="stat-item">
              <span className="stat-value">500+</span>
              <span className="stat-label">Global Recipes</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">8</span>
              <span className="stat-label">World Cuisines</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">4.9★</span>
              <span className="stat-label">Avg Cook Score</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">100%</span>
              <span className="stat-label">Kitchen Tested</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: SUBMIT CTA BANNER */}
      <section className="section animate-in">
        <div className="container">
          <div className="cta-section">
            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
              <span className="eyebrow" style={{ color: 'var(--accent)' }}>Share Your Kitchen Heritage</span>
              <h2 style={{ color: '#ffffff', marginTop: '8px' }}>
                Got a Family Recipe Nobody Outside Your Family Knows?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '24px' }}>
                Put it on the map. Literally. Submit your recipe to our editorial kitchen and share your traditions with thousands of hungry cooks worldwide.
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/submit" className="btn-primary" style={{ backgroundColor: 'var(--accent)', color: 'var(--text)' }}>
                  Submit My Recipe 📝
                </Link>
                <Link to="/recipes" className="btn-secondary" style={{ borderColor: '#ffffff', color: '#ffffff' }}>
                  Browse Cookbook 📚
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: NEWSLETTER & FOOTER PROMO */}
      <section className="section section-alt animate-in">
        <div className="container" style={{ maxWidth: '800px', textAlign: 'center' }}>
          <span className="eyebrow">Weekly Digest</span>
          <h2>Your Spice Rack is About to Get a Passport Stamp</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
            Get one handpicked regional recipe, spice guides, and culinary stories delivered to your inbox every Thursday morning.
          </p>

          {newsletterSuccess ? (
            <Alert variant="success">
              🎉 You're on the list! Keep an eye on your inbox for this Thursday's passport dish.
            </Alert>
          ) : (
            <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <input 
                type="email" 
                required 
                placeholder="Enter your email address..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                style={{
                  padding: '12px 18px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  minWidth: '280px',
                  fontSize: '1rem',
                  backgroundColor: 'var(--surface)'
                }}
              />
              <Button type="submit" variant="primary" loading={submittingNewsletter}>
                Feed Me Something New 🚀
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}