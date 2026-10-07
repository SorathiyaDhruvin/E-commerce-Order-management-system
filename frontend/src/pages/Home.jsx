import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatPrice } from '../utils/helpers';
import { useCart } from '../context/CartContext';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products?size=8'),
          api.get('/categories')
        ]);
        if (productsRes.data.success) setFeaturedProducts(productsRes.data.data.content);
        if (categoriesRes.data.success) setCategories(categoriesRes.data.data);
      } catch (error) {
        console.error('Failed to load home data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const categoryIcons = {
    'Electronics': '💻', 'Clothing': '👕', 'Books': '📚',
    'Home & Kitchen': '🏠', 'Beauty': '💄', 'Sports': '⚽',
    'Toys': '🧸', 'Grocery': '🛒', 'Mobiles': '📱',
    'Fashion': '👗', 'Appliances': '🔌', 'Accessories': '⌚'
  };

  return (
    <div className="ss-home">
      {/* Promotional Banner */}
      <section className="ss-promo-banner">
        <div className="ss-promo-content">
          <div className="ss-promo-text">
            <span className="ss-promo-badge">ShopSphere</span>
            <h2>Great Deals on Top Products</h2>
            <p>Shop the best prices on electronics, fashion, home & more</p>
            <Link to="/products" className="btn btn-primary btn-lg">Shop Now</Link>
          </div>
        </div>
      </section>

      {/* Category Shortcuts */}
      <section className="ss-categories-section">
        <div className="ss-home-container">
          <div className="ss-category-grid">
            {loading ? (
              Array(4).fill(0).map((_, i) => <div key={i} className="ss-category-card skeleton" style={{height: '100px'}}></div>)
            ) : (
              categories.map(cat => (
                <Link to={`/products?category=${cat.id}`} key={cat.id} className="ss-category-card">
                  <div className="ss-category-icon">{categoryIcons[cat.name] || '📦'}</div>
                  <span className="ss-category-name">{cat.name}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="ss-products-section">
        <div className="ss-home-container">
          <div className="ss-section-header">
            <h2 className="ss-section-title">Top Deals</h2>
            <Link to="/products" className="ss-view-all">View All →</Link>
          </div>
          <div className="ss-product-grid">
            {loading ? (
              Array(4).fill(0).map((_, i) => <div key={i} className="ss-product-card skeleton" style={{height: '280px'}}></div>)
            ) : (
              featuredProducts.slice(0, 4).map(product => (
                <div key={product.id} className="ss-product-card">
                  <Link to={`/products/${product.id}`} className="ss-product-img-link">
                    <div className="ss-product-img-wrap">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} loading="lazy" />
                      ) : (
                        <div className="ss-product-img-placeholder">No Image</div>
                      )}
                    </div>
                  </Link>
                  <div className="ss-product-body">
                    {product.brand && <span className="ss-product-brand">{product.brand}</span>}
                    <Link to={`/products/${product.id}`} className="ss-product-name">{product.name}</Link>
                    <div className="ss-product-price-row">
                      <span className="ss-product-price">{formatPrice(product.price)}</span>
                    </div>
                    {product.stockQuantity <= 0 ? (
                      <span className="ss-out-of-stock">Out of Stock</span>
                    ) : product.stockQuantity <= 5 ? (
                      <span className="ss-low-stock">Only {product.stockQuantity} left</span>
                    ) : (
                      <span className="ss-in-stock">In Stock</span>
                    )}
                    <button
                      className="btn btn-primary w-full ss-add-cart-btn"
                      onClick={() => addToCart(product.id, 1)}
                      disabled={product.stockQuantity <= 0}
                    >Add to Cart</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Best Sellers / More Products */}
      {featuredProducts.length > 4 && (
        <section className="ss-products-section">
          <div className="ss-home-container">
            <div className="ss-section-header">
              <h2 className="ss-section-title">Best Sellers</h2>
              <Link to="/products" className="ss-view-all">View All →</Link>
            </div>
            <div className="ss-product-grid">
              {featuredProducts.slice(4, 8).map(product => (
                <div key={product.id} className="ss-product-card">
                  <Link to={`/products/${product.id}`} className="ss-product-img-link">
                    <div className="ss-product-img-wrap">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} loading="lazy" />
                      ) : (
                        <div className="ss-product-img-placeholder">No Image</div>
                      )}
                    </div>
                  </Link>
                  <div className="ss-product-body">
                    {product.brand && <span className="ss-product-brand">{product.brand}</span>}
                    <Link to={`/products/${product.id}`} className="ss-product-name">{product.name}</Link>
                    <div className="ss-product-price-row">
                      <span className="ss-product-price">{formatPrice(product.price)}</span>
                    </div>
                    {product.stockQuantity <= 0 ? (
                      <span className="ss-out-of-stock">Out of Stock</span>
                    ) : (
                      <span className="ss-in-stock">In Stock</span>
                    )}
                    <button
                      className="btn btn-primary w-full ss-add-cart-btn"
                      onClick={() => addToCart(product.id, 1)}
                      disabled={product.stockQuantity <= 0}
                    >Add to Cart</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Shop by Category - Visual Grid */}
      <section className="ss-shopby-section">
        <div className="ss-home-container">
          <h2 className="ss-section-title">Shop by Category</h2>
          <div className="ss-shopby-grid">
            {categories.map(cat => (
              <Link to={`/products?category=${cat.id}`} key={cat.id} className="ss-shopby-card card">
                <div className="ss-shopby-icon">{categoryIcons[cat.name] || '📦'}</div>
                <h3>{cat.name}</h3>
                {cat.description && <p>{cat.description}</p>}
                <span className="ss-shopby-link">Explore →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner Bottom */}
      <section className="ss-bottom-promo">
        <div className="ss-home-container">
          <div className="ss-bottom-promo-card">
            <span>🎉</span>
            <div>
              <strong>Welcome Offer!</strong>
              <p>Get ₹200 off on your first order. Use code <strong>WELCOME200</strong> at checkout.</p>
            </div>
            <Link to="/products" className="btn btn-blue">Shop Now</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
