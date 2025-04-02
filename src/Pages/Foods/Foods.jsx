import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../Components/Sidebar/Sidebar.jsx';
import { useNavigate } from 'react-router-dom';

const Foods = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newFood, setNewFood] = useState({
    name: { en: '', ar: '' },
    image: null,
    price: '',
    description: { en: '', ar: '' },
    stock: '',
    category_id: '',
  });
  const [editingFood, setEditingFood] = useState(null);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      console.log('Fetched Foods:', response.data);
      if (response.data && response.data.data) {
        const formattedFoods = response.data.data.map(food => ({
          id: food.food_id,
          name: { ar: food.food_name || 'غير متوفر', en: food.food_name_en || food.food_name || 'غير متوفر' },
          image_url: food.image_url,
          description: { ar: food.description || 'غير متوفر', en: food.description_en || food.description || 'غير متوفر' },
          price: food.price.replace(' $', ''),
          stock: food.stock,
          category_id: food.category_id || null,
          average_rating: food.average_rating,
        }));
        setFoods(formattedFoods);
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
    if (!token) {
      setError('Please log in first. No token found in localStorage.');
      navigate('/');
      return;
    }

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/admin/categories/show', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      console.log('Fetched Categories:', response.data);
      if (response.data && response.data.data) {
        setCategories(response.data.data);
        setError(null);
      } else {
        setError('Failed to fetch categories: No data returned from the API.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching categories: Server or network issue.');
    }
  };

  const handleAddOrUpdateFood = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please log in first. No token found in localStorage.');
      return;
    }

    const url = editingFood
      ? `http://127.0.0.1:8000/api/admin/foods/update/${editingFood.id}`
      : 'http://127.0.0.1:8000/api/admin/foods/add';
    const method = editingFood ? 'patch' : 'post';

    const formData = new FormData();
    formData.append('name[en]', newFood.name.en);
    formData.append('name[ar]', newFood.name.ar);
    if (newFood.image) formData.append('image', newFood.image);
    formData.append('price', newFood.price);
    formData.append('description[en]', newFood.description.en);
    formData.append('description[ar]', newFood.description.ar);
    formData.append('stock', newFood.stock);
    formData.append('category_id', newFood.category_id || '');

    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    try {
      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Response:', response.data);
      if (response.data.status === 'success') {
        await fetchFoods();
        alert(editingFood ? 'Food updated successfully' : 'Food added successfully');
        setEditingFood(null);
        setNewFood({
          name: { en: '', ar: '' },
          image: null,
          price: '',
          description: { en: '', ar: '' },
          stock: '',
          category_id: '',
        });
        setError(null);
      } else {
        setError(response.data.message || 'Failed to save food: API error.');
      }
    } catch (err) {
      console.error('Error:', err.response?.data);
      setError(err.response?.data?.message || 'Error saving food: Server error.');
    }
  };

  const handleEditFood = (food) => {
    setEditingFood(food);
    setNewFood({
      name: { en: food.name.en || '', ar: food.name.ar || '' },
      image: null,
      price: food.price || '',
      description: { en: food.description.en || '', ar: food.description.ar || '' },
      stock: food.stock || '',
      category_id: food.category_id || '',
    });
  };

  const handleDeleteFood = async (id) => {
    if (!token) {
      setError('Please log in first. No token found in localStorage.');
      return;
    }

    try {
      const response = await axios.delete(`http://127.0.0.1:8000/api/admin/foods/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (response.data.status === 'success') {
        setFoods(foods.filter((food) => food.id !== id));
        alert('Food deleted successfully');
        setError(null);
      } else {
        setError(response.data.message || 'Failed to delete food.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting food: Server error.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 p-4 sm:p-6 lg:p-10 lg:ml-64">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center mb-6 sm:mb-8 text-yellow-300 animate-fade-in-down">
          Foods Management
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-600 text-red-800 rounded-lg text-center max-w-2xl mx-auto">
            {error}
          </div>
        )}

        <div className="mb-8 max-w-3xl mx-auto">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-yellow-300 animate-fade-in text-center sm:text-left">
            {editingFood ? 'Edit Food' : 'Add Food'}
          </h2>
          <form onSubmit={handleAddOrUpdateFood} className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-gray-800 rounded-2xl shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name (Arabic)</label>
                <input
                  type="text"
                  value={newFood.name.ar}
                  onChange={(e) => setNewFood({ ...newFood, name: { ...newFood.name, ar: e.target.value } })}
                  placeholder="اسم الطعام بالعربية"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name (English)</label>
                <input
                  type="text"
                  value={newFood.name.en}
                  onChange={(e) => setNewFood({ ...newFood, name: { ...newFood.name, en: e.target.value } })}
                  placeholder="Food Name in English"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Image</label>
                <input
                  type="file"
                  onChange={(e) => setNewFood({ ...newFood, image: e.target.files[0] })}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  accept="image/*"
                  required={!editingFood}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={newFood.price}
                  onChange={(e) => setNewFood({ ...newFood, price: e.target.value })}
                  placeholder="Price (e.g., 15.00)"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description (Arabic)</label>
                <textarea
                  value={newFood.description.ar}
                  onChange={(e) => setNewFood({ ...newFood, description: { ...newFood.description, ar: e.target.value } })}
                  placeholder="الوصف بالعربية"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description (English)</label>
                <textarea
                  value={newFood.description.en}
                  onChange={(e) => setNewFood({ ...newFood, description: { ...newFood.description, en: e.target.value } })}
                  placeholder="Description in English"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Stock</label>
                <input
                  type="number"
                  value={newFood.stock}
                  onChange={(e) => setNewFood({ ...newFood, stock: e.target.value })}
                  placeholder="Stock (e.g., 20)"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={newFood.category_id}
                  onChange={(e) => setNewFood({ ...newFood, category_id: e.target.value })}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name?.ar || category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 sm:px-5 sm:py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300 focus:ring-4 focus:ring-indigo-400 focus:ring-opacity-50"
              >
                {editingFood ? 'Update Food' : 'Add Food'}
              </button>
              {editingFood && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingFood(null);
                    setNewFood({ name: { en: '', ar: '' }, image: null, price: '', description: { en: '', ar: '' }, stock: '', category_id: '' });
                  }}
                  className="bg-gray-600 text-white px-4 py-2 sm:px-5 sm:py-2 rounded-lg hover:bg-gray-700 transition-all duration-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="overflow-x-auto max-w-full mx-auto">
          <table className="w-full bg-gray-800 rounded-2xl shadow-lg text-sm sm:text-base">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="py-2 px-2 sm:py-3 sm:px-4 text-left font-semibold">ID</th>
                <th className="py-2 px-2 sm:py-3 sm:px-4 text-left font-semibold">Name (EN)</th>
                <th className="py-2 px-2 sm:py-3 sm:px-4 text-left font-semibold">Name (AR)</th>
                <th className="py-2 px-2 sm:py-3 sm:px-4 text-left font-semibold">Image</th>
                <th className="py-2 px-2 sm:py-3 sm:px-4 text-left font-semibold">Price</th>
                <th className="py-2 px-2 sm:py-3 sm:px-4 text-left font-semibold hidden md:table-cell">Description (EN)</th>
                <th className="py-2 px-2 sm:py-3 sm:px-4 text-left font-semibold hidden md:table-cell">Description (AR)</th>
                <th className="py-2 px-2 sm:py-3 sm:px-4 text-left font-semibold">Stock</th>
                <th className="py-2 px-2 sm:py-3 sm:px-4 text-left font-semibold">Category</th>
                <th className="py-2 px-2 sm:py-3 sm:px-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {foods.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-3 px-4 text-center text-gray-400">
                    No foods available
                  </td>
                </tr>
              ) : (
                foods.map((food) => (
                  <tr key={food.id} className="hover:bg-gray-700 transition-all duration-200 border-b border-gray-600">
                    <td className="py-2 px-2 sm:py-3 sm:px-4 text-gray-300">{food.id}</td>
                    <td className="py-2 px-2 sm:py-3 sm:px-4 text-gray-300">{food.name.en}</td>
                    <td className="py-2 px-2 sm:py-3 sm:px-4 text-gray-300">{food.name.ar}</td>
                    <td className="py-2 px-2 sm:py-3 sm:px-4 text-gray-300">
                      {food.image_url ? (
                        <img
                          src={`http://127.0.0.1:8000${food.image_url}`}
                          alt={food.name.en}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                          onError={(e) => (e.target.src = 'https://via.placeholder.com/64')}
                        />
                      ) : (
                        'No Image'
                      )}
                    </td>
                    <td className="py-2 px-2 sm:py-3 sm:px-4 text-gray-300">{food.price}</td>
                    <td className="py-2 px-2 sm:py-3 sm:px-4 text-gray-300 hidden md:table-cell">{food.description.en}</td>
                    <td className="py-2 px-2 sm:py-3 sm:px-4 text-gray-300 hidden md:table-cell">{food.description.ar}</td>
                    <td className="py-2 px-2 sm:py-3 sm:px-4 text-gray-300">{food.stock}</td>
                    <td className="py-2 px-2 sm:py-3 sm:px-4 text-gray-300">
                      {categories.find((cat) => cat.id === food.category_id)?.name?.ar || 'N/A'}
                    </td>
                    <td className="py-2 px-2 sm:py-3 sm:px-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleEditFood(food)}
                        className="bg-indigo-600 text-white px-2 py-1 sm:px-3 sm:py-1 rounded hover:bg-indigo-700 transition-all duration-200 text-xs sm:text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFood(food.id)}
                        className="bg-red-600 text-white px-2 py-1 sm:px-3 sm:py-1 rounded hover:bg-red-700 transition-all duration-200 text-xs sm:text-sm"
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
      </div>
    </div>
  );
};

export default Foods;