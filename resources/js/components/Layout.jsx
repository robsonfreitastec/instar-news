import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path 
      ? 'text-white border-b-4 border-instar-primary font-semibold' 
      : 'text-gray-400 hover:text-white border-b-4 border-transparent hover:border-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-black text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
                <img
                  src="/logo.svg"
                  alt="InstarNews"
                  className="h-10 w-auto"
                />
                <span className="text-xl font-bold tracking-tight">InstarNews</span>
              </Link>
              <div className="flex space-x-1 h-16">
                <Link
                  to="/"
                  className={`flex items-center px-4 h-full text-sm font-medium transition-all duration-200 ${isActive('/')}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/news"
                  className={`flex items-center px-4 h-full text-sm font-medium transition-all duration-200 ${isActive('/news')}`}
                >
                  Notícias
                </Link>
                {user?.is_super_admin && (
                  <>
                    <Link
                      to="/tenants"
                      className={`flex items-center px-4 h-full text-sm font-medium transition-all duration-200 ${isActive('/tenants')}`}
                    >
                      Tenants
                    </Link>
                    <Link
                      to="/users"
                      className={`flex items-center px-4 h-full text-sm font-medium transition-all duration-200 ${isActive('/users')}`}
                    >
                      Usuários
                    </Link>
                    <Link
                      to="/logs"
                      className={`flex items-center px-4 h-full text-sm font-medium transition-all duration-200 ${isActive('/logs')}`}
                    >
                      Logs
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 text-sm font-medium text-gray-300 border-r border-gray-700 pr-4">
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{user?.name}</span>
                </div>
                <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-600 text-white">
                  {user?.is_super_admin ? 'Super Admin' : 'Usuário'}
                </span>
              </div>
              <button
                onClick={logout}
                className="bg-instar-primary hover:bg-instar-primary-dark text-white px-6 py-2 rounded-md text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="w-full">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

