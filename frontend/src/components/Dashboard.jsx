import React, { useState } from 'react';
import { 
  Send, 
  FileSpreadsheet, 
  Mail, 
  Settings, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  LayoutDashboard,
  Users,
  History,
  Search,
  Plus,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const StatCard = ({ title, value, icon: Icon, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4"
  >
    <div className={cn("p-3 rounded-xl", color)}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const stats = [
    { title: 'Emails Sent', value: '1,284', icon: CheckCircle2, color: 'bg-emerald-500' },
    { title: 'Pending', value: '42', icon: Clock, color: 'bg-amber-500' },
    { title: 'Failed', value: '3', icon: AlertCircle, color: 'bg-rose-500' },
    { title: 'Templates', value: '12', icon: Mail, color: 'bg-indigo-500' },
  ];

  const activities = [
    { id: 1, email: 'john.doe@example.com', status: 'Sent', time: '2 mins ago', template: 'Welcome Mail' },
    { id: 2, email: 'sarah.smith@company.com', status: 'Pending', time: '5 mins ago', template: 'Follow-up' },
    { id: 3, email: 'mike.jones@domain.org', status: 'Failed', time: '10 mins ago', template: 'Offer Letter' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-900 dark:text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Send className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">MailFlow</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'templates', icon: Mail, label: 'Templates' },
            { id: 'recipients', icon: Users, label: 'Recipients' },
            { id: 'history', icon: History, label: 'History' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                activeTab === item.id 
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Automation Status</p>
            <div className="flex items-center gap-2 mb-3">
              <div className={cn("w-2 h-2 rounded-full", isRunning ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
              <span className="text-sm font-medium">{isRunning ? 'Running' : 'Paused'}</span>
            </div>
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className={cn(
                "w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors",
                isRunning 
                  ? "bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400" 
                  : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
              )}
            >
              {isRunning ? <><Pause className="w-4 h-4" /> Stop</> : <><Play className="w-4 h-4" /> Start</>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-bold capitalize">{activeTab}</h2>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search everything..." 
                className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all w-64"
              />
            </div>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" /> New Campaign
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* File & Config Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-indigo-500" /> Source Data
                  </h3>
                  <button className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Change File</button>
                </div>
                <div className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 m-6 rounded-2xl flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-4">
                    <FileSpreadsheet className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">Test Mail.xlsx</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mb-6">
                    Last synced 5 minutes ago. Contains 1,329 recipient records.
                  </p>
                  <div className="flex gap-3">
                    <button className="px-6 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-bold">View Data</button>
                    <button className="px-6 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800">Refresh</button>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold flex items-center gap-2">
                    <Mail className="w-5 h-5 text-indigo-500" /> Active Templates
                  </h3>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {['Customer Mail New.msg', 'New Partners.msg', 'Offer Mail.msg'].map((template, i) => (
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
                      <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold">Recent Activity</h3>
                </div>
                <div className="p-6 space-y-6">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2 shrink-0",
                        activity.status === 'Sent' ? "bg-emerald-500" : 
                        activity.status === 'Failed' ? "bg-rose-500" : "bg-amber-500"
                      )} />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <p className="text-sm font-bold truncate max-w-[150px]">{activity.email}</p>
                          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{activity.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                          {activity.status} using {activity.template}
                        </p>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: activity.status === 'Sent' ? '100%' : '30%' }}
                            className={cn(
                              "h-full",
                              activity.status === 'Sent' ? "bg-emerald-500" : 
                              activity.status === 'Failed' ? "bg-rose-500" : "bg-amber-500"
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-3 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors">
                    View Full History
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white">
                <h4 className="font-bold text-lg mb-2">Pro Tip!</h4>
                <p className="text-indigo-100 text-sm mb-4">
                  You can personalize your emails by adding placeholders like {"{Name}"} in your Outlook templates.
                </p>
                <button className="w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-sm font-semibold transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
