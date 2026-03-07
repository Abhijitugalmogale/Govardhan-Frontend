import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Cows from './pages/Cows';
import Milk from './pages/Milk';
import Finance from './pages/Finance';
import Pregnancy from './pages/Pregnancy';

import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-gray-50 text-primary-dark font-bold text-xl">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <div className="font-sans text-text">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/cows" element={<ProtectedRoute><Layout><Cows /></Layout></ProtectedRoute>} />
          <Route path="/pregnancy" element={<ProtectedRoute><Layout><Pregnancy /></Layout></ProtectedRoute>} />
          <Route path="/milk" element={<ProtectedRoute><Layout><Milk /></Layout></ProtectedRoute>} />
          <Route path="/finance" element={<ProtectedRoute><Layout><Finance /></Layout></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer position="top-center" />
      </div>
    </Router>
  );
}

export default App;
