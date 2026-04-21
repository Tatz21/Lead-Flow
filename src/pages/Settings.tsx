import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings as SettingsIcon, 
  Database, 
  Shield, 
  Bell, 
  User,
  Copy,
  Check,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../lib/utils.ts';

export default function Settings() {
  const [copied, setCopied] = useState(false);
  const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  const sqlSchema = `
-- Create leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
  company TEXT,
  website TEXT,
  status TEXT DEFAULT 'Pending',
  value NUMERIC DEFAULT 0,
  source TEXT,
  is_cleaned BOOLEAN DEFAULT FALSE,
  is_email_found BOOLEAN DEFAULT FALSE,
  is_email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Draft',
  sequence JSONB DEFAULT '[]',
  stats JSONB DEFAULT '{"leads": 0, "sent": 0, "opened": 0, "clicked": 0, "replies": 0, "conversions": 0, "revenue": 0}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies (Simplified for demo, adjust for production)
CREATE POLICY "Users can only access their own leads" ON leads FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY "Users can only access their own campaigns" ON campaigns FOR ALL USING (user_id = auth.uid()::text);
  `;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-8 p-2 pb-24 md:pb-2">
      {!isSupabaseConfigured && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="neumorph rounded-[2.5rem] p-6 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/50"
        >
          <div className="flex items-center gap-4 text-amber-800 dark:text-amber-400">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-2xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold">Supabase Not Configured</h3>
              <p className="text-sm opacity-80">Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables in the Secrets panel.</p>
            </div>
          </div>
        </motion.div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="neumorph rounded-[2.5rem] p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 neumorph-sm rounded-2xl text-blue-600 dark:text-blue-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-slate-800 dark:text-slate-200">Database Setup</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Run this SQL in your Supabase SQL Editor to set up the required tables.</p>
              </div>
            </div>

            <div className="relative">
              <pre className="bg-slate-900 dark:bg-slate-950 text-slate-300 dark:text-slate-400 p-6 rounded-2xl overflow-x-auto text-xs font-mono leading-relaxed">
                {sqlSchema}
              </pre>
              <button 
                onClick={handleCopy}
                className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="neumorph rounded-[2.5rem] p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 neumorph-sm rounded-2xl text-blue-600 dark:text-blue-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-slate-800 dark:text-slate-200">Security & Privacy</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account security and data privacy settings.</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 neumorph-sm rounded-2xl">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Add an extra layer of security to your account.</p>
                </div>
                <div className="w-12 h-6 bg-slate-200 dark:bg-slate-800 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white dark:bg-slate-600 rounded-full shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="neumorph rounded-[2.5rem] p-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-24 h-24 neumorph rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                <User className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-slate-800 dark:text-slate-200">Profile Settings</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">mondaldebdip007@gmail.com</p>
              </div>
              <button className="w-full py-4 neumorph-sm rounded-2xl font-bold text-blue-600 dark:text-blue-400 hover:scale-[1.02] transition-all">
                Edit Profile
              </button>
            </div>
          </div>

          <div className="neumorph rounded-[2.5rem] p-8">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Notifications</h4>
            <div className="space-y-4">
              {[
                { label: "Email Alerts", icon: Bell },
                { label: "Campaign Updates", icon: SettingsIcon },
                { label: "Lead Reports", icon: Database }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.label}</span>
                  </div>
                  <div className="w-10 h-5 bg-blue-600 dark:bg-blue-700 rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white dark:bg-slate-200 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
