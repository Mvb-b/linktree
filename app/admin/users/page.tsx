'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  UserCog, 
  Shield,
  Users,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface UsersResponse {
  users: User[];
  total: number;
}

const roleLabels = {
  admin: 'Administrador',
  user: 'Usuario',
};

const statusLabels = {
  active: 'Activo',
  inactive: 'Inactivo',
};

const statusColors = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  inactive: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const roleColors = {
  admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  user: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const limit = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      if (statusFilter) params.set('status', statusFilter);
      params.set('limit', limit.toString());
      params.set('offset', (page * limit).toString());

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Error al cargar usuarios');
        return;
      }

      setUsers(data.data.users);
      setTotal(data.data.total);
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, page]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success) {
        setCurrentUserId(data.data.user.id);
      }
    } catch (err) {
      console.error('Error fetching current user');
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeactivate = async (id: number) => {
    if (!confirm('¿Estás seguro de desactivar este usuario?')) return;
    if (id === currentUserId) {
      alert('No puedes desactivar tu propia cuenta');
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (!data.success) {
        alert(data.error || 'Error al desactivar usuario');
        return;
      }

      fetchUsers();
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const handleActivate = async (id: number) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'active' }),
      });
      const data = await res.json();
      
      if (!data.success) {
        alert(data.error || 'Error al activar usuario');
        return;
      }

      fetchUsers();
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar permanentemente este usuario?')) return;
    if (id === currentUserId) {
      alert('No puedes eliminar tu propia cuenta');
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?id=${id}&hard=true`, { method: 'DELETE' });
      const data = await res.json();
      
      if (!data.success) {
        alert(data.error || 'Error al eliminar usuario');
        return;
      }

      fetchUsers();
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setPage(0);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
            Gestión de <span className="text-fire-orange">Usuarios</span>
          </h1>
          <p className="text-gray-500 text-sm">{total} usuarios registrados</p>
        </div>
        
        <Link
          href="/admin/users/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-fire-orange text-white font-semibold hover:bg-fire-orange/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </Link>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Buscar por nombre o email..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-fire-orange/50 transition-colors"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-fire-orange/50 transition-colors"
          >
            <option value="">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="user">Usuario</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-fire-orange/50 transition-colors"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>

          {(search || roleFilter || statusFilter) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
              Limpiar
            </button>
          )}

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        {loading && users.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-fire-orange/30 border-t-fire-orange rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Cargando usuarios...</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Users className="w-12 h-12 text-gray-600 mb-4" />
            <p className="text-gray-400">No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Usuario</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Rol</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Estado</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Creado</th>
                  <th className="text-right px-6 py-4 text-gray-400 font-medium text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-gray-500 text-sm">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${roleColors[user.role]}`}>
                        {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <UserCog className="w-3 h-3" />}
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs border ${statusColors[user.status]}`}>
                        {statusLabels[user.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(user.created_at).toLocaleDateString('es-CL')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/users/${user.id}/edit`}
                          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        
                        {user.status === 'active' ? (
                          <button
                            onClick={() => handleDeactivate(user.id)}
                            disabled={user.id === currentUserId}
                            className="p-2 rounded-lg text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Desactivar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(user.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-colors"
                            title="Activar"
                          >
                            <UserCog className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={user.id === currentUserId}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Eliminar permanentemente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-gray-400 text-sm">
            Mostrando {page * limit + 1} - {Math.min((page + 1) * limit, total)} de {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-gray-400 text-sm px-4">
              Página {page + 1} de {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
