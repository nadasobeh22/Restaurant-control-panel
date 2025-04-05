import React from 'react';

const DiscountTable = ({ type, data, onEdit, onDelete, onViewFoods }) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow-lg">
      <table className="w-full bg-gray-800 text-[8px] xs:text-[10px] sm:text-xs md:text-sm">
        <thead className="bg-indigo-600 text-white">
          <tr>
            <th className="px-1 xs:px-1.5 sm:px-2 md:px-3 py-0.5 xs:py-1 sm:py-1.5 md:py-2 text-left font-semibold">ID</th>
            <th className="px-1 xs:px-1.5 sm:px-2 md:px-3 py-0.5 xs:py-1 sm:py-1.5 md:py-2 text-left font-semibold">Name</th>
            {type === 'code' && (
              <th className="px-1 xs:px-1.5 sm:px-2 md:px-3 py-0.5 xs:py-1 sm:py-1.5 md:py-2 text-left font-semibold">Code</th>
            )}
            <th className="px-1 xs:px-1.5 sm:px-2 md:px-3 py-0.5 xs:py-1 sm:py-1.5 md:py-2 text-left font-semibold">Value</th>
            <th className="px-1 xs:px-1.5 sm:px-2 md:px-3 py-0.5 xs:py-1 sm:py-1.5 md:py-2 text-left font-semibold">Start</th>
            <th className="px-1 xs:px-1.5 sm:px-2 md:px-3 py-0.5 xs:py-1 sm:py-1.5 md:py-2 text-left font-semibold">End</th>
            <th className="px-1 xs:px-1.5 sm:px-2 md:px-3 py-0.5 xs:py-1 sm:py-1.5 md:py-2 text-left font-semibold">Status</th>
            <th className="px-1 xs:px-1.5 sm:px-2 md:px-3 py-0.5 xs:py-1 sm:py-1.5 md:py-2 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={type === 'code' ? 8 : 7}
                className="px-1 xs:px-1.5 sm:px-2 md:px-3 py-1 xs:py-1.5 sm:py-2 md:py-3 text-center text-gray-400"
              >
                No discounts available
              </td>
            </tr>
          ) : (
            data.map((discount) => (
              <tr
                key={discount.id}
                className="border-t border-gray-700 hover:bg-gray-700 transition-all duration-150"
              >
                <td className="px-1 xs:px-1.5 sm:px-2 md:px-3 py-1 xs:py-1.5 sm:py-2 md:py-3">{discount.id}</td>
                <td className="px-1 xs:px-1.5 sm:px-2 md:px-3 py-1 xs:py-1.5 sm:py-2 md:py-3 max-w-[60px] xs:max-w-[80px] sm:max-w-[100px] md:max-w-[150px] truncate">
                  {discount.name?.en || discount.name || 'N/A'}
                </td>
                {type === 'code' && (
                  <td className="px-1 xs:px-1.5 sm:px-2 md:px-3 py-1 xs:py-1.5 sm:py-2 md:py-3">
                    {discount.code || 'N/A'}
                  </td>
                )}
                <td className="px-1 xs:px-1.5 sm:px-2 md:px-3 py-1 xs:py-1.5 sm:py-2 md:py-3">
                  {discount.value ? `${discount.value}%` : 'N/A'}
                </td>
                <td className="px-1 xs:px-1.5 sm:px-2 md:px-3 py-1 xs:py-1.5 sm:py-2 md:py-3">
                  {discount.start_date ? new Date(discount.start_date).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-1 xs:px-1.5 sm:px-2 md:px-3 py-1 xs:py-1.5 sm:py-2 md:py-3">
                  {discount.end_date ? new Date(discount.end_date).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-1 xs:px-1.5 sm:px-2 md:px-3 py-1 xs:py-1.5 sm:py-2 md:py-3">
                  <span
                    className={`px-0.5 xs:px-1 sm:px-1.5 py-0.25 xs:py-0.5 sm:py-1 rounded-full text-[8px] xs:text-[10px] sm:text-xs ${
                      discount.is_active ? 'bg-green-600' : 'bg-red-600'
                    }`}
                  >
                    {discount.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-1 xs:px-1.5 sm:px-2 md:px-3 py-1 xs:py-1.5 sm:py-2 md:py-3">
                  <div className="flex flex-col xs:flex-row gap-0.5 xs:gap-1 sm:gap-2">
                    <button
                      onClick={() => onEdit(discount)}
                      className="px-0.5 xs:px-1 sm:px-2 py-0.25 xs:py-0.5 sm:py-1 bg-indigo-600 rounded-lg hover:bg-indigo-700 text-[8px] xs:text-[10px] sm:text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onViewFoods(discount.id)}
                      className="px-0.5 xs:px-1 sm:px-2 py-0.25 xs:py-0.5 sm:py-1 bg-yellow-600 rounded-lg hover:bg-yellow-700 text-[8px] xs:text-[10px] sm:text-xs"
                    >
                      Foods
                    </button>
                    <button
                      onClick={() => onDelete(discount.id)}
                      className="px-0.5 xs:px-1 sm:px-2 py-0.25 xs:py-0.5 sm:py-1 bg-red-600 rounded-lg hover:bg-red-700 text-[8px] xs:text-[10px] sm:text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DiscountTable;