import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../Components/Sidebar/Sidebar.jsx';
import { useNavigate } from 'react-router-dom';

const Foods = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newFood, setNewFood] = useState({
    category_id: '',
    name: { en: '', ar: '' },
    image: null,
    price: '',
    description: { en: '', ar: '' },
    stock: ''
  });
  const [editingFood, setEditingFood] = useState(null);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchFoods();
    fetchCategories();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const fetchFoods = async () => {
    if (!token) {
      setError('Please log in first. No token found in localStorage.');
      navigate('/');
      return;
    }

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/admin/foods/show', {
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });
      
      if (response.data && response.data.data) {
        setFoods(response.data.data);
        setError(null);
      } else {
        setError('Failed to fetch foods: No data returned from the API.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching foods: Server or network issue.');
      if (err.response?.status === 401) navigate('/');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/admin/categories/show', {
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });
      if (response.data && response.data.data) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleAddFood = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please log in first. No token found in localStorage.');
      return;
    }

    const formData = new FormData();
    formData.append('category_id', newFood.category_id);
    formData.append('name[en]', newFood.name.en);
    formData.append('name[ar]', newFood.name.ar);
    if (newFood.image) formData.append('image', newFood.image);
    formData.append('price', newFood.price);
    formData.append('description[en]', newFood.description.en);
    formData.append('description[ar]', newFood.description.ar);
    formData.append('stock', newFood.stock);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/admin/foods/add', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json'
        }
      });

      if (response.data.status === 'success') {
        await fetchFoods();
        resetForm();
        setIsAddModalOpen(false);
      } else {
        setError(response.data.message || 'Failed to add food.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding food.');
    }
  };

  const handleUpdateFood = async (e) => {
    e.preventDefault();
    if (!token || !editingFood) return;

    try {
      const response = await axios.patch(
        `http://127.0.0.1:8000/api/admin/foods/update/${editingFood.food_id}`,
        {
          category_id: newFood.category_id,
          name: {
            en: newFood.name.en,
            ar: newFood.name.ar
          },
          price: newFood.price,
          description: {
            en: newFood.description.en,
            ar: newFood.description.ar
          },
          stock: newFood.stock
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        await fetchFoods();
        resetForm();
        setIsEditModalOpen(false);
      } else {
        setError(response.data.message || 'Failed to update food.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating food.');
    }
  };

  const handleDeleteFood = async () => {
    if (!token || !foodToDelete) return;

    try {
      const response = await axios.delete(
        `http://127.0.0.1:8000/api/admin/foods/delete/${foodToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        await fetchFoods();
        setIsDeleteModalOpen(false);
        setFoodToDelete(null);
      } else {
        setError(response.data.message || 'Failed to delete food.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting food.');
    }
  };

  const resetForm = () => {
    setNewFood({
      category_id: '',
      name: { en: '', ar: '' },
      image: null,
      price: '',
      description: { en: '', ar: '' },
      stock: ''
    });
    setError(null);
  };

  const handleEditFood = (food) => {
    setEditingFood(food);
    setNewFood({
      category_id: food.category_id || '',
      name: { 
        en: food.food_name_en || food.food_name || '', 
        ar: food.food_name_ar || food.food_name || '' 
      },
      image: null,
      price: food.price ? food.price.replace(' $', '') : '',
      description: { 
        en: food.description_en || food.description || '', 
        ar: food.description_ar || food.description || '' 
      },
      stock: food.stock || ''
    });
    setIsEditModalOpen(true);
  };

  const confirmDeleteFood = (id) => {
    setFoodToDelete(id);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 p-2 sm:p-4 lg:p-8 w-full lg:ml-64 transition-all duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-3 sm:mb-6 gap-2 sm:gap-4">
          <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-yellow-300 text-center">
            Foods Management
          </h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="py-1 px-2 sm:py-2 sm:px-4 lg:px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-md text-xs sm:text-sm lg:text-base"
          >
            Add Food
          </button>
        </div>

        {error && (
          <div className="mb-3 sm:mb-6 p-2 sm:p-4 bg-red-900/80 border-l-4 border-red-600 text-red-100 rounded-lg text-center max-w-md sm:max-w-2xl mx-auto text-xs sm:text-sm lg:text-base">
            {error}
          </div>
        )}

        {/* Add Food Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-gray-800 p-3 sm:p-5 lg:p-6 rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-2xl lg:max-w-3xl max-h-[85vh] overflow-y-auto">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 text-yellow-300">Add Food</h2>
              <form onSubmit={handleAddFood} className="space-y-3 sm:space-y-4 lg:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                  <div className="space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-300">Category</label>
                    <select
                      value={newFood.category_id}
                      onChange={(e) => setNewFood({...newFood, category_id: e.target.value})}
                      className="w-full px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm lg:text-base"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name?.ar || category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-300">Name (English)</label>
                    <input
                      type="text"
                      value={newFood.name.en}
                      onChange={(e) => setNewFood({...newFood, name: {...newFood.name, en: e.target.value}})}
                      className="w-full px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm lg:text-base"
                      required
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-300">Name (Arabic)</label>
                    <input
                      type="text"
                      value={newFood.name.ar}
                      onChange={(e) => setNewFood({...newFood, name: {...newFood.name, ar: e.target.value}})}
                      className="w-full px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm lg:text-base"
                      required
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-300">Image</label>
                    <input
                      type="file"
                      onChange={(e) => setNewFood({...newFood, image: e.target.files[0]})}
                      className="w-full px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-600 bg-gray-700 text-white rounded-lg file:mr-1 sm:file:mr-2 file:py-0.5 sm:file:py-1 file:px-1 sm:file:px-2 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 text-xs sm:text-sm"
                      accept="image/*"
                      required
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-300">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newFood.price}
                      onChange={(e) => setNewFood({...newFood, price: e.target.value})}
                      className="w-full px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm lg:text-base"
                      required
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-300">Stock</label>
                    <input
                      type="number"
                      value={newFood.stock}
                      onChange={(e) => setNewFood({...newFood, stock: e.target.value})}
                      className="w-full px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm lg:text-base"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-300">Description (English)</label>
                    <textarea
                      value={newFood.description.en}
                      onChange={(e) => setNewFood({...newFood, description: {...newFood.description, en: e.target.value}})}
                      className="w-full px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm lg:text-base"
                      rows="2 sm:rows-3 lg:rows-4"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-300">Description (Arabic)</label>
                    <textarea
                      value={newFood.description.ar}
                      onChange={(e) => setNewFood({...newFood, description: {...newFood.description, ar: e.target.value}})}
                      className="w-full px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm lg:text-base"
                      rows="2 sm:rows-3 lg:rows-4"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 sm:gap-3 lg:gap-4 mt-3 sm:mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      resetForm();
                    }}
                    className="px-2 sm:px-4 lg:px-6 py-1 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 text-xs sm:text-sm lg:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-2 sm:px-4 lg:px-6 py-1 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 text-xs sm:text-sm lg:text-base"
                  >
                    Add Food
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Food Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-gray-800 p-3 sm:p-5 lg:p-6 rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-2xl lg:max-w-3xl max-h-[85vh] overflow-y-auto">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 text-yellow-300">Edit Food</h2>
              <form onSubmit={handleUpdateFood} className="space-y-3 sm:space-y-4 lg:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                  <div className="space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-300">Category</label>
                    <select
                      value={newFood.category_id}
                      onChange={(e) => setNewFood({...newFood, category_id: e.target.value})}
                      className="w-full px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm lg:text-base"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name?.ar || category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-300">Name (English)</label>
                    <input
                      type="text"
                      value={newFood.name.en}
                      onChange={(e) => setNewFood({...newFood, name: {...newFood.name, en: e.target.value}})}
                      className="w-full px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm lg:text-base"
                      required
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-300">Name (Arabic)</label>
                    <input
                      type="text"
                      value={newFood.name.ar}
                      onChange={(e) => setNewFood({...newFood, name: {...newFood.name, ar: e.target.value}})}
                      className="w-full px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm lg:text-base"
                      required
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-300">New Image (Optional)</label>
                    <input
                      type="file"
                      onChange={(e) => setNewFood({...newFood, image: e.target.files[0]})}
                      className="w-full px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-600 bg-gray-700 text-white rounded-lg file:mr-1 sm:file:mr-2 file:py-0.5 sm:file:py-1 file:px-1 sm:file:px-2 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 text-xs sm:text-sm"
                      accept="image/*"
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-300">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newFood.price}
                      onChange={(e) => setNewFood({...newFood, price: e.target.value})}
                      className="w-full px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm lg:text-base"
                      required
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-300">Stock</label>
                    <input
                      type="number"
                      value={newFood.stock}
                      onChange={(e) => setNewFood({...newFood, stock: e.target.value})}
                      className="w-full px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm lg:text-base"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-300">Description (English)</label>
                    <textarea
                      value={newFood.description.en}
                      onChange={(e) => setNewFood({...newFood, description: {...newFood.description, en: e.target.value}})}
                      className="w-full px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm lg:text-base"
                      rows="2 sm:rows-3 lg:rows-4"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-300">Description (Arabic)</label>
                    <textarea
                      value={newFood.description.ar}
                      onChange={(e) => setNewFood({...newFood, description: {...newFood.description, ar: e.target.value}})}
                      className="w-full px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm lg:text-base"
                      rows="2 sm:rows-3 lg:rows-4"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 sm:gap-3 lg:gap-4 mt-3 sm:mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      resetForm();
                    }}
                    className="px-2 sm:px-4 lg:px-6 py-1 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 text-xs sm:text-sm lg:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-2 sm:px-4 lg:px-6 py-1 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 text-xs sm:text-sm lg:text-base"
                  >
                    Update Food
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-gray-800 p-3 sm:p-5 lg:p-6 rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-sm">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 text-yellow-300">Confirm Deletion</h2>
              <p className="text-gray-300 mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base">Are you sure you want to delete this food?</p>
              <div className="flex gap-2 sm:gap-3 lg:gap-4">
                <button
                  onClick={handleDeleteFood}
                  className="flex-1 py-1 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 text-xs sm:text-sm lg:text-base"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-1 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 text-xs sm:text-sm lg:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Foods Table */}
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="w-full bg-gray-800 text-xs sm:text-sm lg:text-base">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-1 sm:px-3 lg:px-4 py-1 sm:py-2 lg:py-3 text-left font-semibold">ID</th>
                <th className="px-1 sm:px-3 lg:px-4 py-1 sm:py-2 lg:py-3 text-left font-semibold">Image</th>
                <th className="px-1 sm:px-3 lg:px-4 py-1 sm:py-2 lg:py-3 text-left font-semibold">Name</th>
                <th className="px-1 sm:px-3 lg:px-4 py-1 sm:py-2 lg:py-3 text-left font-semibold">Price</th>
                <th className="px-1 sm:px-3 lg:px-4 py-1 sm:py-2 lg:py-3 text-left font-semibold">Stock</th>
                <th className="px-1 sm:px-3 lg:px-4 py-1 sm:py-2 lg:py-3 text-left font-semibold">Description</th>
                <th className="px-1 sm:px-3 lg:px-4 py-1 sm:py-2 lg:py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {foods.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-1 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-center text-gray-400">
                    No foods available
                  </td>
                </tr>
              ) : (
                foods.map(food => (
                  <tr key={food.food_id} className="border-t border-gray-700 hover:bg-gray-700 transition-all duration-150">
                    <td className="px-1 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4">{food.food_id}</td>
                    <td className="px-1 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4">
                      <img 
                        src={`http://127.0.0.1:8000${food.image_url}`} 
                        alt={food.food_name}
                        className="w-8 sm:w-12 lg:w-16 h-8 sm:h-12 lg:h-16 object-cover rounded-lg shadow"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                      />
                    </td>
                    <td className="px-1 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 max-w-[80px] sm:max-w-[150px] lg:max-w-[200px] truncate">{food.food_name}</td>
                    <td className="px-1 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4">{food.price}</td>
                    <td className="px-1 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4">{food.stock}</td>
                    <td className="px-1 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 max-w-[100px] sm:max-w-[200px] lg:max-w-[300px] truncate">{food.description}</td>
                    <td className="px-1 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 lg:gap-3">
                        <button
                          onClick={() => handleEditFood(food)}
                          className="px-1 sm:px-2 lg:px-3 py-0.5 sm:py-1 lg:py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDeleteFood(food.food_id)}
                          className="px-1 sm:px-2 lg:px-3 py-0.5 sm:py-1 lg:py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Foods;