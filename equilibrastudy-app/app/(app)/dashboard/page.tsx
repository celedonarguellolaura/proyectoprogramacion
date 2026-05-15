import { getServerUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

// Dashboard placeholder — se construye en Fase 2
export default async function DashboardPage() {
  const user = await getServerUser();
  if (!user) redirect('/login');

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className="text-center max-w-md px-8">
        <div
          className="inline-flex items-center justify-center w-16 h-16 mb-6"
          style={{ backgroundColor: '#D6F5FF', borderRadius: '16px' }}
        >
          <span style={{ fontSize: '30px' }}>⚖️</span>
        </div>
        <h1
          className="text-2xl mb-2"
          style={{ color: '#1A1A2E', fontWeight: 500 }}
        >
          Bienvenida, {user.name}
        </h1>
        <p className="text-sm mb-1" style={{ color: '#8C9BAB' }}>
          {user.email} · {user.role}
        </p>
        <p className="text-sm mt-6" style={{ color: '#8C9BAB' }}>
          El dashboard completo se construye en la Fase 2.
        </p>
      </div>
    </main>
  );
}
