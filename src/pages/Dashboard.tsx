import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  CreditCard,
  ArrowRight
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
    { title: 'Account Balance', value: `$${stats.balance.toFixed(2)}`, icon: CreditCard, color: 'bg-blue-600' },
    { title: 'Total Orders', value: stats.totalOrders, icon: TrendingUp, color: 'bg-indigo-600' },
    { title: 'Active Orders', value: stats.activeOrders, icon: Clock, color: 'bg-amber-600' },
    { title: 'Completed Orders', value: stats.completedOrders, icon: CheckCircle2, color: 'bg-emerald-600' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1 text-lg">Welcome back, {user?.user_metadata?.username || 'User'}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
          >
            <div className={`${card.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-opacity-20`}>
              <card.icon className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{card.title}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


            <Link 
              to="/wallet" 
              className="group p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-slate-800 group-hover:text-blue-700">Add Funds</span>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
              </div>
              <p className="text-slate-500 text-sm">Top up your account balance to start ordering services instantly.</p>
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-600/30">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">Prime Support</h2>
            <p className="text-blue-100 mb-6">Need help with your account? Our dedicated experts are online 24/7.</p>
            <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg">
              Contact Support
            </button>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
