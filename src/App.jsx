import { Routes, Route } from 'react-router-dom';
import Login from './Pages/Login/Login';
import Register from './Pages/Register/Register';
import Dashboard from './Pages/Dashboard/Dashboard';
import Orders from './Pages/Orders/Orders';
import Foods from './Pages/Foods/Foods';
import Categories from './Pages/Categories/Categories';
import Reservations from './Pages/Reservations/Reservations';
import DiscountsManagement from './Pages/DiscountsManagement/DiscountsManagement';
import EmployeesManagement from './Pages/EmployeesManagement/EmployeesManagement';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900">
      <Routes>
        <Route path="/" element={<Login />} /> {/* الصفحة الافتراضية هي Login */}
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/foods" element={<Foods />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/discounts" element={<DiscountsManagement />} />
        <Route path="/employees" element={<EmployeesManagement />} />
        <Route path="*" element={<Login />} /> {/* أي مسار غير موجود يعود لـ Login */}
      </Routes>
    </div>
  );
}

export default App;