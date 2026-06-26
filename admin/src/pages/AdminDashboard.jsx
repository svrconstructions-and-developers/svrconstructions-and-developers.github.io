import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, Users, Building, MessageSquare, Star, Inbox, FileText, Send, 
  Trash2, Plus, Edit2, Check, X, ShieldAlert, Sparkles, Image as ImageIcon, Percent, Loader2 
} from 'lucide-react';
import api from '../services/api';

export default function AdminDashboard() {
  const { adminUser, adminLogout } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  
  // Data lists
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [quotations, setQuotations] = useState([]);

  // Loaders
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Status message
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Modal / Form states
  const [clientModal, setClientModal] = useState({ open: false, mode: 'add', data: { name: '', email: '', password: '', phone: '', company: '', projectId: '' } });
  const [projectModal, setProjectModal] = useState({ open: false, mode: 'add', id: null, data: { name: '', clientName: '', type: '', description: '', completionDate: '', isFeatured: false, imageUrl: '' } });
  
  // Progress tracker editor state
  const [selectedProgressProject, setSelectedProgressProject] = useState('');
  const [progressForm, setProgressForm] = useState({ stage: '', percentage: 0, description: '' });
  const [adminChatForm, setAdminChatForm] = useState({ message: '' });
  const [projectChat, setProjectChat] = useState([]);
  const [projectImagesList, setProjectImagesList] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadImageType, setUploadImageType] = useState('ongoing');

  // Manual Email composer state
  const [emailForm, setEmailForm] = useState({ clientEmail: '', subject: '', message: '' });

  const categories = [
    'Residential Construction',
    'Commercial Construction',
    'Industrial Construction',
    'Interior & Renovation',
    'Infrastructure & Civil Works'
  ];

  // Refresh feedback helper
  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
  };

  const loadAnalytics = () => {
    setLoadingAnalytics(true);
    api.get('/api/admin/analytics')
      .then((res) => {
        setAnalytics(res.data);
        setLoadingAnalytics(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingAnalytics(false);
      });
  };

  const loadTabData = (tab) => {
    setLoadingData(true);
    let endpoint = '';
    if (tab === 'clients') endpoint = '/api/admin/clients';
    else if (tab === 'projects') endpoint = '/api/admin/projects';
    else if (tab === 'reviews') endpoint = '/api/admin/reviews';
    else if (tab === 'contacts') endpoint = '/api/admin/contacts';
    else if (tab === 'quotations') endpoint = '/api/admin/quotations';
    else {
      setLoadingData(false);
      return;
    }

    api.get(endpoint)
      .then((res) => {
        if (tab === 'clients') setClients(res.data);
        else if (tab === 'projects') setProjects(res.data);
        else if (tab === 'reviews') setReviews(res.data);
        else if (tab === 'contacts') setContacts(res.data);
        else if (tab === 'quotations') setQuotations(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingData(false));
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    loadTabData(activeTab);
    if (activeTab === 'progress' && projects.length === 0) {
      // Load projects if not already loaded to populate dropdown
      api.get('/api/admin/projects').then((res) => setProjects(res.data));
    }
  }, [activeTab]);

  // Load chat & images of a selected project in Progress tab
  const handleProgressProjectSelect = async (projId) => {
    setSelectedProgressProject(projId);
    if (!projId) {
      setProjectChat([]);
      setProjectImagesList([]);
      return;
    }
    fetchProgressDetails(projId);
  };

  // Add Client
  const handleClientSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (clientModal.mode === 'add') {
        await api.post('/api/admin/clients', clientModal.data);
        showFeedback('success', 'Client account registered successfully.');
      } else {
        await api.put(`/api/admin/clients/${clientModal.data.id}`, clientModal.data);
        showFeedback('success', 'Client details updated.');
      }
      setClientModal({ ...clientModal, open: false });
      loadTabData('clients');
      loadAnalytics();
    } catch (err) {
      showFeedback('error', err.response?.data?.error || 'Client request failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Client
  const handleClientDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this client?')) return;
    try {
      await api.delete(`/api/admin/clients/${id}`);
      showFeedback('success', 'Client account deleted.');
      loadTabData('clients');
      loadAnalytics();
    } catch (err) {
      showFeedback('error', 'Failed to delete client.');
    }
  };

  // Project CRUD
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (projectModal.mode === 'add') {
        await api.post('/api/admin/projects', projectModal.data);
        showFeedback('success', 'Project created successfully.');
      } else {
        await api.put(`/api/admin/projects/${projectModal.id}`, projectModal.data);
        showFeedback('success', 'Project details modified.');
      }
      setProjectModal({ ...projectModal, open: false });
      loadTabData('projects');
      loadAnalytics();
    } catch (err) {
      showFeedback('error', err.response?.data?.error || 'Project modification failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Project
  const handleProjectDelete = async (id) => {
    if (!window.confirm('Delete this project? All associated progress and chat logs will be lost.')) return;
    try {
      await api.delete(`/api/admin/projects/${id}`);
      showFeedback('success', 'Project removed from database.');
      loadTabData('projects');
      loadAnalytics();
    } catch (e) {
      showFeedback('error', 'Failed to delete project.');
    }
  };

  // Progress update (Milestones)
  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProgressProject || !progressForm.stage) return;
    setActionLoading(true);
    try {
      await api.post(`/api/admin/projects/${selectedProgressProject}/progress`, progressForm);
      showFeedback('success', 'Project progress checklist updated.');
      setProgressForm({ stage: '', percentage: 0, description: '' });
      // Reload details
      fetchProgressDetails(selectedProgressProject);
      loadAnalytics();
    } catch (err) {
      showFeedback('error', 'Failed to update progress.');
    } finally {
      setActionLoading(false);
    }
  };

  // Post admin message to chat
  const handleAdminChatSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProgressProject || !adminChatForm.message.trim()) return;
    setActionLoading(true);
    try {
      await api.post(`/api/admin/projects/${selectedProgressProject}/messages`, adminChatForm);
      setAdminChatForm({ message: '' });
      fetchProgressDetails(selectedProgressProject);
    } catch (err) {
      showFeedback('error', 'Failed to post message.');
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch chat and images for selected project
  const fetchProgressDetails = async (projId) => {
    try {
      api.get(`/api/admin/projects-progress/${projId}`).then(details => {
        setProjectChat(details.data.messages || []);
        setProjectImagesList(details.data.images || []);
      }).catch(err => {
        console.log("No messages/images admin route yet.");
      });
    } catch (e) {
      console.log(e);
    }
  };

  // Upload Progress Image
  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!selectedProgressProject) return;
    setActionLoading(true);
    
    const formData = new FormData();
    formData.append('imageType', uploadImageType);
    if (uploadFile) {
      formData.append('image', uploadFile);
    } else {
      showFeedback('error', 'Please select an image file to upload.');
      setActionLoading(false);
      return;
    }

    try {
      await api.post(`/api/admin/projects/${selectedProgressProject}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showFeedback('success', 'Progress image uploaded.');
      setUploadFile(null);
      document.getElementById('image-upload-input').value = '';
      fetchProgressDetails(selectedProgressProject);
    } catch (err) {
      showFeedback('error', 'Failed to upload progress image.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Progress Image
  const handleImageDelete = async (imgId) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await api.delete(`/api/admin/images/${imgId}`);
      showFeedback('success', 'Image removed.');
      fetchProgressDetails(selectedProgressProject);
    } catch (e) {
      showFeedback('error', 'Failed to delete image.');
    }
  };

  // Approve review
  const handleApproveReview = async (id) => {
    try {
      await api.put(`/api/admin/reviews/${id}/approve`);
      showFeedback('success', 'Review approved and ratings updated.');
      loadTabData('reviews');
      loadAnalytics();
    } catch (e) {
      showFeedback('error', 'Failed to approve review.');
    }
  };

  // Reject review
  const handleRejectReview = async (id) => {
    if (!window.confirm('Delete/Reject this review?')) return;
    try {
      await api.delete(`/api/admin/reviews/${id}`);
      showFeedback('success', 'Review rejected and removed.');
      loadTabData('reviews');
      loadAnalytics();
    } catch (e) {
      showFeedback('error', 'Failed to reject review.');
    }
  };

  // Delete contact form
  const handleDeleteContact = async (id) => {
    if (!window.confirm('Delete contact log?')) return;
    try {
      await api.delete(`/api/admin/contacts/${id}`);
      showFeedback('success', 'Contact entry removed.');
      loadTabData('contacts');
      loadAnalytics();
    } catch (e) {
      showFeedback('error', 'Failed to delete record.');
    }
  };

  // Delete quotation
  const handleDeleteQuotation = async (id) => {
    if (!window.confirm('Delete quotation request?')) return;
    try {
      await api.delete(`/api/admin/quotations/${id}`);
      showFeedback('success', 'Quotation request entry deleted.');
      loadTabData('quotations');
      loadAnalytics();
    } catch (e) {
      showFeedback('error', 'Failed to delete record.');
    }
  };

  // Send Manual Notification Email to Client
  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailForm.clientEmail || !emailForm.subject || !emailForm.message) return;
    setActionLoading(true);
    try {
      const res = await api.post('/api/admin/email-client', emailForm);
      showFeedback('success', res.data.message);
      setEmailForm({ clientEmail: '', subject: '', message: '' });
    } catch (err) {
      showFeedback('error', err.response?.data?.error || 'Failed to send notification email.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    adminLogout();
    // Redirect to parent/home page
    window.location.href = '/';
  };

  const menuItems = [
    { id: 'analytics', label: 'Analytics Overview', icon: BarChart3 },
    { id: 'clients', label: 'Client Manager', icon: Users },
    { id: 'projects', label: 'Project Editor', icon: Building },
    { id: 'progress', label: 'Milestones & Chat', icon: Percent },
    { id: 'reviews', label: 'Reviews Moderation', icon: Star },
    { id: 'contacts', label: 'Inquiries Box', icon: Inbox },
    { id: 'quotations', label: 'Quotations Box', icon: FileText },
    { id: 'email', label: 'Email Outreach', icon: Send }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Feedback Alert */}
      {feedback.message && (
        <div
          className={`fixed top-24 right-8 z-50 p-4 rounded-xl shadow-2xl max-w-sm border transition-luxury ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-gold-500 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="h-4 w-4" /> Security Level: {adminUser?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </div>
          <h1 className="text-3xl font-extrabold text-white">SVR Control Panel</h1>
          <p className="text-sm text-slate-400">Welcome back, <span className="text-slate-200 font-semibold">{adminUser?.username || adminUser?.name}</span>. Manage SVR websites structures.</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-charcoal-900 border border-charcoal-800 text-slate-300 hover:text-red-400 px-4 py-2 rounded-xl text-xs font-semibold transition-luxury"
        >
          Logout Admin
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Menu */}
        <div className="lg:col-span-3 bg-charcoal-900 border border-charcoal-800 rounded-3xl p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-semibold transition-luxury ${
                  activeTab === item.id 
                    ? 'bg-gold-500 text-charcoal-950 shadow-md font-bold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-charcoal-800/40'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dashboard Details Container */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* TAB: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {loadingAnalytics ? (
                <div className="flex h-48 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold-500" /></div>
              ) : (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="glass-panel p-6 rounded-2xl border border-charcoal-800">
                      <Building className="text-gold-500 h-6 w-6 mb-2" />
                      <h4 className="text-2xl font-black text-white">{analytics.projectsCount}</h4>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Total Projects</p>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl border border-charcoal-800">
                      <Users className="text-gold-500 h-6 w-6 mb-2" />
                      <h4 className="text-2xl font-black text-white">{analytics.clientsCount}</h4>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Registered Clients</p>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl border border-charcoal-800">
                      <Inbox className="text-gold-500 h-6 w-6 mb-2" />
                      <h4 className="text-2xl font-black text-white">{analytics.inquiriesCount}</h4>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Inquiry Forms</p>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl border border-charcoal-800">
                      <Star className="text-gold-500 h-6 w-6 mb-2" />
                      <h4 className="text-2xl font-black text-white">{analytics.pendingReviewsCount}</h4>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Pending Reviews</p>
                    </div>
                  </div>

                  {/* Audit / Activity Logs */}
                  <div className="glass-panel p-6 rounded-2xl border border-charcoal-800 space-y-4">
                    <h3 className="text-lg font-bold text-white">Recent Admin Activities</h3>
                    <div className="space-y-3">
                      {analytics.recentActivity?.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No activity logged.</p>
                      ) : (
                        analytics.recentActivity?.map((act) => (
                          <div key={act.id} className="flex justify-between items-start gap-4 p-3 bg-charcoal-950/40 rounded-xl text-xs">
                            <div>
                              <span className="font-bold text-gold-500">[{act.action}]</span>
                              <p className="text-slate-300 mt-1 font-light">{act.details}</p>
                            </div>
                            <div className="text-right text-slate-500">
                              <span>By: {act.username}</span>
                              <span className="block text-[10px] mt-0.5">{new Date(act.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB: CLIENTS */}
          {activeTab === 'clients' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Client Database</h2>
                <button
                  onClick={() => setClientModal({ open: true, mode: 'add', data: { name: '', email: '', password: '', phone: '', company: '', projectId: '' } })}
                  className="bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Add Client Profile
                </button>
              </div>

              {loadingData ? (
                <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gold-500" /></div>
              ) : clients.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No client accounts found.</p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-charcoal-850">
                  <table className="w-full text-left text-xs bg-charcoal-900 border-collapse">
                    <thead>
                      <tr className="bg-charcoal-950 border-b border-charcoal-850 text-slate-400 font-semibold uppercase tracking-wider">
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Phone / Company</th>
                        <th className="p-4">Assigned Project</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal-850">
                      {clients.map((c) => (
                        <tr key={c.id} className="hover:bg-charcoal-850/30">
                          <td className="p-4 font-bold text-white">{c.name}</td>
                          <td className="p-4 text-slate-300">{c.email}</td>
                          <td className="p-4 text-slate-400 font-light">
                            <div>{c.phone || 'N/A'}</div>
                            <div className="text-[10px] text-slate-500">{c.company || 'N/A'}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-semibold ${c.project_id ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' : 'bg-slate-800 text-slate-400'}`}>
                              {c.project_name || 'Unassigned'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center items-center gap-2">
                              <button
                                onClick={() => setClientModal({ open: true, mode: 'edit', data: { id: c.id, name: c.name, email: c.email, phone: c.phone || '', company: c.company || '', projectId: c.project_id || '' } })}
                                className="text-slate-400 hover:text-gold-500 p-1.5"
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleClientDelete(c.id)}
                                className="text-slate-400 hover:text-red-500 p-1.5"
                                title="Delete Client"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Project Index</h2>
                <button
                  onClick={() => setProjectModal({ open: true, mode: 'add', id: null, data: { name: '', clientName: '', type: categories[0], description: '', completionDate: '', isFeatured: false, imageUrl: '' } })}
                  className="bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Create Project Profile
                </button>
              </div>

              {loadingData ? (
                <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gold-500" /></div>
              ) : projects.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No projects found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((p) => (
                    <div key={p.id} className="glass-panel p-5 rounded-2xl border border-charcoal-850 flex items-start gap-4">
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-20 h-20 rounded-xl object-cover border border-charcoal-800"
                      />
                      <div className="flex-grow min-w-0 space-y-1">
                        <div className="flex justify-between items-baseline gap-2">
                          <h4 className="font-bold text-white text-sm truncate">{p.name}</h4>
                          <span className="text-[9px] uppercase tracking-wider text-gold-500 font-semibold bg-gold-500/5 px-2 py-0.5 rounded">
                            {p.rating > 0 ? `★ ${p.rating}` : 'New'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-light">Client: {p.client_name}</p>
                        <p className="text-[10px] text-slate-400 font-light">Type: {p.type}</p>
                        
                        <div className="flex justify-end gap-2 pt-2 border-t border-charcoal-850/60 mt-2">
                          <button
                            onClick={() => setProjectModal({ open: true, mode: 'edit', id: p.id, data: { name: p.name, clientName: p.client_name, type: p.type, description: p.description, completionDate: p.completion_date, isFeatured: p.is_featured === 1, imageUrl: p.image_url } })}
                            className="text-xs text-gold-500 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Edit2 className="h-3 w-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleProjectDelete(p.id)}
                            className="text-xs text-red-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: PROGRESS & CHAT */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Project Progress & Client Chat</h2>
              
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Select Project to Manage</label>
                <select
                  value={selectedProgressProject}
                  onChange={(e) => handleProgressProjectSelect(e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 text-sm cursor-pointer"
                >
                  <option value="">-- Choose a Project --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (Client: {p.client_name})</option>
                  ))}
                </select>
              </div>

              {selectedProgressProject && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
                  {/* Milestones Editor & Media Upload */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Progress Milestone Form */}
                    <div className="glass-panel p-5 rounded-2xl border border-charcoal-800 space-y-4">
                      <h4 className="font-bold text-white text-sm flex items-center gap-2"><Percent className="text-gold-500 h-4 w-4" /> Add Stage Milestone</h4>
                      <form onSubmit={handleProgressSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">Stage Title</label>
                            <input
                              type="text"
                              required
                              value={progressForm.stage}
                              onChange={(e) => setProgressForm({ ...progressForm, stage: e.target.value })}
                              placeholder="e.g. Foundation Casted"
                              className="w-full bg-charcoal-950 border border-charcoal-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-gold-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">Percentage (0 - 100)</label>
                            <input
                              type="number"
                              required
                              min="0"
                              max="100"
                              value={progressForm.percentage}
                              onChange={(e) => setProgressForm({ ...progressForm, percentage: e.target.value })}
                              className="w-full bg-charcoal-950 border border-charcoal-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-gold-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">Milestone Description</label>
                          <textarea
                            rows={2}
                            value={progressForm.description}
                            onChange={(e) => setProgressForm({ ...progressForm, description: e.target.value })}
                            placeholder="Description of completed works..."
                            className="w-full bg-charcoal-950 border border-charcoal-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-gold-500 resize-none"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5"
                        >
                          Record Milestone
                        </button>
                      </form>
                    </div>

                    {/* Progress Media Upload Form */}
                    <div className="glass-panel p-5 rounded-2xl border border-charcoal-800 space-y-4">
                      <h4 className="font-bold text-white text-sm flex items-center gap-2"><ImageIcon className="text-gold-500 h-4 w-4" /> Upload Progress Image</h4>
                      <form onSubmit={handleImageUpload} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">Select Category</label>
                            <select
                              value={uploadImageType}
                              onChange={(e) => setUploadImageType(e.target.value)}
                              className="w-full bg-charcoal-950 border border-charcoal-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-gold-500 cursor-pointer"
                            >
                              <option value="before">Before Construction</option>
                              <option value="ongoing">Ongoing Construction</option>
                              <option value="completed">Completed Works</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">Choose File</label>
                            <input
                              type="file"
                              id="image-upload-input"
                              onChange={(e) => setUploadFile(e.target.files[0])}
                              className="w-full text-slate-400 text-xs cursor-pointer border border-charcoal-800 rounded-xl px-3 py-1.5 bg-charcoal-950 focus:outline-none"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5"
                        >
                          Upload Image File
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Admin Project Chat */}
                  <div className="lg:col-span-5 h-[400px] flex flex-col bg-charcoal-950/60 border border-charcoal-800 rounded-2xl overflow-hidden justify-between">
                    <div className="bg-charcoal-900 px-4 py-3 border-b border-charcoal-800/80 font-bold text-white text-xs flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-gold-500" /> Client Conversation Box
                    </div>

                    <div className="flex-grow p-4 overflow-y-auto space-y-3">
                      {projectChat.length === 0 ? (
                        <p className="text-center text-[10px] text-slate-500 italic py-12">No messages logged in this project chat.</p>
                      ) : (
                        projectChat.map((msg) => {
                          const isMe = msg.sender_role === 'admin';
                          return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] ${isMe ? 'bg-gold-500 text-charcoal-950 font-medium' : 'bg-charcoal-800 text-slate-100 border border-charcoal-700'}`}>
                                <p className="font-extrabold text-[8px] uppercase tracking-wider text-right mb-0.5">{isMe ? 'Admin' : 'Client'}</p>
                                <p className="whitespace-pre-wrap">{msg.message}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <form onSubmit={handleAdminChatSubmit} className="bg-charcoal-900 border-t border-charcoal-850 p-3 flex gap-2">
                      <input
                        type="text"
                        value={adminChatForm.message}
                        onChange={(e) => setAdminChatForm({ message: e.target.value })}
                        placeholder="Type message to client..."
                        className="flex-grow bg-charcoal-950 border border-charcoal-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 text-xs"
                      />
                      <button
                        type="submit"
                        disabled={actionLoading || !adminChatForm.message.trim()}
                        className="bg-gold-500 hover:bg-gold-400 text-charcoal-950 p-2 rounded-xl transition-luxury flex-shrink-0 disabled:bg-charcoal-800 disabled:text-slate-500"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: REVIEWS MODERATION */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Pending and Approved Ratings</h2>
              
              {loadingData ? (
                <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gold-500" /></div>
              ) : reviews.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No ratings log found in database.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="glass-panel p-5 rounded-2xl border border-charcoal-850 flex justify-between items-start gap-4">
                      <div className="space-y-2 flex-grow min-w-0">
                        <div className="flex items-baseline gap-2">
                          <h4 className="font-bold text-white text-sm">{r.client_name}</h4>
                          <span className="text-[10px] text-slate-400">on {r.project_name}</span>
                        </div>
                        
                        <div className="flex text-gold-500 font-bold text-[11px] gap-0.5">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
                          ))}
                        </div>

                        <p className="text-xs text-slate-300 italic font-light">"{r.comment || 'No comment provided.'}"</p>
                        
                        <div className="flex gap-2 items-center pt-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.is_approved === 1 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                            {r.is_approved === 1 ? 'Approved & Public' : 'Pending Verification'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {r.is_approved === 0 && (
                          <button
                            onClick={() => handleApproveReview(r.id)}
                            className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-charcoal-950 p-2 rounded-xl text-xs flex items-center justify-center gap-1 font-semibold"
                            title="Approve Review"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleRejectReview(r.id)}
                          className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-charcoal-950 p-2 rounded-xl text-xs flex items-center justify-center gap-1 font-semibold"
                          title="Reject / Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: CONTACT SUBMISSIONS */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">General Inquiry Logs</h2>

              {loadingData ? (
                <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gold-500" /></div>
              ) : contacts.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No contact submissions logged.</p>
              ) : (
                <div className="space-y-4">
                  {contacts.map((c) => (
                    <div key={c.id} className="glass-panel p-5 rounded-2xl border border-charcoal-850 flex justify-between items-start gap-4">
                      <div className="space-y-2 flex-grow min-w-0">
                        <div className="flex justify-between items-baseline gap-2">
                          <h4 className="font-bold text-white text-sm">{c.name}</h4>
                          <span className="text-[10px] text-slate-500">{new Date(c.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Email: <a href={`mailto:${c.email}`} className="text-gold-500 hover:underline">{c.email}</a> | Phone: <span className="font-medium text-slate-200">{c.phone || 'N/A'}</span>
                        </p>
                        <p className="text-xs text-slate-300">
                          Company: <span className="font-medium text-slate-200">{c.company || 'N/A'}</span> | Service: <span className="font-semibold text-gold-400">{c.service || 'N/A'}</span>
                        </p>
                        <div className="bg-charcoal-950/60 p-3 rounded-xl border border-charcoal-850 text-xs text-slate-400 font-light leading-relaxed">
                          {c.message}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteContact(c.id)}
                        className="text-slate-400 hover:text-red-500 p-2"
                        title="Delete log"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: QUOTATIONS */}
          {activeTab === 'quotations' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Quotation Inquiry Forms</h2>

              {loadingData ? (
                <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gold-500" /></div>
              ) : quotations.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No quotation requests logged.</p>
              ) : (
                <div className="space-y-4">
                  {quotations.map((q) => (
                    <div key={q.id} className="glass-panel p-5 rounded-2xl border border-charcoal-850 flex justify-between items-start gap-4">
                      <div className="space-y-2 flex-grow min-w-0">
                        <div className="flex justify-between items-baseline gap-2">
                          <h4 className="font-bold text-white text-sm">{q.name}</h4>
                          <span className="text-[10px] text-slate-500">{new Date(q.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Email: <a href={`mailto:${q.email}`} className="text-gold-500 hover:underline">{q.email}</a> | Phone: <span className="font-medium text-slate-200">{q.phone || 'N/A'}</span>
                        </p>
                        <p className="text-xs text-slate-300">Company: <span className="font-medium text-slate-200">{q.company || 'N/A'}</span></p>
                        <div className="bg-charcoal-950/60 p-3 rounded-xl border border-charcoal-850 text-xs text-slate-400 font-light leading-relaxed">
                          {q.details}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteQuotation(q.id)}
                        className="text-slate-400 hover:text-red-500 p-2"
                        title="Delete log"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: EMAIL OUTREACH */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Manual Client Notification</h2>
              
              <div className="glass-panel p-6 rounded-3xl border border-charcoal-800 space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Compose a customized project progress status report to send directly to a client email. 
                </p>

                <form onSubmit={handleSendEmail} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Recipient Client Email</label>
                    <input
                      type="email"
                      required
                      value={emailForm.clientEmail}
                      onChange={(e) => setEmailForm({ ...emailForm, clientEmail: e.target.value })}
                      placeholder="client@example.com"
                      className="w-full bg-charcoal-900 border border-charcoal-850 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Email Subject</label>
                    <input
                      type="text"
                      required
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                      placeholder="e.g. SVR Horizon Heights - Slab Casting Completed"
                      className="w-full bg-charcoal-900 border border-charcoal-850 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Message Body</label>
                    <textarea
                      required
                      rows={6}
                      value={emailForm.message}
                      onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                      placeholder="Type details, specifications, timelines..."
                      className="w-full bg-charcoal-900 border border-charcoal-850 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500 text-xs resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin text-charcoal-950" /> : <><Send className="h-3.5 w-3.5" /> <span>Send Email Update</span></>}
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* CLIENT MODAL (ADD / EDIT) */}
      {clientModal.open && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-charcoal-950/80 backdrop-blur-sm" onClick={() => setClientModal({ ...clientModal, open: false })}></div>
          <div className="relative w-full max-w-md bg-charcoal-900 border border-charcoal-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10">
            <h3 className="text-xl font-bold text-white mb-4">{clientModal.mode === 'add' ? 'Register Client Profile' : 'Modify Client Profile'}</h3>
            
            <form onSubmit={handleClientSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={clientModal.data.name}
                  onChange={(e) => setClientModal({ ...clientModal, data: { ...clientModal.data, name: e.target.value } })}
                  className="w-full bg-charcoal-950 border border-charcoal-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={clientModal.data.email}
                  onChange={(e) => setClientModal({ ...clientModal, data: { ...clientModal.data, email: e.target.value } })}
                  className="w-full bg-charcoal-950 border border-charcoal-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 text-xs"
                />
              </div>

              {clientModal.mode === 'add' && (
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={clientModal.data.password}
                    onChange={(e) => setClientModal({ ...clientModal, data: { ...clientModal.data, password: e.target.value } })}
                    className="w-full bg-charcoal-950 border border-charcoal-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 text-xs"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={clientModal.data.phone}
                    onChange={(e) => setClientModal({ ...clientModal, data: { ...clientModal.data, phone: e.target.value } })}
                    className="w-full bg-charcoal-950 border border-charcoal-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Company</label>
                  <input
                    type="text"
                    value={clientModal.data.company}
                    onChange={(e) => setClientModal({ ...clientModal, data: { ...clientModal.data, company: e.target.value } })}
                    className="w-full bg-charcoal-950 border border-charcoal-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Link to Active Project</label>
                <select
                  value={clientModal.data.projectId}
                  onChange={(e) => setClientModal({ ...clientModal, data: { ...clientModal.data, projectId: e.target.value } })}
                  className="w-full bg-charcoal-950 border border-charcoal-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 text-xs cursor-pointer"
                >
                  <option value="">-- Choose Project (Optional) --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setClientModal({ ...clientModal, open: false })}
                  className="px-4 py-2 border border-charcoal-800 text-slate-400 text-xs rounded-xl hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin text-charcoal-950" /> : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROJECT MODAL (ADD / EDIT) */}
      {projectModal.open && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-charcoal-950/80 backdrop-blur-sm" onClick={() => setProjectModal({ ...projectModal, open: false })}></div>
          <div className="relative w-full max-w-lg bg-charcoal-900 border border-charcoal-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10">
            <h3 className="text-xl font-bold text-white mb-4">{projectModal.mode === 'add' ? 'Create Project Profile' : 'Update Project Details'}</h3>
            
            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Project Name</label>
                  <input
                    type="text"
                    required
                    value={projectModal.data.name}
                    onChange={(e) => setProjectModal({ ...projectModal, data: { ...projectModal.data, name: e.target.value } })}
                    className="w-full bg-charcoal-950 border border-charcoal-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    value={projectModal.data.clientName}
                    onChange={(e) => setProjectModal({ ...projectModal, data: { ...projectModal.data, clientName: e.target.value } })}
                    className="w-full bg-charcoal-950 border border-charcoal-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Project Category</label>
                  <select
                    value={projectModal.data.type}
                    onChange={(e) => setProjectModal({ ...projectModal, data: { ...projectModal.data, type: e.target.value } })}
                    className="w-full bg-charcoal-950 border border-charcoal-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 text-xs cursor-pointer"
                  >
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Est. Completion Date</label>
                  <input
                    type="date"
                    value={projectModal.data.completionDate}
                    onChange={(e) => setProjectModal({ ...projectModal, data: { ...projectModal.data, completionDate: e.target.value } })}
                    className="w-full bg-charcoal-950 border border-charcoal-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 text-xs cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Image URL</label>
                <input
                  type="text"
                  value={projectModal.data.imageUrl}
                  onChange={(e) => setProjectModal({ ...projectModal, data: { ...projectModal.data, imageUrl: e.target.value } })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-charcoal-950 border border-charcoal-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Project Description</label>
                <textarea
                  rows={3}
                  value={projectModal.data.description}
                  onChange={(e) => setProjectModal({ ...projectModal, data: { ...projectModal.data, description: e.target.value } })}
                  className="w-full bg-charcoal-950 border border-charcoal-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 text-xs resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={projectModal.data.isFeatured}
                  onChange={(e) => setProjectModal({ ...projectModal, data: { ...projectModal.data, isFeatured: e.target.checked } })}
                  className="h-4 w-4 bg-charcoal-950 border-charcoal-800 focus:outline-none rounded cursor-pointer text-gold-500"
                />
                <label htmlFor="isFeatured" className="text-xs font-semibold text-slate-300 cursor-pointer">Feature on Public Home Page</label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setProjectModal({ ...projectModal, open: false })}
                  className="px-4 py-2 border border-charcoal-800 text-slate-400 text-xs rounded-xl hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin text-charcoal-950" /> : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
