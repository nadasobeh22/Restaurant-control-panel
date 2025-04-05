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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState(null);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [currentDiscountId, setCurrentDiscountId] = useState(null);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const token = localStorage.getItem('token');
  const API_BASE_URL = 'http://127.0.0.1:8000/api/admin';

  useEffect(() => {
    if (!token) {
      setError('Please log in first');
      return;
    }
    fetchDiscounts();
    fetchFoods();
  }, [token, activeTab]);

  const fetchDiscounts = async () => {
    try {
      const generalResponse = await axios.get(`${API_BASE_URL}/discountsGeneral/show`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formattedGeneral = generalResponse.data.data.map(discount => ({
        ...discount,
        name: discount.discount_name || discount.name || '',
        id: discount.discount_id || discount.id,
      }));
      setGeneralDiscounts(formattedGeneral || []);

      const codeResponse = await axios.get(`${API_BASE_URL}/discountsCode/show`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formattedCode = codeResponse.data.data.map(discount => ({
        ...discount,
        name: discount.discount_name || discount.name || '',
        id: discount.discount_id || discount.id,
      }));
      setCodeDiscounts(formattedCode || []);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch discounts');
    }
  };

  const fetchFoods = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/foods/show`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFoods(response.data.data || []);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch foods');
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleAddDiscount = async (e) => {
    e.preventDefault();
    if (!token) return;

    const isGeneral = activeTab === 'general';
    const url = `${API_BASE_URL}/discounts${isGeneral ? 'General' : 'Code'}/store`;
    const discountData = isGeneral
      ? {
          name: { en: newDiscount.name.en, ar: newDiscount.name.ar },
          value: parseFloat(newDiscount.value),
          start_date: newDiscount.start_date,
          end_date: newDiscount.end_date,
          is_active: newDiscount.is_active,
        }
      : {
          name: newDiscount.name.en,
          code: newDiscount.code,
          value: parseFloat(newDiscount.value),
          start_date: newDiscount.start_date,
          end_date: newDiscount.end_date,
          is_active: newDiscount.is_active,
        };

    try {
      const response = await axios.post(url, discountData, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
      if (response.data.status === 'success') {
        fetchDiscounts();
        resetForm();
        setIsAddModalOpen(false);
        alert('Discount added successfully');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add discount');
    }
  };

  const handleUpdateDiscount = async (e) => {
    e.preventDefault();
    if (!token || !editingDiscount) return;

    const isGeneral = activeTab === 'general';
    const url = `${API_BASE_URL}/discounts${isGeneral ? 'General' : 'Code'}/update/${editingDiscount.id}`;
    const discountData = isGeneral
      ? {
          name: { en: newDiscount.name.en, ar: newDiscount.name.ar },
          value: parseFloat(newDiscount.value),
          start_date: newDiscount.start_date,
          end_date: newDiscount.end_date,
          is_active: newDiscount.is_active,
        }
      : {
          name: newDiscount.name.en,
          code: newDiscount.code,
          value: parseFloat(newDiscount.value),
          start_date: newDiscount.start_date,
          end_date: newDiscount.end_date,
          is_active: newDiscount.is_active,
        };

    try {
      const response = await axios.patch(url, discountData, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
      if (response.data.status === 'success') {
        fetchDiscounts();
        resetForm();
        setIsEditModalOpen(false);
        alert('Discount updated successfully');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update discount');
    }
  };

  const handleDeleteDiscount = async () => {
    if (!token || !discountToDelete) return;

    const isGeneral = activeTab === 'general';
    const url = `${API_BASE_URL}/discounts${isGeneral ? 'General' : 'Code'}/delete/${discountToDelete}`;

    try {
      const response = await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status === 'success') {
        fetchDiscounts();
        setIsDeleteModalOpen(false);
        setDiscountToDelete(null);
        alert('Discount deleted successfully');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete discount');
    }
  };

  const resetForm = () => {
    setNewDiscount({
      name: { en: '', ar: '' },
      value: '',
      start_date: '',
      end_date: '',
      code: '',
      is_active: true,
    });
    setEditingDiscount(null);
    setError(null);
  };

  const handleEditDiscount = (discount) => {
    setEditingDiscount(discount);
    setNewDiscount({
      name: {
        en: discount.name?.en || discount.discount_name || discount.name || '',
        ar: discount.name?.ar || discount.discount_name || '',
      },
      value: discount.value ? parseFloat(discount.value.replace('%', '').trim()) : '',
      start_date: discount.start_date || '',
      end_date: discount.end_date || '',
      code: discount.code || '',
      is_active: discount.is_active === 1 || discount.is_active === true,
    });
    setIsEditModalOpen(true);
  };

  const confirmDeleteDiscount = (id) => {
    setDiscountToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const viewDiscountFoods = async (id) => {
    if (!token) return;

    const isGeneral = activeTab === 'general';
    const url = `${API_BASE_URL}/discounts${isGeneral ? 'General' : 'Code'}/${id}/foods`; // Corrected route

    try {
      const response = await axios.get(url, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (response.data.status === 'success') {
        setSelectedDiscountFoods(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to retrieve discount foods');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch discount foods');
    }
  };

  const handleOpenAttachModal = (id) => {
    setCurrentDiscountId(id);
    viewDiscountFoods(id);
    setIsAttachModalOpen(true);
  };

  const handleAttachFoods = async () => {
    if (!token || !currentDiscountId) return;

    const isGeneral = activeTab === 'general';
    const url = `${API_BASE_URL}/discounts${isGeneral ? 'General' : 'Code'}/${currentDiscountId}/attach-foods`;

    try {
      const response = await axios.post(
        url,
        { food_ids: attachFoods.map(id => parseInt(id)) },
        { 
          headers: { 
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          } 
        }
      );
      if (response.data.status === 'success') {
        alert('Foods attached successfully');
        viewDiscountFoods(currentDiscountId);
        setAttachFoods([]);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to attach foods');
    }
  };

  const handleDetachFood = async (foodId) => {
    if (!token || !currentDiscountId) return;

    const isGeneral = activeTab === 'general';
    const url = `${API_BASE_URL}/discounts${isGeneral ? 'General' : 'Code'}/${currentDiscountId}/detach-food`;

    try {
      const response = await axios.delete(
        url,
        { 
          headers: { 
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          data: { food_ids: [parseInt(foodId)] }
        }
      );
      if (response.data.status === 'success') {
        alert('Food detached successfully');
        viewDiscountFoods(currentDiscountId);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to detach food');
    }
  };

  const discounts = activeTab === 'general' ? generalDiscounts : codeDiscounts;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 p-2 sm:p-4 md:p-6 lg:ml-64">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6">
          <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-yellow-300">
            Discounts Management
          </h1>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <button
              onClick={() => { setActiveTab('general'); resetForm(); }}
              className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-[10px] sm:text-xs md:text-sm ${activeTab === 'general' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              General Discounts
            </button>
            <button
              onClick={() => { setActiveTab('code'); resetForm(); }}
              className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-[10px] sm:text-xs md:text-sm ${activeTab === 'code' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              Code Discounts
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-2 sm:px-3 py-1 sm:py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 text-[10px] sm:text-xs md:text-sm"
            >
              Add Discount
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 border-l-4 border-red-600 text-red-800 rounded-lg text-[10px] sm:text-xs md:text-sm">
            {error}
          </div>
        )}

        <DiscountTable
          type={activeTab}
          data={discounts}
          onEdit={handleEditDiscount}
          onDelete={confirmDeleteDiscount}
          onViewFoods={handleOpenAttachModal}
        />

        {/* Add Discount Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-gray-800 p-3 sm:p-4 rounded-2xl shadow-lg w-full max-w-[90%] sm:max-w-md md:max-w-lg max-h-[80vh] overflow-y-auto">
              <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-yellow-300">Add Discount</h2>
              <form onSubmit={handleAddDiscount} className="space-y-2 sm:space-y-3">
                <div>
                  <label className="block text-gray-300 text-[10px] sm:text-xs md:text-sm mb-1">Name (English)</label>
                  <input
                    type="text"
                    value={newDiscount.name.en}
                    onChange={(e) => setNewDiscount({ ...newDiscount, name: { ...newDiscount.name, en: e.target.value } })}
                    className="w-full p-1 sm:p-2 border border-gray-600 bg-gray-700 rounded-lg text-[10px] sm:text-xs md:text-sm"
                    required
                  />
                </div>
                {activeTab === 'general' && (
                  <div>
                    <label className="block text-gray-300 text-[10px] sm:text-xs md:text-sm mb-1">Name (Arabic)</label>
                    <input
                      type="text"
                      value={newDiscount.name.ar}
                      onChange={(e) => setNewDiscount({ ...newDiscount, name: { ...newDiscount.name, ar: e.target.value } })}
                      className="w-full p-1 sm:p-2 border border-gray-600 bg-gray-700 rounded-lg text-[10px] sm:text-xs md:text-sm"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-gray-300 text-[10px] sm:text-xs md:text-sm mb-1">Value (%)</label>
                  <input
                    type="number"
                    value={newDiscount.value}
                    onChange={(e) => setNewDiscount({ ...newDiscount, value: e.target.value })}
                    className="w-full p-1 sm:p-2 border border-gray-600 bg-gray-700 rounded-lg text-[10px] sm:text-xs md:text-sm"
                    required
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-[10px] sm:text-xs md:text-sm mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newDiscount.start_date}
                    onChange={(e) => setNewDiscount({ ...newDiscount, start_date: e.target.value })}
                    className="w-full p-1 sm:p-2 border border-gray-600 bg-gray-700 rounded-lg text-[10px] sm:text-xs md:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-[10px] sm:text-xs md:text-sm mb-1">End Date</label>
                  <input
                    type="date"
                    value={newDiscount.end_date}
                    onChange={(e) => setNewDiscount({ ...newDiscount, end_date: e.target.value })}
                    className="w-full p-1 sm:p-2 border border-gray-600 bg-gray-700 rounded-lg text-[10px] sm:text-xs md:text-sm"
                    required
                  />
                </div>
                {activeTab === 'code' && (
                  <div>
                    <label className="block text-gray-300 text-[10px] sm:text-xs md:text-sm mb-1">Code</label>
                    <input
                      type="text"
                      value={newDiscount.code}
                      onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value })}
                      className="w-full p-1 sm:p-2 border border-gray-600 bg-gray-700 rounded-lg text-[10px] sm:text-xs md:text-sm"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-gray-300 text-[10px] sm:text-xs md:text-sm mb-1">Status</label>
                  <select
                    value={newDiscount.is_active}
                    onChange={(e) => setNewDiscount({ ...newDiscount, is_active: e.target.value === 'true' })}
                    className="w-full p-1 sm:p-2 border border-gray-600 bg-gray-700 rounded-lg text-[10px] sm:text-xs md:text-sm"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-indigo-700 text-[10px] sm:text-xs md:text-sm"
                  >
                    Add Discount
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                    className="w-full bg-gray-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-gray-700 text-[10px] sm:text-xs md:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Discount Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-gray-800 p-3 sm:p-4 rounded-2xl shadow-lg w-full max-w-[90%] sm:max-w-md md:max-w-lg max-h-[80vh] overflow-y-auto">
              <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-yellow-300">Edit Discount</h2>
              <form onSubmit={handleUpdateDiscount} className="space-y-2 sm:space-y-3">
                <div>
                  <label className="block text-gray-300 text-[10px] sm:text-xs md:text-sm mb-1">Name (English)</label>
                  <input
                    type="text"
                    value={newDiscount.name.en}
                    onChange={(e) => setNewDiscount({ ...newDiscount, name: { ...newDiscount.name, en: e.target.value } })}
                    className="w-full p-1 sm:p-2 border border-gray-600 bg-gray-700 rounded-lg text-[10px] sm:text-xs md:text-sm"
                    required
                  />
                </div>
                {activeTab === 'general' && (
                  <div>
                    <label className="block text-gray-300 text-[10px] sm:text-xs md:text-sm mb-1">Name (Arabic)</label>
                    <input
                      type="text"
                      value={newDiscount.name.ar}
                      onChange={(e) => setNewDiscount({ ...newDiscount, name: { ...newDiscount.name, ar: e.target.value } })}
                      className="w-full p-1 sm:p-2 border border-gray-600 bg-gray-700 rounded-lg text-[10px] sm:text-xs md:text-sm"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-gray-300 text-[10px] sm:text-xs md:text-sm mb-1">Value (%)</label>
                  <input
                    type="number"
                    value={newDiscount.value}
                    onChange={(e) => setNewDiscount({ ...newDiscount, value: e.target.value })}
                    className="w-full p-1 sm:p-2 border border-gray-600 bg-gray-700 rounded-lg text-[10px] sm:text-xs md:text-sm"
                    required
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-[10px] sm:text-xs md:text-sm mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newDiscount.start_date}
                    onChange={(e) => setNewDiscount({ ...newDiscount, start_date: e.target.value })}
                    className="w-full p-1 sm:p-2 border border-gray-600 bg-gray-700 rounded-lg text-[10px] sm:text-xs md:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-[10px] sm:text-xs md:text-sm mb-1">End Date</label>
                  <input
                    type="date"
                    value={newDiscount.end_date}
                    onChange={(e) => setNewDiscount({ ...newDiscount, end_date: e.target.value })}
                    className="w-full p-1 sm:p-2 border border-gray-600 bg-gray-700 rounded-lg text-[10px] sm:text-xs md:text-sm"
                    required
                  />
                </div>
                {activeTab === 'code' && (
                  <div>
                    <label className="block text-gray-300 text-[10px] sm:text-xs md:text-sm mb-1">Code</label>
                    <input
                      type="text"
                      value={newDiscount.code}
                      onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value })}
                      className="w-full p-1 sm:p-2 border border-gray-600 bg-gray-700 rounded-lg text-[10px] sm:text-xs md:text-sm"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-gray-300 text-[10px] sm:text-xs md:text-sm mb-1">Status</label>
                  <select
                    value={newDiscount.is_active}
                    onChange={(e) => setNewDiscount({ ...newDiscount, is_active: e.target.value === 'true' })}
                    className="w-full p-1 sm:p-2 border border-gray-600 bg-gray-700 rounded-lg text-[10px] sm:text-xs md:text-sm"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-indigo-700 text-[10px] sm:text-xs md:text-sm"
                  >
                    Update Discount
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsEditModalOpen(false); resetForm(); }}
                    className="w-full bg-gray-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-gray-700 text-[10px] sm:text-xs md:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-gray-800 p-3 sm:p-4 rounded-2xl shadow-lg w-full max-w-[90%] sm:max-w-xs">
              <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-yellow-300">Confirm Deletion</h2>
              <p className="text-gray-300 mb-3 sm:mb-4 text-[10px] sm:text-xs md:text-sm">Are you sure you want to delete this discount?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteDiscount}
                  className="w-full bg-red-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-red-700 text-[10px] sm:text-xs md:text-sm"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full bg-gray-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-gray-700 text-[10px] sm:text-xs md:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Attach Foods Modal */}
        {isAttachModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-gray-800 p-3 sm:p-4 rounded-2xl shadow-lg w-full max-w-[90%] sm:max-w-md md:max-w-lg max-h-[80vh] overflow-y-auto">
              <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-yellow-300">Manage Associated Foods</h2>
              <div className="mb-2 sm:mb-3">
                <h3 className="text-[12px] sm:text-sm md:text-base font-semibold text-gray-300">Currently Attached Foods:</h3>
                {selectedDiscountFoods.length > 0 ? (
                  <ul className="list-disc pl-4 text-gray-400 text-[10px] sm:text-xs md:text-sm">
                    {selectedDiscountFoods.map((food) => (
                      <li key={food.food_id} className="flex justify-between items-center py-1">
                        <span>{food.food_name} - Price: {food.price}</span>
                        <button
                          onClick={() => handleDetachFood(food.food_id)}
                          className="bg-red-600 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded hover:bg-red-700 text-[10px] sm:text-xs"
                        >
                          Detach
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-[10px] sm:text-xs md:text-sm">No foods attached.</p>
                )}
              </div>
              <div>
                <h3 className="text-[12px] sm:text-sm md:text-base font-semibold text-gray-300">Attach New Foods:</h3>
                <select
                  multiple
                  value={attachFoods}
                  onChange={(e) => setAttachFoods(Array.from(e.target.selectedOptions, (option) => option.value))}
                  className="w-full p-1 sm:p-2 border border-gray-600 bg-gray-700 rounded-lg h-20 sm:h-24 text-[10px] sm:text-xs md:text-sm"
                >
                  {foods.map((food) => (
                    <option key={food.food_id} value={food.food_id}>
                      {food.food_name} - Price: {food.price}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAttachFoods}
                  className="mt-2 w-full bg-indigo-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-indigo-700 text-[10px] sm:text-xs md:text-sm"
                >
                  Attach Selected Foods
                </button>
              </div>
              <button
                onClick={() => setIsAttachModalOpen(false)}
                className="mt-2 w-full bg-gray-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-gray-700 text-[10px] sm:text-xs md:text-sm"
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