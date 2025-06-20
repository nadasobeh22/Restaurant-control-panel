import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../../Components/Sidebar/Sidebar.jsx';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaUserFriends, FaClock, FaCalendarCheck, FaTimes } from 'react-icons/fa';

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

    const applyFilter = useCallback((data, status) => {
        if (status === 'all') {
            setFilteredReservations(data);
        } else {
            setFilteredReservations(data.filter(res => res.status === status));
        }
    }, []);

    const fetchReservations = useCallback(async () => {
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
                const sortedData = response.data.data.sort((a, b) => new Date(b.reservation_time) - new Date(a.reservation_time));
                setReservations(sortedData);
                applyFilter(sortedData, filterStatus);
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
    }, [token, navigate, applyFilter, filterStatus]);

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
        if (!token || !editingReservation) return;

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
                setErrors(errorResponse.errors);
            } else {
                setGeneralError(errorResponse?.message || 'Server connection error');
            }
        }
    };

    const formatDateTime = (dateTimeString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
        return new Date(dateTimeString).toLocaleString('en-US', options);
    };

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content Area: Now a flex column */}
            <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 md:pl-20 lg:pl-8 transition-all duration-300 lg:ml-64">
                
                {/* --- 1. Fixed Header Area (Not scrollable) --- */}
                <div>
                    <header className="mb-4 text-center">
                        <h1 className="text-xl md:text-4xl font-bold">Reservations <span className="text-orange-500">Management</span></h1>
                        <p className="text-xs md:text-base text-gray-400 mt-2">View and manage customer reservations.</p>
                    </header>
                    <div className="mb-6 flex justify-center md:justify-start">
                        <label className="text-gray-300 mr-3 self-center">Filter by Status:</label>
                        <select
                            value={filterStatus}
                            onChange={handleFilterChange}
                            className="p-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        >
                            <option value="all">All</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>

                {/* --- 2. Scrollable Content Area --- */}
                <div className="flex-1 overflow-y-auto pb-8">
                    {loading && <div className="text-center text-gray-400 my-8">Loading reservations...</div>}
                    {generalError && <div className="mb-4 p-3 bg-red-900/50 border-l-4 border-red-500 text-red-200 rounded-lg text-center">{generalError}</div>}
                    {successMessage && <div className="mb-4 p-3 bg-green-900/50 border-l-4 border-green-500 text-green-200 rounded-lg text-center">{successMessage}</div>}

                    {!loading && (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg">
                                <div className="overflow-x-auto rounded-xl">
                                    <table className="min-w-full">
                                        <thead className="bg-white/10 sticky top-0 z-10">
                                            <tr>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">ID</th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">People</th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">Date & Time</th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">Request</th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {filteredReservations.length === 0 ? (
                                                <tr><td colSpan="6" className="py-8 px-4 text-center text-gray-500">No reservations found for this filter.</td></tr>
                                            ) : (
                                                filteredReservations.map((reservation) => (
                                                    <tr key={reservation.reservation_id} className="hover:bg-white/5 transition-colors duration-200">
                                                        <td className="py-3 px-4 text-gray-300">{reservation.reservation_id}</td>
                                                        <td className="py-3 px-4 text-gray-300">{reservation.num_people}</td>
                                                        <td className="py-3 px-4 text-gray-300 whitespace-nowrap">{formatDateTime(reservation.reservation_time)}</td>
                                                        <td className="py-3 px-4 text-gray-300 max-w-xs truncate">{reservation.special_request || 'N/A'}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${reservation.status === 'completed' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'}`}>
                                                                {reservation.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <button onClick={() => handleEditReservation(reservation)} className="p-1 text-gray-400 hover:text-orange-500 transition-colors">
                                                                <FaEdit size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Mobile Card View */}
                            <div className="block md:hidden space-y-4">
                                {filteredReservations.length === 0 ? (
                                    <p className="text-center text-gray-500 mt-8">No reservations found for this filter.</p>
                                ) : (
                                    filteredReservations.map((reservation) => (
                                        <div key={reservation.reservation_id} className="bg-white/5 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/10">
                                            <div className="flex items-center gap-4">
                                                <div className="text-orange-400"><FaCalendarCheck size={32}/></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <FaUserFriends className="text-gray-400"/>
                                                        <span>{reservation.num_people} People</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <FaClock/>
                                                        <span>{formatDateTime(reservation.reservation_time)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${reservation.status === 'completed' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'}`}>
                                                        {reservation.status}
                                                    </span>
                                                    <button onClick={() => handleEditReservation(reservation)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-orange-500 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                                                        <FaEdit size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            {reservation.special_request && (
                                                <div className="mt-3 pt-3 border-t border-white/10 text-sm text-gray-300">
                                                    <strong>Request:</strong> {reservation.special_request}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {isEditModalOpen && editingReservation && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-xl border border-white/10 w-full max-w-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Edit Reservation Status</h2>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                    <FaTimes size={20}/>
                                </button>
                            </div>
                            <form onSubmit={handleUpdateReservation} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                                    <select
                                        value={editingReservation.status || 'processing'}
                                        onChange={(e) => setEditingReservation({ ...editingReservation, status: e.target.value })}
                                        className={`w-full px-4 py-2 bg-gray-800 border ${errors.status ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:outline-none`}
                                    >
                                        <option value="processing">Processing</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                    {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status[0]}</p>}
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">Update Status</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reservations;