import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../../Components/Sidebar/Sidebar.jsx';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: { en: '', ar: '' }, image: null });
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

    const resetForm = useCallback(() => {
        setNewCategory({ name: { en: '', ar: '' }, image: null });
        setEditingCategory(null);
        setErrors({});
        setGeneralError(null);
    }, []);

    const fetchCategories = useCallback(async () => {
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            // A more optimized backend would provide translations in a single call.
            // This implementation correctly handles the current backend structure.
            const [enResponse, arResponse] = await Promise.all([
                axios.get('http://127.0.0.1:8000/api/admin/categories/show', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }),
                axios.get('http://127.0.0.1:8000/api/admin/categories/showTranslated?lang=ar', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })
            ]);

            if (enResponse.data.status === 'success' && arResponse.data.status === 'success') {
                const arCategoriesMap = new Map(arResponse.data.data.map(cat => [cat.id, cat.name]));
                const mergedCategories = enResponse.data.data.map(cat => ({
                    ...cat,
                    name: {
                        en: cat.name,
                        ar: arCategoriesMap.get(cat.id) || ''
                    }
                }));
                setCategories(mergedCategories);
            } else {
                setGeneralError('Failed to fetch categories');
            }
        } catch (err) {
            setGeneralError(err.response?.data?.message || 'Server connection error');
            if (err.response?.status === 401) navigate('/login');
        }
    }, [token, navigate]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleError = (err) => {
        const errorResponse = err.response?.data;
        if (errorResponse) {
            setGeneralError(errorResponse.message || 'An unknown error occurred.');
            if (errorResponse.errors) {
                const flatErrors = {};
                Object.keys(errorResponse.errors).forEach(key => {
                    flatErrors[key] = errorResponse.errors[key][0];
                });
                setErrors(flatErrors);
            }
        } else {
            setGeneralError('Could not connect to the server.');
        }
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        setErrors({});
        setGeneralError(null);
        if (!token) { navigate('/login'); return; }

        const formData = new FormData();
        formData.append('name[en]', newCategory.name.en);
        formData.append('name[ar]', newCategory.name.ar);
        if (newCategory.image) formData.append('image', newCategory.image);

        try {
            await axios.post('http://127.0.0.1:8000/api/admin/categories/add', formData, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            await fetchCategories();
            closeModal();
        } catch (err) {
            handleError(err);
        }
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        setErrors({});
        setGeneralError(null);
        if (!token || !editingCategory) return;

        const formData = new FormData();
        formData.append('name[en]', newCategory.name.en);
        formData.append('name[ar]', newCategory.name.ar);
        if (newCategory.image) formData.append('image', newCategory.image);

        try {
            await axios.post(`http://127.0.0.1:8000/api/admin/categories/update/${editingCategory.id}`, formData, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            await fetchCategories();
            closeModal();
        } catch (err) {
            handleError(err);
        }
    };

    const handleEditClick = (category) => {
        resetForm();
        setEditingCategory(category);
        setNewCategory({
            name: { en: category.name.en || '', ar: category.name.ar || '' },
            image: null
        });
        setIsEditModalOpen(true);
    };

    const handleDeleteCategory = async () => {
        if (!token || !categoryToDelete) return;
        try {
            await axios.delete(`http://127.0.0.1:8000/api/admin/categories/delete/${categoryToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchCategories();
            setIsDeleteModalOpen(false);
            setCategoryToDelete(null);
        } catch (err) {
            setGeneralError(err.response?.data?.message || 'Server connection error');
            setIsDeleteModalOpen(false);
        }
    };

    const confirmDeleteCategory = (id) => {
        setCategoryToDelete(id);
        setIsDeleteModalOpen(true);
    };
    
    const openAddModal = () => {
        resetForm();
        setIsAddModalOpen(true);
    };

    const closeModal = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        resetForm();
    };

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">{isEditModalOpen ? 'Edit Category' : 'Add New Category'}</h2>
                        <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
                            <FaTimes size={20} />
                        </button>
                    </div>
                    {generalError && <div className="mb-4 p-3 bg-red-900/50 border-l-4 border-red-500 text-red-200 rounded-lg">{generalError}</div>}
                    <form onSubmit={isEditModalOpen ? handleUpdateCategory : handleAddCategory} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Name (English)</label>
                            <input type="text" value={newCategory.name.en} onChange={(e) => setNewCategory({ ...newCategory, name: { ...newCategory.name, en: e.target.value } })} placeholder="e.g., Appetizers" className={`w-full px-4 py-2 bg-gray-800 border ${errors['name.en'] ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:outline-none`} />
                            {errors['name.en'] && <p className="text-red-500 text-sm mt-1">{errors['name.en']}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Name (Arabic)</label>
                            <input type="text" value={newCategory.name.ar} onChange={(e) => setNewCategory({ ...newCategory, name: { ...newCategory.name, ar: e.target.value } })} placeholder="e.g., مقبلات" className={`w-full px-4 py-2 bg-gray-800 border ${errors['name.ar'] ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:outline-none`} />
                            {errors['name.ar'] && <p className="text-red-500 text-sm mt-1">{errors['name.ar']}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Image {isEditModalOpen && '(Leave blank to keep current image)'}</label>
                            <input type="file" onChange={(e) => setNewCategory({ ...newCategory, image: e.target.files[0] })} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700 transition-colors" />
                            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">{isEditModalOpen ? 'Update Category' : 'Add Category'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    const renderDeleteModal = () => (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl border border-white/10 w-full max-w-md">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Confirm Deletion</h2>
                        <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                            <FaTimes size={20} />
                        </button>
                    </div>
                    <p className="text-gray-300 mb-6">Are you sure you want to delete this category? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
                        <button onClick={handleDeleteCategory} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Delete</button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="flex-1 flex flex-col transition-all duration-300 lg:ml-64 md:pl-20 lg:pl-8">
                
                {/* --- 1. Fixed Header Area --- */}
                <div className="p-4 sm:p-6 lg:p-8 pb-4">
                    <header className="mb-4 text-center">
                        <h1 className="text-xl md:text-4xl font-bold">Category <span className="text-orange-500">Management</span></h1>
                        <p className="text-xs md:text-base text-gray-400 mt-2">Add, edit, or delete your menu categories.</p>
                    </header>
                    <div className="mb-4 flex justify-center sm:justify-end">
                        <button onClick={openAddModal} className="flex items-center gap-2 py-2 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                            <FaPlus size={14} /> Add New Category
                        </button>
                    </div>
                </div>

                {/* Modals are fixed, their position in JSX doesn't affect layout */}
                {(isAddModalOpen || isEditModalOpen) && renderModal()}
                {isDeleteModalOpen && renderDeleteModal()}
                
                {/* --- 2. Scrollable Content Area --- */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-8">
                    <div className="hidden md:block bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg">
                        <div className="overflow-x-auto rounded-xl">
                            <table className="min-w-full">
                                <thead className="bg-white/10 sticky top-0 z-10">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">ID</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">Image</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">Name (EN)</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">Name (AR)</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {categories.length > 0 ? categories.map((category) => (
                                        <tr key={category.id} className="hover:bg-white/5 transition-colors">
                                            <td className="py-3 px-4 text-gray-300">{category.id}</td>
                                            <td className="py-3 px-4">
                                                <img src={category.image_url} alt={category.name.en} className="w-12 h-12 object-cover rounded-md" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/1a1a1a/FFF?text=...'; }} />
                                            </td>
                                            <td className="py-3 px-4 text-gray-300">{category.name.en}</td>
                                            <td className="py-3 px-4 text-gray-300">{category.name.ar}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => handleEditClick(category)} className="p-1 text-gray-400 hover:text-orange-500 transition-colors"><FaEdit size={14} /></button>
                                                    <button onClick={() => confirmDeleteCategory(category.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><FaTrash size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="py-8 px-4 text-center text-gray-500">No categories available. Add one to get started!</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="block md:hidden space-y-4">
                        {categories.length > 0 ? categories.map((category) => (
                            <div key={category.id} className="bg-white/5 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/10">
                                <div className="flex items-center gap-4">
                                    <img src={category.image_url} alt={category.name.en} className="w-16 h-16 object-cover rounded-full border-2 border-orange-500/50 flex-shrink-0" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/1a1a1a/FFF?text=...'; }} />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-white truncate">{category.name.en}</h3>
                                        <p className="text-gray-300 truncate">{category.name.ar}</p>
                                        <span className="mt-1 inline-block bg-gray-700 text-gray-400 text-xs font-semibold px-2 py-1 rounded-full">ID: {category.id}</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button onClick={() => handleEditClick(category)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-orange-500 bg-white/5 hover:bg-white/10 rounded-full transition-colors"><FaEdit size={14} /></button>
                                        <button onClick={() => confirmDeleteCategory(category.id)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 bg-white/5 hover:bg-white/10 rounded-full transition-colors"><FaTrash size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-gray-500 mt-8">No categories available. Add one to get started!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Categories;