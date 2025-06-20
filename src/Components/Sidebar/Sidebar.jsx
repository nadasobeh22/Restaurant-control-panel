import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const largeScreen = window.innerWidth >= 1024;
      setIsLargeScreen(largeScreen);
      if (largeScreen && isOpen) {
        toggleSidebar();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, toggleSidebar]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/orders', label: 'Orders' },
    { to: '/foods', label: 'Foods' },
    { to: '/categories', label: 'Categories' },
    { to: '/reservations', label: 'Reservations' },
    { to: '/discounts', label: 'Discounts' },
    { to: '/employees', label: 'Employees' },
  ];

  const sidebarClasses = isLargeScreen
    ? 'translate-x-0'
    : isOpen
    ? 'translate-x-0'
    : '-translate-x-full';

  return (
    <>
      {!isLargeScreen && !isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 p-2 sm:p-3 rounded-full z-50 transition-all duration-300 bg-orange-600  text-white hover:bg-orange-700"
        >
          <FaBars size={16} className="sm:w-5 sm:h-5" />
        </button>
      )}

      {/* The only change is here: added border-r and border-gray-800 */}
      <div
        className={`w-64 min-h-screen bg-black p-4 sm:p-6 fixed top-0 left-0 overflow-y-auto z-50 shadow-lg transition-transform duration-300 ease-in-out border-r border-gray-800 ${sidebarClasses}`}
      >
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-orange-500 animate-fade-in">
            Admin Panel
          </h2>
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-orange-500 transition-colors duration-200 hover:text-orange-400"
          >
            <FaTimes size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>
        <nav className="space-y-2">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className="block py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium text-sm sm:text-base text-gray-300 hover:bg-orange-600 hover:text-white transition-colors duration-200"
              onClick={() => {
                if (window.innerWidth < 1024) toggleSidebar();
              }}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full block py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium text-sm sm:text-base text-gray-300 hover:bg-orange-600 hover:text-white transition-colors duration-200 text-left"
          >
            Logout
          </button>
        </nav>
      </div>

      {isOpen && !isLargeScreen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;