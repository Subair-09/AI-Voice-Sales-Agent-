import React, { useState, useEffect } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { BrandPanel } from './components/BrandPanel';
import { LoginCard } from './components/LoginCard';

export default function App() {
  const [view, setView] = useState<'dashboard' | 'login'>(() => {
    // Check URL query parameters or default to dashboard
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'login') return 'login';
    return 'dashboard';
  });

  const handleLoginSuccess = () => {
    setView('dashboard');
    window.history.pushState({}, '', '/');
  };

  const handleSignOut = () => {
    localStorage.removeItem('bbd_admin_token');
    localStorage.removeItem('bbd_admin_user');
    setView('login');
    window.history.pushState({}, '', '/?view=login');
  };

  const handleViewLogin = () => {
    setView('login');
    window.history.pushState({}, '', '/?view=login');
  };

  // If in login view, show the 50/50 Desktop Admin Login Screen
  if (view === 'login') {
    return (
      <div className="min-h-screen w-full bg-[#F8F4EC] flex flex-col lg:flex-row overflow-x-hidden font-sans">
        <BrandPanel />
        <LoginCard onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // Otherwise, render the primary approved Baked by Doja Admin Dashboard
  return (
    <AdminDashboard
      onSignOut={handleSignOut}
      onViewLogin={handleViewLogin}
    />
  );
}
