import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaUserShield, FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const API_URL = 'http://127.0.0.1:8000/api/admin/login';

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(API_URL, { email, password }, {
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.data.status === 'success') {
                const token = response.data.data.authorization.token;
                localStorage.setItem('token', token);
                navigate('/dashboard');
            } else {
                setError(response.data.message || 'Invalid email or password.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-black">
            <div className="w-full max-w-md p-8 space-y-8 bg-transparent backdrop-blur-lg rounded-2xl shadow-xl border border-white/10">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-600/20 mb-4 border border-orange-500/30">
                        <FaUserShield className="h-6 w-6 text-orange-500" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white">
                        Admin <span className="text-orange-500">Login</span>
                    </h2>
                </div>

                {error && (
                    <div className="p-3 bg-red-900/40 border border-red-500/50 text-red-200 rounded-lg text-center">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                                <FaEnvelope />
                            </span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-black text-gray-200 border border-gray-700 rounded-xl placeholder:text-gray-400 focus:ring-1 focus:ring-gray-500 transition-all"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                                <FaLock />
                            </span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-black text-gray-200 border border-gray-700 rounded-xl placeholder:text-gray-400 focus:ring-1 focus:ring-gray-500 transition-all"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors focus:ring-4 focus:ring-orange-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z" />
                                </svg>
                                <span>Loading...</span>
                            </div>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-sm text-gray-400">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="inline-block mt-2 text-orange-500 hover:text-orange-400 font-medium transition-colors"
                        >
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
