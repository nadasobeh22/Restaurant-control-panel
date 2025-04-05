import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../Components/Sidebar/Sidebar.jsx';
import { useNavigate } from 'react-router-dom';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generalError, setGeneralError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchReservations();
  }, [token]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const fetchReservations = async () => {
    if (!token) {
      setGeneralError('Please log in first');
      navigate('/');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/api/admin/reservations/show', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });

      if (response.data.status === 'success') {
        setReservations(response.data.data);
        applyFilter(response.data.data, filterStatus);
        setGeneralError(null);
      } else {
        setGeneralError(response.data.message || 'Failed to fetch reservations');
      }
    } catch (err) {
      setGeneralError(err.response?.data?.message || 'Server connection error');
      if (err.response?.status === 401) navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (data, status) => {
    if (status === 'all') {
      setFilteredReservations(data);
    } else {
      setFilteredReservations(data.filter(res => res.status === status));
    }
  };

  const handleFilterChange = (e) => {
    const newFilter = e.target.value;
    setFilterStatus(newFilter);
    applyFilter(reservations, newFilter);
  };

  const handleEditReservation = (reservation) => {
    setEditingReservation({ ...reservation });
    setIsEditModalOpen(true);
    setErrors({});
  };

  const handleUpdateReservation = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const response = await axios.patch(
        `http://127.0.0.1:8000/api/admin/reservations/update-status/${editingReservation.reservation_id}`,
        { status: editingReservation.status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (response.data.status === 'success') {
        const updatedReservations = reservations.map((res) =>
          res.reservation_id === editingReservation.reservation_id ? { ...res, status: editingReservation.status } : res
        );
        setReservations(updatedReservations);
        applyFilter(updatedReservations, filterStatus);
        setIsEditModalOpen(false);
        setEditingReservation(null);
        setErrors({});
        setGeneralError(null);
        setSuccessMessage(response.data.message || 'Reservation updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setGeneralError(response.data.message || 'Failed to update reservation');
      }
    } catch (err) {
      const errorResponse = err.response?.data;
      if (errorResponse?.errors) {
        const formattedErrors = {};
        Object.keys(errorResponse.errors).forEach(key => {
          formattedErrors[key] = errorResponse.errors[key][0];
        });
        setErrors(formattedErrors);
      } else {
        setGeneralError(errorResponse?.message || 'Server connection error');
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6 text-yellow-300">
          Reservations Management
        </h1>

        {loading && (
          <div className="text-center text-gray-400 mb-4">
            <p>Loading reservations...</p>
          </div>
        )}

        {generalError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center text-sm sm:text-base break-words">
            {generalError}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center text-sm sm:text-base break-words">
            {successMessage}
          </div>
        )}

        {!loading && !generalError && (
          <>
            <div className="mb-6">
              <label className="text-gray-300 mr-2">Filter by Status:</label>
              <select
                value={filterStatus}
                onChange={handleFilterChange}
                className="p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="all">All</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-800 rounded-2xl shadow-lg text-xs sm:text-sm">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="py-2 px-2 sm:px-3 lg:px-4 text-left font-semibold">ID</th>
                    <th className="py-2 px-2 sm:px-3 lg:px-4 text-left font-semibold">People</th>
                    <th className="py-2 px-2 sm:px-3 lg:px-4 text-left font-semibold">Time</th>
                    <th className="py-2 px-2 sm:px-3 lg:px-4 text-left font-semibold hidden sm:table-cell">Request</th>
                    <th className="py-2 px-2 sm:px-3 lg:px-4 text-left font-semibold">Status</th>
                    <th className="py-2 px-2 sm:px-3 lg:px-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-3 px-4 text-center text-gray-400">
                        No reservations available
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map((reservation) => (
                      <tr
                        key={reservation.reservation_id}
                        className="hover:bg-gray-700 transition-all duration-200"
                      >
                        <td className="py-2 px-2 sm:px-3 lg:px-4 text-gray-300">{reservation.reservation_id}</td>
                        <td className="py-2 px-2 sm:px-3 lg:px-4 text-gray-300">{reservation.num_people}</td>
                        <td className="py-2 px-2 sm:px-3 lg:px-4 text-gray-300 whitespace-nowrap">{reservation.reservation_time}</td>
                        <td className="py-2 px-2 sm:px-3 lg:px-4 text-gray-300 hidden sm:table-cell">
                          {reservation.special_request || 'N/A'}
                        </td>
                        <td className="py-2 px-2 sm:px-3 lg:px-4 text-gray-300">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              reservation.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {reservation.status || 'Processing'}
                          </span>
                        </td>
                        <td className="py-2 px-2 sm:px-3 lg:px-4 flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleEditReservation(reservation)}
                            className="py-1 px-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-all duration-200 text-xs sm:text-sm"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg max-w-lg w-full">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-yellow-300">Edit Reservation</h2>
              <form onSubmit={handleUpdateReservation} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <select
                    value={editingReservation.status || 'processing'}
                    onChange={(e) => setEditingReservation({ ...editingReservation, status: e.target.value })}
                    className={`w-full px-4 py-2 bg-gray-700 border ${errors['status'] ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                  >
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                  </select>
                  {errors['status'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['status']}</p>
                  )}
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
                      setEditingReservation(null);
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
      </div>
    </div>
  );
};

export default Reservations;