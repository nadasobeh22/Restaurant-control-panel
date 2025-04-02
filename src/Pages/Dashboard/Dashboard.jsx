import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../Components/Sidebar/Sidebar.jsx';

const Dashboard = () => {
  const [data, setData] = useState({
    "numbers of categories": 0,
    "numbers of foods": 0,
    "numbers of processing orders": 0,
    "numbers of processing reservations": 0,
    "numbers of employees": 0,
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }
    axios
      .get('http://127.0.0.1:8000/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      })
      .then((response) => {
        if (response.data.status === 'success') setData(response.data.data);
      })
      .catch((error) => {
        if (error.response?.status === 401) window.location.href = '/';
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 p-6 lg:ml-64">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-yellow-300">Dashboard Overview</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Orders', value: data["numbers of processing orders"], link: '/orders' },
            { title: 'Foods', value: data["numbers of foods"], link: '/foods' },
            { title: 'Categories', value: data["numbers of categories"], link: '/categories' },
            { title: 'Reservations', value: data["numbers of processing reservations"], link: '/reservations' },
            { title: 'Discounts', value: 'Manage Discounts', link: '/discounts' },
            { title: 'Employees', value: data["numbers of employees"], link: '/employees' },
          ].map((item, index) => (
            <div
              key={index}
              className="p-6 bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <h2 className="text-lg md:text-xl font-semibold text-yellow-300">{item.title}</h2>
              <p className="mt-2 text-gray-300">{item.value}</p>
              <Link
                to={item.link}
                className="mt-4 inline-block text-indigo-400 hover:text-indigo-300 transition-all duration-200"
              >
                Manage {item.title}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;