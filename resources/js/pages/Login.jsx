import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Falha no login. Verifique suas credenciais e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center mb-8">
            <img
              src="/logo-white.png"
              alt="InstarNews"
              className="h-24 w-auto"
            />
          </div>
          <h2 className="mt-2 text-center text-2xl font-bold text-gray-800">
            Sistema de Notícias
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Entre com sua conta
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Endereço de email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-instar-primary focus:border-instar-primary focus:z-10 sm:text-sm"
                placeholder="Endereço de email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-instar-primary focus:border-instar-primary focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          <div className="text-sm text-center text-gray-600">
            <p className="mb-2 font-semibold">Credenciais de demonstração:</p>
            <div className="space-y-1 text-left bg-gray-100 p-3 rounded">
              <p><strong>Super Admin:</strong> admin@example.com</p>
              <p><strong>Portal Globo News:</strong> carlos.silva@globonews.com.br</p>
              <p><strong>Folha de São Paulo:</strong> joao.oliveira@folha.com.br</p>
              <p><strong>Estadão Digital:</strong> pedro.almeida@estadao.com.br</p>
              <p className="mt-2 text-xs text-gray-500">Todas as senhas: <strong>password</strong></p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

