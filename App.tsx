import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import ImagePage from './pages/ImagePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import { useAI } from './contexts/AIContext';
import Loader from './ui/Loader';
import LandingPage from './pages/LandingPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import AdminPasswordPage from './pages/AdminPasswordPage';
import ProfilePage from './pages/ProfilePage';
import LandingHeader from './components/layout/LandingHeader';
import Footer from './components/layout/Footer';

const AuthProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, authLoading } = useAI();
  const location = useLocation();

  if (authLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, authLoading, isAdminAuthenticated } = useAI();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader text="Verifying session..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdminAuthenticated) {
    return <AdminPasswordPage />;
  }

  return <>{children}</>;
};

const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, authLoading } = useAI();

    if (authLoading) {
        return null;
    }

    if (user) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}


const App: React.FC = () => {
  const { authLoading, user } = useAI();
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader text="Initializing ZARA AI..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans flex flex-col">
      {user ? <Header /> : <LandingHeader />}
      <main className="flex-grow">
        <Routes>
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><SignUpPage /></GuestRoute>} />
          
          <Route path="/" element={user ? <HomePage /> : <LandingPage />} />
          
          <Route path="/image/:id" element={<AuthProtectedRoute><ImagePage /></AuthProtectedRoute>} />
          <Route path="/admin" element={<AdminProtectedRoute><AdminPage /></AuthProtectedRoute>} />
          <Route path="/announcements" element={<AuthProtectedRoute><AnnouncementsPage /></AuthProtectedRoute>} />
          <Route path="/profile" element={<AuthProtectedRoute><ProfilePage /></AuthProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;