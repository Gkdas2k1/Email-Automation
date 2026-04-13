import React, { useState, useEffect, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  ArrowRight,
  Upload,
  Loader2,
  X,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = "http://localhost:8000/api";

const StatCard = ({ title, value, icon: Icon, color, onClick }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    onClick={onClick}
    className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all"
  >
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
    </div>
  </motion.div>
);

const DetailsModal = ({ title, data, onClose, onResend }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800"
    >
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-xl font-bold">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Name</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Email</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                {title.includes('Failed') && <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-4 text-sm font-semibold">{item.Name}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{item['Mail ID']}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      item.Status?.includes('Sent at') ? 'bg-emerald-100 text-emerald-600' :
                      item.Status?.includes('Failed') ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.Status || 'Pending'}
                    </span>
                  </td>
                  {title.includes('Failed') && (
                    <td className="px-4 py-4">
                      <button 
                        onClick={() => onResend(item._originalIndex)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                      >
                        <Send className="w-3 h-3" /> Resend
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500 italic">No recipients found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ sent: 0, pending: 0, failed: 0, templates_count: 0 });
  const [templates, setTemplates] = useState([]);
  const [logs, setLogs] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [modalType, setModalType] = useState(null); // 'sent' | 'pending' | 'failed'
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [statsRes, templatesRes, logsRes, recipientsRes] = await Promise.all([
        axios.get(`${API_BASE}/stats`),
        axios.get(`${API_BASE}/templates`),
        axios.get(`${API_BASE}/logs`),
        axios.get(`${API_BASE}/recipients`)
      ]);
      setStats(statsRes.data);
      setTemplates(templatesRes.data.slice(0, 3));
      setLogs(logsRes.data);
      setRecipients(recipientsRes.data.map((r, i) => ({ ...r, _originalIndex: i })));
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      await axios.post(`${API_BASE}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('File uploaded successfully!');
      fetchData();
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResend = async (index) => {
    try {
      await axios.post(`${API_BASE}/resend`, { index });
      alert('Resend triggered successfully!');
      fetchData();
    } catch (err) {
      alert('Resend failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  const filteredRecipients = recipients.filter(r => {
    if (modalType === 'sent') return r.Status?.includes('Sent at');
    if (modalType === 'failed') return r.Status?.includes('Failed');
    if (modalType === 'pending') return !r.Status || (!r.Status.includes('Sent at') && !r.Status.includes('Failed'));
    return false;
  });

  const statItems = [
    { id: 'sent', title: 'Emails Sent', value: stats.sent, icon: CheckCircle2, color: 'bg-emerald-500' },
    { id: 'pending', title: 'Pending', value: stats.pending, icon: Clock, color: 'bg-amber-500' },
    { id: 'failed', title: 'Failed', value: stats.failed, icon: AlertCircle, color: 'bg-rose-500' },
    { id: 'templates', title: 'Templates', value: stats.templates_count, icon: Mail, color: 'bg-indigo-500' },
  ];

  if (loading) return <div className="flex items-center justify-center h-full">Loading dashboard...</div>;

  return (
    <div className="space-y-8 relative">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" className="hidden" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((stat, i) => (
          <StatCard 
            key={i} 
            {...stat} 
            onClick={() => stat.id !== 'templates' && setModalType(stat.id)}
          />
        ))}
      </div>

      <AnimatePresence>
        {modalType && (
          <DetailsModal 
            title={`${modalType.charAt(0).toUpperCase() + modalType.slice(1)} Recipients`}
            data={filteredRecipients}
            onClose={() => setModalType(null)}
            onResend={handleResend}
          />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-500" /> Source Data
              </h3>
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1">
                {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                Change File
              </button>
            </div>
            <div className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 m-6 rounded-2xl flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h4 className="text-lg font-bold mb-2">Test Mail.xlsx</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mb-6">
                Connected to the Excel source. Total recipients: {stats.sent + stats.pending + stats.failed}
              </p>
              <div className="flex gap-3">
                <button onClick={() => navigate('/recipients')} className="px-6 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
                  View Recipients
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="px-6 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Upload New
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-500" /> Recent Templates
              </h3>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {templates.map((template, i) => (
                <div key={i} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{template}</p>
                      <p className="text-xs text-slate-500">Outlook Template File</p>
                    </div>
                  </div>
                  <button onClick={() => navigate('/templates')} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden h-[500px] flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold">Execution Logs</h3>
              <button onClick={() => navigate('/history')} className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                View All
              </button>
            </div>
            <div className="p-4 space-y-2 overflow-y-auto flex-1 font-mono text-[11px] bg-slate-950 text-slate-300">
              {logs.map((log, i) => (
                <div key={i} className="border-b border-slate-800 pb-1 last:border-0">
                  {log}
                </div>
              ))}
              {logs.length === 0 && <p className="text-slate-500 italic">No logs available yet.</p>}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white">
            <h4 className="font-bold text-lg mb-2">Automation Active</h4>
            <p className="text-indigo-100 text-sm mb-4">
              The backend is ready to process your email campaigns. Make sure Outlook is open.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
