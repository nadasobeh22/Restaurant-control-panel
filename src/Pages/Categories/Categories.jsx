import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../../Components/Sidebar/Sidebar.jsx';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaEdit, FaTrash } from 'react-icons/fa';

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
            navigate('/');
            return;
        }
        try {
            const [enResponse, arResponse] = await Promise.all([
                axios.get('http://127.0.0.1:8000/api/admin/categories/show', {
                    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
                }),
                axios.get('http://127.0.0.1:8000/api/admin/categories/showTranslated?lang=ar', {
                    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
                })
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
            if (err.response?.status === 401) navigate('/');
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
        if (!token) { navigate('/'); return; }

        const formData = new FormData();
        formData.append('name[en]', newCategory.name.en);
        formData.append('name[ar]', newCategory.name.ar);
        if (newCategory.image) {
            formData.append('image', newCategory.image);
        }
        
        try {
            await axios.post('http://127.0.0.1:8000/api/admin/categories/add', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json' 
                },
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
        if (newCategory.image) {
            formData.append('image', newCategory.image);
        }
        
        try {
            await axios.post(`http://127.0.0.1:8000/api/admin/categories/update/${editingCategory.id}`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json' 
                },
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

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
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

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="flex-1 p-4 lg:p-6 lg:ml-64 transition-all duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-yellow-300">Category Management</h1>
                    <button onClick={handleLogout} className="mt-4 sm:mt-0 flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 text-sm sm:text-base">
                        <FaSignOutAlt size={16} /> Logout
                    </button>
                </div>

                <div className="mb-8">
                    <button onClick={openAddModal} className="py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200">
                        Add Category
                    </button>
                </div>

                {(isAddModalOpen || isEditModalOpen) && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg max-w-lg w-full">
                            <h2 className="text-lg md:text-xl font-semibold mb-4 text-yellow-300">{isEditModalOpen ? 'Edit Category' : 'Add Category'}</h2>
                            {generalError && <div className="mb-4 p-3 bg-red-900/80 border-l-4 border-red-500 text-red-100 rounded-lg text-center">{generalError}</div>}
                            <form onSubmit={isEditModalOpen ? handleUpdateCategory : handleAddCategory} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Name (English)</label>
                                    <input type="text" value={newCategory.name.en} onChange={(e) => setNewCategory({ ...newCategory, name: { ...newCategory.name, en: e.target.value } })} placeholder="Category Name in English" className={`w-full px-4 py-2 bg-gray-700 border ${errors['name.en'] ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none`} />
                                    {errors['name.en'] && <p className="text-red-500 text-sm mt-1">{errors['name.en']}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Name (Arabic)</label>
                                    <input type="text" value={newCategory.name.ar} onChange={(e) => setNewCategory({ ...newCategory, name: { ...newCategory.name, ar: e.target.value } })} placeholder="اسم الفئة بالعربية" className={`w-full px-4 py-2 bg-gray-700 border ${errors['name.ar'] ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none`} />
                                    {errors['name.ar'] && <p className="text-red-500 text-sm mt-1">{errors['name.ar']}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Image {isEditModalOpen && '(Optional)'}</label>
                                    <input type="file" onChange={(e) => setNewCategory({ ...newCategory, image: e.target.files[0] })} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700" />
                                    {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                                </div>
                                <div className="flex gap-3 pt-3">
                                    <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200">
                                        {isEditModalOpen ? 'Update' : 'Add'}
                                    </button>
                                    <button type="button" onClick={closeModal} className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg max-w-sm w-full">
                            <h2 className="text-lg font-semibold mb-4 text-yellow-300">Confirm Deletion</h2>
                            <p className="text-gray-300 mb-4">Are you sure you want to delete this category?</p>
                            <div className="flex gap-3">
                                <button onClick={handleDeleteCategory} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200">Yes, Delete</button>
                                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Desktop Table View */}
                <div className="hidden md:block">
                    <div className="overflow-x-auto rounded-lg shadow-lg">
                        <table className="min-w-full bg-gray-800">
                            <thead className="bg-indigo-600 text-white">
                                <tr>
                                    <th className="py-3 px-4 text-left text-sm font-semibold">ID</th>
                                    <th className="py-3 px-4 text-left text-sm font-semibold">Image</th>
                                    <th className="py-3 px-4 text-left text-sm font-semibold">Name (AR)</th>
                                    <th className="py-3 px-4 text-left text-sm font-semibold">Name (EN)</th>
                                    <th className="py-3 px-4 text-left text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {categories.length > 0 ? categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-700/50 transition-colors duration-200">
                                        <td className="py-3 px-4 text-gray-300">{category.id}</td>
                                        <td className="py-3 px-4">
                                            <img src={category.image_url} alt={category.name.en} className="w-12 h-12 object-cover rounded-md" onError={(e) => { e.target.onerror = null; e.target.src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; }} />
                                        </td>
                                        <td className="py-3 px-4 text-gray-300">{category.name.ar}</td>
                                        <td className="py-3 px-4 text-gray-300">{category.name.en}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEditClick(category)} className="py-1 px-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-all duration-200 text-sm">Edit</button>
                                                <button onClick={() => confirmDeleteCategory(category.id)} className="py-1 px-3 bg-red-600 text-white rounded hover:bg-red-700 transition-all duration-200 text-sm">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="py-4 px-4 text-center text-gray-400">No categories available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- [تعديل] تصميم جديد وجميل لشاشات الموبايل --- */}
                <div className="block md:hidden space-y-4">
                    {categories.length > 0 ? categories.map((category) => (
                        <div key={category.id} className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-lg relative border border-gray-700">
                            <div className="absolute top-3 right-3 flex gap-2">
                                <button onClick={() => handleEditClick(category)} className="w-8 h-8 flex items-center justify-center bg-indigo-600/70 hover:bg-indigo-500 rounded-full transition-colors duration-200">
                                    <FaEdit size={14} />
                                </button>
                                <button onClick={() => confirmDeleteCategory(category.id)} className="w-8 h-8 flex items-center justify-center bg-red-600/70 hover:bg-red-500 rounded-full transition-colors duration-200">
                                    <FaTrash size={14} />
                                </button>
                            </div>
                            <div className="flex items-center gap-4">
                                <img src={category.image_url} alt={category.name.en} className="w-20 h-20 object-cover rounded-full border-2 border-indigo-500 flex-shrink-0" onError={(e) => { e.target.onerror = null; e.target.src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; }} />
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white truncate">{category.name.en}</h3>
                                    <p className="text-gray-300">{category.name.ar}</p>
                                    <span className="mt-2 inline-block bg-gray-700 text-gray-400 text-xs font-semibold px-2 py-1 rounded-full">
                                        ID: {category.id}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-gray-400 mt-8">No categories available</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Categories;