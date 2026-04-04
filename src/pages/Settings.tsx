import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Key, 
  Shield, 
  Save, 
  Bell, 
  Globe,
  Database
} from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext.tsx';
import { db } from '../lib/firebase.ts';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const SettingSection = ({ title, description, children }: any) => (
  <div className="neumorph rounded-[2.5rem] p-8 flex flex-col gap-6">
    <div>
      <h3 className="text-xl font-display font-bold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const InputField = ({ label, icon: Icon, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">{label}</label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      <input 
        {...props}
        className="w-full pl-12 pr-4 py-3 neumorph-inset rounded-2xl focus:outline-none text-slate-700 font-medium"
      />
    </div>
  </div>
);

export default function Settings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    brevoApiKey: '',
    supabaseUrl: '',
    supabaseAnonKey: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile({ ...profile, ...docSnap.data() });
      } else {
        setProfile({
          ...profile,
          displayName: user.displayName || '',
          email: user.email || ''
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...profile,
        updatedAt: serverTimestamp()
      }, { merge: true });
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="flex flex-col gap-8 p-2 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-800">Settings</h2>
          <p className="text-slate-500">Manage your profile and API integrations</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="neumorph px-8 py-4 rounded-2xl font-bold text-blue-600 flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
        >
          <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <SettingSection 
          title="Profile Information" 
          description="Update your personal details and how others see you."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField 
              label="Full Name" 
              icon={User} 
              value={profile.displayName}
              onChange={(e: any) => setProfile({ ...profile, displayName: e.target.value })}
            />
            <InputField 
              label="Email Address" 
              icon={Mail} 
              value={profile.email}
              disabled
            />
          </div>
        </SettingSection>

        <SettingSection 
          title="API Integrations" 
          description="Connect your external services to power LeadFlow AI."
        >
          <div className="space-y-6">
            <InputField 
              label="Brevo API Key" 
              icon={Key} 
              type="password"
              placeholder="xkeysib-..."
              value={profile.brevoApiKey}
              onChange={(e: any) => setProfile({ ...profile, brevoApiKey: e.target.value })}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField 
                label="Supabase URL" 
                icon={Globe} 
                placeholder="https://your-project.supabase.co"
                value={profile.supabaseUrl}
                onChange={(e: any) => setProfile({ ...profile, supabaseUrl: e.target.value })}
              />
              <InputField 
                label="Supabase Anon Key" 
                icon={Shield} 
                type="password"
                placeholder="eyJhbG..."
                value={profile.supabaseAnonKey}
                onChange={(e: any) => setProfile({ ...profile, supabaseAnonKey: e.target.value })}
              />
            </div>
          </div>
        </SettingSection>

        <SettingSection 
          title="Notifications" 
          description="Choose what updates you want to receive."
        >
          <div className="flex items-center justify-between p-4 neumorph-sm rounded-2xl">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-bold text-slate-800 text-sm">Email Notifications</p>
                <p className="text-xs text-slate-500">Get notified when a campaign completes.</p>
              </div>
            </div>
            <div className="w-12 h-6 neumorph-inset rounded-full relative cursor-pointer">
              <div className="absolute left-1 top-1 w-4 h-4 bg-blue-600 rounded-full shadow-sm" />
            </div>
          </div>
        </SettingSection>
      </div>
    </div>
  );
}
