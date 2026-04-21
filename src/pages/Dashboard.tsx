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
import { supabase } from '../lib/supabase.ts';

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="neumorph p-6 rounded-[2rem] flex flex-col gap-4"
  >
    <div className="flex justify-between items-start">
      <div className="p-3 neumorph-sm rounded-2xl text-blue-600 dark:text-blue-400">
        <Icon className="w-6 h-6" />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-lg",
        trend === 'up' ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400" : "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400"
      )}>
        {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        {change}%
      </div>
    </div>
    <div>
      <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-1">{title}</p>
      <h3 className="text-3xl font-display font-bold text-slate-800 dark:text-slate-200">{value}</h3>
    </div>
  </motion.div>
);

export default function DashboardOverview() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [stats, setStats] = useState({
    leads: 0,
    sent: 0,
    opened: 0,
    conversions: 0,
    pipelineValue: 0
  });

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      try {
        // Fetch leads stats
        const { data: leadsData, error: leadsError } = await supabase
          .from('leads')
          .select('value')
          .eq('user_id', user.uid);
        
        if (!leadsError && leadsData) {
          const totalValue = leadsData.reduce((acc, curr) => acc + (curr.value || 0), 0);
          setStats(prev => ({ ...prev, leads: leadsData.length, pipelineValue: totalValue }));
        }

        // Fetch campaigns stats
        const { data: campaignsData, error: campaignsError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('user_id', user.uid);
        
        if (!campaignsError && campaignsData) {
          setCampaigns(campaignsData);
          let sent = 0, opened = 0, conv = 0;
          campaignsData.forEach(c => {
            sent += c.stats?.sent || 0;
            opened += c.stats?.opened || 0;
            conv += c.stats?.conversions || 0;
          });
          setStats(prev => ({ ...prev, sent, opened, conversions: conv }));
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchData();

    // Set up subscriptions for real-time updates
    const leadsSub = supabase
      .channel('dashboard_leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads', filter: `user_id=eq.${user.uid}` }, fetchData)
      .subscribe();

    const campaignsSub = supabase
      .channel('dashboard_campaigns')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns', filter: `user_id=eq.${user.uid}` }, fetchData)
      .subscribe();

    return () => {
      leadsSub.unsubscribe();
      campaignsSub.unsubscribe();
    };
  }, [user]);

  const convRate = stats.sent > 0 ? ((stats.conversions / stats.sent) * 100).toFixed(1) : '0.0';

  return (
    <div className="flex flex-col gap-8 p-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Total Leads" 
          value={stats.leads.toLocaleString()} 
          change="12.5" 
          icon={Users} 
          trend="up" 
        />
        <StatCard 
          title="Pipeline Value" 
          value={`₹${stats.pipelineValue.toLocaleString('en-IN')}`} 
          change="15.2" 
          icon={TrendingUp} 
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
          title="Conversion" 
          value={`${convRate}%`} 
          change="4.1" 
          icon={TrendingUp} 
          trend="up" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="md:col-span-2 neumorph rounded-[2.5rem] p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
              <h3 className="text-xl font-display font-bold text-slate-800 dark:text-slate-200">Outreach Performance</h3>
              <div className="h-48 md:h-64 flex items-end justify-between gap-2 md:gap-4 px-2 md:px-4">
                {[40, 65, 45, 90, 55, 75, 60].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 md:gap-3">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      className="w-full max-w-[32px] md:max-w-[40px] bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg md:rounded-t-xl shadow-lg shadow-blue-500/20"
                    />
                    <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500">Day {i+1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-display font-bold text-slate-800 dark:text-slate-200">Campaign Status</h3>
              <div className="flex flex-col gap-4">
                {[
                  { label: "Active Campaigns", count: campaigns.filter(c => c.status === 'Active').length, color: "bg-emerald-500", text: "text-emerald-600" },
                  { label: "Paused Campaigns", count: campaigns.filter(c => c.status === 'Paused').length, color: "bg-amber-500", text: "text-amber-600" },
                  { label: "Drafts", count: campaigns.filter(c => c.status === 'Draft').length, color: "bg-slate-400", text: "text-slate-400" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 neumorph-sm rounded-2xl group hover:scale-[1.02] transition-all">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-full animate-pulse", item.color)} />
                      <span className="font-bold text-slate-600 dark:text-slate-400">{item.label}</span>
                    </div>
                    <span className={cn("text-2xl font-display font-bold", item.text)}>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="neumorph rounded-[2.5rem] p-8">
          <h3 className="text-xl font-display font-bold mb-6 text-slate-800 dark:text-slate-200">Recent Activity</h3>
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
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.user}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.action}</p>
                </div>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{item.time}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-4 neumorph-sm rounded-2xl font-bold text-blue-600 dark:text-blue-400 hover:scale-[1.02] transition-all">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}

