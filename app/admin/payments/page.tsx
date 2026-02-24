'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Calendar, 
  Edit2, 
  Trash2,
  TrendingUp,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  User,
  DollarSign,
  Search,
  X
} from 'lucide-react';

interface Payment {
  id: number;
  paymentRecorderId: string;
  amount: number;
  date: string;
  description: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface PaymentSummary {
  totalCompleted: number;
  totalPending: number;
  totalAmount: number;
  countCompleted: number;
  countPending: number;
}

interface MonthlyData {
  month: string;
  total: number;
  count: number;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    recorderId: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch payments and summary
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch payments
      const params = new URLSearchParams();
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);
      if (filters.status) params.set('status', filters.status);
      if (filters.recorderId) params.set('recorderId', filters.recorderId);
      
      const paymentsRes = await fetch(`/api/admin/payments?${params}`);
      const paymentsData = await paymentsRes.json();
      setPayments(paymentsData.payments || []);
      
      // Fetch summary
      const summaryRes = await fetch('/api/admin/payments?summary=true');
      const summaryData = await summaryRes.json();
      setSummary(summaryData.summary);
      setMonthly(summaryData.monthly || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este pago?')) return;
    
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/payments?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        alert('Error al eliminar el pago');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Error al eliminar el pago');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      completed: 'Completado',
      pending: 'Pendiente',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Simple bar chart
  const SimpleBarChart = ({ data }: { data: MonthlyData[] }) => {
    if (data.length === 0) return null;
    
    const maxValue = Math.max(...data.map(d => d.total), 1);
    const recentData = data.slice(-6);
    
    return (
      <div className="mt-4">
        <h4 className="text-xs font-medium text-gray-400 mb-3">Totales por mes</h4>
        <div className="flex items-end gap-2 h-20">
          {recentData.map((item) => (
            <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className="w-full bg-violet-500/60 rounded-t-sm hover:bg-violet-400 transition-colors"
                style={{ height: `${(item.total / maxValue) * 100}%`, minHeight: '4px' }}
                title={`${item.month}: $${item.total.toLocaleString('es-CL')}`}
              />
              <span className="text-[9px] text-gray-500">
                {item.month.split('-')[1]}/{item.month.split('-')[0].slice(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-gray-100">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <CreditCard className="w-7 h-7 md:w-8 md:h-8 text-violet-500" />
                Administración de Pagos
              </h1>
              <p className="text-gray-400">Gestiona los pagos manuales registrados</p>
            </div>
            <Link
              href="/admin/payments/new"
              className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Pago
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-green-500/20 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-xs text-gray-400">Completado</span>
              </div>
              <p className="text-xl font-bold text-white">
                ${summary.totalCompleted.toLocaleString('es-CL')}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">{summary.countCompleted} pagos</p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                  <Clock className="w-4 h-4 text-yellow-400" />
                </div>
                <span className="text-xs text-gray-400">Pendiente</span>
              </div>
              <p className="text-xl font-bold text-white">
                ${summary.totalPending.toLocaleString('es-CL')}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">{summary.countPending} pagos</p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <div className="