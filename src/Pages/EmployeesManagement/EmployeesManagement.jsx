import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../Components/Sidebar/Sidebar.jsx';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';

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
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const fetchEmployees = async () => {
    if (!token) {
      setGeneralError('Please log in first. No token found in localStorage.');
      return;
    }

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/admin/employees/show', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });

      if (response.data.status === 'success') {
        setEmployees(response.data.data);
        setGeneralError(null);
      } else {
        setGeneralError(response.data.message || 'Failed to fetch employees');
      }
    } catch (err) {
      setGeneralError(err.response?.data?.message || 'Server connection error');
    }
  };

  const handleAddOrUpdateEmployee = async (e, isEdit = false) => {
    e.preventDefault();
    if (!token) {
      setGeneralError('Please log in first. No token found in localStorage.');
      return;
    }

    const url = isEdit
      ? `http://127.0.0.1:8000/api/admin/employees/update/${editingEmployee.id}`
      : 'http://127.0.0.1:8000/api/admin/employees/add';
    const method = isEdit ? 'patch' : 'post';

    try {
      const response = await axios({
        method,
        url,
        data: newEmployee,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      });

      if (response.data.status === 'success') {
        await fetchEmployees();
        setNewEmployee({ name: '', phone: '', position: '', salary: '', hire_date: '' });
        setEditingEmployee(null);
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setErrors({});
        setGeneralError(null);
        setSuccessMessage(response.data.message || (isEdit ? 'Employee updated successfully' : 'Employee added successfully'));
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setGeneralError(response.data.message || 'Failed to save employee');
      }
    } catch (err) {
      const errorResponse = err.response?.data;
      if (errorResponse?.errors) {
        setErrors(errorResponse.errors); // تعيين الأخطاء التفصيلية كما هي من الـ API
      } else {
        setGeneralError(errorResponse?.message || 'Server connection error');
      }
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setNewEmployee({
      name: employee.name,
      phone: employee.phone,
      position: employee.position,
      salary: employee.salary,
      hire_date: employee.hire_date,
    });
    setIsEditModalOpen(true);
    setErrors({});
  };

  const handleDeleteEmployee = async () => {
    if (!token) {
      setGeneralError('Please log in first. No token found in localStorage.');
      return;
    }

    try {
      const response = await axios.delete(
        `http://127.0.0.1:8000/api/admin/employees/delete/${employeeToDelete}`,
        {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        }
      );

      if (response.data.status === 'success') {
        setEmployees(employees.filter((emp) => emp.id !== employeeToDelete));
        setGeneralError(null);
        setSuccessMessage(response.data.message || 'Employee deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        setIsDeleteModalOpen(false);
        setEmployeeToDelete(null);
      } else {
        setGeneralError(response.data.message || 'Failed to delete employee');
      }
    } catch (err) {
      setGeneralError(err.response?.data?.message || 'Server connection error');
      setIsDeleteModalOpen(false);
    }
  };

  const confirmDeleteEmployee = (id) => {
    setEmployeeToDelete(id);
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
          <h1 className="text-2xl md:text-3xl font-bold text-center text-yellow-300">Employees Management</h1>
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

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
            {successMessage}
          </div>
        )}

        <div className="mb-8">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200"
          >
            Add Employee
          </button>
        </div>

        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg max-w-lg w-full">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-yellow-300">Add Employee</h2>
              <form onSubmit={handleAddOrUpdateEmployee} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    className={`w-full px-4 py-2 bg-gray-700 border ${errors.name ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                    required
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    className={`w-full px-4 py-2 bg-gray-700 border ${errors.phone ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                    required
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone[0]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Position</label>
                  <select
                    value={newEmployee.position}
                    onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                    className={`w-full px-4 py-2 bg-gray-700 border ${errors.position ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                    required
                  >
                    <option value="">Select Position</option>
                    <option value="Chef">Chef</option>
                    <option value="Waiter">Waiter</option>
                    <option value="Cashier">Cashier</option>
                  </select>
                  {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position[0]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Salary</label>
                  <input
                    type="number"
                    value={newEmployee.salary}
                    onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                    className={`w-full px-4 py-2 bg-gray-700 border ${errors.salary ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                    required
                  />
                  {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary[0]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Hire Date</label>
                  <input
                    type="date"
                    value={newEmployee.hire_date}
                    onChange={(e) => setNewEmployee({ ...newEmployee, hire_date: e.target.value })}
                    className={`w-full px-4 py-2 bg-gray-700 border ${errors.hire_date ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                    required
                  />
                  {errors.hire_date && <p className="text-red-500 text-sm mt-1">{errors.hire_date[0]}</p>}
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
                      setNewEmployee({ name: '', phone: '', position: '', salary: '', hire_date: '' });
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
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-yellow-300">Edit Employee</h2>
              <form onSubmit={(e) => handleAddOrUpdateEmployee(e, true)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    className={`w-full px-4 py-2 bg-gray-700 border ${errors.name ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                    required
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    className={`w-full px-4 py-2 bg-gray-700 border ${errors.phone ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                    required
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone[0]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Position</label>
                  <select
                    value={newEmployee.position}
                    onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                    className={`w-full px-4 py-2 bg-gray-700 border ${errors.position ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                    required
                  >
                    <option value="">Select Position</option>
                    <option value="Chef">Chef</option>
                    <option value="Waiter">Waiter</option>
                    <option value="Cashier">Cashier</option>
                  </select>
                  {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position[0]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Salary</label>
                  <input
                    type="number"
                    value={newEmployee.salary}
                    onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                    className={`w-full px-4 py-2 bg-gray-700 border ${errors.salary ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                    required
                  />
                  {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary[0]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Hire Date</label>
                  <input
                    type="date"
                    value={newEmployee.hire_date}
                    onChange={(e) => setNewEmployee({ ...newEmployee, hire_date: e.target.value })}
                    className={`w-full px-4 py-2 bg-gray-700 border ${errors.hire_date ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                    required
                  />
                  {errors.hire_date && <p className="text-red-500 text-sm mt-1">{errors.hire_date[0]}</p>}
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
                      setNewEmployee({ name: '', phone: '', position: '', salary: '', hire_date: '' });
                      setEditingEmployee(null);
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
              <p className="text-gray-300 mb-4">Are you sure you want to delete this employee?</p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteEmployee}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setEmployeeToDelete(null);
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
                  <th className="py-3 px-4 text-left text-sm font-semibold min-w-[120px]">Phone</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold min-w-[100px]">Salary</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold min-w-[120px]">Hire Date</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold min-w-[100px]">Position</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold min-w-[140px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-3 px-4 text-center text-gray-400">No employees available</td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-700 transition-all duration-200">
                      <td className="py-2 px-4 text-gray-300 truncate">{employee.id}</td>
                      <td className="py-2 px-4 text-gray-300 truncate">{employee.name}</td>
                      <td className="py-2 px-4 text-gray-300 truncate">{employee.phone}</td>
                      <td className="py-2 px-4 text-gray-300 truncate">{employee.salary}</td>
                      <td className="py-2 px-4 text-gray-300 truncate">{employee.hire_date}</td>
                      <td className="py-2 px-4 text-gray-300 truncate">{employee.position}</td>
                      <td className="py-2 px-4 flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className="py-1 px-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-all duration-200 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDeleteEmployee(employee.id)}
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
            {employees.length === 0 ? (
              <p className="text-center text-gray-400">No employees available</p>
            ) : (
              employees.map((employee) => (
                <div key={employee.id} className="p-4 bg-gray-700 rounded-lg shadow-lg">
                  <div className="space-y-2">
                    <p className="text-gray-300 text-sm"><strong>ID:</strong> {employee.id}</p>
                    <p className="text-gray-300 text-sm"><strong>Name:</strong> {employee.name}</p>
                    <p className="text-gray-300 text-sm"><strong>Phone:</strong> {employee.phone}</p>
                    <p className="text-gray-300 text-sm"><strong>Salary:</strong> {employee.salary}</p>
                    <p className="text-gray-300 text-sm"><strong>Hire Date:</strong> {employee.hire_date}</p>
                    <p className="text-gray-300 text-sm"><strong>Position:</strong> {employee.position}</p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleEditEmployee(employee)}
                      className="flex-1 py-1 px-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-all duration-200 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDeleteEmployee(employee.id)}
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

export default EmployeesManagement;