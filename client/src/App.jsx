import React from 'react';
import { Routes, Route, NavLink, Link } from 'react-router-dom';

// Import pages
import Home from './pages/Home';
import Browse from './pages/Browse';
import RecipeDetail from './pages/RecipeDetail';
import SubmitRecipe from './pages/SubmitRecipe';
import Admin from './pages/Admin';

export default function App() {
  return (
    <div className="app-container">
      {/* Sticky Top Navigation Bar */}
      <header className="header-nav">
        <div className="container nav-content">
          <Link to="/" className="nav-logo">
            <span className="logo-icon">🌍📍</span>
            <span className="logo-text">
              The Hungry <span className="logo-accent">Atlas</span>
            </span>
          </Link>

          <nav className="nav-links">
            <NavLink 
              to="/" 
              end 
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Home
            </NavLink>
            <NavLink 
              to="/recipes" 
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Explore Recipes
            </NavLink>
            <NavLink 
              to="/submit" 
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Submit Recipe
            </NavLink>
          </nav>

          <div className="nav-cta-wrapper">
            <Link to="/recipes" className="btn-primary btn-sm">
              Start Cooking 🍲
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<Browse />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/submit" element={<SubmitRecipe />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      {/* Global Site Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand-col">
              <Link to="/" className="nav-logo footer-logo">
                <span className="logo-icon">🌍📍</span>
                <span className="logo-text">The Hungry Atlas</span>
              </Link>
              <p className="footer-tagline">
                Eight cuisines. One hungry planet. Zero passport required.
              </p>
              <p className="footer-copy">
                The Hungry Atlas turns your kitchen into a layover in Marrakesh, Osaka, or Oaxaca — real recipes, real steps, real people cooking alongside you.
              </p>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">Cuisines</h4>
              <ul className="footer-links">
                <li><Link to="/recipes?cuisine=Italian">🇮🇹 Italian Kitchen</Link></li>
                <li><Link to="/recipes?cuisine=Mexican">🇲🇽 Mexican Stalls</Link></li>
                <li><Link to="/recipes?cuisine=Indian">🇮🇳 Indian Flavors</Link></li>
                <li><Link to="/recipes?cuisine=Japanese">🇯🇵 Japanese Izakaya</Link></li>
                <li><Link to="/recipes?cuisine=Moroccan">🇲🇦 Moroccan Souk</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">Categories</h4>
              <ul className="footer-links">
                <li><Link to="/recipes?category=Starter">🥗 Starters & Small Plates</Link></li>
                <li><Link to="/recipes?category=Main">🍲 Main Courses</Link></li>
                <li><Link to="/recipes?category=Dessert">🍰 Sweet Treats & Desserts</Link></li>
                <li><Link to="/recipes?category=Breakfast">🍳 Morning Bakes & Eggs</Link></li>
                <li><Link to="/recipes?category=Side">🥖 Side Dishes</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">Community</h4>
              <ul className="footer-links">
                <li><Link to="/submit">Submit Your Family Recipe</Link></li>
                <li><Link to="/recipes">Search All Recipes</Link></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-stitch-line"></div>
            <div className="footer-bottom-flex">
              <p>© {new Date().getFullYear()} The Hungry Atlas (forgeai-site-mvcnye51). All rights reserved.</p>
              <div className="footer-bottom-links">
                <span className="badge">100% Homemade</span>
                <span className="badge">Authentic Flavors</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}