import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  X,
  Info
} from 'lucide-react';

interface Service {
  id: string | number;
  name: string;
  category: string;
  price: number;
  min_qty: number;
  max_qty: number;
  description: string;
}

const Services: React.FC = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Order Modal State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [orderLink, setOrderLink] = useState('');
  const [orderQty, setOrderQty] = useState<number>(100);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('services').select('*');
    if (data) setServices(data);
    setLoading(false);
  };

  const categories = ['All', ...new Set(services.map(s => s.category))];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !user) return;

    setSubmitting(true);
    setMessage(null);

    try {
      // Validate quantity
      if (orderQty < selectedService.min_qty || orderQty > selectedService.max_qty) {
        throw new Error(`Quantity must be between ${selectedService.min_qty} and ${selectedService.max_qty}`);
      }

      // Check balance (Server side or here for UX)
      const cost = (selectedService.price / 1000) * orderQty;
      const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
      
      if (!profile || profile.balance < cost) {
        throw new Error('Insufficient balance. Please add funds.');
      }

      // 1. Insert order
      const { error: orderError } = await supabase.from('orders').insert({
        user_id: user.id,
        service_id: selectedService.id,
        link: orderLink,
        quantity: orderQty,
        status: 'pending'
      });

      if (orderError) throw orderError;

      // 2. Deduct balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: profile.balance - cost })
        .eq('id', user.id);

      if (balanceError) throw balanceError;

      setMessage({ type: 'success', text: 'Order placed successfully!' });
      setTimeout(() => setSelectedService(null), 2000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Services</h1>
          <p className="text-slate-500 mt-1">Select a high-quality service to boost your profile</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search services..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full md:w-64"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium font-mono uppercase tracking-widest text-xs">Syncing Catalog...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredServices.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col hover:border-blue-300 hover:shadow-xl hover:shadow-blue-600/5 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase tracking-wider group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  {service.category}
                </span>
                <span className="text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-lg text-sm">
                  ${service.price.toFixed(2)}/1k
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-blue-700 transition-colors italic">{service.name}</h3>
              <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">{service.description}</p>
              
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100">
                <div className="text-xs text-slate-400 font-medium">
                  Min: <span className="text-slate-600">{service.min_qty}</span> • Max: <span className="text-slate-600">{service.max_qty >= 1000000 ? '1M+' : service.max_qty.toLocaleString()}</span>
                </div>
                <button 
                  onClick={() => {
                    setSelectedService(service);
                    setOrderQty(service.min_qty);
                    setOrderLink('');
                    setMessage(null);
                  }}
                  className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all font-bold group-hover:scale-105 active:scale-95"
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Order Modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl shadow-black/20"
            >
              <div className="bg-blue-600 p-8 text-white relative">
                <button 
                  onClick={() => setSelectedService(null)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-4 mb-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest">{selectedService.category}</span>
                  <div className="flex items-center gap-1 text-blue-100 text-xs">
                    <Info className="w-3 h-3" />
                  ) ID: #{selectedService.id}
                  </div>
                </div>
                <h2 className="text-2xl font-bold italic">{selectedService.name}</h2>
              </div>

              <form onSubmit={handleCreateOrder} className="p-8 space-y-6">
                {message && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className={`p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
                  >
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="text-sm font-semibold">{message.text}</p>
                  </motion.div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Target Link</label>
                    <input 
                      type="url" 
                      required
                      placeholder="https://instagram.com/p/..."
                      value={orderLink}
                      onChange={(e) => setOrderLink(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Quantity</label>
                      <input 
                        type="number" 
                        required
                        min={selectedService.min_qty}
                        max={selectedService.max_qty}
                        value={orderQty}
                        onChange={(e) => setOrderQty(parseInt(e.target.value))}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Total Cost</label>
                      <div className="px-5 py-4 bg-blue-50 border border-blue-100/50 rounded-2xl text-blue-700 font-bold text-xl">
                        ${((selectedService.price / 1000) * orderQty).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setSelectedService(null)}
                    className="flex-1 py-4 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/30 disabled:opacity-70"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirm Order</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Services;
