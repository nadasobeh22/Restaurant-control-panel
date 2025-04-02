import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../Components/Sidebar/Sidebar.jsx';
import OrderTable from '../../Components/OrderTable/OrderTable.jsx';
import { useNavigate } from 'react-router-dom';
import { FaSyncAlt, FaSignOutAlt } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

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
    setError(null);
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/admin/orders/show', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });

      if (response.data.status === 'success') {
        setOrders(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server connection error');
      if (err.response?.status === 401) navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const response = await axios.patch(
        `http://127.0.0.1:8000/api/admin/orders/update-status/${id}`,
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
        setError(response.data.message || 'Failed to update order status');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating order status');
    }
  };

  const viewOrderDetails = async (id) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/admin/orders/details/${id}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });

      if (response.data.status === 'success') {
        const selectedOrderData = orders.find((order) => order.order_id === id);
        setOrderDetails({
          ...selectedOrderData,
          items: response.data.data.map((item) => ({
            name: item.food?.name || 'Unnamed Item',
            quantity: item.quantity,
            price: item.price,
            price_after_discounts: item.price_after_discounts,
            image_url: item.food?.image_url
              ? `http://127.0.0.1:8000${item.food.image_url}`
              : null,
          })),
        });
        setSelectedOrder(id);
      } else {
        setError(response.data.message || 'Failed to fetch order details');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching order details');
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;
    return matchesStatus && matchesPayment;
  });

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 p-4 lg:p-6 lg:ml-64">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-yellow-300">Orders Management</h1>
          <button
            onClick={handleLogout}
            className="mt-4 sm:mt-0 flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-all duration-200"
          >
            <FaSignOutAlt size={16} />
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="mb-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-gray-300 text-sm md:text-base">Filter by Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="all">All</option>
                <option value="processing">Processing</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-gray-300 text-sm md:text-base">Filter by Payment:</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full sm:w-auto p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200"
          >
            <FaSyncAlt size={16} />
            Refresh
          </button>
        </div>

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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 p-4 md:p-6 rounded-2xl shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
              <h2 className="text-lg md:text-xl font-bold mb-4 text-yellow-300">Order #{selectedOrder} Details</h2>
              <div className="space-y-2 text-sm md:text-base">
                <p className="text-gray-300"><strong>Phone:</strong> {orderDetails.phone_number}</p>
                <p className="text-gray-300"><strong>Total Price:</strong> {orderDetails.price}</p>
                <p className="text-gray-300"><strong>Price After Discounts:</strong> {orderDetails.price_after_discounts}</p>
                <p className="text-gray-300"><strong>Payment Status:</strong> {orderDetails.payment_status}</p>
                <p className="text-gray-300"><strong>Order Status:</strong> {orderDetails.order_status}</p>
              </div>
              <h3 className="text-base md:text-lg font-semibold mt-4 text-gray-300">Items:</h3>
              {orderDetails.items && orderDetails.items.length > 0 ? (
                <ul className="space-y-3 mt-2">
                  {orderDetails.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 p-2 bg-gray-700 rounded-lg">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => (e.target.src = 'https://via.placeholder.com/48')}
                        />
                      )}
                      <div>
                        <p className="text-gray-300 font-medium">{item.name}</p>
                        <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                        <p className="text-gray-400 text-sm">Price: {item.price}</p>
                        <p className="text-gray-400 text-sm">Discounted Price: {item.price_after_discounts}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No items available</p>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;