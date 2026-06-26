import React, { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, Calendar, Star, CheckCircle2, MessageSquare, X, Send } from 'lucide-react';
import api from '../services/api';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ clientName: '', rating: 5, comment: '' });
  const [reviewStatus, setReviewStatus] = useState({ type: '', message: '' });

  const categories = [
    'Residential Construction',
    'Commercial Construction',
    'Industrial Construction',
    'Interior & Renovation',
    'Infrastructure & Civil Works'
  ];

  const fetchProjects = () => {
    setLoading(true);
    let url = '/api/projects';
    const params = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (typeFilter) params.push(`type=${encodeURIComponent(typeFilter)}`);
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    api.get(url)
      .then((res) => {
        setProjects(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching projects:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProjects();
  }, [typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  const openProjectDetails = async (id) => {
    try {
      const response = await api.get(`/api/projects/${id}`);
      setProjectDetails(response.data);
      setSelectedProject(response.data);
      // Reset review form
      setReviewForm({ clientName: '', rating: 5, comment: '' });
      setReviewStatus({ type: '', message: '' });
    } catch (err) {
      console.error('Error fetching project details:', err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.clientName || !reviewForm.rating) {
      setReviewStatus({ type: 'error', message: 'Name and rating are required' });
      return;
    }

    setSubmittingReview(true);
    setReviewStatus({ type: '', message: '' });

    try {
      const response = await api.post(`/api/projects/${selectedProject.id}/reviews`, reviewForm);
      setReviewStatus({ type: 'success', message: response.data.message });
      setReviewForm({ clientName: '', rating: 5, comment: '' });
    } catch (err) {
      setReviewStatus({ type: 'error', message: err.response?.data?.error || 'Failed to submit review' });
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Page Header */}
      <div className="space-y-4">
        <span className="text-gold-500 font-bold tracking-widest text-xs uppercase block">Portfolio</span>
        <h1 className="text-4xl font-extrabold text-white">Our Construction Projects</h1>
        <p className="text-slate-400 max-w-2xl font-light">Explore our structurally completed residential homes, luxury towers, and robust industrial sites.</p>
      </div>

      {/* Search & Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-charcoal-900 p-4 rounded-2xl border border-charcoal-800 shadow-md">
        <div className="relative md:col-span-6">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project name, client, description..."
            className="w-full bg-charcoal-950 border border-charcoal-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-gold-500 text-sm"
          />
        </div>

        <div className="relative md:col-span-4">
          <SlidersHorizontal className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-charcoal-950 border border-charcoal-800 rounded-xl pl-12 pr-10 py-3 text-white focus:outline-none focus:border-gold-500 text-sm appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="md:col-span-2 bg-gold-500 text-charcoal-950 font-bold py-3 rounded-xl hover:bg-gold-400 transition-luxury shadow"
        >
          Search
        </button>
      </form>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl">
          <SlidersHorizontal className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-1">No Projects Found</h3>
          <p className="text-sm text-slate-400">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => openProjectDetails(project.id)}
              className="glass-panel rounded-2xl overflow-hidden group shadow-lg flex flex-col h-full hover:-translate-y-2 cursor-pointer transition-luxury border border-charcoal-800/80"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={project.image_url}
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-700"
                />
                <span className="absolute top-4 left-4 bg-charcoal-900/90 text-gold-500 border border-gold-500/20 text-xs px-3 py-1 rounded-full font-semibold">
                  {project.type}
                </span>
              </div>
              <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white leading-tight group-hover:text-gold-400 transition-luxury">
                    {project.name}
                  </h3>
                  <p className="text-xs text-slate-400">Client: <span className="text-slate-300 font-semibold">{project.client_name}</span></p>
                  <p className="text-sm text-slate-400 line-clamp-3 font-light leading-relaxed">
                    {project.description}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-charcoal-800/60 pt-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {project.completion_date}</span>
                  <div className="flex items-center gap-1.5 bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/25">
                    <Star className="h-3 w-3 fill-gold-500 text-gold-500" />
                    <span className="text-gold-400 font-bold">
                      {project.average_rating > 0 ? project.average_rating : 'New'}
                    </span>
                    <span className="text-slate-500">({project.review_count})</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => setSelectedProject(null)}
            className="absolute inset-0 bg-charcoal-950/80 backdrop-blur-md"
          ></div>

          {/* Modal Content */}
          <div className="relative w-full max-w-4xl bg-charcoal-900 border border-charcoal-800 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col z-10">
            {/* Modal Header */}
            <div className="sticky top-0 z-20 bg-charcoal-900 border-b border-charcoal-800 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedProject.name}</h3>
                <p className="text-xs text-slate-400">Category: <span className="text-slate-300 font-semibold">{selectedProject.type}</span></p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-slate-400 hover:text-white p-2"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-8 flex-grow">
              {/* Main Image */}
              <div className="h-72 sm:h-96 rounded-2xl overflow-hidden relative shadow-lg">
                <img
                  src={selectedProject.image_url}
                  alt={selectedProject.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                  <h4 className="text-lg font-bold text-white">Project Overview</h4>
                  <p className="text-slate-300 text-sm leading-relaxed font-light whitespace-pre-wrap">{selectedProject.description}</p>
                </div>
                <div className="glass-panel p-6 rounded-2xl space-y-3 text-sm h-fit">
                  <h4 className="font-bold text-white border-b border-charcoal-800 pb-2">Details</h4>
                  <p className="text-xs text-slate-400">Client: <span className="text-slate-200 block text-sm font-semibold mt-0.5">{selectedProject.client_name}</span></p>
                  <p className="text-xs text-slate-400">Completion Date: <span className="text-slate-200 block text-sm font-semibold mt-0.5">{selectedProject.completion_date}</span></p>
                  <div className="flex items-center justify-between border-t border-charcoal-800 pt-3">
                    <span className="text-xs text-slate-400">Rating Status</span>
                    <div className="flex items-center gap-1 text-gold-500">
                      <Star className="h-4 w-4 fill-gold-500 text-gold-500" />
                      <span className="font-extrabold">{selectedProject.average_rating > 0 ? selectedProject.average_rating : 'New'}</span>
                      <span className="text-xs text-slate-400">({selectedProject.review_count} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestones / Work Stages */}
              {selectedProject.milestones && selectedProject.milestones.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-white">Execution Milestones</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedProject.milestones.map((m) => (
                      <div key={m.id} className="bg-charcoal-950 p-4 rounded-xl border border-charcoal-800 flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-white text-sm">{m.stage}</h5>
                            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {m.percentage}%
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{m.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews and Ratings Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-charcoal-800 pt-8">
                {/* Submit Review */}
                <div className="space-y-4 bg-charcoal-950/40 p-6 rounded-2xl border border-charcoal-800/80">
                  <h4 className="text-lg font-bold text-white flex items-center gap-2"><Star className="h-5 w-5 text-gold-500" /> Rate Completed Works</h4>
                  
                  {reviewStatus.message && (
                    <div
                      className={`p-3 rounded-lg text-sm ${
                        reviewStatus.type === 'success'
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                          : 'bg-red-500/10 border border-red-500/30 text-red-400'
                      }`}
                    >
                      {reviewStatus.message}
                    </div>
                  )}

                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={reviewForm.clientName}
                        onChange={(e) => setReviewForm({ ...reviewForm, clientName: e.target.value })}
                        className="w-full bg-charcoal-900 border border-charcoal-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-gold-500 text-sm"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Select Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className="p-1 focus:outline-none"
                          >
                            <Star
                              className={`h-7 w-7 transition-colors ${
                                star <= reviewForm.rating
                                  ? 'fill-gold-500 text-gold-500'
                                  : 'text-slate-600 hover:text-gold-400'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Comments</label>
                      <textarea
                        rows={3}
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        className="w-full bg-charcoal-900 border border-charcoal-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-gold-500 text-sm resize-none"
                        placeholder="Describe your review of SVR structural construction works..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full bg-gold-500 text-charcoal-950 font-bold py-2.5 rounded-xl hover:bg-gold-400 transition-luxury flex items-center justify-center gap-2"
                    >
                      {submittingReview ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-charcoal-950 border-t-transparent"></div>
                      ) : (
                        <>
                          <span>Submit Rating</span>
                          <Send className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Display Reviews */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-white flex items-center gap-2"><MessageSquare className="h-5 w-5 text-gold-500" /> Client Testimonials ({selectedProject.reviews?.length || 0})</h4>
                  
                  {selectedProject.reviews?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No approved client reviews posted yet. Be the first to submit a review.</p>
                  ) : (
                    <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2">
                      {selectedProject.reviews?.map((r) => (
                        <div key={r.id} className="bg-charcoal-950 p-4 rounded-xl border border-charcoal-800 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-white">{r.client_name}</span>
                            <div className="flex gap-0.5 text-gold-500 font-semibold">
                              {Array.from({ length: r.rating }).map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-gold-500 text-gold-500" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-slate-300 italic leading-relaxed">"{r.comment}"</p>
                          <span className="text-[9px] text-slate-500 block text-right">{new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
