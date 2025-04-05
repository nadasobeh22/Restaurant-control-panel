import { Routes, Route } from 'react-router-dom';
import Login from './Pages/Login/Login';
import Dashboard from './Pages/Dashboard/Dashboard';
import Orders from './Pages/Orders/Orders';
import Foods from './Pages/Foods/Foods';
import Categories from './Pages/Categories/Categories';
import Reservations from './Pages/Reservations/Reservations';
import DiscountsManagement from './Pages/DiscountsManagement/DiscountsManagement';
import EmployeesManagement from './Pages/EmployeesManagement/EmployeesManagement';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/foods" element={<Foods />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/discounts" element={<DiscountsManagement />} />
        <Route path="/employees" element={<EmployeesManagement />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;