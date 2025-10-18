import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewsList from './pages/NewsList';
import NewsForm from './pages/NewsForm';
import TenantsList from './pages/TenantsList';
import TenantDetail from './pages/TenantDetail';
import ActivityLogs from './pages/ActivityLogs';
import UsersList from './pages/UsersList';
import UserForm from './pages/UserForm';
import Layout from './components/Layout';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-instar-primary"></div>
          <div className="mt-4 text-xl text-gray-700">Carregando...</div>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
}

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="news" element={<NewsList />} />
        <Route path="news/new" element={<NewsForm />} />
        <Route path="news/edit/:uuid" element={<NewsForm />} />
        <Route path="tenants" element={<TenantsList />} />
        <Route path="tenants/:uuid" element={<TenantDetail />} />
        <Route path="users" element={<UsersList />} />
        <Route path="users/new" element={<UserForm />} />
        <Route path="users/edit/:uuid" element={<UserForm />} />
        <Route path="logs" element={<ActivityLogs />} />
      </Route>
    </Routes>
  );
}

export default App;

