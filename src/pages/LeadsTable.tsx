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
import { 
  collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { useAuth } from '../context/AuthContext.tsx';
import axios from 'axios';

export default function LeadsTable() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'leads'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeads(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user || acceptedFiles.length === 0) return;
    setUploading(true);
    
    const file = acceptedFiles[0];
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      try {
        // In a real app, we'd send this to the backend agent
        // For this demo, we'll simulate the cleaning process and add to Firestore
        const response = await axios.post('/api/leads/upload', { csvData: text });
        console.log("Upload response:", response.data);
        
        // Simulating AI cleaning and adding a few leads
        const mockLeads = [
          { firstName: "New", lastName: "Lead", email: "new@example.com", company: "Future Corp", website: "future.com", status: "Pending" },
          { firstName: "AI", lastName: "Agent", email: "ai@bot.io", company: "Botics", website: "botics.io", status: "Verified" }
        ];

        for (const lead of mockLeads) {
          await addDoc(collection(db, 'leads'), {
            ...lead,
            userId: user.uid,
            createdAt: serverTimestamp()
          });
        }
        alert("Leads uploaded and processing started!");
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsText(file);
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this lead?")) return;
    await deleteDoc(doc(db, 'leads', id));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    disabled: uploading
  });

  return (
    <div className="flex flex-col gap-6 p-2">
      {/* Upload Area */}
      <div 
        {...getRootProps()} 
        className={cn(
          "neumorph rounded-[2.5rem] p-12 border-4 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-4",
          isDragActive ? "border-blue-400 bg-blue-50/50" : "border-slate-200/50",
          uploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 neumorph-sm rounded-2xl flex items-center justify-center text-blue-600">
          {uploading ? <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /> : <Upload className="w-8 h-8" />}
        </div>
        <div className="text-center">
          <h3 className="text-xl font-display font-bold text-slate-800">
            {uploading ? 'Processing Leads...' : 'Upload Leads CSV'}
          </h3>
          <p className="text-slate-500">Drag and drop your file here, or click to browse</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="neumorph rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              className="w-full pl-12 pr-4 py-3 neumorph-inset rounded-2xl focus:outline-none text-slate-700"
            />
          </div>
          <div className="flex gap-3">
            <button className="neumorph-sm p-3 rounded-xl text-slate-600 hover:text-blue-600">
              <Filter className="w-5 h-5" />
            </button>
            <button className="neumorph-sm px-6 py-3 rounded-xl font-bold text-blue-600 hover:scale-105 transition-all">
              <Plus className="w-5 h-5" /> Add Lead
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-500 text-sm font-bold uppercase tracking-wider">
              <tr>
                <th className="px-8 py-6">Lead</th>
                <th className="px-8 py-6">Company</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Website</th>
                <th className="px-8 py-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 neumorph-sm rounded-xl flex items-center justify-center font-bold text-blue-600">
                        {lead.firstName?.charAt(0) || 'L'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{lead.firstName} {lead.lastName}</p>
                        <p className="text-xs text-slate-500">{lead.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-medium text-slate-600">{lead.company}</td>
                  <td className="px-8 py-6">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                      lead.status === 'Verified' ? "bg-emerald-100 text-emerald-700" :
                      lead.status === 'Pending' ? "bg-amber-100 text-amber-700" :
                      "bg-rose-100 text-rose-700"
                    )}>
                      {lead.status === 'Verified' ? <CheckCircle2 className="w-3 h-3" /> :
                       lead.status === 'Pending' ? <Clock className="w-3 h-3" /> :
                       <XCircle className="w-3 h-3" />}
                      {lead.status}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <a href={`https://${lead.website}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      {lead.website} <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => handleDelete(lead.id)}
                      className="p-2 hover:bg-rose-50 rounded-lg transition-colors text-rose-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-medium">
                    No leads found. Upload a CSV to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

