import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { 
  PlusCircle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CreditCard,
  History,
  ShieldCheck,
  Banknote,
  Loader2
} from 'lucide-react';

interface Transaction {
  id: string | number;
  created_at: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'refund';
  description: string;
}

const Wallet: React.FC = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);

      // Fetch Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();
      
      if (profile) setBalance(profile.balance);

      // Fetch Transactions
      const { data: txs } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (txs) setTransactions(txs as any);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Wallet</h1>
        <p className="text-slate-500 mt-1">Manage your funds and transaction history</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Balance Card */}
        <div className="lg:col-span-5 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-8 text-white shadow-2xl shadow-blue-600/30 relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                  <CreditCard className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <p className="text-blue-100/60 text-xs font-bold uppercase tracking-widest font-mono">Current Balance</p>
                  <h2 className="text-4xl font-bold mt-1 tabular-nums">${balance.toFixed(2)}</h2>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-blue-100 font-medium">Add funds directly to your wallet for instant order processing.</p>
                <div className="flex gap-4">
                  <button className="flex-1 bg-white text-blue-700 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-lg">
                    <PlusCircle className="w-5 h-5" /> Add Funds
                  </button>
                </div>
              </div>
            </div>
            {/* Geometric backgrounds */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl -ml-16 -mb-16" />
          </motion.div>

          <div className="bg-white border border-slate-200 rounded-[32px] p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Secure Payments
            </h3>
            <div className="space-y-6">
              {[
                { name: 'Credit / Debit Card', icon: CreditCard, subtitle: 'Visa, Mastercard, Amex' },
                { name: 'Crypto Currency', icon: Banknote, subtitle: 'BTC, ETH, USDT (TRC-20)' },
              ].map((method) => (
                <div key={method.name} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all cursor-pointer">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm transition-colors">
                    <method.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{method.name}</p>
                    <p className="text-xs text-slate-500">{method.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-[32px] p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 italic">
              <History className="w-6 h-6 text-blue-600" /> Transactions
            </h2>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
              <p className="text-slate-400 font-mono text-xs tracking-widest uppercase">Fetching Records...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-40">
              <History className="w-16 h-16 text-slate-300 mb-4" />
              <p className="font-bold text-slate-400">No transactions recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-blue-100 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'deposit' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {tx.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors uppercase tracking-tight italic">{tx.description}</p>
                      <p className="text-xs text-slate-500">{new Date(tx.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className={`text-lg font-bold tabular-nums ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
