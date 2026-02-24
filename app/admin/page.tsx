import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, BarChart3, ArrowRight, Shield } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

export default async function AdminDashboard() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    redirect('/admin/login');
  }

  const cards = [
    {
      href: '/admin/users',
      icon: Users,
      title: 'Gestión de Usuarios',
      description: 'Crear, editar, desactivar usuarios',
      color: 'fire-orange',
    },
    {
      href: '/admin/analytics',
      icon: BarChart3,
      title: 'Analytics',
      description: 'Ver estadísticas del linktree',
      color: 'purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
            Panel de <span className="text-fire-orange">Administración</span>
          </h1>
          <p className="text-gray-400">Bienvenido, {user.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="glass-card rounded-2xl p-6 group hover:border-fire-orange/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl bg-${card.color}/20 mb-4`}>
                  <card.icon className={`w-6 h-6 text-${card.color}`} />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-fire-orange group-hover:translate-x-1 transition-all" />
              </div>
              <h2 className="font-display text-xl font-semibold text-white mb-2">
                {card.title}
              </h2>
              <p className="text-gray-400 text-sm">
                {card.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
