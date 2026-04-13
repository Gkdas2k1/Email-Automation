import React, { useState, useEffect } from 'react';
import { History, Search, Filter, Download, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE = "http://localhost:8000/api";

const HistoryPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${API_BASE}/logs`);
        setLogs(res.data);
      } catch (err) {
        console.error("Error fetching logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div>Loading logs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Execution History</h1>
          <p className="text-slate-500 dark:text-slate-400">Detailed automation logs from the backend</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" /> Export Logs
          </button>
        </div>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-3 h-3" /> System Online
            </div>
            <div className="text-slate-500 text-xs font-mono">automation.log</div>
          </div>
          <div className="flex gap-2">
             <button className="p-1 hover:bg-slate-800 rounded text-slate-400">
               <Filter className="w-4 h-4" />
             </button>
             <button className="p-1 hover:bg-slate-800 rounded text-slate-400">
               <Search className="w-4 h-4" />
             </button>
          </div>
        </div>
        <div className="p-6 font-mono text-sm space-y-2 max-h-[600px] overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-4 group">
              <span className="text-slate-600 shrink-0 select-none text-right w-10">{i + 1}</span>
              <span className={log.includes('ERROR') ? 'text-rose-400' : log.includes('WARNING') ? 'text-amber-400' : 'text-slate-300'}>
                {log}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="p-12 text-center text-slate-600 italic">
              No logs found on the server.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
