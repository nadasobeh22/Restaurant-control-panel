import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../../Components/Sidebar/Sidebar.jsx';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Foods = () => {
    const [foods, setFoods] = useState([]);
    const [categories, setCategories] = useState([]);
    const [paginationMeta, setPaginationMeta] = useState(null);
    const [newFood, setNewFood] = useState({
        category_id: '', name: { en: '', ar: '' }, image: null,
        price: '', description: { en: '', ar: '' }, stock: ''
    });
    const [editingFood, setEditingFood] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [generalError, setGeneralError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [foodToDelete, setFoodToDelete] = useState(null);
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const resetForm = useCallback(() => {
        setNewFood({
            category_id: '', name: { en: '', ar: '' }, image: null,
            price: '', description: { en: '', ar: '' }, stock: ''
        });
        setEditingFood(null);
        setFormErrors({});
        setGeneralError(null);
    }, []);
    
    const fetchFoods = useCallback(async (page = 1) => {
        if (!token) {
            navigate('/');
            return;
        }
        try {
            const url = `http://127.0.0.1:8000/api/admin/foods/show?page=${page}`;
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });
            if (response.data && response.data.data) {
                const mappedFoods = response.data.data.map(food => ({
                    ...food,
                    name: {
                        en: food.food_name,
                        ar: food.translations?.ar?.food_name || ''
                    },
                    description: {
                        en: food.description,
                        ar: food.translations?.ar?.description || ''
                    }
                }));
                setFoods(mappedFoods);
                setPaginationMeta(response.data.meta);
            }
        } catch (err) {
            setGeneralError(err.response?.data?.message || 'Error fetching foods.');
            if (err.response?.status === 401) navigate('/');
        }
    }, [token, navigate]);

    const fetchCategories = useCallback(async () => {
        if (!token) return;
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/categories/show', {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });
            if (response.data && response.data.data) {
                setCategories(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    }, [token]);

    useEffect(() => {
        fetchFoods();
        fetchCategories();
    }, [fetchFoods, fetchCategories]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleError = (err) => {
        const errors = err.response?.data?.errors;
        if (errors) {
            const flatErrors = {};
            Object.keys(errors).forEach(key => {
                flatErrors[key] = errors[key][0];
            });
            setFormErrors(flatErrors);
        } else {
            setGeneralError(err.response?.data?.message || 'An unexpected error occurred.');
        }
    };
    
    const handleAddFood = async (e) => {
        e.preventDefault();
        setGeneralError(null);
        setFormErrors({});

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
            await axios.post('http://127.0.0.1:8000/api/admin/foods/add', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchFoods(1);
            setIsAddModalOpen(false);
            resetForm();
        } catch (err) {
            handleError(err);
        }
    };

    const handleUpdateFood = async (e) => {
        e.preventDefault();
        if (!editingFood) return;
        setGeneralError(null);
        setFormErrors({});

        const formData = new FormData();
        formData.append('category_id', newFood.category_id);
        formData.append('name[en]', newFood.name.en);
        formData.append('name[ar]', newFood.name.ar);
        if (newFood.image) {
            formData.append('image', newFood.image);
        }
        formData.append('price', newFood.price);
        formData.append('description[en]', newFood.description.en);
        formData.append('description[ar]', newFood.description.ar);
        formData.append('stock', newFood.stock);
        formData.append('_method', 'PATCH');

        try {
            await axios.post(`http://127.0.0.1:8000/api/admin/foods/update/${editingFood.food_id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchFoods(paginationMeta?.current_page || 1);
            setIsEditModalOpen(false);
            resetForm();
        } catch (err) {
            handleError(err);
        }
    };

    const handleDeleteFood = async () => {
        if (!foodToDelete) return;
        try {
            await axios.delete(`http://127.0.0.1:8000/api/admin/foods/delete/${foodToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchFoods(paginationMeta?.current_page || 1);
            setIsDeleteModalOpen(false);
            setFoodToDelete(null);
        } catch (err) {
            setGeneralError(err.response?.data?.message || 'Error deleting food.');
            setIsDeleteModalOpen(false);
        }
    };

    const handlePageChange = (page) => {
        if (page && paginationMeta && page >= 1 && page <= paginationMeta.last_page) {
            fetchFoods(page);
        }
    };
    
    const openEditModal = (food) => {
        resetForm();
        setEditingFood(food);
        
        setNewFood({
            category_id: food.category_id || '',
            name: { 
                en: food.food_name || '', 
                ar: food.name?.ar || '' 
            },
            image: null,
            price: food.price ? String(food.price).replace(' $', '') : '',
            description: { 
                en: food.description.en || '', // Use the already mapped description
                ar: food.description.ar || '' 
            },
            stock: food.stock || ''
        });
        setIsEditModalOpen(true);
    };

    const openAddModal = () => {
        resetForm();
        setIsAddModalOpen(true);
    };

    const openDeleteModal = (id) => {
        setFoodToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const renderModal = (isEditing) => (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl shadow-lg w-full max-w-3xl border border-white/10 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-6 text-orange-500">{isEditing ? 'Edit Food' : 'Add New Food'}</h2>
                {generalError && <div className="mb-4 p-3 bg-red-900/50 border-l-4 border-red-500 text-red-200 rounded-lg text-center" onClick={() => setGeneralError(null)}>{generalError}</div>}
                <form onSubmit={isEditing ? handleUpdateFood : handleAddFood} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                            <select name="category_id" value={newFood.category_id} onChange={(e) => setNewFood({ ...newFood, category_id: e.target.value })} className={`w-full px-4 py-2 bg-gray-800 border ${formErrors.category_id ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-orange-500`} required>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name?.en || c.name}</option>)}
                            </select>
                            {formErrors.category_id && <p className="text-red-500 text-sm mt-1">{formErrors.category_id}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Name (EN)</label>
                            <input type="text" value={newFood.name.en} onChange={(e) => setNewFood({ ...newFood, name: { ...newFood.name, en: e.target.value } })} className={`w-full px-4 py-2 bg-gray-800 border ${formErrors['name.en'] ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-orange-500`} required/>
                            {formErrors['name.en'] && <p className="text-red-500 text-sm mt-1">{formErrors['name.en']}</p>}
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Name (AR)</label>
                            <input type="text" value={newFood.name.ar} onChange={(e) => setNewFood({ ...newFood, name: { ...newFood.name, ar: e.target.value } })} className={`w-full px-4 py-2 bg-gray-800 border ${formErrors['name.ar'] ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-orange-500`} required/>
                            {formErrors['name.ar'] && <p className="text-red-500 text-sm mt-1">{formErrors['name.ar']}</p>}
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Price</label>
                            <input type="number" step="0.01" value={newFood.price} onChange={(e) => setNewFood({ ...newFood, price: e.target.value })} className={`w-full px-4 py-2 bg-gray-800 border ${formErrors.price ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-orange-500`} required/>
                            {formErrors.price && <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>}
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Stock</label>
                            <input type="number" value={newFood.stock} onChange={(e) => setNewFood({ ...newFood, stock: e.target.value })} className={`w-full px-4 py-2 bg-gray-800 border ${formErrors.stock ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-orange-500`} required/>
                             {formErrors.stock && <p className="text-red-500 text-sm mt-1">{formErrors.stock}</p>}
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Image {isEditing && "(Leave blank to keep current)"}</label>
                            <input type="file" onChange={(e) => setNewFood({ ...newFood, image: e.target.files[0] })} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700"/>
                             {formErrors.image && <p className="text-red-500 text-sm mt-1">{formErrors.image}</p>}
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-gray-300 mb-1">Description (EN)</label>
                             <textarea value={newFood.description.en} onChange={(e) => setNewFood({...newFood, description: {...newFood.description, en: e.target.value}})} rows="3" className={`w-full px-4 py-2 bg-gray-800 border ${formErrors['description.en'] ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-orange-500`}></textarea>
                              {formErrors['description.en'] && <p className="text-red-500 text-sm mt-1">{formErrors['description.en']}</p>}
                        </div>
                         <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-gray-300 mb-1">Description (AR)</label>
                             <textarea value={newFood.description.ar} onChange={(e) => setNewFood({...newFood, description: {...newFood.description, ar: e.target.value}})} rows="3" className={`w-full px-4 py-2 bg-gray-800 border ${formErrors['description.ar'] ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-orange-500`}></textarea>
                            {formErrors['description.ar'] && <p className="text-red-500 text-sm mt-1">{formErrors['description.ar']}</p>}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-3">
                        <button type="submit" className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">{isEditing ? 'Update' : 'Add'}</button>
                        <button type="button" onClick={() => isEditing ? setIsEditModalOpen(false) : setIsAddModalOpen(false)} className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Cancel</button>
                    </div>
                </form>
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
                        <h1 className="text-xl md:text-4xl font-bold">Food <span className="text-orange-500">Management</span></h1>
                        <p className="text-xs md:text-base text-gray-400 mt-2">Manage your restaurant's food items.</p>
                    </header>
                    <div className="mb-4 flex justify-center md:justify-end">
                        <button onClick={openAddModal} className="w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-200">
                            <FaPlus size={14} /> Add New Food
                        </button>
                    </div>
                </div>

                {isAddModalOpen && renderModal(false)}
                {isEditModalOpen && renderModal(true)}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl shadow-lg max-w-sm w-full border border-white/10">
                            <h2 className="text-lg font-semibold mb-4 text-orange-500">Confirm Deletion</h2>
                            <p className="text-gray-300 mb-6">Are you sure you want to delete this food item?</p>
                            <div className="flex gap-3">
                                <button onClick={handleDeleteFood} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Yes, Delete</button>
                                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* --- 2. Scrollable Content Area --- */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-8">
                    <div className="hidden md:block bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg">
                        <div className="overflow-x-auto rounded-xl">
                            <table className="min-w-full">
                                <thead className="bg-white/10 sticky top-0 z-10">
                                    <tr>
                                        {['ID', 'Image', 'Name', 'Price', 'Stock', 'Actions'].map(h => <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {foods.map(food => (
                                        <tr key={food.food_id} className="hover:bg-white/5">
                                            <td className="py-3 px-4 text-gray-300">{food.food_id}</td>
                                            <td className="py-3 px-4"><img src={`http://127.0.0.1:8000${food.image_url}`} alt={food.name.en} className="w-12 h-12 object-cover rounded-md"/></td>
                                            <td className="py-3 px-4 text-gray-300">{food.name.en}</td>
                                            <td className="py-3 px-4 text-gray-300">{food.price}</td>
                                            <td className="py-3 px-4 text-gray-300">{food.stock}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-2">
                                                    <button onClick={() => openEditModal(food)} className="p-2 bg-gray-700 text-white rounded-md hover:bg-orange-600"><FaEdit/></button>
                                                    <button onClick={() => openDeleteModal(food.food_id)} className="p-2 bg-gray-700 text-white rounded-md hover:bg-red-600"><FaTrash/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="block md:hidden space-y-4">
                        {foods.map(food => (
                            <div key={food.food_id} className="bg-white/5 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/10">
                                <div className="flex items-start gap-4">
                                    <img src={`http://127.0.0.1:8000${food.image_url}`} alt={food.name.en} className="w-20 h-20 object-cover rounded-lg border-2 border-gray-700 flex-shrink-0"/>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white truncate">{food.name.en}</h3>
                                        <p className="text-sm text-gray-400 truncate">{food.name.ar}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-lg font-semibold text-orange-500">{food.price}</span>
                                            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">Stock: {food.stock}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end mt-4 border-t border-white/10 pt-3">
                                    <button onClick={() => openEditModal(food)} className="py-2 px-4 flex-1 bg-gray-700 text-white rounded-md hover:bg-orange-600 transition-colors duration-200 text-sm">Edit</button>
                                    <button onClick={() => openDeleteModal(food.food_id)} className="py-2 px-4 flex-1 bg-gray-700 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-sm">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {paginationMeta && paginationMeta.last_page > 1 && (
                        <div className="flex justify-center items-center mt-8 space-x-2 flex-wrap">
                            <button 
                                onClick={() => handlePageChange(paginationMeta.current_page - 1)} 
                                disabled={!paginationMeta.prev_page_url} 
                                className="p-2 disabled:opacity-50 hover:bg-neutral-800 rounded-full transition-colors"
                            >
                                <FaChevronLeft />
                            </button>
                            {paginationMeta.links.slice(1, -1).map(link => (
                                <button 
                                    key={link.label} 
                                    onClick={() => handlePageChange(Number(link.label))} 
                                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${link.active ? 'bg-orange-600 font-bold' : 'bg-neutral-800 hover:bg-neutral-700'}`}
                                >
                                    {link.label}
                                </button>
                            ))}
                            <button 
                                onClick={() => handlePageChange(paginationMeta.current_page + 1)} 
                                disabled={!paginationMeta.next_page_url} 
                                className="p-2 disabled:opacity-50 hover:bg-neutral-800 rounded-full transition-colors"
                            >
                                <FaChevronRight />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Foods;