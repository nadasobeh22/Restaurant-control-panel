import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../../Components/Sidebar/Sidebar.jsx';
import { FaPlus, FaEdit, FaTrash, FaLink, FaTimes } from 'react-icons/fa';

const DiscountsManagement = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [generalDiscounts, setGeneralDiscounts] = useState([]);
    const [codeDiscounts, setCodeDiscounts] = useState([]);
    const [allFoods, setAllFoods] = useState([]);
    const [newDiscount, setNewDiscount] = useState({
        name: { en: '', ar: '' },
        value: '',
        start_date: '',
        end_date: '',
        code: '',
        is_active: true,
    });
    const [editingDiscount, setEditingDiscount] = useState(null);
    const [attachedFoods, setAttachedFoods] = useState([]);
    const [foodsToAttach, setFoodsToAttach] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [discountToDelete, setDiscountToDelete] = useState(null);
    const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
    const [currentDiscountId, setCurrentDiscountId] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [generalError, setGeneralError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const token = localStorage.getItem('token');
    const API_BASE_URL = 'http://127.0.0.1:8000/api/admin';

    const fetchDiscounts = useCallback(async () => {
        if (!token) return;
        try {
            const [generalRes, codeRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/discountsGeneral/show`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/discountsCode/show`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setGeneralDiscounts(generalRes.data.data.map(d => ({ ...d, id: d.discount_id, name: d.discount_name })) || []);
            setCodeDiscounts(codeRes.data.data.map(d => ({ ...d, id: d.discount_id, name: d.discount_name })) || []);
        } catch (error) {
            setGeneralError(error.response?.data?.message || 'Failed to fetch discounts');
        }
    }, [token]);

    const fetchFoods = useCallback(async () => {
        if (!token) return;
        try {
            const response = await axios.get(`${API_BASE_URL}/foods/show?all=true`, { headers: { Authorization: `Bearer ${token}` } });
            setAllFoods(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch foods:', error);
        }
    }, [token]);

    useEffect(() => {
        fetchDiscounts();
        fetchFoods();
    }, [fetchDiscounts, fetchFoods]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const resetForm = () => {
        setNewDiscount({ name: { en: '', ar: '' }, value: '', start_date: '', end_date: '', code: '', is_active: true });
        setEditingDiscount(null);
        setFormErrors({});
        setGeneralError(null);
    };

    const handleError = (error) => {
        const errors = error.response?.data?.errors;
        if (errors) {
            const flatErrors = {};
            Object.keys(errors).forEach(key => { flatErrors[key] = errors[key][0]; });
            setFormErrors(flatErrors);
        } else {
            setGeneralError(error.response?.data?.message || 'An unexpected error occurred.');
        }
    };
    
    const handleAddDiscount = async (e) => {
        e.preventDefault();
        setFormErrors({});
        setGeneralError(null);
        const isGeneral = activeTab === 'general';
        const url = `${API_BASE_URL}/discounts${isGeneral ? 'General' : 'Code'}/store`;
        const { name, ...rest } = newDiscount;
        const discountData = isGeneral ? { name, ...rest } : { ...newDiscount, name: newDiscount.name.en };
        try {
            await axios.post(url, discountData, { headers: { Authorization: `Bearer ${token}` } });
            fetchDiscounts();
            setIsAddModalOpen(false);
            resetForm();
        } catch (error) {
            handleError(error);
        }
    };

    const handleUpdateDiscount = async (e) => {
        e.preventDefault();
        if (!editingDiscount) return;
        setFormErrors({});
        setGeneralError(null);
        const isGeneral = activeTab === 'general';
        const url = `${API_BASE_URL}/discounts${isGeneral ? 'General' : 'Code'}/update/${editingDiscount.id}`;
        const { name, ...rest } = newDiscount;
        const discountData = isGeneral ? { name, ...rest } : { ...newDiscount, name: newDiscount.name.en };
        try {
            await axios.patch(url, discountData, { headers: { Authorization: `Bearer ${token}` } });
            fetchDiscounts();
            setIsEditModalOpen(false);
            resetForm();
        } catch (error) {
            handleError(error);
        }
    };

    const handleDeleteDiscount = async () => {
        if (!discountToDelete) return;
        const isGeneral = activeTab === 'general';
        const url = `${API_BASE_URL}/discounts${isGeneral ? 'General' : 'Code'}/delete/${discountToDelete}`;
        try {
            await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });
            fetchDiscounts();
            setIsDeleteModalOpen(false);
            setDiscountToDelete(null);
        } catch (error) {
            setGeneralError(error.response?.data?.message || 'Failed to delete discount');
        }
    };
    
    const openEditModal = (discount) => {
        resetForm();
        setEditingDiscount(discount);
        setNewDiscount({
            name: { en: discount.name?.en || discount.name || '', ar: discount.name?.ar || '' },
            value: discount.value ? parseFloat(String(discount.value).replace('%', '')) : '',
            start_date: discount.start_date || '',
            end_date: discount.end_date || '',
            code: discount.code || '',
            is_active: discount.is_active === 1,
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (id) => {
        setDiscountToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const openAttachModal = async (id) => {
        setGeneralError(null);
        setCurrentDiscountId(id);
        setAttachedFoods([]);
        setFoodsToAttach([]);
        setIsAttachModalOpen(true);
    
        const isGeneral = activeTab === 'general';
        const url = `${API_BASE_URL}/discounts${isGeneral ? 'General' : 'Code'}/${id}/foods`;
        try {
            const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.status === 'success') {
                setAttachedFoods(response.data.data || []);
            }
        } catch (error) {
            console.error("Could not fetch attached foods, maybe there are none:", error);
        }
    };
    
    const handleAttachFoods = async () => {
        if (!currentDiscountId || foodsToAttach.length === 0) return;
        const isGeneral = activeTab === 'general';
        const url = `${API_BASE_URL}/discounts${isGeneral ? 'General' : 'Code'}/${currentDiscountId}/attach-foods`;
        try {
            await axios.post(url, { food_ids: foodsToAttach.map(id => parseInt(id)) }, { headers: { Authorization: `Bearer ${token}` } });
            await openAttachModal(currentDiscountId); // Refresh the modal data
        } catch (error) {
            setGeneralError(error.response?.data?.message || 'Failed to attach foods');
        }
    };

    const handleDetachFood = async (foodId) => {
        if (!currentDiscountId) return;
        const isGeneral = activeTab === 'general';
        const url = `${API_BASE_URL}/discounts${isGeneral ? 'General' : 'Code'}/${currentDiscountId}/detach-food`;
        try {
            await axios.delete(url, { headers: { Authorization: `Bearer ${token}` }, data: { food_ids: [parseInt(foodId)] } });
            await openAttachModal(currentDiscountId); // Refresh the modal data
        } catch (error) {
            setGeneralError(error.response?.data?.message || 'Failed to detach food');
        }
    };

    const discounts = activeTab === 'general' ? generalDiscounts : codeDiscounts;

    const renderFormFields = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name (EN)</label>
                <input type="text" value={newDiscount.name.en} onChange={(e) => setNewDiscount({ ...newDiscount, name: { ...newDiscount.name, en: e.target.value } })} required className={`w-full px-4 py-2 bg-gray-800 border ${formErrors['name.en'] ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:ring-2 focus:ring-orange-500`} />
                {formErrors['name.en'] && <p className="text-red-500 text-sm mt-1">{formErrors['name.en']}</p>}
            </div>
            {activeTab === 'general' && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Name (AR)</label>
                    <input type="text" value={newDiscount.name.ar} onChange={(e) => setNewDiscount({ ...newDiscount, name: { ...newDiscount.name, ar: e.target.value } })} required className={`w-full px-4 py-2 bg-gray-800 border ${formErrors['name.ar'] ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:ring-2 focus:ring-orange-500`} />
                    {formErrors['name.ar'] && <p className="text-red-500 text-sm mt-1">{formErrors['name.ar']}</p>}
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Value (%)</label>
                <input type="number" value={newDiscount.value} onChange={(e) => setNewDiscount({ ...newDiscount, value: e.target.value })} required min="0" max="100" step="0.01" className={`w-full px-4 py-2 bg-gray-800 border ${formErrors.value ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:ring-2 focus:ring-orange-500`} />
                {formErrors.value && <p className="text-red-500 text-sm mt-1">{formErrors.value}</p>}
            </div>
            {activeTab === 'code' && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Code</label>
                    <input type="text" value={newDiscount.code} onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value })} required className={`w-full px-4 py-2 bg-gray-800 border ${formErrors.code ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:ring-2 focus:ring-orange-500`} />
                    {formErrors.code && <p className="text-red-500 text-sm mt-1">{formErrors.code}</p>}
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                <input type="date" value={newDiscount.start_date} onChange={(e) => setNewDiscount({ ...newDiscount, start_date: e.target.value })} required className={`w-full px-4 py-2 bg-gray-800 border ${formErrors.start_date ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:ring-2 focus:ring-orange-500`} />
                {formErrors.start_date && <p className="text-red-500 text-sm mt-1">{formErrors.start_date}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                <input type="date" value={newDiscount.end_date} onChange={(e) => setNewDiscount({ ...newDiscount, end_date: e.target.value })} required className={`w-full px-4 py-2 bg-gray-800 border ${formErrors.end_date ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:ring-2 focus:ring-orange-500`} />
                {formErrors.end_date && <p className="text-red-500 text-sm mt-1">{formErrors.end_date}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <select value={newDiscount.is_active} onChange={(e) => setNewDiscount({ ...newDiscount, is_active: e.target.value === 'true' })} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500">
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                </select>
            </div>
        </div>
    );
    
    return (
        <div className="flex min-h-screen bg-black text-white">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="flex-1 p-4 sm:p-6 lg:p-8 md:pl-20 lg:pl-8 transition-all duration-300 lg:ml-64">
                <header className="mb-8 text-center">
                    <h1 className="text-xl md:text-4xl font-bold">Discounts <span className="text-orange-500">Management</span></h1>
                    <p className="text-xs md:text-base text-gray-400 mt-2">Manage general and code-based discounts.</p>
                </header>

                <div className="mb-6 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <button onClick={() => { resetForm(); setIsAddModalOpen(true); }} className="w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 order-1 sm:order-2">
                        <FaPlus size={14} /> Add New Discount
                    </button>
                    <div className="flex items-center gap-2 bg-gray-800 p-1 rounded-lg order-2 sm:order-1">
                        <button onClick={() => setActiveTab('general')} className={`px-4 py-2 text-sm rounded-md transition-colors ${activeTab === 'general' ? 'bg-orange-600' : 'hover:bg-gray-700'}`}>General</button>
                        <button onClick={() => setActiveTab('code')} className={`px-4 py-2 text-sm rounded-md transition-colors ${activeTab === 'code' ? 'bg-orange-600' : 'hover:bg-gray-700'}`}>Code</button>
                    </div>
                </div>
                
                {generalError && <div className="mb-4 p-3 bg-red-900/50 border-l-4 border-red-500 text-red-200 rounded-lg text-center" onClick={()=>setGeneralError(null)}>{generalError}</div>}

                {/* Desktop Table with Vertical Scroll */}
                <div className="hidden md:block bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg">
                    <div className="overflow-x-auto overflow-y-auto max-h-96 rounded-xl">
                        <table className="min-w-full">
                            <thead className="bg-white/10 sticky top-0 z-10">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">ID</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">Name</th>
                                    {activeTab === 'code' && <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">Code</th>}
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">Value</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">Dates</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {discounts.map(d => (
                                    <tr key={d.id} className="hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4 text-sm text-gray-300">{d.id}</td>
                                        <td className="py-3 px-4 text-sm text-white">{typeof d.name === 'object' ? d.name?.en || d.name?.ar || 'N/A' : d.name || 'N/A'}</td>
                                        {activeTab === 'code' && <td className="py-3 px-4 text-sm text-gray-300">{d.code || 'N/A'}</td>}
                                        <td className="py-3 px-4 text-sm text-orange-400">{d.value}</td>
                                        <td className="py-3 px-4 text-sm text-gray-300">{d.start_date} - {d.end_date}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${d.is_active === 1 ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                                                {d.is_active === 1 ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => openEditModal(d)} className="p-1 text-gray-400 hover:text-orange-500 transition-colors">
                                                    <FaEdit size={14} />
                                                </button>
                                                <button onClick={() => openDeleteModal(d.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                                                    <FaTrash size={14} />
                                                </button>
                                                <button onClick={() => openAttachModal(d.id)} className="p-1 text-gray-400 hover:text-orange-500 transition-colors">
                                                    <FaLink size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Cards with Vertical Scroll */}
                <div className="md:hidden space-y-4 max-h-96 overflow-y-auto">
                    {discounts.map(d => (
                        <div key={d.id} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-white font-medium">{typeof d.name === 'object' ? d.name?.en || d.name?.ar || 'N/A' : d.name || 'N/A'}</h3>
                                    <p className="text-gray-400 text-sm">ID: {d.id}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${d.is_active === 1 ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                                    {d.is_active === 1 ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                <div>
                                    <span className="text-gray-400">Value:</span>
                                    <span className="text-orange-400 ml-1">{d.value}</span>
                                </div>
                                {activeTab === 'code' && (
                                    <div>
                                        <span className="text-gray-400">Code:</span>
                                        <span className="text-gray-300 ml-1">{d.code || 'N/A'}</span>
                                    </div>
                                )}
                                <div className="col-span-2">
                                    <span className="text-gray-400">Period:</span>
                                    <span className="text-gray-300 ml-1">{d.start_date} - {d.end_date}</span>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => openEditModal(d)} className="p-2 text-gray-400 hover:text-orange-500 transition-colors">
                                    <FaEdit size={16} />
                                </button>
                                <button onClick={() => openDeleteModal(d.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                    <FaTrash size={16} />
                                </button>
                                <button onClick={() => openAttachModal(d.id)} className="p-2 text-gray-400 hover:text-orange-500 transition-colors">
                                    <FaLink size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-900 rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-white">Add New {activeTab === 'general' ? 'General' : 'Code'} Discount</h2>
                                    <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                        <FaTimes size={20} />
                                    </button>
                                </div>
                                {generalError && <div className="mb-4 p-3 bg-red-900/50 border-l-4 border-red-500 text-red-200 rounded-lg">{generalError}</div>}
                                <form onSubmit={handleAddDiscount}>
                                    {renderFormFields()}
                                    <div className="flex justify-end gap-3 mt-6">
                                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                                            Cancel
                                        </button>
                                        <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                                            Add Discount
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-900 rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-white">Edit {activeTab === 'general' ? 'General' : 'Code'} Discount</h2>
                                    <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                        <FaTimes size={20} />
                                    </button>
                                </div>
                                {generalError && <div className="mb-4 p-3 bg-red-900/50 border-l-4 border-red-500 text-red-200 rounded-lg">{generalError}</div>}
                                <form onSubmit={handleUpdateDiscount}>
                                    {renderFormFields()}
                                    <div className="flex justify-end gap-3 mt-6">
                                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                                            Cancel
                                        </button>
                                        <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                                            Update Discount
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-900 rounded-xl border border-white/10 w-full max-w-md">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-white">Delete Discount</h2>
                                    <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                        <FaTimes size={20} />
                                    </button>
                                </div>
                                <p className="text-gray-300 mb-6">Are you sure you want to delete this discount? This action cannot be undone.</p>
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={handleDeleteDiscount} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Attach Foods Modal */}
                {isAttachModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden">
                            <div className="p-6 max-h-[90vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-white">Manage Foods for Discount</h2>
                                    <button onClick={() => setIsAttachModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                        <FaTimes size={20} />
                                    </button>
                                </div>
                                {generalError && <div className="mb-4 p-3 bg-red-900/50 border-l-4 border-red-500 text-red-200 rounded-lg">{generalError}</div>}
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-96">
                                    {/* Available Foods Section with Vertical Scroll */}
                                    <div className="bg-white/5 rounded-lg p-4 border border-white/10 flex flex-col">
                                        <h3 className="text-lg font-semibold text-orange-500 mb-2">Available Foods</h3>
                                        <p className="text-gray-400 text-sm mb-4">Select one or more foods to attach to the discount.</p>
                                        <div className="flex-grow space-y-2 overflow-y-auto pr-2 border border-gray-700 rounded-lg p-2 scrollable-area">
                                            <style jsx>{`
                                                .scrollable-area::-webkit-scrollbar { width: 8px; }
                                                .scrollable-area::-webkit-scrollbar-track { background: #374151; border-radius: 4px; }
                                                .scrollable-area::-webkit-scrollbar-thumb { background: #ea580c; border-radius: 4px; }
                                                .scrollable-area::-webkit-scrollbar-thumb:hover { background: #c2410c; }
                                            `}</style>
                                            {allFoods.filter(food => !attachedFoods.some(attached => attached.food_id === food.food_id)).map(food => (
                                                <div key={food.food_id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                                                    <span className="text-white">{food.food_name?.en || food.food_name || 'N/A'}</span>
                                                    <button
                                                        onClick={() => {
                                                            if (!foodsToAttach.includes(food.food_id)) {
                                                                setFoodsToAttach([...foodsToAttach, food.food_id]);
                                                            }
                                                        }}
                                                        disabled={foodsToAttach.includes(food.food_id)}
                                                        className={`px-3 py-1 text-sm rounded transition-colors ${
                                                            foodsToAttach.includes(food.food_id)
                                                                ? 'bg-green-600 text-white cursor-not-allowed'
                                                                : 'bg-orange-600 text-white hover:bg-orange-700'
                                                        }`}
                                                    >
                                                        {foodsToAttach.includes(food.food_id) ? 'Selected' : 'Select'}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        {foodsToAttach.length > 0 && (
                                            <button
                                                onClick={handleAttachFoods}
                                                className="w-full mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                                            >
                                                Attach Selected Foods ({foodsToAttach.length})
                                            </button>
                                        )}
                                    </div>

                                    {/* Attached Foods Section with Vertical Scroll */}
                                    <div className="bg-white/5 rounded-lg p-4 border border-white/10 flex flex-col">
                                        <h3 className="text-lg font-semibold text-orange-500 mb-2">Attached Foods ({attachedFoods.length})</h3>
                                        <p className="text-gray-400 text-sm mb-4">These foods are currently linked to the discount.</p>
                                        <div className="flex-grow space-y-2 overflow-y-auto pr-2 border border-gray-700 rounded-lg p-2 scrollable-area">
                                            {attachedFoods.length === 0 ? (
                                                <div className="h-full flex items-center justify-center">
                                                     <p className="text-gray-500 text-center">No foods attached yet.</p>
                                                </div>
                                            ) : (
                                                attachedFoods.map(food => (
                                                    <div key={food.food_id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                                        <span className="text-white">{food.food_name?.en || food.food_name || 'N/A'}</span>
                                                        <button
                                                            onClick={() => handleDetachFood(food.food_id)}
                                                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-6">
                                    <button
                                        onClick={() => setIsAttachModalOpen(false)}
                                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiscountsManagement;