import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Wallet as WalletIcon,
  Shield,
  Settings,
  Bell,
  LogOut,
  Loader2
} from 'lucide-react';

interface ProfileData {
  username: string;
  balance: number;
  created_at: string;
}

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) setProfile(data as any);
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Loading Profile...</p>
      </div>
    );
  }

  const sections = [
    { label: 'Username', value: profile?.username || user?.user_metadata?.username || 'N/A', icon: UserIcon },
    { label: 'Email', value: user?.email || 'N/A', icon: Mail },
    { label: 'Current Balance', value: `$${profile?.balance.toFixed(2) || '0.00'}`, icon: WalletIcon },
    { label: 'Member Since', value: new Date(profile?.created_at || user?.created_at || '').toLocaleDateString(), icon: Calendar },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
          <p className="text-slate-500 mt-1 uppercase text-xs font-mono tracking-[0.2em]">Management & Security</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-8">
          {/* Avatar Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] border border-slate-200 p-8 text-center shadow-xl shadow-slate-200/40"
          >
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 text-white border-4 border-white">
              <UserIcon className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 italic">@{profile?.username || 'User'}</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Free Tier Member</p>
            
            <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">0</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coupons</p>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">1</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Devices</p>
              </div>
            </div>
          </motion.div>

          <div className="bg-white rounded-[32px] border border-slate-200 p-6 space-y-2">
            {[
              { label: 'Security Settings', icon: Shield },
              { label: 'Account Preferences', icon: Settings },
              { label: 'Notification Center', icon: Bell },
            ].map(item => (
              <button key={item.label} className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-all text-sm font-semibold text-left">
                <item.icon className="w-4 h-4 text-slate-400" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-200 p-10 shadow-sm relative overflow-hidden">
            <h3 className="text-xl font-bold text-slate-900 mb-8 italic">Account Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-8">
              {sections.map(section => (
                <div key={section.label} className="space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-400">
                    <section.icon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{section.label}</span>
                  </div>
                  <p className="text-lg font-bold text-slate-800 break-all">{section.value}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-12 pt-10 border-t border-slate-100 flex items-center justify-between gap-4">
              <button className="px-8 py-3 bg-slate-950 text-white rounded-xl font-bold hover:bg-slate-800 transition-all text-sm">
                Edit Profile
              </button>
              <button 
                onClick={() => signOut()}
                className="px-8 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all text-sm flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
            {/* Design touch */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-full border-b border-l border-blue-100" />
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-[32px] p-8 flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-emerald-900 font-bold text-lg italic">Verification Level 1</h4>
              <p className="text-emerald-700 text-sm leading-relaxed">Your account is secured with email verification. Enable 2FA for Level 2 verification and increased limits.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
