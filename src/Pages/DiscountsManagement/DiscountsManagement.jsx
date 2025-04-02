import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../Components/Sidebar/Sidebar.jsx';
import DiscountTable from '../../Components/DiscountTable/DiscountTable.jsx';

const DiscountsManagement = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [generalDiscounts, setGeneralDiscounts] = useState([]);
  const [codeDiscounts, setCodeDiscounts] = useState([]);
  const [foods, setFoods] = useState([]);
  const [newDiscount, setNewDiscount] = useState({
    name: { en: '', ar: '' },
    value: '',
    start_date: '',
    end_date: '',
    code: '',
    is_active: true,
  });
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [selectedDiscountFoods, setSelectedDiscountFoods] = useState([]);
  const [attachFoods, setAttachFoods] = useState([]);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [currentDiscountId, setCurrentDiscountId] = useState(null);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const token = localStorage.getItem('token');
  const language = 'en';

  useEffect(() => {
    if (token) {
      axios
        .get('http://127.0.0.1:8000/api/admin/discountsGeneral/show', {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        })
        .then((response) => setGeneralDiscounts(response.data.data || []))
        .catch((error) => setError('Error fetching general discounts: ' + error.message));

      axios
        .get('http://127.0.0.1:8000/api/admin/discountsCode/show', {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        })
        .then((response) => setCodeDiscounts(response.data.data || []))
        .catch((error) => setError('Error fetching code discounts: ' + error.message));
    } else {
      setError('Please log in first');
    }
  }, [token]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleAddOrUpdateDiscount = (e) => {
    e.preventDefault();
    if (token) {
      const url = editingDiscount
        ? activeTab === 'general'
          ? `http://127.0.0.1:8000/api/admin/discountsGeneral/update/${editingDiscount.id}`
          : `http://127.0.0.1:8000/api/admin/discountsCode/update/${editingDiscount.id}`
        : activeTab === 'general'
        ? 'http://127.0.0.1:8000/api/admin/discountsGeneral/add'
        : 'http://127.0.0.1:8000/api/admin/discountsCode/add';
      const method = editingDiscount ? 'patch' : 'post';

      const discountData = {
        ...newDiscount,
        name: { en: newDiscount.name.en, ar: newDiscount.name.ar },
      };

      axios({
        method,
        url,
        data: discountData,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      })
        .then((response) => {
          if (response.data.status === 'success') {
            if (activeTab === 'general') {
              axios
                .get('http://127.0.0.1:8000/api/admin/discountsGeneral/show', {
                  headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
                })
                .then((res) => setGeneralDiscounts(res.data.data || []));
            } else {
              axios
                .get('http://127.0.0.1:8000/api/admin/discountsCode/show', {
                  headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
                })
                .then((res) => setCodeDiscounts(res.data.data || []));
            }
            alert(editingDiscount ? 'Discount updated successfully' : 'Discount added successfully');
            setEditingDiscount(null);
            setNewDiscount({ name: { en: '', ar: '' }, value: '', start_date: '', end_date: '', code: '', is_active: true });
            setError(null);
          } else {
            setError('Failed to save discount: ' + response.data.message);
          }
        })
        .catch((error) => setError('Error saving discount: ' + error.message));
    } else {
      setError('Please log in first');
    }
  };

  const handleEditDiscount = (discount) => {
    setEditingDiscount(discount);
    setNewDiscount({
      name: { en: discount.name?.en || '', ar: discount.name?.ar || '' },
      value: discount.value.replace(' %', ''),
      start_date: discount.start_date,
      end_date: discount.end_date,
      code: discount.code || '',
      is_active: discount.is_active,
    });
  };

  const deleteDiscount = (id) => {
    if (token) {
      const url =
        activeTab === 'general'
          ? `http://127.0.0.1:8000/api/admin/discountsGeneral/delete/${id}`
          : `http://127.0.0.1:8000/api/admin/discountsCode/delete/${id}`;
      axios
        .delete(url, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        })
        .then((response) => {
          if (response.data.status === 'success') {
            if (activeTab === 'general') {
              setGeneralDiscounts(generalDiscounts.filter((d) => d.id !== id));
            } else {
              setCodeDiscounts(codeDiscounts.filter((d) => d.id !== id));
            }
            alert('Discount deleted successfully');
            setError(null);
          } else {
            setError('Failed to delete discount: ' + response.data.message);
          }
        })
        .catch((error) => setError('Error deleting discount: ' + error.message));
    } else {
      setError('Please log in first');
    }
  };

  const viewDiscountFoods = (id) => {
    if (token) {
      const url =
        activeTab === 'general'
          ? `http://127.0.0.1:8000/api/admin/discountsGeneral/${id}/foods`
          : `http://127.0.0.1:8000/api/admin/discountsCode/${id}/foods`;
      axios
        .get(url, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        })
        .then((response) => {
          if (response.data.status === 'success') {
            setSelectedDiscountFoods(response.data.data || []);
          } else {
            setError('Failed to fetch discount foods: ' + response.data.message);
          }
        })
        .catch((error) => setError('Error fetching discount foods: ' + error.message));
    } else {
      setError('Please log in first');
    }
  };

  const handleOpenAttachModal = (id) => {
    setCurrentDiscountId(id);
    viewDiscountFoods(id);
    setShowAttachModal(true);
  };

  const handleAttachFoods = () => {
    if (token && currentDiscountId) {
      const url =
        activeTab === 'general'
          ? `http://127.0.0.1:8000/api/admin/discountsGeneral/${currentDiscountId}/attach-food`
          : `http://127.0.0.1:8000/api/admin/discountsCode/${currentDiscountId}/attach-food`;
      axios
        .post(
          url,
          { food_ids: attachFoods },
          {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
          }
        )
        .then((response) => {
          if (response.data.status === 'success') {
            alert('Foods attached successfully');
            viewDiscountFoods(currentDiscountId);
            setAttachFoods([]);
          } else {
            setError('Failed to attach foods: ' + response.data.message);
          }
        })
        .catch((error) => setError('Error attaching foods: ' + error.message));
    } else {
      setError('Please log in first');
    }
  };

  const handleDetachFood = (foodId) => {
    if (token && currentDiscountId) {
      const url =
        activeTab === 'general'
          ? `http://127.0.0.1:8000/api/admin/discountsGeneral/${currentDiscountId}/detach-food`
          : `http://127.0.0.1:8000/api/admin/discountsCode/${currentDiscountId}/detach-food`;
      axios
        .post(
          url,
          { food_id: foodId },
          {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
          }
        )
        .then((response) => {
          if (response.data.status === 'success') {
            alert('Food detached successfully');
            viewDiscountFoods(currentDiscountId);
          } else {
            setError('Failed to detach food: ' + response.data.message);
          }
        })
        .catch((error) => setError('Error detaching food: ' + error.message));
    } else {
      setError('Please log in first');
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 p-2 sm:p-4 md:p-6 lg:ml-64">
        <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-center mb-2 sm:mb-4 text-yellow-300">
          Discounts Management
        </h1>
        {error && (
          <div className="mb-2 sm:mb-4 p-2 bg-red-100 border-l-4 border-red-600 text-red-800 rounded-lg text-center text-xs sm:text-sm">
            {error}
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-center mb-2 sm:mb-4 gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg font-medium transition-colors duration-200 text-xs sm:text-sm ${
              activeTab === 'general' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            General Discounts
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg font-medium transition-colors duration-200 text-xs sm:text-sm ${
              activeTab === 'code' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Code Discounts
          </button>
        </div>
        <div className="mb-4 sm:mb-6">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold mb-2 text-yellow-300 text-center">
            {editingDiscount ? 'Edit Discount' : 'Add Discount'}
          </h2>
          <form
            onSubmit={handleAddOrUpdateDiscount}
            className="space-y-2 p-2 sm:p-4 bg-gray-800 rounded-2xl shadow-lg w-full max-w-[90%] sm:max-w-xs md:max-w-sm lg:max-w-md mx-auto"
          >
            <div>
              <label className="block text-gray-300 font-medium text-xs mb-1">Name (English)</label>
              <input
                type="text"
                value={newDiscount.name.en}
                onChange={(e) => setNewDiscount({ ...newDiscount, name: { ...newDiscount.name, en: e.target.value } })}
                placeholder="Discount Name in English"
                className="w-full p-1 sm:p-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 font-medium text-xs mb-1">Name (Arabic)</label>
              <input
                type="text"
                value={newDiscount.name.ar}
                onChange={(e) => setNewDiscount({ ...newDiscount, name: { ...newDiscount.name, ar: e.target.value } })}
                placeholder="اسم الخصم بالعربية"
                className="w-full p-1 sm:p-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 font-medium text-xs mb-1">Value (%)</label>
              <input
                type="number"
                value={newDiscount.value}
                onChange={(e) => setNewDiscount({ ...newDiscount, value: e.target.value })}
                placeholder="Discount Value"
                className="w-full p-1 sm:p-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 font-medium text-xs mb-1">Start Date</label>
              <input
                type="date"
                value={newDiscount.start_date}
                onChange={(e) => setNewDiscount({ ...newDiscount, start_date: e.target.value })}
                className="w-full p-1 sm:p-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 font-medium text-xs mb-1">End Date</label>
              <input
                type="date"
                value={newDiscount.end_date}
                onChange={(e) => setNewDiscount({ ...newDiscount, end_date: e.target.value })}
                className="w-full p-1 sm:p-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                required
              />
            </div>
            {activeTab === 'code' && (
              <div>
                <label className="block text-gray-300 font-medium text-xs mb-1">Code</label>
                <input
                  type="text"
                  value={newDiscount.code}
                  onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value })}
                  placeholder="Discount Code"
                  className="w-full p-1 sm:p-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                  required
              />
            </div>
            )}
            <div>
              <label className="block text-gray-300 font-medium text-xs mb-1">Status</label>
              <select
                value={newDiscount.is_active}
                onChange={(e) => setNewDiscount({ ...newDiscount, is_active: e.target.value === 'true' })}
                className="w-full p-1 sm:p-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
              >
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-xs sm:text-sm"
              >
                {editingDiscount ? 'Update Discount' : 'Add Discount'}
              </button>
              {editingDiscount && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingDiscount(null);
                    setNewDiscount({ name: { en: '', ar: '' }, value: '', start_date: '', end_date: '', code: '', is_active: true });
                  }}
                  className="w-full bg-gray-600 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-xs sm:text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        {activeTab === 'general' && (
          <div>
            <h2 className="text-sm sm:text-base md:text-lg font-semibold mb-2 text-yellow-300">
              General Discounts
            </h2>
            <DiscountTable
              type="general"
              data={generalDiscounts}
              onDelete={deleteDiscount}
              onEdit={handleEditDiscount}
              onViewFoods={handleOpenAttachModal}
              language={language}
            />
          </div>
        )}
        {activeTab === 'code' && (
          <div>
            <h2 className="text-sm sm:text-base md:text-lg font-semibold mb-2 text-yellow-300">
              Code Discounts
            </h2>
            <DiscountTable
              type="code"
              data={codeDiscounts}
              onDelete={deleteDiscount}
              onEdit={handleEditDiscount}
              onViewFoods={handleOpenAttachModal}
              language={language}
            />
          </div>
        )}
        {showAttachModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-gray-800 p-2 sm:p-4 rounded-2xl shadow-lg w-full max-w-[90%] sm:max-w-xs md:max-w-sm lg:max-w-md max-h-[80vh] overflow-y-auto">
              <h2 className="text-sm sm:text-base md:text-lg font-bold mb-2 text-yellow-300">
                Manage Associated Foods
              </h2>
              <div className="mb-2 sm:mb-3">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-300">Currently Attached Foods:</h3>
                {selectedDiscountFoods && selectedDiscountFoods.length > 0 ? (
                  <ul className="list-disc pl-4 text-gray-400 text-xs sm:text-sm">
                    {selectedDiscountFoods.map((food) => (
                      <li key={food.food_id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-1">
                        <span>{food.food_name} - Price: {food.price}</span>
                        <button
                          onClick={() => handleDetachFood(food.food_id)}
                          className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors duration-200 text-xs mt-1 sm:mt-0"
                        >
                          Detach
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-xs sm:text-sm">No foods attached.</p>
                )}
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-300">Attach New Foods:</h3>
                <select
                  multiple
                  value={attachFoods}
                  onChange={(e) => setAttachFoods(Array.from(e.target.selectedOptions, (option) => option.value))}
                  className="w-full p-1 sm:p-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 sm:h-24 text-xs sm:text-sm"
                >
                  {foods.map((food) => (
                    <option key={food.id} value={food.id}>
                      {food.name} - Price: {food.price}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAttachFoods}
                  className="mt-2 w-full bg-indigo-600 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-xs sm:text-sm"
                >
                  Attach Selected Foods
                </button>
              </div>
              <button
                onClick={() => setShowAttachModal(false)}
                className="mt-2 w-full bg-gray-600 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-xs sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountsManagement;