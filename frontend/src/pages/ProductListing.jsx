import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './ProductListing.css';

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 1 });
  
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const pageParam = parseInt(searchParams.get('page')) || 0;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
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
          if (categoryParam) {
            endpoint += `&categoryId=${categoryParam}`;
          }
        } else if (categoryParam) {
          endpoint = `/products/category/${categoryParam}?page=${pageParam}&size=12`;
        }

        const res = await api.get(endpoint);
        if (res.data.success) {
          setProducts(res.data.data.content);
          setPagination({
            page: res.data.data.page,
            totalPages: res.data.data.totalPages
          });
        }
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryParam, searchParam, pageParam]);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set('category', value);
    } else {
      newParams.delete('category');
    }
    newParams.set('page', '0');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo(0, 0);
  };

  return (
    <div className="product-listing-container animate-fade-in">
      <div className="products-hero">
        <div className="products-hero-content">
          <h1>Discover Your Next Favorite Item</h1>
          <p>Explore our premium collection of meticulously crafted products.</p>
        </div>
      </div>

      <div className="listing-header">
        <h2>{searchParam ? `Search Results for "${searchParam}"` : 'All Products'}</h2>
        
        <div className="filters">
          <select 
            className="form-control category-select" 
            value={categoryParam} 
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="products-grid grid grid-cols-4">
        {loading ? (
          Array(8).fill(0).map((_, i) => <div key={i} className="product-card skeleton" style={{height: '350px'}}></div>)
        ) : products.length > 0 ? (
          products.map(product => (
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
                <h3 className="product-name" title={product.name}>{product.name}</h3>
                <div className="product-price">${product.price.toFixed(2)}</div>
                <Link to={`/products/${product.id}`} className="btn btn-secondary w-full">View Details</Link>
              </div>
            </div>
          ))
        ) : (
          <div className="no-products">
            <div className="no-products-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
            </div>
            <h3>Nothing found!</h3>
            <p>We couldn't find any products matching your current filters.</p>
            <button 
              className="btn btn-primary" 
              onClick={() => setSearchParams(new URLSearchParams())}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {!loading && pagination.totalPages > 1 && (
        <div className="pagination">
          <button 
            className="btn btn-secondary" 
            disabled={pagination.page === 0}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </button>
          <span className="page-info">
            Page {pagination.page + 1} of {pagination.totalPages}
          </span>
          <button 
            className="btn btn-secondary" 
            disabled={pagination.page >= pagination.totalPages - 1}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductListing;
