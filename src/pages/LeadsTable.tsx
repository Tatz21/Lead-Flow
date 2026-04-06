import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  XCircle,
  Clock,
  ExternalLink,
  Trash2,
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase.ts';
import { useAuth } from '../context/AuthContext.tsx';
import axios from 'axios';

import Papa from 'papaparse';
import { GoogleGenAI } from "@google/genai";

export default function LeadsTable() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newLead, setNewLead] = useState({
    first_name: '',
    last_name: '',
    email: '',
    company: '',
    website: '',
    value: 0,
    source: 'LinkedIn'
  });

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const fetchLeads = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLeads();
    
    // Set up real-time subscription
    if (!user) return;
    const subscription = supabase
      .channel('leads_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'leads',
        filter: `user_id=eq.${user.uid}`
      }, () => {
        fetchLeads();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, fetchLeads]);

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const { error } = await supabase.from('leads').insert([{
        ...newLead,
        user_id: user.uid,
        status: 'Pending',
        is_cleaned: true,
        is_email_found: false,
        is_email_sent: false
      }]);

      if (error) throw error;
      
      setShowAddModal(false);
      setNewLead({
        first_name: '',
        last_name: '',
        email: '',
        company: '',
        website: '',
        value: 0,
        source: 'LinkedIn'
      });
    } catch (error) {
      console.error("Error adding lead:", error);
      alert("Failed to add lead. Make sure the 'leads' table exists in Supabase.");
    }
  };

  const cleanLeadWithAI = async (lead: any) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Clean and structure this lead data into a JSON object with fields: first_name, last_name, company, website. 
        If first_name/last_name are missing, try to derive them from email. 
        If company is missing, try to derive it from website or email domain.
        Data: ${JSON.stringify(lead)}`,
        config: {
          responseMimeType: "application/json"
        }
      });
      
      const cleaned = JSON.parse(response.text || '{}');
      return { ...lead, ...cleaned, is_cleaned: true };
    } catch (error) {
      console.error("AI Cleaning failed:", error);
      return { ...lead, is_cleaned: false };
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user || acceptedFiles.length === 0) return;
    setUploading(true);
    
    const file = acceptedFiles[0];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rawLeads = results.data;
        try {
          for (const rawLead of rawLeads as any[]) {
            // Basic mapping if headers don't match exactly
            const mappedLead = {
              first_name: rawLead.first_name || rawLead.FirstName || rawLead.Name?.split(' ')[0] || '',
              last_name: rawLead.last_name || rawLead.LastName || rawLead.Name?.split(' ').slice(1).join(' ') || '',
              email: rawLead.email || rawLead.Email || '',
              company: rawLead.company || rawLead.Company || '',
              website: rawLead.website || rawLead.Website || '',
              value: Number(rawLead.value || rawLead.Value || 0),
              source: rawLead.source || rawLead.Source || 'CSV Upload'
            };

            const cleanedLead = await cleanLeadWithAI(mappedLead);
            
            await supabase.from('leads').insert([{
              ...cleanedLead,
              user_id: user.uid,
              status: 'Verified',
              is_email_found: !!cleanedLead.email,
              is_email_sent: false
            }]);
          }
        } catch (error) {
          console.error("Upload processing failed:", error);
          alert("Error processing CSV. Please ensure the 'leads' table exists in Supabase.");
        } finally {
          setUploading(false);
        }
      },
      error: (error) => {
        console.error("CSV Parsing failed:", error);
        setUploading(false);
      }
    });
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this lead?")) return;
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      // fetchLeads() will be triggered by subscription
    } catch (error) {
      console.error("Error deleting lead:", error);
      alert("Failed to delete lead.");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    disabled: uploading
  });

  const filteredLeads = leads.filter(lead => 
    `${lead.first_name} ${lead.last_name} ${lead.email} ${lead.company}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 md:gap-6 p-2 pb-24 md:pb-2">
      {/* Add Lead Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="neumorph w-full max-w-xl p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl md:text-2xl font-display font-bold text-slate-800 dark:text-slate-200">Add New Lead</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 neumorph-sm rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddLead} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-2 uppercase tracking-wider">First Name</label>
                  <input 
                    required
                    type="text" 
                    value={newLead.first_name}
                    onChange={e => setNewLead({...newLead, first_name: e.target.value})}
                    className="w-full px-4 py-3 neumorph-inset rounded-2xl focus:outline-none text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-2 uppercase tracking-wider">Last Name</label>
                  <input 
                    required
                    type="text" 
                    value={newLead.last_name}
                    onChange={e => setNewLead({...newLead, last_name: e.target.value})}
                    className="w-full px-4 py-3 neumorph-inset rounded-2xl focus:outline-none text-sm"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-2 uppercase tracking-wider">Email Address</label>
                  <input 
                    required
                    type="email" 
                    value={newLead.email}
                    onChange={e => setNewLead({...newLead, email: e.target.value})}
                    className="w-full px-4 py-3 neumorph-inset rounded-2xl focus:outline-none text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-2 uppercase tracking-wider">Company</label>
                  <input 
                    type="text" 
                    value={newLead.company}
                    onChange={e => setNewLead({...newLead, company: e.target.value})}
                    className="w-full px-4 py-3 neumorph-inset rounded-2xl focus:outline-none text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-2 uppercase tracking-wider">Website</label>
                  <input 
                    type="text" 
                    value={newLead.website}
                    onChange={e => setNewLead({...newLead, website: e.target.value})}
                    className="w-full px-4 py-3 neumorph-inset rounded-2xl focus:outline-none text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-2 uppercase tracking-wider">Value (₹)</label>
                  <input 
                    type="number" 
                    value={newLead.value}
                    onChange={e => setNewLead({...newLead, value: Number(e.target.value)})}
                    className="w-full px-4 py-3 neumorph-inset rounded-2xl focus:outline-none text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-2 uppercase tracking-wider">Source</label>
                  <select 
                    value={newLead.source}
                    onChange={e => setNewLead({...newLead, source: e.target.value})}
                    className="w-full px-4 py-3 neumorph-inset rounded-2xl focus:outline-none bg-transparent text-sm"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Direct Web">Direct Web</option>
                    <option value="Referrals">Referrals</option>
                    <option value="Cold Email">Cold Email</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex gap-4 mt-6">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-4 neumorph-sm rounded-2xl font-bold text-slate-500 hover:text-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-blue-600 rounded-2xl font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all"
                  >
                    Save Lead
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Area - Hidden on small mobile for cleaner look, or made compact */}
      <div 
        {...getRootProps()} 
        className={cn(
          "neumorph rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 border-4 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 md:gap-4",
          isDragActive ? "border-blue-400 bg-blue-50/50" : "border-slate-200/50",
          uploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="w-12 h-12 md:w-16 md:h-16 neumorph-sm rounded-2xl flex items-center justify-center text-blue-600">
          {uploading ? <div className="w-6 h-6 md:w-8 md:h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /> : <Upload className="w-6 h-6 md:w-8 md:h-8" />}
        </div>
        <div className="text-center">
          <h3 className="text-lg md:text-xl font-display font-bold text-slate-800 dark:text-slate-200">
            {uploading ? 'Processing Leads...' : 'Upload Leads CSV'}
          </h3>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Drag & drop or click to browse</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="neumorph rounded-[2rem] md:rounded-[2.5rem] overflow-hidden flex flex-col">
        <div className="p-4 md:p-8 border-b border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 neumorph-inset rounded-2xl focus:outline-none text-slate-700 dark:text-slate-200 text-sm"
            />
          </div>
          <div className="flex w-full md:w-auto gap-3">
            <button className="neumorph-sm p-3 rounded-xl text-slate-600 hover:text-blue-600 flex-1 md:flex-none flex justify-center">
              <Filter className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="neumorph-sm px-6 py-3 rounded-xl font-bold text-blue-600 hover:scale-105 transition-all flex items-center justify-center gap-2 flex-[2] md:flex-none"
            >
              <Plus className="w-5 h-5" /> Add Lead
            </button>
          </div>
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden flex flex-col divide-y divide-slate-200/50">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 neumorph-sm rounded-xl flex items-center justify-center font-bold text-blue-600">
                    {lead.first_name?.charAt(0) || 'L'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{lead.first_name} {lead.last_name}</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{lead.company}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(lead.id)}
                  className="p-2 neumorph-sm rounded-lg text-rose-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Value</p>
                  <p className="font-bold text-slate-800">₹{(lead.value || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold",
                  lead.status === 'Verified' ? "bg-emerald-100 text-emerald-700" :
                  lead.status === 'Pending' ? "bg-amber-100 text-amber-700" :
                  "bg-rose-100 text-rose-700"
                )}>
                  {lead.status === 'Verified' ? <CheckCircle2 className="w-3 h-3" /> :
                   lead.status === 'Pending' ? <Clock className="w-3 h-3" /> :
                   <XCircle className="w-3 h-3" />}
                  {lead.status}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-8 py-6">Lead</th>
                <th className="px-8 py-6">Company</th>
                <th className="px-8 py-6">Value</th>
                <th className="px-8 py-6">Source</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 neumorph-sm rounded-xl flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                        {lead.first_name?.charAt(0) || 'L'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{lead.first_name} {lead.last_name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{lead.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-medium text-slate-600 dark:text-slate-400">{lead.company}</td>
                  <td className="px-8 py-6 font-bold text-slate-800 dark:text-slate-200">₹{(lead.value || 0).toLocaleString('en-IN')}</td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      {lead.source || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      lead.status === 'Verified' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                      lead.status === 'Pending' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                      "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                    )}>
                      {lead.status === 'Verified' ? <CheckCircle2 className="w-3 h-3" /> :
                       lead.status === 'Pending' ? <Clock className="w-3 h-3" /> :
                       <XCircle className="w-3 h-3" />}
                      {lead.status}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => handleDelete(lead.id)}
                      className="p-2 neumorph-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all text-rose-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLeads.length === 0 && !loading && (
          <div className="px-8 py-20 text-center text-slate-400 font-medium">
            No leads found. Upload a CSV or add one manually.
          </div>
        )}
      </div>
    </div>
  );
}

