import React, { useState } from 'react';

const EmployeeForm = ({ onSubmit, initialData = {}, onCancel }) => {
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      name: e.target.name.value,
      phone: e.target.phone.value,
      position: e.target.position.value,
      salary: e.target.salary.value,
      hire_date: e.target.hire_date.value,
    };

    onSubmit(formData, (errorData) => {
      if (errorData) {
        setErrors(errorData);
      } else {
        setErrors({});
        if (!initialData.id) e.target.reset();
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 p-2 sm:p-4 md:p-6 bg-gray-800 rounded-xl shadow-lg w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto"
    >
      <h2 className="text-sm sm:text-base md:text-lg font-semibold text-yellow-300 mb-2 text-center">
        {initialData.id ? 'Update Employee' : 'Add Employee'}
      </h2>
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-300">Name</label>
        <input
          type="text"
          name="name"
          defaultValue={initialData.name || ''}
          className="w-full px-2 py-1 text-xs sm:text-sm border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
        {errors.name && <p className="text-red-500 text-xs">{errors.name[0]}</p>}
      </div>
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-300">Phone</label>
        <input
          type="text"
          name="phone"
          defaultValue={initialData.phone || ''}
          className="w-full px-2 py-1 text-xs sm:text-sm border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
        {errors.phone && <p className="text-red-500 text-xs">{errors.phone[0]}</p>}
      </div>
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-300">Position</label>
        <input
          type="text"
          name="position"
          defaultValue={initialData.position || ''}
          className="w-full px-2 py-1 text-xs sm:text-sm border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
        {errors.position && <p className="text-red-500 text-xs">{errors.position[0]}</p>}
      </div>
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-300">Salary</label>
        <input
          type="number"
          name="salary"
          defaultValue={initialData.salary || ''}
          className="w-full px-2 py-1 text-xs sm:text-sm border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
        {errors.salary && <p className="text-red-500 text-xs">{errors.salary[0]}</p>}
      </div>
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-300">Hire Date</label>
        <input
          type="date"
          name="hire_date"
          defaultValue={initialData.hire_date || ''}
          className="w-full px-2 py-1 text-xs sm:text-sm border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
        {errors.hire_date && <p className="text-red-500 text-xs">{errors.hire_date[0]}</p>}
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200 text-xs sm:text-sm"
        >
          {initialData.id ? 'Update Employee' : 'Add Employee'}
        </button>
        {initialData.id && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-gray-600 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 text-xs sm:text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default EmployeeForm;