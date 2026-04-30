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
  Package
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
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100 uppercase tracking-wider"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case 'processing':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100 uppercase tracking-wider"><RotateCcw className="w-3 h-3 animate-spin-slow" /> Processing</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full border border-slate-200 uppercase tracking-wider"><XIcon className="w-3 h-3" /> Cancelled</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100 uppercase tracking-wider"><Clock className="w-3 h-3" /> Pending</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-100 uppercase tracking-wider"><AlertCircle className="w-3 h-3" /> Refunded</span>;
    }
  };

  const XIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Order History</h1>
        <p className="text-slate-500 mt-1">Track the progress of your active orders</p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Loading History...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[32px] py-20 px-8 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 italic">No Orders Found</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">Boost your social presence. Explore our services to find the best fit for your profile.</p>
          <a href="/services" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20">
            Browse Services
          </a>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-bottom border-slate-100">
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Order ID</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Service Name</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest font-mono text-center">Quantity</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Status</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Date</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest font-mono text-right">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order, i) => (
                  <motion.tr 
                    key={order.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-5 font-mono text-sm text-slate-500">#{order.id}</td>
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors italic">{order.service?.name}</div>
                    </td>
                    <td className="px-8 py-5 text-center font-bold text-slate-600 tabular-nums">
                      {order.quantity.toLocaleString()}
                    </td>
                    <td className="px-8 py-5">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <a 
                        href={order.link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-sm hover:underline"
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
