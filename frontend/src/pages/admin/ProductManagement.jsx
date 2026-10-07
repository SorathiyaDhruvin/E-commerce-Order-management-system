import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './AdminTable.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    imageUrl: '',
    brand: '',
    categoryId: '',
    active: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products?size=100'),
        api.get('/categories')
      ]);
      
      if (productsRes.data.success) {
        setProducts(productsRes.data.data.content);
      }
      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '', description: '', price: '', stockQuantity: '', 
      imageUrl: '', brand: '', categoryId: '', active: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl || '',
      brand: product.brand || '',
      categoryId: product.categoryId,
      active: product.active
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await api.put(`/products/${editingId}`, formData);
        if (res.data.success) {
          toast.success('Product updated successfully');
        }
      } else {
        const res = await api.post('/products', formData);
        if (res.data.success) {
          toast.success('Product created successfully');
        }
      }
      fetchData();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Product deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  if (loading && products.length === 0) {
    return <div className="admin-loading">Loading products...</div>;
  }

  return (
    <div className="admin-table-container animate-fade-in">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Manage Products</h2>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add New Product
          </button>
        )}
      </div>

      {showForm && (
        <div className="admin-form-card card">
          <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input type="text" name="name" className="form-control" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Brand</label>
                <input type="text" name="brand" className="form-control" value={formData.brand} onChange={handleInputChange} />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-control" rows="3" value={formData.description} onChange={handleInputChange} required></textarea>
            </div>
            
            <div className="grid grid-cols-3">
              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input type="number" step="0.01" name="price" className="form-control" value={formData.price} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input type="number" name="stockQuantity" className="form-control" value={formData.stockQuantity} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select name="categoryId" className="form-control" value={formData.categoryId} onChange={handleInputChange} required>
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input type="text" name="imageUrl" className="form-control" value={formData.imageUrl} onChange={handleInputChange} />
            </div>
            
            <div className="form-group checkbox-group">
              <input type="checkbox" id="active" name="active" checked={formData.active} onChange={handleInputChange} />
              <label htmlFor="active">Active (Visible to customers)</label>
            </div>
            
            <div className="admin-form-actions">
              <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editingId ? 'Update Product' : 'Save Product'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="card table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="table-img" />
                  ) : (
                    <div className="table-img-placeholder">N/A</div>
                  )}
                </td>
                <td className="font-semibold">{product.name}</td>
                <td>{product.categoryName}</td>
                <td>₹{product.price.toFixed(2)}</td>
                <td>
                  <span className={`badge ₹{product.stockQuantity <= 5 ? 'badge-warning' : 'badge-success'}`}>
                    {product.stockQuantity}
                  </span>
                </td>
                <td>
                  {product.active ? (
                    <span className="badge badge-success">Active</span>
                  ) : (
                    <span className="badge badge-danger">Inactive</span>
                  )}
                </td>
                <td className="table-actions">
                  <button className="btn-icon edit" onClick={() => handleEdit(product)} title="Edit">✏️</button>
                  <button className="btn-icon delete" onClick={() => handleDelete(product.id)} title="Delete">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="empty-table">No products found. Add some!</div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
