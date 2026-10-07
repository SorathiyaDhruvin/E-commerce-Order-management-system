import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { formatPrice } from '../utils/helpers';
import { useCart } from '../context/CartContext';
import './ProductListing.css';

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 1, totalElements: 0 });
  const { addToCart } = useCart();

  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || '';
  const pageParam = parseInt(searchParams.get('page')) || 0;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) setCategories(res.data.data);
      } catch (e) { /* silent */ }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let endpoint = `/products?page=${pageParam}&size=12`;

        if (searchParam) {
          endpoint = `/products/search?keyword=${encodeURIComponent(searchParam)}&page=${pageParam}&size=12`;
          if (categoryParam) endpoint += `&categoryId=${categoryParam}`;
        } else if (categoryParam) {
          endpoint = `/products/category/${categoryParam}?page=${pageParam}&size=12`;
        }

        const res = await api.get(endpoint);
        if (res.data.success) {
          let items = res.data.data.content;
          // Client-side sorting
          if (sortParam === 'price-asc') items = [...items].sort((a, b) => a.price - b.price);
          else if (sortParam === 'price-desc') items = [...items].sort((a, b) => b.price - a.price);
          else if (sortParam === 'newest') items = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          setProducts(items);
          setPagination({
            page: res.data.data.page,
            totalPages: res.data.data.totalPages,
            totalElements: res.data.data.totalElements || items.length,
          });
        }
      } catch (e) {
        console.error('Failed to fetch products', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryParam, searchParam, pageParam, sortParam]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    if (key !== 'page') newParams.set('page', '0');
    setSearchParams(newParams);
  };

  const clearFilters = () => setSearchParams(new URLSearchParams());

  const handlePageChange = (newPage) => {
    updateParam('page', newPage.toString());
    window.scrollTo(0, 0);
  };

  const activeCategoryName = categories.find(c => String(c.id) === categoryParam)?.name;

  return (
    <div className="ss-listing">
      <div className="ss-listing-container">
        {/* Breadcrumb */}
        <div className="ss-breadcrumb">
          <Link to="/">Home</Link>
          <span>›</span>
          {activeCategoryName ? (
            <>
              <Link to="/products">Products</Link>
              <span>›</span>
              <span>{activeCategoryName}</span>
            </>
          ) : (
            <span>Products</span>
          )}
        </div>

        <div className="ss-listing-grid">
          {/* Filters Sidebar */}
          <aside className="ss-filters">
            <div className="ss-filter-header">
              <h3>Filters</h3>
              {(categoryParam || searchParam) && (
                <button className="ss-clear-filters" onClick={clearFilters}>Clear All</button>
              )}
            </div>

            {/* Category Filter */}
            <div className="ss-filter-section">
              <h4>CATEGORY</h4>
              <label className={`ss-filter-option ${!categoryParam ? 'active' : ''}`}>
                <input type="radio" name="category" value="" checked={!categoryParam} onChange={() => updateParam('category', '')} />
                All Categories
              </label>
              {categories.map(cat => (
                <label key={cat.id} className={`ss-filter-option ${String(cat.id) === categoryParam ? 'active' : ''}`}>
                  <input type="radio" name="category" value={cat.id} checked={String(cat.id) === categoryParam} onChange={() => updateParam('category', String(cat.id))} />
                  {cat.name}
                </label>
              ))}
            </div>

            {/* Price Filter */}
            <div className="ss-filter-section">
              <h4>PRICE</h4>
              {[
                { label: 'Under ₹500', max: 500 },
                { label: '₹500 - ₹1,000', min: 500, max: 1000 },
                { label: '₹1,000 - ₹5,000', min: 1000, max: 5000 },
                { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
                { label: '₹10,000 & Above', min: 10000 },
              ].map((range, i) => (
                <label key={i} className="ss-filter-option">
                  <input type="checkbox" disabled />
                  {range.label}
                </label>
              ))}
            </div>

            {/* Availability */}
            <div className="ss-filter-section">
              <h4>AVAILABILITY</h4>
              <label className="ss-filter-option">
                <input type="checkbox" disabled />
                In Stock
              </label>
              <label className="ss-filter-option">
                <input type="checkbox" disabled />
                Out of Stock
              </label>
            </div>
          </aside>

          {/* Products Main Area */}
          <div className="ss-listing-main">
            {/* Header */}
            <div className="ss-listing-header">
              <div className="ss-listing-title">
                <h2>
                  {searchParam ? `Results for "${searchParam}"` : activeCategoryName || 'All Products'}
                </h2>
                {!loading && <span className="ss-results-count">({pagination.totalElements} products)</span>}
              </div>
              <div className="ss-sort">
                <label>Sort By:</label>
                <select value={sortParam} onChange={(e) => updateParam('sort', e.target.value)} className="form-control">
                  <option value="">Relevance</option>
                  <option value="price-asc">Price — Low to High</option>
                  <option value="price-desc">Price — High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <div className="ss-products-grid">
              {loading ? (
                Array(8).fill(0).map((_, i) => <div key={i} className="ss-product-card skeleton" style={{height: '300px'}}></div>)
              ) : products.length > 0 ? (
                products.map(product => (
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
                        <span className="ss-in-stock">Free Delivery</span>
                      )}
                      <button className="btn btn-primary w-full ss-add-cart-btn" onClick={() => addToCart(product.id, 1)} disabled={product.stockQuantity <= 0}>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="ss-empty-results">
                  <p><strong>No products found</strong></p>
                  <p>Try changing your search or filters.</p>
                  <button className="btn btn-secondary" onClick={clearFilters}>Clear Filters</button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
              <div className="ss-pagination">
                <button className="btn btn-secondary btn-sm" disabled={pagination.page === 0} onClick={() => handlePageChange(pagination.page - 1)}>Previous</button>
                <span className="ss-page-info">Page {pagination.page + 1} of {pagination.totalPages}</span>
                <button className="btn btn-secondary btn-sm" disabled={pagination.page >= pagination.totalPages - 1} onClick={() => handlePageChange(pagination.page + 1)}>Next</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
