import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../Components/Sidebar/Sidebar.jsx';
import OrderTable from '../../Components/OrderTable/OrderTable.jsx';
import { useNavigate } from 'react-router-dom';
import { FaSyncAlt, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [generalError, setGeneralError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const API_BASE_URL = 'http://127.0.0.1:8000/api/admin';

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem('token');
        navigate('/');
        return;
      }
    } catch (err) {
      localStorage.removeItem('token');
      navigate('/');
      return;
    }

    fetchOrders();
  }, [token, navigate]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    setGeneralError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/show`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });

      if (response.data.status === 'success') {
        setOrders(response.data.data);
      } else {
        setGeneralError(response.data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setGeneralError(err.response?.data?.message || 'Server connection error');
      if (err.response?.status === 401) navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/orders/update-status/${id}`,
        { order_status: status },
        {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
        }
      );

      if (response.data.status === 'success') {
        setOrders(
          orders.map((order) =>
            order.order_id === id ? { ...order, order_status: status } : order
          )
        );
      } else {
        setGeneralError(response.data.message || 'Failed to update order status');
      }
    } catch (err) {
      setGeneralError(err.response?.data?.message || 'Error updating order status');
    }
  };

  const viewOrderDetails = async (id) => {
    setGeneralError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/details/${id}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });

      if (response.data.status === 'success') {
        const selectedOrderData = orders.find((order) => order.order_id === id);
        setOrderDetails({
          ...selectedOrderData,
          items: response.data.data.map((item) => {
            let imageUrl = null;
            if (item.food?.image_url) {
              let normalizedPath = item.food.image_url.replace(/\\/g, '/');
              const uploadKeyword = '/upload/';
              const uploadIndex = normalizedPath.indexOf(uploadKeyword);
              if (uploadIndex !== -1) {
                let relativePath = normalizedPath.substring(uploadIndex);
                imageUrl = `http://127.0.0.1:8000${relativePath}`;
              }
            }
            return {
              name: item.food?.name || 'Unnamed Item',
              quantity: item.quantity,
              price: item.price,
              price_after_discounts: item.price_after_discounts,
              image_url: imageUrl,
            };
          }),
        });
        setSelectedOrder(id);
      } else {
        setGeneralError(response.data.message || 'Failed to fetch order details');
      }
    } catch (err) {
      setGeneralError(err.response?.data?.message || 'Error fetching order details');
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;
    return matchesStatus && matchesPayment;
  });

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* زر الهامبرغر الثابت */}
      {!isLargeScreen && !isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 p-2 sm:p-3 rounded-full z-50 transition-all duration-300 bg-orange-600 text-white hover:bg-orange-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 md:ml-20 lg:ml-64">
        <header className="mb-8 text-center">
          <h1 className="text-xl md:text-4xl font-bold">Orders <span className="text-orange-500">Management</span></h1>
          <p className="text-xs md:text-base text-gray-400 mt-2">Manage customer orders and their status.</p>
        </header>

        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="block text-sm font-medium text-gray-300">Filter by Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All</option>
                <option value="processing">Processing</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="block text-sm font-medium text-gray-300">Filter by Payment:</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4 w-full sm:w-auto justify-end">
            <button
              onClick={fetchOrders}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-200"
            >
              <FaSyncAlt size={14} />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
            >
              <FaSignOutAlt size={14} />
              Logout
            </button>
          </div>
        </div>

        {generalError && (
          <div className="mb-4 p-3 bg-red-900/50 border-l-4 border-red-500 text-red-200 rounded-lg text-center" onClick={() => setGeneralError(null)}>
            {generalError}
          </div>
        )}

        {isLoading ? (
          <div className="text-center text-gray-400">Loading orders...</div>
        ) : (
          <div>
            <p className="text-gray-400 mb-2">Orders count: {filteredOrders.length}</p>
            <OrderTable
              data={filteredOrders}
              onUpdateStatus={updateOrderStatus}
              onViewDetails={viewOrderDetails}
            />
          </div>
        )}

        {selectedOrder && orderDetails && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Order #{selectedOrder} Details</h2>
                  <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white transition-colors">
                    <FaTimes size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm md:text-base">
                  <div>
                    <p className="block text-sm font-medium text-gray-300 mb-1">Phone:</p>
                    <p className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">{orderDetails.phone_number}</p>
                  </div>
                  <div>
                    <p className="block text-sm font-medium text-gray-300 mb-1">Total Price:</p>
                    <p className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">${orderDetails.price}</p>
                  </div>
                  <div>
                    <p className="block text-sm font-medium text-gray-300 mb-1">Price After Discounts:</p>
                    <p className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">${orderDetails.price_after_discounts}</p>
                  </div>
                  <div>
                    <p className="block text-sm font-medium text-gray-300 mb-1">Payment Status:</p>
                    <p className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">{orderDetails.payment_status}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="block text-sm font-medium text-gray-300 mb-1">Order Status:</p>
                    <p className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">{orderDetails.order_status}</p>
                  </div>
                </div>
                <h3 className="text-base md:text-lg font-semibold mt-6 text-gray-300">Items:</h3>
                {orderDetails.items && orderDetails.items.length > 0 ? (
                  <ul className="space-y-3 mt-2">
                    {orderDetails.items.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => (e.target.src = 'https://via.placeholder.com/64')}
                          />
                        )}
                        <div>
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                          <p className="text-gray-400 text-sm">Price: <span className="text-green-400">${item.price}</span></p>
                          <p className="text-gray-400 text-sm">Discounted Price: <span className="text-orange-400">${item.price_after_discounts}</span></p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm mt-2">No items available</p>
                )}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setSelectedOrder(null)}
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

export default Orders;
