import React from 'react';

const DiscountTable = ({ type, data, onDelete, onEdit, onViewFoods, language = 'en' }) => {
  return (
    <div className="p-2 sm:p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-2xl shadow-lg w-full">
        {data.length === 0 ? (
          <div className="p-2 sm:p-3 text-center text-gray-400 text-xs sm:text-sm">
            No discounts available
          </div>
        ) : (
          <div className="grid gap-2 sm:table sm:w-full">
            <div className="hidden sm:table-header-group bg-indigo-600 text-white">
              <div className="sm:table-row">
                <div className="sm:table-cell py-1 sm:py-2 px-2 text-left text-xs font-semibold">ID</div>
                <div className="sm:table-cell py-1 sm:py-2 px-2 text-left text-xs font-semibold">Name</div>
                {type === 'code' && (
                  <div className="sm:table-cell py-1 sm:py-2 px-2 text-left text-xs font-semibold">Code</div>
                )}
                <div className="sm:table-cell py-1 sm:py-2 px-2 text-left text-xs font-semibold">Value</div>
                <div className="sm:table-cell py-1 sm:py-2 px-2 text-left text-xs font-semibold">Start Date</div>
                <div className="sm:table-cell py-1 sm:py-2 px-2 text-left text-xs font-semibold">End Date</div>
                <div className="sm:table-cell py-1 sm:py-2 px-2 text-left text-xs font-semibold">Status</div>
                <div className="sm:table-cell py-1 sm:py-2 px-2 text-left text-xs font-semibold">Actions</div>
              </div>
            </div>
            <div className="grid gap-2 sm:table-row-group">
              {data.map((discount) => (
                <div
                  key={discount.id}
                  className="flex flex-col sm:table-row border-b border-gray-600 p-2 sm:p-0 hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className="sm:table-cell sm:py-2 sm:px-2 text-gray-300 text-xs">
                    <span className="sm:hidden font-semibold">ID: </span>
                    {discount.id}
                  </div>
                  <div className="sm:table-cell sm:py-2 sm:px-2 text-gray-300 text-xs">
                    <span className="sm:hidden font-semibold">Name: </span>
                    {discount.name && typeof discount.name === 'object' ? discount.name[language] : discount.name || 'N/A'}
                  </div>
                  {type === 'code' && (
                    <div className="sm:table-cell sm:py-2 sm:px-2 text-gray-300 text-xs">
                      <span className="sm:hidden font-semibold">Code: </span>
                      {discount.code || 'N/A'}
                    </div>
                  )}
                  <div className="sm:table-cell sm:py-2 sm:px-2 text-gray-300 text-xs">
                    <span className="sm:hidden font-semibold">Value: </span>
                    {discount.value} %
                  </div>
                  <div className="sm:table-cell sm:py-2 sm:px-2 text-gray-300 text-xs">
                    <span className="sm:hidden font-semibold">Start Date: </span>
                    {discount.start_date}
                  </div>
                  <div className="sm:table-cell sm:py-2 sm:px-2 text-gray-300 text-xs">
                    <span className="sm:hidden font-semibold">End Date: </span>
                    {discount.end_date}
                  </div>
                  <div className="sm:table-cell sm:py-2 sm:px-2 text-xs">
                    <span className="sm:hidden font-semibold">Status: </span>
                    <span
                      className={`px-1 sm:px-2 py-1 rounded-full text-xs font-medium ${
                        discount.is_active ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}
                    >
                      {discount.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="sm:table-cell sm:py-2 sm:px-2 text-xs">
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      <button
                        onClick={() => onEdit(discount)}
                        className="bg-indigo-600 text-white px-1 sm:px-2 py-1 rounded hover:bg-indigo-700 transition-colors duration-200 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onViewFoods(discount.id)}
                        className="bg-yellow-600 text-white px-1 sm:px-2 py-1 rounded hover:bg-yellow-700 transition-colors duration-200 text-xs"
                      >
                        View Foods
                      </button>
                      <button
                        onClick={() => onDelete(discount.id)}
                        className="bg-red-600 text-white px-1 sm:px-2 py-1 rounded hover:bg-red-700 transition-colors duration-200 text-xs"
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
  );
};

export default DiscountTable;