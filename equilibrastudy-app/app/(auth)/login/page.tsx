'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json() as { error?: string };

      if (!res.ok) {
        setError(data.error ?? 'Error al iniciar sesión');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="w-full max-w-md"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #E8ECF0',
        borderRadius: '12px',
        padding: '2.5rem 2rem',
      }}
    >
      {/* Logo */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center justify-center w-14 h-14 mb-4"
          style={{ backgroundColor: '#D6F5FF', borderRadius: '14px' }}
        >
          <span style={{ fontSize: '26px' }}>⚖️</span>
        </div>
        <h1
          className="text-2xl"
          style={{ color: '#1A1A2E', fontWeight: 500, letterSpacing: '-0.02em' }}
        >
          EquilibraStudy
        </h1>
        <p className="text-sm mt-1" style={{ color: '#8C9BAB' }}>
          Tu espacio de estudio inteligente
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className="block text-sm mb-1.5"
            style={{ color: '#1A1A2E', fontWeight: 500 }}
          >
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 text-sm rounded-lg outline-none"
            style={{
              border: '1.5px solid #E8ECF0',
              backgroundColor: '#FFFFFF',
              color: '#1A1A2E',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#00C8F5')}
            onBlur={(e) => (e.target.style.borderColor = '#E8ECF0')}
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label
            className="block text-sm mb-1.5"
            style={{ color: '#1A1A2E', fontWeight: 500 }}
          >
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 text-sm rounded-lg outline-none"
            style={{
              border: '1.5px solid #E8ECF0',
              backgroundColor: '#FFFFFF',
              color: '#1A1A2E',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#00C8F5')}
            onBlur={(e) => (e.target.style.borderColor = '#E8ECF0')}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div
            className="text-sm px-3.5 py-2.5 rounded-lg"
            style={{ backgroundColor: '#FFE9D6', color: '#8A3C10' }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 text-sm rounded-lg transition-opacity"
          style={{
            backgroundColor: '#00C8F5',
            color: '#003D4D',
            fontWeight: 500,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: '#8C9BAB' }}>
        ¿No tienes cuenta?{' '}
        <Link
          href="/register"
          style={{ color: '#00C8F5', fontWeight: 500 }}
        >
          Regístrate
        </Link>
      </p>
    </div>
  );
}
