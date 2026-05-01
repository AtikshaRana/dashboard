import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  ExternalLink,
  Loader2,
  Package,
  X as XIcon,
  Search,
  Filter
} from 'lucide-react';

interface Order {
  id: string | number;
  created_at: string;
  quantity: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  link: string;
  service: {
    name: string;
  };
}

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setLoading(true);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          quantity,
          status,
          link,
          service:services ( name )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setOrders(data as any);
      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100 uppercase tracking-wider"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case 'processing':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 text-brand-700 text-[10px] font-bold rounded-full border border-brand-100 uppercase tracking-wider"><RotateCcw className="w-3 h-3 animate-spin-slow" /> Processing</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full border border-slate-200 uppercase tracking-wider"><XIcon className="w-3 h-3" /> Cancelled</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-100 uppercase tracking-wider"><Clock className="w-3 h-3" /> Pending</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-full border border-rose-100 uppercase tracking-wider"><AlertCircle className="w-3 h-3" /> Refunded</span>;
    }
  };

  return (
    <div className="space-y-10 pb-12 font-sans">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900">Order History</h1>
          <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
            Track the progress of your active orders
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            Total Records: {orders.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-brand-500/10 transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search orders..." className="bg-transparent border-none focus:outline-none text-sm font-medium w-40" />
          </div>
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 text-brand-600 animate-spin mb-6" />
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Synchronizing History...</p>
        </div>
      ) : orders.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-[40px] py-24 px-8 text-center shadow-sm relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-100">
              <Package className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-3xl font-serif font-bold text-slate-900 mb-4 italic">No Orders Found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-10 leading-relaxed font-medium">Boost your social presence. Explore our services to find the best fit for your profile.</p>
            <a href="/services" className="inline-flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-10 py-5 rounded-2xl font-bold transition-all shadow-2xl shadow-slate-900/20 active:scale-95">
              Browse Services
            </a>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50/50 rounded-full blur-3xl -mr-32 -mt-32" />
        </motion.div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[40px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Order ID</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Service Name</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Quantity</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Date</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order, i) => (
                  <motion.tr 
                    key={order.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-slate-50/30 transition-colors group"
                  >
                    <td className="px-8 py-6 font-mono text-xs text-slate-400">#{order.id}</td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-tight italic">{order.service?.name}</div>
                    </td>
                    <td className="px-8 py-6 text-center font-bold text-slate-600 tabular-nums">
                      {order.quantity.toLocaleString()}
                    </td>
                    <td className="px-8 py-6">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-slate-500">
                      {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <a 
                        href={order.link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-brand-600 font-bold text-xs hover:text-brand-700 transition-colors bg-brand-50 px-4 py-2 rounded-xl border border-brand-100"
                      >
                        Visit <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
