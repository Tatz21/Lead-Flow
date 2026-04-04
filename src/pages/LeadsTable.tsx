import React, { useState, useCallback } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils.ts';

export default function LeadsTable() {
  const [leads, setLeads] = useState([
    { id: 1, name: "John Doe", company: "Acme Corp", email: "john@acme.com", status: "Verified", website: "acme.com" },
    { id: 2, name: "Jane Smith", company: "TechFlow", email: "jane@techflow.io", status: "Pending", website: "techflow.io" },
    { id: 3, name: "Bob Wilson", company: "Global Inc", email: "bob@global.com", status: "Invalid", website: "global.com" },
    { id: 4, name: "Alice Brown", company: "StartUp", email: "alice@startup.co", status: "Verified", website: "startup.co" },
  ]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("Files dropped:", acceptedFiles);
    // Handle CSV upload logic here
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'text/csv': ['.csv'] }
  });

  return (
    <div className="flex flex-col gap-6 p-2">
      {/* Upload Area */}
      <div 
        {...getRootProps()} 
        className={cn(
          "neumorph rounded-[2.5rem] p-12 border-4 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-4",
          isDragActive ? "border-blue-400 bg-blue-50/50" : "border-slate-200/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 neumorph-sm rounded-2xl flex items-center justify-center text-blue-600">
          <Upload className="w-8 h-8" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-display font-bold text-slate-800">Upload Leads CSV</h3>
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
              Add Lead
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
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{lead.name}</p>
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
                    <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
