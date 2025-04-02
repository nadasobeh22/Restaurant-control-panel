import React from 'react';

const OrderTable = ({ data, onUpdateStatus, onViewDetails }) => {
  return (
    <div className="w-full">
      {/* عرض الجدول على الشاشات الكبيرة */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-2xl shadow-lg">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold">Order ID</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Phone</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Total</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">After Discount</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Payment</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Status</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-4 px-4 text-center text-gray-400 text-sm">
                  No orders found.
                </td>
              </tr>
            ) : (
              data.map((order) => (
                <tr key={order.order_id} className="hover:bg-gray-700 transition-all duration-200 border-b border-gray-700">
                  <td className="py-3 px-4 text-gray-300 text-sm">{order.order_id}</td>
                  <td className="py-3 px-4 text-gray-300 text-sm">{order.phone_number}</td>
                  <td className="py-3 px-4 text-gray-300 text-sm">{order.price}</td>
                  <td className="py-3 px-4 text-gray-300 text-sm">{order.price_after_discounts}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <select
                      onChange={(e) => onUpdateStatus(order.order_id, e.target.value)}
                      value={order.order_status}
                      className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs md:text-sm"
                    >
                      <option value="processing">Processing</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <button
                      onClick={() => onViewDetails(order.order_id)}
                      className="bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition-all duration-200 text-xs md:text-sm"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* عرض البطاقات على الشاشات الصغيرة */}
      <div className="lg:hidden space-y-4">
        {data.length === 0 ? (
          <div className="text-center text-gray-400 py-4">No orders found.</div>
        ) : (
          data.map((order) => (
            <div key={order.order_id} className="bg-gray-800 rounded-lg p-4 shadow-lg">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-gray-400 text-xs">Order ID</p>
                  <p className="text-gray-300 text-sm">{order.order_id}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Phone</p>
                  <p className="text-gray-300 text-sm">{order.phone_number}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Total</p>
                  <p className="text-gray-300 text-sm">{order.price}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">After Discount</p>
                  <p className="text-gray-300 text-sm">{order.price_after_discounts}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Payment</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.payment_status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Status</p>
                  <select
                    onChange={(e) => onUpdateStatus(order.order_id, e.target.value)}
                    value={order.order_status}
                    className="w-full p-1 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs"
                  >
                    <option value="processing">Processing</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => onViewDetails(order.order_id)}
                className="w-full bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200 text-sm"
              >
                View Details
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderTable;