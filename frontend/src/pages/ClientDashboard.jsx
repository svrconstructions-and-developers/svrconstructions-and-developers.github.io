import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Percent, Image as ImageIcon, MessageSquare, Send, CheckCircle2, User, HardHat, FileText, Sparkles, Building, Info } from 'lucide-react';
import api from '../services/api';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Chat input state
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Gallery category filter
  const [imageFilter, setImageFilter] = useState('all');

  const fetchDashboard = () => {
    setLoading(true);
    api.get('/api/client/dashboard')
      .then((res) => {
        setDashboardData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching client dashboard:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboard();
    
    // Auto refresh chat/progress every 10 seconds for real-time feel
    const interval = setInterval(() => {
      api.get('/api/client/dashboard')
        .then((res) => setDashboardData(res.data))
        .catch((e) => console.log('Silent sync error:', e));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSendingMsg(true);
    try {
      await api.post('/api/client/messages', { message: newMessage });
      setNewMessage('');
      
      // Refresh dashboard to display new message
      const res = await api.get('/api/client/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingMsg(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
      </div>
    );
  }

  // Handle case where client has no assigned project
  if (!dashboardData || !dashboardData.hasProject) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="glass-panel p-12 rounded-3xl space-y-6 border border-charcoal-800">
          <div className="bg-gold-500/10 p-4 rounded-full w-fit mx-auto border border-gold-500/25">
            <Building className="h-12 w-12 text-gold-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Welcome, {dashboardData?.clientName || user?.name}!</h2>
            <p className="text-gold-500 font-semibold">Account Pending Project Assignment</p>
            <p className="text-slate-400 max-w-lg mx-auto text-sm font-light">
              Your client profile has been registered successfully. However, our administrators have not yet linked your account to an active project layout. 
            </p>
          </div>
          <div className="p-4 bg-charcoal-900 rounded-2xl flex items-center gap-3 border border-charcoal-800 max-w-md mx-auto text-left text-xs text-slate-400">
            <Info className="h-5 w-5 text-gold-500 flex-shrink-0" />
            <span>Please contact SVR Engineering Office with your email ID (<b>{user?.email}</b>) to link your active plot construction.</span>
          </div>
        </div>
      </div>
    );
  }

  const { project, clientName, companyName } = dashboardData;
  const filteredImages = imageFilter === 'all' 
    ? project.images 
    : project.images.filter(img => img.image_type === imageFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Dashboard Top Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-charcoal-800 shadow-xl bg-gradient-to-r from-charcoal-900 via-charcoal-950 to-charcoal-900">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gold-500 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-4 w-4" /> Client Dashboard Portal
          </div>
          <h1 className="text-3xl font-extrabold text-white">{project.name}</h1>
          <p className="text-sm text-slate-400">Client: <span className="text-slate-200 font-semibold">{clientName}</span> | Organization: <span className="text-slate-200 font-semibold">{companyName}</span></p>
        </div>

        <div className="flex flex-col items-end gap-1.5 bg-gold-500/10 border border-gold-500/20 px-6 py-4 rounded-2xl">
          <span className="text-xs uppercase tracking-wider text-gold-500 font-bold">Overall Progress</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white">{project.overallPercentage}%</span>
            <span className="text-xs text-slate-400">Completed</span>
          </div>
        </div>
      </div>

      {/* Grid: Left column (Progress Details & Gallery) | Right column (Supervisor Chat) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Progress Tracking and Images */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Progress Tracker (Checklist / Percentage bar) */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Percent className="text-gold-500 h-5 w-5" /> Structural Milestones & Completion Bar
            </h3>
            
            {/* Visual Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-charcoal-900 rounded-full h-4 overflow-hidden border border-charcoal-800">
                <div
                  className="bg-gradient-to-r from-gold-600 to-gold-400 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${project.overallPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-semibold">
                <span>Excavation (0%)</span>
                <span>Framing (50%)</span>
                <span>Finishing (100%)</span>
              </div>
            </div>

            {/* Checklist of stages */}
            <div className="space-y-4 pt-4 border-t border-charcoal-800/60">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Construction Timeline Details</h4>
              
              {project.progressSteps.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No milestone reports entered by admin yet.</p>
              ) : (
                <div className="space-y-4">
                  {project.progressSteps.map((step) => (
                    <div key={step.id} className="flex items-start gap-4 p-4 bg-charcoal-900/60 border border-charcoal-800 rounded-2xl">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl text-emerald-400 flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="flex-grow space-y-1">
                        <div className="flex justify-between items-baseline gap-4">
                          <h5 className="font-bold text-white text-sm">{step.stage}</h5>
                          <span className="text-xs text-gold-500 font-bold bg-gold-500/5 px-2 py-0.5 rounded border border-gold-500/15">{step.percentage}%</span>
                        </div>
                        <p className="text-xs text-slate-400 font-light leading-relaxed">{step.description}</p>
                        <span className="text-[9px] text-slate-500 block pt-1">Logged: {new Date(step.updated_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Project Images Gallery */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-baseline gap-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ImageIcon className="text-gold-500 h-5 w-5" /> Progress Photo Gallery
              </h3>
              
              {/* Category Filters */}
              <div className="flex bg-charcoal-900 border border-charcoal-800 rounded-xl p-1 gap-1 text-xs">
                {['all', 'before', 'ongoing', 'completed'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setImageFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider transition-luxury ${
                      imageFilter === tab 
                        ? 'bg-gold-500 text-charcoal-950 shadow' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {filteredImages.length === 0 ? (
              <div className="text-center py-12 bg-charcoal-950/40 rounded-2xl border border-dashed border-charcoal-850">
                <ImageIcon className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-xs text-slate-500">No images available for the selected category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {filteredImages.map((img) => (
                  <div key={img.id} className="group relative rounded-xl overflow-hidden shadow h-48 border border-charcoal-850">
                    <img
                      src={img.image_url}
                      alt="Construction site status"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-transparent to-transparent opacity-80"></div>
                    <span className="absolute bottom-3 left-3 bg-gold-500/90 text-charcoal-950 font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full">
                      {img.image_type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Project Messages / supervisor Chat */}
        <div className="lg:col-span-4 h-fit">
          <div className="glass-panel rounded-3xl border border-charcoal-800 shadow-xl overflow-hidden flex flex-col h-[600px]">
            {/* Chat Header */}
            <div className="bg-charcoal-900 border-b border-charcoal-800/80 px-6 py-4 flex items-center gap-3">
              <div className="bg-gold-500/10 border border-gold-500/25 p-2 rounded-xl text-gold-500">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Supervisor Chat</h4>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  Active line to Engineering Admin
                </p>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-charcoal-950/20">
              {project.messages.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <MessageSquare className="h-8 w-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-500">No chat history. Send a message to start conversation with SVR developers.</p>
                </div>
              ) : (
                project.messages.map((msg) => {
                  const isAdminRole = msg.sender_role === 'admin';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isAdminRole ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                          isAdminRole
                            ? 'bg-charcoal-850 text-slate-100 border border-charcoal-800 rounded-tl-none'
                            : 'bg-gold-500 text-charcoal-950 font-medium rounded-tr-none shadow'
                        }`}
                      >
                        <div className="flex justify-between items-center gap-4 mb-1">
                          <span className={`font-black text-[9px] uppercase tracking-wider ${isAdminRole ? 'text-gold-400' : 'text-charcoal-800'}`}>
                            {isAdminRole ? 'SVR Admin' : 'You'}
                          </span>
                          <span className={`text-[8px] ${isAdminRole ? 'text-slate-500' : 'text-charcoal-600'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Send Form */}
            <form onSubmit={handleSendMessage} className="bg-charcoal-900 border-t border-charcoal-800 p-4 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type update request or query..."
                className="flex-grow bg-charcoal-950 border border-charcoal-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500 text-xs"
              />
              <button
                type="submit"
                disabled={sendingMsg || !newMessage.trim()}
                className="bg-gold-500 hover:bg-gold-400 text-charcoal-950 p-2.5 rounded-xl transition-luxury shadow flex-shrink-0 disabled:bg-charcoal-800 disabled:text-slate-500"
              >
                {sendingMsg ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-charcoal-950 border-t-transparent"></div>
                ) : (
                  <Send className="h-4.5 w-4.5" />
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
