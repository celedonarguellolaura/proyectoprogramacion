import { redirect } from 'next/navigation';

// La raíz siempre va al dashboard.
// El middleware redirige a /login si el usuario no está autenticado.
export default function RootPage() {
  redirect('/dashboard');
}
