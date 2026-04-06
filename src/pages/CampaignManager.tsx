import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Play, Pause, Trash2, Mail, Clock, ChevronRight, Target, 
  Users, MousePointer2, MessageSquare, Edit3, Copy, X, Save,
  Zap, BarChart2, TrendingUp, Star
} from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.ts';
import { useAuth } from '../context/AuthContext.tsx';

const TEMPLATES = [
  {
    id: 'saas-outreach',
    title: 'SaaS Founders Outreach',
    description: 'Targeted at SaaS founders for partnership or sales.',
    sequence: [
      { day: 1, subject: 'Quick question about {{company}}', body: 'Hi {{firstName}}, I noticed your work at {{company}}...' },
      { day: 3, subject: 'Re: Quick question', body: 'Just following up on my previous email...' }
    ]
  },
  {
    id: 'agency-leads',
    title: 'Digital Agency Leads',
    description: 'For agencies looking to scale their client base.',
    sequence: [
      { day: 1, subject: 'Scaling {{company}} in 2024', body: 'Hey {{firstName}}, love what you guys are doing at {{company}}...' }
    ]
  },
  {
    id: 'real-estate',
    title: 'Real Estate Investors',
    description: 'Outreach for property management or investment deals.',
    sequence: [
      { day: 1, subject: 'Property investment opportunity in {{city}}', body: 'Hi {{firstName}}, I have a unique property deal that might interest you...' }
    ]
  },
  {
    id: 'freelance',
    title: 'Freelance Client Acquisition',
    description: 'Perfect for designers, developers, and marketers.',
    sequence: [
      { day: 1, subject: 'Helping {{company}} with {{service}}', body: 'Hi {{firstName}}, I saw your recent project and thought I could help...' }
    ]
  },
  {
    id: 'b2b-tech',
    title: 'B2B Tech Sales',
    description: 'High-ticket enterprise software outreach.',
    sequence: [
      { day: 1, subject: 'Improving {{company}}\'s workflow', body: 'Hi {{firstName}}, I noticed some inefficiencies in your current tech stack...' }
    ]
  },
  {
    id: 'hr-recruitment',
    title: 'HR & Recruitment',
    description: 'Targeting hiring managers for recruitment services.',
    sequence: [
      { day: 1, subject: 'Top talent for {{company}}', body: 'Hi {{firstName}}, I saw you are hiring for several roles at {{company}}...' },
      { day: 4, subject: 'Re: Top talent', body: 'Just wanted to follow up on my previous email regarding recruitment...' }
    ]
  },
  {
    id: 'ecommerce-growth',
    title: 'E-commerce Growth',
    description: 'Helping online stores scale their revenue.',
    sequence: [
      { day: 1, subject: 'Scaling {{company}} sales', body: 'Hi {{firstName}}, I love your products at {{company}}. Have you considered...' }
    ]
  },
  {
    id: 'cold-outreach-basic',
    title: 'General Cold Outreach',
    description: 'A versatile template for any B2B outreach.',
    sequence: [
      { day: 1, subject: 'Quick question for {{firstName}}', body: 'Hi {{firstName}}, I was researching {{company}} and had a quick question...' }
    ]
  }
];

const CampaignForm = ({ campaign, onClose, onSave }: any) => {
  const [formData, setFormData] = useState(campaign || {
    title: '',
    description: '',
    status: 'Draft',
    sequence: [{ day: 1, subject: '', body: '' }]
  });

  const addStep = () => {
    setFormData({
      ...formData,
      sequence: [...formData.sequence, { day: formData.sequence.length + 2, subject: '', body: '' }]
    });
  };

  const removeStep = (index: number) => {
    const newSeq = formData.sequence.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, sequence: newSeq });
  };

  const updateStep = (index: number, field: string, value: any) => {
    const newSeq = [...formData.sequence];
    newSeq[index] = { ...newSeq[index], [field]: value };
    setFormData({ ...formData, sequence: newSeq });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="neumorph w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-[2.5rem] flex flex-col"
      >
        <div className="p-8 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center">
          <h3 className="text-2xl font-display font-bold text-slate-800 dark:text-slate-200">
            {campaign?.id ? 'Edit Campaign' : 'Create New Campaign'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Campaign Details</label>
            <input 
              type="text" 
              placeholder="Campaign Title"
              className="w-full px-6 py-4 neumorph-inset rounded-2xl focus:outline-none text-slate-700 dark:text-slate-200 font-medium"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <textarea 
              placeholder="Campaign Description"
              className="w-full px-6 py-4 neumorph-inset rounded-2xl focus:outline-none text-slate-700 dark:text-slate-200 font-medium min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Email Sequence</label>
              <button 
                onClick={addStep}
                className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Step
              </button>
            </div>

            {formData.sequence.map((step: any, i: number) => (
              <div key={i} className="neumorph-sm p-6 rounded-2xl space-y-4 relative">
                <button 
                  onClick={() => removeStep(i)}
                  className="absolute top-4 right-4 p-1 text-rose-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">Day {step.day}</p>
                    <input 
                      type="text" 
                      placeholder="Subject Line"
                      className="w-full mt-2 bg-transparent border-b border-slate-200 focus:border-blue-500 focus:outline-none py-1 text-slate-700 font-medium"
                      value={step.subject}
                      onChange={(e) => updateStep(i, 'subject', e.target.value)}
                    />
                  </div>
                </div>
                <textarea 
                  placeholder="Email Body..."
                  className="w-full bg-transparent border-b border-slate-200 focus:border-blue-500 focus:outline-none py-1 text-slate-700 min-h-[80px]"
                  value={step.body}
                  onChange={(e) => updateStep(i, 'body', e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 border-t border-slate-200/50 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 neumorph-sm rounded-2xl font-bold text-slate-500 hover:text-slate-800 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave(formData)}
            className="flex-1 py-4 bg-blue-600 rounded-2xl font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" /> Save Campaign
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CampaignCard = ({ campaign, onEdit, onDuplicate, onDelete }: any) => {
  const stats = campaign.stats || { leads: 0, sent: 0, opened: 0, clicked: 0, replies: 0, conversions: 0, revenue: 0 };
  const ctr = stats.sent > 0 ? ((stats.clicked / stats.sent) * 100).toFixed(1) : '0.0';
  const conv = stats.sent > 0 ? ((stats.conversions / stats.sent) * 100).toFixed(1) : '0.0';

  return (
    <motion.div 
      layout
      className="neumorph rounded-[2.5rem] p-8 flex flex-col gap-6"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 neumorph-sm rounded-2xl flex items-center justify-center text-blue-600">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-slate-800 dark:text-slate-200">{campaign.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={cn(
                "w-2 h-2 rounded-full",
                campaign.status === 'Active' ? "bg-emerald-500" : 
                campaign.status === 'Paused' ? "bg-amber-500" : "bg-slate-400"
              )} />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{campaign.status}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(campaign)}
            className="neumorph-sm p-3 rounded-xl text-slate-600 hover:text-blue-600"
          >
            <Edit3 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onDuplicate(campaign)}
            className="neumorph-sm p-3 rounded-xl text-slate-600 hover:text-blue-600"
          >
            <Copy className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onDelete(campaign.id)}
            className="neumorph-sm p-3 rounded-xl text-rose-500 hover:bg-rose-50"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Leads", value: stats.leads, icon: Users },
          { label: "Sent", value: stats.sent, icon: Mail },
          { label: "Revenue", value: `₹${(stats.revenue || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Conv.", value: `${conv}%`, icon: Zap, color: "text-blue-600 dark:text-blue-400" }
        ].map((stat, i) => (
          <div key={i} className="neumorph-sm p-4 rounded-2xl text-center">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">{stat.label}</p>
            <p className={cn("text-lg font-display font-bold", stat.color || "text-slate-800 dark:text-slate-200")}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-200/50 flex justify-between items-center">
        <Link 
          to="/dashboard/analytics" 
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-all"
        >
          <BarChart2 className="w-4 h-4" /> Detailed Analytics
        </Link>
        <Link 
          to="/dashboard/leads" 
          className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:gap-3 transition-all"
        >
          View Leads <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
};

export default function CampaignManager() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchCampaigns();

    if (!user) return;
    const subscription = supabase
      .channel('campaigns_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns', filter: `user_id=eq.${user.uid}` }, fetchCampaigns)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, fetchCampaigns]);

  const handleSave = async (data: any) => {
    if (!user) return;
    try {
      if (data.id) {
        const { id, created_at, ...updateData } = data;
        const { error } = await supabase
          .from('campaigns')
          .update(updateData)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('campaigns').insert([{
          ...data,
          user_id: user.uid,
          stats: { leads: 0, sent: 0, opened: 0, clicked: 0, replies: 0, conversions: 0, revenue: 0 }
        }]);
        if (error) throw error;
      }
      setIsFormOpen(false);
      setEditingCampaign(null);
    } catch (error) {
      console.error("Error saving campaign:", error);
    }
  };

  const handleDuplicate = async (campaign: any) => {
    if (!user) return;
    const { id, created_at, ...rest } = campaign;
    await handleSave({ ...rest, title: `${rest.title} (Copy)` });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting campaign:", error);
    }
  };

  const useTemplate = (template: any) => {
    setEditingCampaign({
      title: template.title,
      description: template.description,
      status: 'Draft',
      sequence: template.sequence
    });
    setIsFormOpen(true);
    setShowTemplates(false);
  };

  return (
    <div className="flex flex-col gap-8 p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-slate-200">Campaigns</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage your outreach sequences and follow-ups</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowTemplates(!showTemplates)}
            className="neumorph px-6 py-4 rounded-2xl font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-200 transition-all"
          >
            <Star className="w-5 h-5" /> Templates
          </button>
          <button 
            onClick={() => { setEditingCampaign(null); setIsFormOpen(true); }}
            className="neumorph px-8 py-4 rounded-2xl font-bold text-blue-600 flex items-center gap-2 hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" /> Create Campaign
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showTemplates && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden"
          >
            {TEMPLATES.map(template => (
              <div key={template.id} className="neumorph-sm p-6 rounded-[2rem] flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-800">{template.title}</h4>
                  <p className="text-xs text-slate-500">{template.description}</p>
                </div>
                <button 
                  onClick={() => useTemplate(template)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-all"
                >
                  Use Template
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {campaigns.map(campaign => (
          <CampaignCard 
            key={campaign.id} 
            campaign={campaign} 
            onEdit={(c: any) => { setEditingCampaign(c); setIsFormOpen(true); }}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        ))}
        
        {campaigns.length === 0 && (
          <div className="lg:col-span-2 neumorph rounded-[2.5rem] p-20 flex flex-col items-center justify-center gap-6 text-center">
            <div className="w-20 h-20 neumorph-sm rounded-3xl flex items-center justify-center text-slate-300">
              <Zap className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-slate-800">No campaigns yet</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Create your first campaign or use a template to start reaching out to leads.</p>
            </div>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
            >
              Get Started
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <CampaignForm 
            campaign={editingCampaign} 
            onClose={() => { setIsFormOpen(false); setEditingCampaign(null); }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
