import React from 'react';

const OrderTable = ({ data, onUpdateStatus, onViewDetails }) => {
  return (
    <div className="w-full">
      {/* عرض الجدول على الشاشات الكبيرة */}
      <div className="hidden md:block bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg">
        <div className="overflow-x-auto overflow-y-auto max-h-96 rounded-xl">
          <table className="min-w-full">
            <thead className="bg-white/10 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">Order ID</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">Phone</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">Total</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">After Discount</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">Payment</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 px-4 text-center text-gray-400 text-sm">
                    No orders found.
                  </td>
                </tr>
              ) : (
                data.map((order) => (
                  <tr key={order.order_id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-300">{order.order_id}</td>
                    <td className="py-3 px-4 text-sm text-white">{order.phone_number}</td>
                    <td className="py-3 px-4 text-sm text-green-400">${order.price}</td>
                    <td className="py-3 px-4 text-sm text-orange-400">${order.price_after_discounts}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.payment_status === 'paid' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <select
                        onChange={(e) => onUpdateStatus(order.order_id, e.target.value)}
                        value={order.order_status}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-orange-500 text-xs md:text-sm"
                      >
                        <option value="processing">Processing</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onViewDetails(order.order_id)}
                          className="p-1 text-gray-400 hover:text-orange-500 transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* عرض البطاقات على الشاشات الصغيرة */}
      <div className="md:hidden space-y-4 max-h-96 overflow-y-auto">
        {data.length === 0 ? (
          <div className="text-center text-gray-400 py-4">No orders found.</div>
        ) : (
          data.map((order) => (
            <div key={order.order_id} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-white font-medium">Order ID: {order.order_id}</h3>
                  <p className="text-gray-400 text-sm">Phone: {order.phone_number}</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-orange-900/50 text-orange-300">
                  {order.order_status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span className="text-gray-400">Total:</span>
                  <span className="text-green-400 ml-1">${order.price}</span>
                </div>
                <div>
                  <span className="text-gray-400">After Discount:</span>
                  <span className="text-orange-400 ml-1">${order.price_after_discounts}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400">Payment:</span>
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                    order.payment_status === 'paid' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'
                  }`}>
                    {order.payment_status}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center gap-2 mt-3">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status:</label>
                  <select
                    onChange={(e) => onUpdateStatus(order.order_id, e.target.value)}
                    value={order.order_status}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-orange-500 text-xs"
                  >
                    <option value="processing">Processing</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
                <div className="w-1/2 flex justify-end">
                  <button
                    onClick={() => onViewDetails(order.order_id)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderTable;
