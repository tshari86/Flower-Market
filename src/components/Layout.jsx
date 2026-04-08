import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Tags,
  CreditCard,
  User,
  Users,
  FileText,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();

  const navItems = [
    { to: "/app/dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { to: "/app/intake", icon: <ShoppingCart size={18} />, label: "Flower Intake" },
    { to: "/app/sales", icon: <ShoppingBag size={18} />, label: "Sales" },
    { to: "/app/direct-sales", icon: <Tags size={18} />, label: "Direct Sales" },
    { to: "/app/payments", icon: <CreditCard size={18} />, label: "Payments" },
    { to: "/app/farmer", icon: <User size={18} />, label: "Farmer" },
    { to: "/app/buyer", icon: <Users size={18} />, label: "Buyer" },
    { to: "/app/accounts", icon: <FileText size={18} />, label: "Accounts" },
  ];

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  return (
    <div className="w-64 bg-white h-screen shadow-lg flex flex-col fixed left-0 top-0 z-10 font-medium">
      <div className="h-16 border-b flex items-center px-6 gap-3">
        <h1 className="font-bold text-xl text-blue-900">BloomControl</h1>
      </div>

      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-sm transition-all duration-200 border-l-4 ${isActive
                ? 'bg-blue-50 text-blue-600 border-blue-600'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 border-transparent'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-6 py-3 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 border-l-4 border-transparent mt-4"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
};

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
