import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  CreditCard,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    balance: 0,
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      // Fetch Profile for balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();

      // Fetch Orders stats
      const { data: orders } = await supabase
        .from('orders')
        .select('status')
        .eq('user_id', user.id);

      if (orders) {
        setStats({
          balance: profile?.balance || 0,
          totalOrders: orders.length,
          activeOrders: orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
          completedOrders: orders.filter(o => o.status === 'completed').length
        });
      }
    };

    fetchStats();
  }, [user]);

  const cards = [
    { 
      title: 'Account Balance', 
      value: `$${stats.balance.toFixed(2)}`, 
      icon: CreditCard, 
      color: 'text-brand-600', 
      bg: 'bg-brand-50',
      trend: '+12.5%' 
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders, 
      icon: TrendingUp, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50',
      trend: '+8.2%' 
    },
    { 
      title: 'Active Orders', 
      value: stats.activeOrders, 
      icon: Clock, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50',
      trend: 'Active' 
    },
    { 
      title: 'Completed Orders', 
      value: stats.completedOrders, 
      icon: CheckCircle2, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50',
      trend: '99% Success' 
    },
  ];

  return (
    <div className="space-y-10 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2 font-medium">
            Welcome back, <span className="text-slate-900 font-bold">{user?.user_metadata?.username || 'User'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`${card.bg} ${card.color} w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <ArrowUpRight className="w-3 h-3" />
                {card.trend}
              </div>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.title}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-200 p-10 shadow-sm">
          <div className="flex items-center justify-between mb-10 pb-8 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <Zap className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-900">Quick Actions</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link 
              to="/wallet" 
              className="group p-8 bg-slate-50 rounded-[32px] border border-slate-100 hover:border-brand-200 hover:bg-brand-50/50 transition-all text-left relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-slate-900 group-hover:text-brand-700 transition-colors">Add Funds</span>
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-brand-600 group-hover:text-white transition-all">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">Top up your account balance to start ordering services instantly.</p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-all" />
            </Link>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl group">
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/10">
              <ShieldCheck className="w-7 h-7 text-brand-400" />
            </div>
            <h2 className="text-3xl font-serif font-bold mb-4 italic">Prime Support</h2>
            <p className="text-slate-400 mb-10 leading-relaxed">Need help with your account? Our dedicated experts are online 24/7.</p>
            <button className="w-full bg-brand-500 text-white py-5 rounded-2xl font-bold hover:bg-brand-400 transition-all shadow-xl shadow-brand-500/20 active:scale-95">
              Contact Support
            </button>
          </div>
          {/* Design elements */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-500/20 rounded-full blur-[100px] group-hover:bg-brand-500/30 transition-all duration-1000" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
