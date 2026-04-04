import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  Mail, 
  MousePointer2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="neumorph p-6 rounded-[2rem] flex flex-col gap-4"
  >
    <div className="flex justify-between items-start">
      <div className="p-3 neumorph-sm rounded-2xl text-blue-600">
        <Icon className="w-6 h-6" />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-lg",
        trend === 'up' ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
      )}>
        {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        {change}%
      </div>
    </div>
    <div>
      <p className="text-slate-500 font-medium text-sm mb-1">{title}</p>
      <h3 className="text-3xl font-display font-bold text-slate-800">{value}</h3>
    </div>
  </motion.div>
);

export default function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    leads: 0,
    sent: 0,
    opened: 0,
    conversions: 0
  });

  useEffect(() => {
    if (!user) return;
    
    // Listen to leads
    const qLeads = query(collection(db, 'leads'), where('userId', '==', user.uid));
    const unsubLeads = onSnapshot(qLeads, (snap) => {
      setStats(prev => ({ ...prev, leads: snap.size }));
    });

    // Listen to campaigns for other stats
    const qCampaigns = query(collection(db, 'campaigns'), where('userId', '==', user.uid));
    const unsubCampaigns = onSnapshot(qCampaigns, (snap) => {
      let sent = 0, opened = 0, conv = 0;
      snap.docs.forEach(doc => {
        const data = doc.data();
        sent += data.stats?.sent || 0;
        opened += data.stats?.opened || 0;
        conv += data.stats?.conversions || 0;
      });
      setStats(prev => ({ ...prev, sent, opened, conversions: conv }));
    });

    return () => {
      unsubLeads();
      unsubCampaigns();
    };
  }, [user]);

  const openRate = stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(1) : '0.0';
  const convRate = stats.sent > 0 ? ((stats.conversions / stats.sent) * 100).toFixed(1) : '0.0';

  return (
    <div className="flex flex-col gap-8 p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Leads" 
          value={stats.leads.toLocaleString()} 
          change="12.5" 
          icon={Users} 
          trend="up" 
        />
        <StatCard 
          title="Emails Sent" 
          value={stats.sent.toLocaleString()} 
          change="8.2" 
          icon={Mail} 
          trend="up" 
        />
        <StatCard 
          title="Open Rate" 
          value={`${openRate}%`} 
          change="2.4" 
          icon={MousePointer2} 
          trend="down" 
        />
        <StatCard 
          title="Conversion" 
          value={`${convRate}%`} 
          change="4.1" 
          icon={TrendingUp} 
          trend="up" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 neumorph rounded-[2.5rem] p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-display font-bold">Outreach Performance</h3>
            <div className="flex gap-2">
              <button className="neumorph-sm px-4 py-2 rounded-xl text-sm font-medium text-blue-600">Weekly</button>
              <button className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-200/50">Monthly</button>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-4 px-4">
            {[40, 65, 45, 90, 55, 75, 60].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  className="w-full max-w-[40px] bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl shadow-lg shadow-blue-500/20"
                />
                <span className="text-xs font-bold text-slate-400">Day {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="neumorph rounded-[2.5rem] p-8">
          <h3 className="text-xl font-display font-bold mb-6">Recent Activity</h3>
          <div className="flex flex-col gap-6">
            {[
              { user: "Sarah Jenkins", action: "Email Opened", time: "2m ago", color: "bg-blue-500" },
              { user: "TechCorp Inc", action: "Lead Enriched", time: "15m ago", color: "bg-purple-500" },
              { user: "Mike Ross", action: "Reply Received", time: "1h ago", color: "bg-emerald-500" },
              { user: "Global Logistics", action: "Campaign Started", time: "3h ago", color: "bg-orange-500" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={cn("w-2 h-2 rounded-full", item.color)} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">{item.user}</p>
                  <p className="text-xs text-slate-500">{item.action}</p>
                </div>
                <span className="text-xs font-medium text-slate-400">{item.time}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-4 neumorph-sm rounded-2xl font-bold text-blue-600 hover:scale-[1.02] transition-all">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}

