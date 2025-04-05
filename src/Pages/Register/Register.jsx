import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as Yup from 'yup';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = 'http://127.0.0.1:8000/api/admin/register';

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setErrors({});

    try {
      await validationSchema.validate(formData, { abortEarly: false });

      const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.data.status === 'success') {
        const token = response.data.data.authorization.token;
        localStorage.setItem('token', token);
        setMessage('Registration successful! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setMessage(response.data.message || 'Registration failed');
        if (response.data.errors) setErrors(response.data.errors);
      }
    } catch (validationErrors) {
      if (validationErrors.inner) {
        const formattedErrors = {};
        validationErrors.inner.forEach((error) => {
          formattedErrors[error.path] = error.message;
        });
        setErrors(formattedErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-gray-900 to-indigo-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-6 sm:p-8 bg-white rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105"
      >
        <h2 className="text-3xl font-extrabold text-center text-indigo-600 mb-8 animate-fade-in-down">Register</h2>
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-600 text-red-800 rounded-lg animate-fade-in">
            {Object.entries(errors).map(([field, msg], index) => (
              <p key={index} className="text-sm">{msg}</p>
            ))}
          </div>
        )}
        {message && (
          <p className="mb-6 p-4 bg-green-100 border-l-4 border-green-600 text-green-800 rounded-lg animate-fade-in">
            {message}
          </p>
        )}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300`}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300`}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300`}
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full mt-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-300 focus:ring-4 focus:ring-indigo-400 focus:ring-opacity-50 disabled:opacity-60 animate-pulse-on-hover"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-3 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Registering...
            </div>
          ) : (
            'Register'
          )}
        </button>
      </form>
    </div>
  );
};

export default Register;