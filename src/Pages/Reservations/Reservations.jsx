import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../Components/Sidebar/Sidebar.jsx';
import { useNavigate } from 'react-router-dom';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchReservations();
  }, [token]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const fetchReservations = async () => {
    if (!token) {
      setError('Please log in first');
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
        setError(null);
      } else {
        setError(response.data.message || 'Failed to fetch reservations');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server connection error');
      if (err.response?.status === 401) navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (id, status) => {
    if (!token) {
      setError('Please log in first');
      return;
    }

    try {
      const response = await axios.patch(
        `http://127.0.0.1:8000/api/admin/reservations/update/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (response.data.status === 'success') {
        setReservations(
          reservations.map((res) =>
            res.reservation_id === id ? { ...res, status } : res
          )
        );
        setError(null);
      } else {
        setError(response.data.message || 'Failed to update reservation status');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating reservation status');
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64">
        {/* Header */}
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6 text-yellow-300">
          Reservations Management
        </h1>

        {/* Loading State */}
        {loading && (
          <div className="text-center text-gray-400 mb-4">
            <p>Loading reservations...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center text-sm sm:text-base break-words">
            {error}
          </div>
        )}

        {/* Reservations Table */}
        {!loading && !error && (
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
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-3 px-4 text-center text-gray-400">
                      No reservations available
                    </td>
                  </tr>
                ) : (
                  reservations.map((reservation) => (
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
                            reservation.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : reservation.status === 'canceled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {reservation.status || 'Processing'}
                        </span>
                      </td>
                      <td className="py-2 px-2 sm:px-3 lg:px-4">
                        <select
                          onChange={(e) => updateReservationStatus(reservation.reservation_id, e.target.value)}
                          value={reservation.status || 'processing'}
                          className="w-full p-1 sm:p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs sm:text-sm"
                        >
                          <option value="processing">Processing</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="canceled">Canceled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;