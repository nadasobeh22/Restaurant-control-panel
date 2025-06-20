import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../../Components/Sidebar/Sidebar.jsx';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';

const EmployeesManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        phone: '',
        position: '',
        salary: '',
        hire_date: '',
    });
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [generalError, setGeneralError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const token = localStorage.getItem('token');
    const API_BASE_URL = 'http://127.0.0.1:8000/api/admin';

    const fetchEmployees = useCallback(async ( ) => {
        if (!token) return;
        try {
            const response = await axios.get(`${API_BASE_URL}/employees/show`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setEmployees(response.data.data || []);
        } catch (error) {
            setGeneralError(error.response?.data?.message || 'Failed to fetch employees');
        }
    }, [token]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const resetForm = () => {
        setNewEmployee({ name: '', phone: '', position: '', salary: '', hire_date: '' });
        setEditingEmployee(null);
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

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        setFormErrors({});
        setGeneralError(null);
        try {
            await axios.post(`${API_BASE_URL}/employees/add`, newEmployee, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            fetchEmployees();
            setIsAddModalOpen(false);
            resetForm();
        } catch (error) {
            handleError(error);
        }
    };

    const handleUpdateEmployee = async (e) => {
        e.preventDefault();
        if (!editingEmployee) return;
        setFormErrors({});
        setGeneralError(null);
        try {
            await axios.patch(`${API_BASE_URL}/employees/update/${editingEmployee.id}`, newEmployee, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            fetchEmployees();
            setIsEditModalOpen(false);
            resetForm();
        } catch (error) {
            handleError(error);
        }
    };

    const handleDeleteEmployee = async () => {
        if (!employeeToDelete) return;
        try {
            await axios.delete(`${API_BASE_URL}/employees/delete/${employeeToDelete}`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            fetchEmployees();
            setIsDeleteModalOpen(false);
            setEmployeeToDelete(null);
        } catch (error) {
            setGeneralError(error.response?.data?.message || 'Failed to delete employee');
        }
    };

    const openEditModal = (employee) => {
        resetForm();
        setEditingEmployee(employee);
        setNewEmployee({
            name: employee.name || '',
            phone: employee.phone || '',
            position: employee.position || '',
            salary: employee.salary || '',
            hire_date: employee.hire_date || '',
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (id) => {
        setEmployeeToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const renderFormFields = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input 
                    type="text" 
                    value={newEmployee.name} 
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })} 
                    required 
                    className={`w-full px-4 py-2 bg-gray-800 border ${formErrors.name ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:ring-2 focus:ring-orange-500`} 
                />
                {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                <input 
                    type="text" 
                    value={newEmployee.phone} 
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })} 
                    required 
                    className={`w-full px-4 py-2 bg-gray-800 border ${formErrors.phone ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:ring-2 focus:ring-orange-500`} 
                />
                {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Position</label>
                <select 
                    value={newEmployee.position} 
                    onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })} 
                    required 
                    className={`w-full px-4 py-2 bg-gray-800 border ${formErrors.position ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:ring-2 focus:ring-orange-500`}
                >
                    <option value="">Select Position</option>
                    <option value="Chef">Chef</option>
                    <option value="Waiter">Waiter</option>
                    <option value="Cashier">Cashier</option>
                </select>
                {formErrors.position && <p className="text-red-500 text-sm mt-1">{formErrors.position}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Salary</label>
                <input 
                    type="number" 
                    value={newEmployee.salary} 
                    onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })} 
                    required 
                    min="0" 
                    step="0.01" 
                    className={`w-full px-4 py-2 bg-gray-800 border ${formErrors.salary ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:ring-2 focus:ring-orange-500`} 
                />
                {formErrors.salary && <p className="text-red-500 text-sm mt-1">{formErrors.salary}</p>}
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">Hire Date</label>
                <input 
                    type="date" 
                    value={newEmployee.hire_date} 
                    onChange={(e) => setNewEmployee({ ...newEmployee, hire_date: e.target.value })} 
                    required 
                    className={`w-full px-4 py-2 bg-gray-800 border ${formErrors.hire_date ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:ring-2 focus:ring-orange-500`} 
                />
                {formErrors.hire_date && <p className="text-red-500 text-sm mt-1">{formErrors.hire_date}</p>}
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-black text-white">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="flex-1 p-4 sm:p-6 lg:p-8 md:pl-20 lg:pl-8 transition-all duration-300 lg:ml-64">
                <header className="mb-8 text-center">
                    <h1 className="text-xl md:text-4xl font-bold">Employees <span className="text-orange-500">Management</span></h1>
                    <p className="text-xs md:text-base text-gray-400 mt-2">Manage restaurant employees and their information.</p>
                </header>

                <div className="mb-6 flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <button 
                        onClick={() => { resetForm(); setIsAddModalOpen(true); }} 
                        className="w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                        <FaPlus size={14} /> Add New Employee
                    </button>
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
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">Phone</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">Position</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">Salary</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">Hire Date</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {employees.map(emp => (
                                    <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4 text-sm text-gray-300">{emp.id}</td>
                                        <td className="py-3 px-4 text-sm text-white">{emp.name || 'N/A'}</td>
                                        <td className="py-3 px-4 text-sm text-gray-300">{emp.phone || 'N/A'}</td>
                                        <td className="py-3 px-4 text-sm text-orange-400">{emp.position || 'N/A'}</td>
                                        <td className="py-3 px-4 text-sm text-green-400">${emp.salary || '0'}</td>
                                        <td className="py-3 px-4 text-sm text-gray-300">{emp.hire_date || 'N/A'}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => openEditModal(emp)} className="p-1 text-gray-400 hover:text-orange-500 transition-colors">
                                                    <FaEdit size={14} />
                                                </button>
                                                <button onClick={() => openDeleteModal(emp.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                                                    <FaTrash size={14} />
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
                    {employees.map(emp => (
                        <div key={emp.id} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-white font-medium">{emp.name || 'N/A'}</h3>
                                    <p className="text-gray-400 text-sm">ID: {emp.id}</p>
                                </div>
                                <span className="px-2 py-1 text-xs rounded-full bg-orange-900/50 text-orange-300">
                                    {emp.position || 'N/A'}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                <div>
                                    <span className="text-gray-400">Phone:</span>
                                    <span className="text-gray-300 ml-1">{emp.phone || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Salary:</span>
                                    <span className="text-green-400 ml-1">${emp.salary || '0'}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-400">Hire Date:</span>
                                    <span className="text-gray-300 ml-1">{emp.hire_date || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => openEditModal(emp)} className="p-2 text-gray-400 hover:text-orange-500 transition-colors">
                                    <FaEdit size={16} />
                                </button>
                                <button onClick={() => openDeleteModal(emp.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                    <FaTrash size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Employee Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-900 rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-white">Add New Employee</h2>
                                    <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                        <FaTimes size={20} />
                                    </button>
                                </div>
                                {generalError && <div className="mb-4 p-3 bg-red-900/50 border-l-4 border-red-500 text-red-200 rounded-lg">{generalError}</div>}
                                <form onSubmit={handleAddEmployee}>
                                    {renderFormFields()}
                                    <div className="flex justify-end gap-3 mt-6">
                                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                                            Cancel
                                        </button>
                                        <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                                            Add Employee
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Employee Modal */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-900 rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-white">Edit Employee</h2>
                                    <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                        <FaTimes size={20} />
                                    </button>
                                </div>
                                {generalError && <div className="mb-4 p-3 bg-red-900/50 border-l-4 border-red-500 text-red-200 rounded-lg">{generalError}</div>}
                                <form onSubmit={handleUpdateEmployee}>
                                    {renderFormFields()}
                                    <div className="flex justify-end gap-3 mt-6">
                                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                                            Cancel
                                        </button>
                                        <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                                            Update Employee
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-900 rounded-xl border border-white/10 w-full max-w-md">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-white">Confirm Delete</h2>
                                    <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                        <FaTimes size={20} />
                                    </button>
                                </div>
                                <p className="text-gray-300 mb-6">Are you sure you want to delete this employee? This action cannot be undone.</p>
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={handleDeleteEmployee} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                        Delete
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

export default EmployeesManagement;