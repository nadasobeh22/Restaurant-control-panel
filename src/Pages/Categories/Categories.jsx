import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../Components/Sidebar/Sidebar.jsx';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: { en: '', ar: '' } });
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const fetchCategories = async () => {
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/admin/categories/show', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });

      if (response.data.status === 'success') {
        const formattedCategories = response.data.data.map(category => ({
          ...category,
          name: typeof category.name === 'string' ? { en: category.name, ar: category.name_ar || '' } : category.name,
        }));
        setCategories(formattedCategories);
      } else {
        setError(response.data.message || 'Failed to fetch categories');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server connection error');
      if (err.response?.status === 401) navigate('/');
    }
  };

  const handleAddOrUpdateCategory = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate('/');
      return;
    }

    const url = editingCategory
      ? `http://127.0.0.1:8000/api/admin/categories/update/${editingCategory.id}`
      : 'http://127.0.0.1:8000/api/admin/categories/add';
    const method = editingCategory ? 'patch' : 'post';

    try {
      const response = await axios({
        method,
        url,
        data: newCategory,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      });

      if (response.data.status === 'success') {
        await fetchCategories();
        setEditingCategory(null);
        setNewCategory({ name: { en: '', ar: '' } });
        setError(null);
      } else {
        setError(response.data.message || 'Failed to save category');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server connection error');
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    const nameEn = typeof category.name === 'object' ? category.name.en || '' : category.name || '';
    const nameAr = typeof category.name === 'object' ? category.name.ar || '' : category.name_ar || '';
    setNewCategory({ name: { en: nameEn, ar: nameAr } });
  };

  const handleDeleteCategory = async (id) => {
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const response = await axios.delete(`http://127.0.0.1:8000/api/admin/categories/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });

      if (response.data.status === 'success') {
        setCategories(categories.filter((cat) => cat.id !== id));
        setError(null);
      } else {
        setError(response.data.message || 'Failed to delete category');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server connection error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 p-4 lg:p-6 lg:ml-64">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-yellow-300">Category Management</h1>
          <button
            onClick={handleLogout}
            className="mt-4 sm:mt-0 flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-all duration-200"
          >
            <FaSignOutAlt size={16} />
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-yellow-300">
            {editingCategory ? 'Edit Category' : 'Add Category'}
          </h2>
          <form
            onSubmit={handleAddOrUpdateCategory}
            className="space-y-5 p-6 bg-gray-800 rounded-2xl shadow-lg max-w-lg mx-auto transition-all duration-300"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Name (Arabic)</label>
              <input
                type="text"
                value={newCategory.name.ar}
                onChange={(e) => setNewCategory({ ...newCategory, name: { ...newCategory.name, ar: e.target.value } })}
                placeholder="اسم الفئة بالعربية"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Name (English)</label>
              <input
                type="text"
                value={newCategory.name.en}
                onChange={(e) => setNewCategory({ ...newCategory, name: { ...newCategory.name, en: e.target.value } })}
                placeholder="Category Name in English"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200"
              >
                {editingCategory ? 'Update' : 'Add'}
              </button>
              {editingCategory && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    setNewCategory({ name: { en: '', ar: '' } });
                  }}
                  className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        <div className="overflow-x-auto md:overflow-x-hidden">
          <div className="hidden md:block">
            <table className="min-w-full bg-gray-800 rounded-2xl shadow-lg table-auto">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold min-w-[60px]">ID</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold min-w-[120px]">Name (EN)</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold min-w-[120px]">Name (AR)</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold min-w-[140px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-3 px-4 text-center text-gray-400">No categories available</td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-700 transition-all duration-200">
                      <td className="py-2 px-4 text-gray-300 truncate">{category.id}</td>
                      <td className="py-2 px-4 text-gray-300 truncate">
                        {typeof category.name === 'object' ? category.name.en : category.name}
                      </td>
                      <td className="py-2 px-4 text-gray-300 truncate">
                        {typeof category.name === 'object' ? category.name.ar : category.name_ar || ''}
                      </td>
                      <td className="py-2 px-4 flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="py-1 px-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-all duration-200 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="py-1 px-3 bg-red-600 text-white rounded hover:bg-red-700 transition-all duration-200 text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="block md:hidden space-y-4">
            {categories.length === 0 ? (
              <p className="text-center text-gray-400">No categories available</p>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="p-4 bg-gray-700 rounded-lg shadow-lg">
                  <div className="space-y-2">
                    <p className="text-gray-300 text-sm">
                      <strong>ID:</strong> {category.id}
                    </p>
                    <p className="text-gray-300 text-sm">
                      <strong>Name (EN):</strong> {typeof category.name === 'object' ? category.name.en : category.name}
                    </p>
                    <p className="text-gray-300 text-sm">
                      <strong>Name (AR):</strong> {typeof category.name === 'object' ? category.name.ar : category.name_ar || ''}
                    </p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="flex-1 py-1 px-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-all duration-200 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="flex-1 py-1 px-3 bg-red-600 text-white rounded hover:bg-red-700 transition-all duration-200 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;