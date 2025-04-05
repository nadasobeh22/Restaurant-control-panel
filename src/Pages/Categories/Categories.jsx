import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../Components/Sidebar/Sidebar.jsx';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: { en: '', ar: '' } });
  const [editingCategory, setEditingCategory] = useState(null);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
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
        setGeneralError(null);
      } else {
        setGeneralError(response.data.message || 'Failed to fetch categories');
      }
    } catch (err) {
      setGeneralError(err.response?.data?.message || 'Server connection error');
      if (err.response?.status === 401) navigate('/');
    }
  };

  const handleAddOrUpdateCategory = async (e, isEdit = false) => {
    e.preventDefault();
    if (!token) {
      navigate('/');
      return;
    }

    const url = isEdit
      ? `http://127.0.0.1:8000/api/admin/categories/update/${editingCategory.id}`
      : 'http://127.0.0.1:8000/api/admin/categories/add';
    const method = isEdit ? 'patch' : 'post';

    try {
      const response = await axios({
        method,
        url,
        data: newCategory,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      });

      if (response.data.status === 'success') {
        await fetchCategories();
        setNewCategory({ name: { en: '', ar: '' } });
        setEditingCategory(null);
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setErrors({});
        setGeneralError(null);
      } else {
        setGeneralError(response.data.message || 'Failed to save category');
      }
    } catch (err) {
      const errorResponse = err.response?.data;
      if (errorResponse?.errors) {
        const formattedErrors = {};
        Object.keys(errorResponse.errors).forEach(key => {
          formattedErrors[key] = errorResponse.errors[key][0];
        });
        setErrors(formattedErrors);
      } else {
        setGeneralError(errorResponse?.message || 'Server connection error');
      }
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    const nameEn = typeof category.name === 'object' ? category.name.en || '' : category.name || '';
    const nameAr = typeof category.name === 'object' ? category.name.ar || '' : category.name_ar || '';
    setNewCategory({ name: { en: nameEn, ar: nameAr } });
    setIsEditModalOpen(true);
    setErrors({});
  };

  const handleDeleteCategory = async () => {
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const response = await axios.delete(`http://127.0.0.1:8000/api/admin/categories/delete/${categoryToDelete}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });

      if (response.data.status === 'success') {
        setCategories(categories.filter((cat) => cat.id !== categoryToDelete));
        setGeneralError(null);
        setIsDeleteModalOpen(false);
        setCategoryToDelete(null);
      } else {
        setGeneralError(response.data.message || 'Failed to delete category');
      }
    } catch (err) {
      setGeneralError(err.response?.data?.message || 'Server connection error');
      setIsDeleteModalOpen(false);
    }
  };

  const confirmDeleteCategory = (id) => {
    setCategoryToDelete(id);
    setIsDeleteModalOpen(true);
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

        {generalError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
            {generalError}
          </div>
        )}

        <div className="mb-8">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200"
          >
            Add Category
          </button>
        </div>

        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg max-w-lg w-full">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-yellow-300">Add Category</h2>
              <form onSubmit={handleAddOrUpdateCategory} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name (Arabic)</label>
                  <input
                    type="text"
                    value={newCategory.name.ar}
                    onChange={(e) => setNewCategory({ ...newCategory, name: { ...newCategory.name, ar: e.target.value } })}
                    placeholder="اسم الفئة بالعربية"
                    className={`w-full px-4 py-2 bg-gray-700 border ${errors['name.ar'] ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                  />
                  {errors['name.ar'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['name.ar']}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name (English)</label>
                  <input
                    type="text"
                    value={newCategory.name.en}
                    onChange={(e) => setNewCategory({ ...newCategory, name: { ...newCategory.name, en: e.target.value } })}
                    placeholder="Category Name in English"
                    className={`w-full px-4 py-2 bg-gray-700 border ${errors['name.en'] ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                  />
                  {errors['name.en'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['name.en']}</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setNewCategory({ name: { en: '', ar: '' } });
                      setErrors({});
                    }}
                    className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg max-w-lg w-full">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-yellow-300">Edit Category</h2>
              <form onSubmit={(e) => handleAddOrUpdateCategory(e, true)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name (Arabic)</label>
                  <input
                    type="text"
                    value={newCategory.name.ar}
                    onChange={(e) => setNewCategory({ ...newCategory, name: { ...newCategory.name, ar: e.target.value } })}
                    placeholder="اسم الفئة بالعربية"
                    className={`w-full px-4 py-2 bg-gray-700 border ${errors['name.ar'] ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                  />
                  {errors['name.ar'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['name.ar']}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name (English)</label>
                  <input
                    type="text"
                    value={newCategory.name.en}
                    onChange={(e) => setNewCategory({ ...newCategory, name: { ...newCategory.name, en: e.target.value } })}
                    placeholder="Category Name in English"
                    className={`w-full px-4 py-2 bg-gray-700 border ${errors['name.en'] ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                  />
                  {errors['name.en'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['name.en']}</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setNewCategory({ name: { en: '', ar: '' } });
                      setEditingCategory(null);
                      setErrors({});
                    }}
                    className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg max-w-sm w-full">
              <h2 className="text-lg font-semibold mb-4 text-yellow-300">Confirm Deletion</h2>
              <p className="text-gray-300 mb-4">Are you sure you want to delete this category?</p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCategory}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setCategoryToDelete(null);
                  }}
                  className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto md:overflow-x-hidden">
          <div className="hidden md:block">
            <table className="min-w-full bg-gray-800 rounded-2xl shadow-lg table-auto">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold min-w-[60px]">ID</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold min-w-[120px]">Name</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold min-w-[140px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-3 px-4 text-center text-gray-400">No categories available</td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-700 transition-all duration-200">
                      <td className="py-2 px-4 text-gray-300 truncate">{category.id}</td>
                      <td className="py-2 px-4 text-gray-300 truncate">
                        {typeof category.name === 'object' ? category.name.en : category.name}
                      </td>
                      <td className="py-2 px-4 flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="py-1 px-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-all duration-200 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDeleteCategory(category.id)}
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
                      <strong>Name:</strong> {typeof category.name === 'object' ? category.name.en : category.name}
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
                      onClick={() => confirmDeleteCategory(category.id)}
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