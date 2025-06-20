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
        localStorage.setItem('token', response.data.data.authorization.token);
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
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 bg-transparent backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-white">
          Admin <span className="text-orange-500">Register</span>
        </h2>

        {Object.keys(errors).length > 0 && (
          <div className="p-4 bg-red-900/50 border border-red-500/40 text-red-200 rounded-lg text-sm space-y-1">
            {Object.entries(errors).map(([field, msg], i) => (
              <p key={i}>{msg}</p>
            ))}
          </div>
        )}

        {message && (
          <div className="p-4 bg-green-900/50 border border-green-500/40 text-green-200 rounded-lg text-sm">
            {message}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1 bg-transparent">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            className={`w-full px-4 py-3 bg-black/40 text-white border ${errors.name ? 'border-red-500' : 'border-white/10'} rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1 bg-transparent">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className={`w-full px-4 py-3 bg-black/40 text-white border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1 bg-transparent">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className={`w-full px-4 py-3 bg-black/40 text-white border ${errors.password ? 'border-red-500' : 'border-white/10'} rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500`}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors focus:ring-4 focus:ring-orange-500/50 disabled:opacity-60"
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;
