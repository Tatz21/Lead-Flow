import React from 'react';
import { 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Mail, 
  Clock, 
  ChevronRight,
  Target
} from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { motion } from 'motion/react';

const CampaignCard = ({ title, status, leads, sent, opened, replies }: any) => (
  <div className="neumorph rounded-[2.5rem] p-8 flex flex-col gap-6">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 neumorph-sm rounded-2xl flex items-center justify-center text-blue-600">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-display font-bold text-slate-800">{title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className={cn(
              "w-2 h-2 rounded-full",
              status === 'Active' ? "bg-emerald-500" : "bg-amber-500"
            )} />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{status}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="neumorph-sm p-3 rounded-xl text-slate-600 hover:text-blue-600">
          {status === 'Active' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <button className="neumorph-sm p-3 rounded-xl text-rose-500 hover:bg-rose-50">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>

    <div className="grid grid-cols-4 gap-4">
      {[
        { label: "Leads", value: leads, icon: Users },
        { label: "Sent", value: sent, icon: Mail },
        { label: "Opened", value: opened, icon: MousePointer2 },
        { label: "Replies", value: replies, icon: MessageSquare }
      ].map((stat, i) => (
        <div key={i} className="neumorph-sm p-4 rounded-2xl text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{stat.label}</p>
          <p className="text-lg font-display font-bold text-slate-800">{stat.value}</p>
        </div>
      ))}
    </div>

    <div className="pt-4 border-t border-slate-200/50 flex justify-between items-center">
      <div className="flex -space-x-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="w-8 h-8 rounded-full border-2 border-soft-bg bg-slate-300 neumorph-sm" />
        ))}
        <div className="w-8 h-8 rounded-full border-2 border-soft-bg bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
          +12
        </div>
      </div>
      <button className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:gap-3 transition-all">
        View Details <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

import { Users, MousePointer2, MessageSquare } from 'lucide-react';

export default function CampaignManager() {
  return (
    <div className="flex flex-col gap-8 p-2">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-800">Campaigns</h2>
          <p className="text-slate-500">Manage your outreach sequences and follow-ups</p>
        </div>
        <button className="neumorph px-8 py-4 rounded-2xl font-bold text-blue-600 flex items-center gap-2 hover:scale-105 transition-all">
          <Plus className="w-5 h-5" /> Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CampaignCard 
          title="SaaS Founders Outreach" 
          status="Active" 
          leads={450} 
          sent={320} 
          opened={184} 
          replies={42} 
        />
        <CampaignCard 
          title="Digital Agency Leads" 
          status="Paused" 
          leads={1200} 
          sent={840} 
          opened={412} 
          replies={86} 
        />
        <CampaignCard 
          title="E-commerce Q4 Campaign" 
          status="Active" 
          leads={850} 
          sent={120} 
          opened={54} 
          replies={12} 
        />
        <div className="neumorph rounded-[2.5rem] p-8 border-4 border-dashed border-slate-200/50 flex flex-col items-center justify-center gap-4 text-slate-400">
          <div className="w-16 h-16 neumorph-sm rounded-2xl flex items-center justify-center">
            <Plus className="w-8 h-8" />
          </div>
          <p className="font-bold">Create New Campaign</p>
        </div>
      </div>
    </div>
  );
}
