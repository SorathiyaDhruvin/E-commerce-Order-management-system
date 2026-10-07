import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products?size=4'),
          api.get('/categories')
        ]);
        
        if (productsRes.data.success) {
          setFeaturedProducts(productsRes.data.data.content);
        }
        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.data.slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to load home data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="home-container animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Discover Premium Tech & Gadgets</h1>
          <p className="hero-subtitle">
            Upgrade your lifestyle with our curated collection of the latest electronics, accessories, and more.
          </p>
          <Link to="/products" className="btn btn-primary hero-btn">Shop Now</Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <h2 className="section-title">Shop by Category</h2>
        <div className="categories-grid grid grid-cols-4">
          {loading ? (
            Array(4).fill(0).map((_, i) => <div key={i} className="category-card skeleton"></div>)
          ) : (
            categories.map(category => (
              <Link to={`/products?category=${category.id}`} key={category.id} className="category-card">
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="section-header">
          <h2 className="section-title">Featured Products</h2>
          <Link to="/products" className="view-all-link">View All →</Link>
        </div>
        
        <div className="products-grid grid grid-cols-4">
          {loading ? (
            Array(4).fill(0).map((_, i) => <div key={i} className="product-card skeleton" style={{height: '300px'}}></div>)
          ) : (
            featuredProducts.map(product => (
              <div key={product.id} className="product-card card">
                <div className="product-image-container">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="product-image" />
                  ) : (
                    <div className="product-image-placeholder">No Image</div>
                  )}
                  {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                    <span className="badge badge-warning product-badge">Low Stock</span>
                  )}
                  {product.stockQuantity === 0 && (
                    <span className="badge badge-danger product-badge">Out of Stock</span>
                  )}
                </div>
                <div className="product-info">
                  <span className="product-brand">{product.brand}</span>
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-price">${product.price.toFixed(2)}</div>
                  <Link to={`/products/${product.id}`} className="btn btn-secondary w-full">View Details</Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      
      {/* Promo Section */}
      <section className="promo-section">
        <div className="promo-content">
          <h2>Special Offer!</h2>
          <p>Get 20% off on your first order. Use code <strong>WELCOME20</strong> at checkout.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
