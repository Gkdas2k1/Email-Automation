import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Search, Download, RefreshCw, CheckCircle2, AlertCircle, Clock, Edit2, Check, X, ChevronDown } from 'lucide-react';
import axios from 'axios';

const API_BASE = "http://localhost:8000/api";

const RecipientsPage = () => {
  const [recipients, setRecipients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState(null); // { index, column, value }

  const fetchData = async () => {
    try {
      const [recipientsRes, templatesRes] = await Promise.all([
        axios.get(`${API_BASE}/recipients`),
        axios.get(`${API_BASE}/templates`)
      ]);
      setRecipients(recipientsRes.data);
      setTemplates(templatesRes.data);
    } catch (err) {
      console.error("Error fetching recipients", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async (index, column, value) => {
    try {
      await axios.post(`${API_BASE}/update-recipient`, {
        index,
        column,
        value
      });
      setEditingCell(null);
      fetchData(); // Refresh data
    } catch (err) {
      alert("Failed to update: " + (err.response?.data?.detail || err.message));
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase tracking-wider">Pending</span>;
    const s = String(status);
    if (s.includes('Sent at')) return <span className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Sent</span>;
    if (s.includes('Failed')) return <span className="px-2 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Failed</span>;
    if (s.includes('Will send on')) return <span className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" /> Scheduled</span>;
    return <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase tracking-wider">{s}</span>;
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading recipients...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Recipients List</h1>
          <p className="text-slate-500 dark:text-slate-400">Data loaded from Test Mail.xlsx</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all w-full"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Template</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recipients.map((recipient, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-sm">{recipient.Name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{recipient['Mail ID']}</td>
                  
                  {/* Template Column */}
                  <td className="px-6 py-4 text-sm font-medium">
                    {editingCell?.index === i && editingCell?.column === 'Templates' ? (
                      <div className="flex items-center gap-2">
                        <select 
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs p-1 focus:ring-2 focus:ring-indigo-500"
                          value={editingCell.value}
                          onChange={(e) => setEditingCell({...editingCell, value: e.target.value})}
                        >
                          <option value="">Select Template</option>
                          {templates.map((t, idx) => (
                            <option key={idx} value={t}>{t}</option>
                          ))}
                        </select>
                        <button onClick={() => handleUpdate(i, 'Templates', editingCell.value)} className="text-emerald-500"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingCell(null)} className="text-rose-500"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group/cell">
                        {recipient.Templates ? (
                          <span className="text-slate-900 dark:text-white">{recipient.Templates}</span>
                        ) : (
                          <button 
                            onClick={() => setEditingCell({ index: i, column: 'Templates', value: '' })}
                            className="text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 hover:underline"
                          >
                            <Plus className="w-3 h-3" /> Select Template
                          </button>
                        )}
                        {recipient.Templates && (
                          <button 
                            onClick={() => setEditingCell({ index: i, column: 'Templates', value: recipient.Templates })}
                            className="opacity-0 group-hover/cell:opacity-100 text-slate-400 hover:text-indigo-500 transition-opacity"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4">{getStatusBadge(recipient.Status)}</td>

                  {/* Date Column */}
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {editingCell?.index === i && editingCell?.column === 'Date' ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="date"
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs p-1 focus:ring-2 focus:ring-indigo-500"
                          value={editingCell.value}
                          onChange={(e) => setEditingCell({...editingCell, value: e.target.value})}
                        />
                        <button onClick={() => handleUpdate(i, 'Date', editingCell.value)} className="text-emerald-500"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingCell(null)} className="text-rose-500"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group/cell">
                        <span>{recipient.Date || 'No Date'}</span>
                        <button 
                          onClick={() => setEditingCell({ index: i, column: 'Date', value: recipient.Date || '' })}
                          className="opacity-0 group-hover/cell:opacity-100 text-slate-400 hover:text-indigo-500 transition-opacity"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Plus = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default RecipientsPage;
