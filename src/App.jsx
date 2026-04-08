
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Farmer from './pages/Farmer';
import Intake from './pages/Intake';
import Sales from './pages/Sales';
import DirectSales from './pages/DirectSales';
import Accounts from './pages/Accounts';
import Payments from './pages/Payments';
import Buyer from './pages/Buyer';
import Reports from './pages/Reports';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="intake" element={<Intake />} />
          <Route path="sales" element={<Sales />} />
          <Route path="direct-sales" element={<DirectSales />} />
          <Route path="payments" element={<Payments />} />
          <Route path="farmer" element={<Farmer />} />
          <Route path="buyer" element={<Buyer />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
