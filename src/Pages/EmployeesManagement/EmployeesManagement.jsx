import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../Components/Sidebar/Sidebar.jsx';
import EmployeeForm from '../../Components/EmployeeForm/EmployeeForm.jsx';
import { useNavigate } from 'react-router-dom';
import { FaSyncAlt, FaSignOutAlt } from 'react-icons/fa';

const EmployeesManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const fetchEmployees = async () => {
    if (!token) {
      setError('Please log in first. No token found in localStorage.');
      navigate('/');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/admin/employees/show', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });

      if (response.data.status === 'success') {
        setEmployees(response.data.data);
        setError(null);
      } else {
        setError('Failed to fetch employees: ' + response.data.message);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError('Unauthorized: Invalid or expired token. Please log in again.');
          localStorage.removeItem('token');
          navigate('/');
        } else if (err.response.status === 403) {
          setError('Forbidden: You do not have permission to view employees.');
        } else {
          setError(err.response.data?.message || 'Failed to fetch employees.');
        }
      } else {
        setError('Network error: Unable to connect to the server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addOrUpdateEmployee = (employeeData, setErrorCallback) => {
    if (!token) {
      setError('Please log in first. No token found in localStorage.');
      return;
    }

    const url = editingEmployee
      ? `http://127.0.0.1:8000/api/admin/employees/update/${editingEmployee.id}`
      : 'http://127.0.0.1:8000/api/admin/employees/add';
    const method = editingEmployee ? 'patch' : 'post';

    axios({
      method,
      url,
      data: employeeData,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    })
      .then((response) => {
        if (response.data.status === 'success') {
          if (editingEmployee) {
            setEmployees(employees.map((emp) => (emp.id === editingEmployee.id ? response.data.data : emp)));
            alert('Employee updated successfully');
            setEditingEmployee(null);
          } else {
            setEmployees([...employees, response.data.data]);
            alert('Employee added successfully');
          }
          setErrorCallback(null);
        } else {
          setErrorCallback(response.data.data);
          alert('Failed to save employee: ' + response.data.message);
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 422) {
          setErrorCallback(error.response.data.data);
        } else {
          alert('Error saving employee: ' + error.message);
        }
      });
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
  };

  const deleteEmployee = (id) => {
    if (!token) {
      setError('Please log in first. No token found in localStorage.');
      return;
    }

    axios
      .delete(`http://127.0.0.1:8000/api/admin/employees/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      })
      .then((response) => {
        if (response.data.status === 'success') {
          setEmployees(employees.filter((emp) => emp.id !== id));
          alert('Employee deleted successfully');
        } else {
          alert('Failed to delete employee: ' + response.data.message);
        }
      })
      .catch((error) => alert('Error deleting employee: ' + error.message));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 p-2 sm:p-4 md:p-6 lg:ml-64">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-3 sm:mb-6 gap-2">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-center text-yellow-300">
            Employees Management
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg hover:bg-red-700 transition-all duration-200 text-xs sm:text-sm"
          >
            <FaSignOutAlt size={12} />
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center text-xs sm:text-sm">
            {error}
          </div>
        )}

        <div className="mb-4 sm:mb-6">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold mb-2 text-yellow-300 text-center">
            {editingEmployee ? 'Edit Employee' : 'Add Employee'}
          </h2>
          <EmployeeForm
            onSubmit={addOrUpdateEmployee}
            initialData={editingEmployee || {}}
            onCancel={() => setEditingEmployee(null)}
          />
        </div>

        <div>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-2">
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-yellow-300">
              Employees List
            </h2>
            <button
              onClick={fetchEmployees}
              className="flex items-center gap-1 bg-indigo-600 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200 text-xs sm:text-sm"
            >
              <FaSyncAlt size={12} />
              Refresh
            </button>
          </div>
          {isLoading ? (
            <div className="text-center text-gray-300 text-xs sm:text-sm">Loading employees...</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-full bg-gray-800 rounded-xl shadow-lg">
                {/* Responsive Table */}
                {employees.length === 0 ? (
                  <div className="p-3 text-center text-gray-400 text-xs sm:text-sm">
                    No employees available. Please add a new employee.
                  </div>
                ) : (
                  <div className="grid gap-2 sm:table sm:w-full">
                    <div className="hidden sm:table-header-group bg-indigo-600 text-white">
                      <div className="sm:table-row">
                        <div className="sm:table-cell py-2 px-2 font-semibold">ID</div>
                        <div className="sm:table-cell py-2 px-2 font-semibold">Name</div>
                        <div className="sm:table-cell py-2 px-2 font-semibold">Phone</div>
                        <div className="sm:table-cell py-2 px-2 font-semibold">Salary</div>
                        <div className="sm:table-cell py-2 px-2 font-semibold">Hire Date</div>
                        <div className="sm:table-cell py-2 px-2 font-semibold">Position</div>
                        <div className="sm:table-cell py-2 px-2 font-semibold">Actions</div>
                      </div>
                    </div>
                    <div className="grid gap-2 sm:table-row-group">
                      {employees.map((employee) => (
                        <div
                          key={employee.id}
                          className="sm:table-row flex flex-col sm:flex-row border-b border-gray-600 p-2 sm:p-0 hover:bg-gray-700 transition-all duration-200"
                        >
                          <div className="sm:table-cell sm:py-2 sm:px-2 text-gray-300">
                            <span className="sm:hidden font-semibold text-xs">ID: </span>
                            {employee.id}
                          </div>
                          <div className="sm:table-cell sm:py-2 sm:px-2 text-gray-300">
                            <span className="sm:hidden font-semibold text-xs">Name: </span>
                            {employee.name}
                          </div>
                          <div className="sm:table-cell sm:py-2 sm:px-2 text-gray-300">
                            <span className="sm:hidden font-semibold text-xs">Phone: </span>
                            {employee.phone}
                          </div>
                          <div className="sm:table-cell sm:py-2 sm:px-2 text-gray-300">
                            <span className="sm:hidden font-semibold text-xs">Salary: </span>
                            {employee.salary}
                          </div>
                          <div className="sm:table-cell sm:py-2 sm:px-2 text-gray-300">
                            <span className="sm:hidden font-semibold text-xs">Hire Date: </span>
                            {employee.hire_date}
                          </div>
                          <div className="sm:table-cell sm:py-2 sm:px-2 text-gray-300">
                            <span className="sm:hidden font-semibold text-xs">Position: </span>
                            {employee.position}
                          </div>
                          <div className="sm:table-cell sm:py-2 sm:px-2">
                            <div className="flex gap-1 sm:gap-2">
                              <button
                                onClick={() => handleEditEmployee(employee)}
                                className="bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 transition-all duration-200 text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteEmployee(employee.id)}
                                className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-all duration-200 text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeesManagement;