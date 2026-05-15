// Layout base de la app — el sidebar completo se construye en Fase 2
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      {children}
    </div>
  );
}
