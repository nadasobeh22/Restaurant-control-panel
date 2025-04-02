import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

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

  return (
    <>
      {/* زر فتح الـ Sidebar (يظهر فقط على الشاشات الصغيرة عندما يكون الـ Sidebar مخفيًا) */}
      {!isLargeScreen && !isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 p-2 sm:p-3 rounded-full z-50 transition-all duration-300"
          style={{ backgroundColor: '#4F46E5', color: '#FFFFFF' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4338CA')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4F46E5')}
        >
          <FaBars size={16} className="sm:w-5 sm:h-5" />
        </button>
      )}

      {/* الـ Sidebar */}
      <div
        className="w-64 min-h-screen p-4 sm:p-6 fixed top-0 left-0 overflow-y-auto z-50 shadow-lg transition-all duration-300 ease-in-out"
        style={{
          backgroundColor: '#1F2937',
          display: isLargeScreen ? 'block' : isOpen ? 'block' : 'none',
        }}
      >
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h2
            className="text-xl sm:text-2xl font-bold animate-fade-in"
            style={{ color: '#FBBF24' }}
          >
            Admin Panel
          </h2>
          <button
            onClick={toggleSidebar}
            className="lg:hidden transition-all duration-200"
            style={{ color: '#FBBF24' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FACC15')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#FBBF24')}
          >
            <FaTimes size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>
        <nav className="space-y-2">
          {[
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/orders', label: 'Orders' },
            { to: '/foods', label: 'Foods' },
            { to: '/categories', label: 'Categories' },
            { to: '/reservations', label: 'Reservations' },
            { to: '/discounts', label: 'Discounts' },
            { to: '/employees', label: 'Employees' },
            { to: '/', label: 'Logout' },
          ].map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className="block py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base"
              style={{ color: '#D1D5DB' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4F46E5';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#D1D5DB';
              }}
              onClick={(e) => {
                if (item.label === 'Logout') {
                  localStorage.removeItem('token');
                }
                if (window.innerWidth < 1024) {
                  toggleSidebar();
                }
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* الخلفية (Overlay) عند فتح الـ Sidebar على الشاشات الصغيرة */}
      {isOpen && !isLargeScreen && (
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;