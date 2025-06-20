import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../Components/Sidebar/Sidebar.jsx';
import {
  FaShoppingCart,
  FaUtensils,
  FaThList,
  FaCalendarAlt,
  FaTags,
  FaUsers,
} from 'react-icons/fa';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    axios
      .get('http://127.0.0.1:8000/api/admin/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })
      .then((response) => {
        if (response.data.status === 'success') {
          setData(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          window.location.href = '/login';
        }
        setLoading(false);
      });
  }, []);

  const cardItems = [
    {
      title: 'Processing Orders',
      value: data?.['numbers of processing orders'],
      link: '/orders',
      icon: <FaShoppingCart size={20} />,
      description: 'Orders currently in progress',
    },
    {
      title: 'Total Foods',
      value: data?.['numbers of foods'],
      link: '/foods',
      icon: <FaUtensils size={20} />,
      description: 'Menu items available',
    },
    {
      title: 'Total Categories',
      value: data?.['numbers of categories'],
      link: '/categories',
      icon: <FaThList size={20} />,
      description: 'Food types listed',
    },
    {
      title: 'Processing Reservations',
      value: data?.['numbers of processing reservations'],
      link: '/reservations',
      icon: <FaCalendarAlt size={20} />,
      description: 'Upcoming reservations',
    },
    {
      title: 'Total Employees',
      value: data?.['numbers of employees'],
      link: '/employees',
      icon: <FaUsers size={20} />,
      description: 'Staff members added',
    },
    {
      title: 'Manage Discounts',
      value: 'Go to settings',
      link: '/discounts',
      icon: <FaTags size={20} />,
      description: 'Current discount options',
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center text-white">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 lg:ml-64">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              Dashboard <span className="text-orange-500">Overview</span>
            </h1>
            <p className="text-gray-400 mt-2 text-sm sm:text-base">
              A quick summary of your restaurant's current status.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {cardItems.map((item, index) => (
              <Link
                to={item.link}
                key={index}
                className="p-4 sm:p-5 rounded-xl transition-all duration-300 flex flex-col justify-between min-h-40 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-orange-500">{item.icon}</span>
                    <span className="text-sm sm:text-base font-semibold text-gray-300 break-words">
                      {item.title}
                    </span>
                  </div>
                  <p className={`mt-1 font-bold text-white ${
                    typeof item.value === 'string'
                      ? 'text-base sm:text-lg'
                      : 'text-2xl sm:text-3xl'
                  }`}>
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{item.description}</p>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-orange-500">
                  Manage &rarr;
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
