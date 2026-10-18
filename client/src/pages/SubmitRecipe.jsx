import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Input, Textarea, Select, Card, Alert, PageHeader } from '../components/ui';

export default function SubmitRecipe() {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    cuisine: 'Italian',
    category: 'Main',
    imageUrl: '',
    youtubeUrl: '',
    userName: ''
  });

  // Dynamic Array States
  const [ingredients, setIngredients] = useState([
    { name: '', quantity: '' },
    { name: '', quantity: '' }
  ]);
  const [instructions, setInstructions] = useState(['', '']);

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const cuisineOptions = [
    { value: 'Italian', label: '🇮🇹 Italian' },
    { value: 'Mexican', label: '🇲🇽 Mexican' },
    { value: 'Indian', label: '🇮🇳 Indian' },
    { value: 'Japanese', label: '🇯🇵 Japanese' },
    { value: 'Chinese', label: '🇨🇳 Chinese' },
    { value: 'American', label: '🇺🇸 American' },
    { value: 'French', label: '🇫🇷 French' },
    { value: 'Moroccan', label: '🇲🇦 Moroccan' }
  ];

  const categoryOptions = [
    { value: 'Starter', label: '🥣 Starter' },
    { value: 'Main', label: '🍝 Main Course' },
    { value: 'Dessert', label: '🍰 Dessert' },
    { value: 'Side', label: '🥗 Side Dish' },
    { value: 'Breakfast', label: '🥞 Breakfast' }
  ];

  // Dynamic Handlers
  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const addIngredientRow = () => {
    setIngredients([...ingredients, { name: '', quantity: '' }]);
  };

  const removeIngredientRow = (index) => {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleInstructionChange = (index, value) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const addInstructionStep = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstructionStep = (index) => {
    if (instructions.length <= 1) return;
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Please provide a recipe name.');
      return;
    }

    const validIngredients = ingredients.filter(i => i.name.trim() !== '');
    if (validIngredients.length === 0) {
      setError('Please add at least one ingredient.');
      return;
    }

    const validInstructions = instructions.filter(s => s.trim() !== '');
    if (validInstructions.length === 0) {
      setError('Please provide at least one instruction step.');
      return;
    }

    // Format arrays into strings for storage compatibility
    const formattedIngredients = validIngredients
      .map(i => `${i.quantity ? i.quantity + ' ' : ''}${i.name}`.trim())
      .join('\n');

    const formattedInstructions = validInstructions
      .map((step, idx) => `${idx + 1}. ${step.trim()}`)
      .join('\n');

    const payload = {
      name: formData.name.trim(),
      cuisine: formData.cuisine,
      category: formData.category,
      imageUrl: formData.imageUrl.trim() || 'https://picsum.photos/seed/recipe-default/800/600',
      youtubeUrl: formData.youtubeUrl.trim(),
      userName: formData.userName.trim(),
      ingredients: formattedIngredients,
      instructions: formattedInstructions,
      source: 'user',
      status: 'pending',
      avgRating: 5.0
    };

    setLoading(true);

    try {
      await axios.post('/api/recipes', payload);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.error || 'Failed to submit recipe. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submit-recipe-page animate-in">
      {/* Page Header Hero */}
      <section className="hero compact-hero">
        <div className="container">
          <span className="eyebrow">Community Kitchen</span>
          <h1>Share Something <span className="gradient-text">Worth Eating</span></h1>
          <p className="hero-subtitle">
            Got a family recipe nobody outside your family knows? Put it on the map. Literally.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container section">
        {success ? (
          <div className="card-elevated submission-success-card animate-in">
            <div className="success-icon">🎉</div>
            <span className="badge badge-success">Submitted & Pending Approval</span>
            <h2>Your Recipe Is in the Queue!</h2>
            <p className="muted-text">
              Thank you for contributing to <strong>The Hungry Atlas</strong>. Our culinary moderators will kitchen-test and approve your dish shortly. Once live, food lovers worldwide can cook it alongside you!
            </p>
            <div className="action-buttons">
              <Button 
                variant="primary" 
                onClick={() => {
                  setSuccess(false);
                  setFormData({ name: '', cuisine: 'Italian', category: 'Main', imageUrl: '', youtubeUrl: '', userName: '' });
                  setIngredients([{ name: '', quantity: '' }, { name: '', quantity: '' }]);
                  setInstructions(['', '']);
                }}
              >
                Submit Another Recipe 🍳
              </Button>
              <Button variant="secondary" onClick={() => navigate('/recipes')}>
                Browse Recipe Catalog 📖
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="recipe-submit-form">
            {error && (
              <Alert variant="error" title="Submission Issue" dismissible onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* SECTION 1: THE BASICS */}
            <section className="form-section card">
              <div className="section-head-sm">
                <span className="step-num">1</span>
                <div>
                  <h2>The Basics</h2>
                  <p className="muted-text">Name your dish and tag its country of origin & meal course.</p>
                </div>
              </div>

              <div className="form-grid">
                <Input
                  label="Recipe Title *"
                  placeholder="e.g. Grandma's Creamy Tuscan Garlic Chicken"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <Input
                  label="Your Name / Chef Handle"
                  placeholder="e.g. Chef Marco or @hungry_sarah"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                />

                <Select
                  label="Cuisine Origin *"
                  options={cuisineOptions}
                  value={formData.cuisine}
                  onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                />

                <Select
                  label="Course Category *"
                  options={categoryOptions}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />

                <Input
                  label="Featured Image URL"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />

                <Input
                  label="YouTube Walkthrough Video URL (Optional)"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                />
              </div>
            </section>

            {/* SECTION 2: INGREDIENTS BUILDER */}
            <section className="form-section card">
              <div className="section-head-sm">
                <span className="step-num">2</span>
                <div>
                  <h2>Every Ingredient, Down to the Pinch of Salt</h2>
                  <p className="muted-text">Add ingredients with exact measurements so home cooks can replicate it perfectly.</p>
                </div>
              </div>

              <div className="dynamic-rows">
                {ingredients.map((ing, idx) => (
                  <div key={idx} className="dynamic-row ingredient-row">
                    <Input
                      placeholder="Quantity / Unit (e.g. 2 tbsp, 500g)"
                      value={ing.quantity}
                      onChange={(e) => handleIngredientChange(idx, 'quantity', e.target.value)}
                    />
                    <Input
                      placeholder="Ingredient Name (e.g. Extra Virgin Olive Oil)"
                      value={ing.name}
                      onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => removeIngredientRow(idx)}
                      disabled={ingredients.length <= 1}
                      title="Remove line"
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>

              <div className="form-actions-inline">
                <Button type="button" variant="secondary" size="sm" onClick={addIngredientRow}>
                  + Add Ingredient Line
                </Button>
              </div>
            </section>

            {/* SECTION 3: INSTRUCTIONS BUILDER */}
            <section className="form-section card">
              <div className="section-head-sm">
                <span className="step-num">3</span>
                <div>
                  <h2>Walk Us Through It, Step by Step</h2>
                  <p className="muted-text">Clear, numbered directions build confidence in the kitchen.</p>
                </div>
              </div>

              <div className="dynamic-rows">
                {instructions.map((step, idx) => (
                  <div key={idx} className="dynamic-row instruction-row">
                    <span className="step-badge">Step {idx + 1}</span>
                    <Textarea
                      placeholder={`Explain step ${idx + 1}... (e.g., Sear the chicken breasts over medium-high heat until golden brown, approx 6 mins.)`}
                      value={step}
                      onChange={(e) => handleInstructionChange(idx, e.target.value)}
                      rows={2}
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => removeInstructionStep(idx)}
                      disabled={instructions.length <= 1}
                      title="Remove step"
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>

              <div className="form-actions-inline">
                <Button type="button" variant="secondary" size="sm" onClick={addInstructionStep}>
                  + Add Instruction Step
                </Button>
              </div>
            </section>

            {/* SECTION 4: REVIEW & SUBMIT */}
            <section className="form-section card cta-section">
              <div className="cta-content">
                <h2>Looks Good? Send It Our Way!</h2>
                <p>Your recipe will be reviewed by our team and published to the global database.</p>
                
                <div className="submit-footer">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg" 
                    loading={loading}
                    disabled={loading}
                  >
                    {loading ? 'Submitting Recipe...' : 'Submit My Recipe 🚀'}
                  </Button>
                </div>
              </div>
            </section>
          </form>
        )}
      </div>

      {/* THREE SUBSTANTIAL COMMUNITY & GUIDELINE SECTIONS BELOW */}
      
      {/* SECTION B: GUIDELINES */}
      <section className="section bg-surface-2">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Quality Kitchen Standards</span>
            <h2>What Makes a Great Atlas Submission?</h2>
            <p>We review every recipe to guarantee our readers get foolproof, restaurant-quality results at home.</p>
          </div>

          <div className="grid grid-3">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Specific Quantities</h3>
              <p className="muted-text">
                Avoid vague measurements like "a bowl of flour." Use exact grams, cups, tablespoons, or pinches to ensure consistency across different kitchens worldwide.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📸</div>
              <h3>Vibrant Food Photography</h3>
              <p className="muted-text">
                High-resolution, well-lit flat-lays work best. Show the final plated dish under warm natural light so hungry cooks know what to aim for!
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌶️</div>
              <h3>Authentic Heritage</h3>
              <p className="muted-text">
                Tell us where the dish comes from! Whether it's an authentic family heirloom or a personal fusion twist, context makes the meal special.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION C: COMMUNITY STATS */}
      <section className="section">
        <div className="container">
          <div className="grid grid-4 stats-grid">
            <div className="stat-card">
              <span className="stat-value">1,400+</span>
              <span className="stat-label">Community Recipes</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">48 Cuisines</span>
              <span className="stat-label">Represented Worldwide</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">98.4%</span>
              <span className="stat-label">Kitchen Approval Rate</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">24-48 hrs</span>
              <span className="stat-label">Average Review Time</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION D: COMMUNITY FAQ */}
      <section className="section bg-surface">
        <div className="container container-narrow">
          <div className="section-head">
            <span className="eyebrow">Frequently Asked Questions</span>
            <h2>Submitting Your Dish</h2>
          </div>

          <div className="faq-list">
            <div className="faq-item card">
              <h3>How long before my recipe appears on the site?</h3>
              <p className="muted-text">
                Our editorial team kitchen-tests and verifies ingredient listings within 24 to 48 hours. Once approved by an admin, it instantly pops up on the global explore page.
              </p>
            </div>

            <div className="faq-item card">
              <h3>Can I edit my recipe after submitting?</h3>
              <p className="muted-text">
                If you notice an error in your ingredients or steps after submitting, simply re-submit or reach out to our team via the Admin portal and we will update your entry.
              </p>
            </div>

            <div className="faq-item card">
              <h3>Do I retain ownership of my recipe?</h3>
              <p className="muted-text">
                Yes! You retain full credit for your recipe. We publish your specified name or handle alongside the dish to celebrate your culinary craftsmanship.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}