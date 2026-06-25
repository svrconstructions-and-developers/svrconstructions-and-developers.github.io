import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, HardHat, FileSpreadsheet, Lock, User, LogOut, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function Layout({ children }) {
  const { user, logout, adminUser, adminLogout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quotationModalOpen, setQuotationModalOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ name: '', email: '', phone: '', company: '', details: '' });
  const [quoteStatus, setQuoteStatus] = useState({ type: '', message: '' });
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const navigate = useNavigate();

  const handleClientLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleAdminLogout = () => {
    adminLogout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const submitQuotation = async (e) => {
    e.preventDefault();
    if (!quoteForm.name || !quoteForm.email || !quoteForm.details) {
      setQuoteStatus({ type: 'error', message: 'Please fill in Name, Email and Description.' });
      return;
    }

    setSubmittingQuote(true);
    setQuoteStatus({ type: '', message: '' });

    try {
      await api.post('/api/contact/quotation', quoteForm);
      setQuoteStatus({ type: 'success', message: 'Quotation request submitted! We will contact you soon.' });
      setQuoteForm({ name: '', email: '', phone: '', company: '', details: '' });
      setTimeout(() => {
        setQuotationModalOpen(false);
        setQuoteStatus({ type: '', message: '' });
      }, 3000);
    } catch (err) {
      setQuoteStatus({ type: 'error', message: err.response?.data?.error || 'Failed to submit. Please try again.' });
    } finally {
      setSubmittingQuote(false);
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About Us' },
    { to: '/projects', label: 'Projects' },
    { to: '/services', label: 'Services' },
    { to: '/contact', label: 'Contact Us' }
  ];

  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-50 glass-panel shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Company Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gold-500 text-charcoal-950 p-2 rounded-lg transition-transform group-hover:scale-105">
              <HardHat className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-baseline">
                <span className="text-xl font-extrabold tracking-tight text-white">SVR</span>
                <span className="text-gold-500 font-bold ml-1 text-sm tracking-wider">CONSTRUCTION</span>
              </div>
              <span className="text-[10px] text-slate-400 tracking-[0.2em] block uppercase -mt-1">Developers & Engineers</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-semibold tracking-wide transition-luxury hover:text-gold-400 ${
                    isActive ? 'text-gold-500 border-b-2 border-gold-500 pb-1' : 'text-slate-300'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Admin Portal Section */}
            {adminUser ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/admin"
                  className="flex items-center space-x-1 bg-gold-500/10 border border-gold-500/30 text-gold-500 px-3.5 py-2 rounded-full text-xs font-semibold hover:bg-gold-500/20 transition-luxury"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Admin ({adminUser.username})</span>
                </Link>
                <button
                  onClick={handleAdminLogout}
                  className="text-slate-400 hover:text-red-400 p-2 rounded-full transition-luxury"
                  title="Logout Admin"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="text-slate-400 hover:text-gold-400 text-xs font-semibold transition-luxury"
              >
                Admin Login
              </Link>
            )}

            <span className="text-charcoal-700 text-xs">|</span>

            {/* Client Portal Section */}
            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 bg-charcoal-800 text-slate-300 px-3.5 py-2 rounded-full text-xs font-semibold hover:bg-charcoal-700 transition-luxury"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Client ({user.name})</span>
                </Link>
                <button
                  onClick={handleClientLogout}
                  className="text-slate-400 hover:text-red-400 p-2 rounded-full transition-luxury"
                  title="Logout Client"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-slate-300 hover:text-gold-400 text-xs font-semibold transition-luxury"
              >
                Client Portal
              </Link>
            )}

            {/* Get Quotation Button */}
            <button
              onClick={() => setQuotationModalOpen(true)}
              className="bg-gold-500 text-charcoal-950 font-bold px-5 py-2.5 rounded-full text-sm shadow-md hover:bg-gold-400 hover:scale-105 transition-luxury active:scale-95"
            >
              Get Quotation
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center space-x-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="border border-gold-500/30 text-gold-500 p-1.5 rounded-full hover:bg-gold-500/10 transition-luxury"
              >
                <Lock className="h-4 w-4" />
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed inset-x-0 top-20 z-40 bg-charcoal-900/95 backdrop-blur-lg border-b border-charcoal-800 shadow-2xl p-6"
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-lg font-medium transition-luxury ${
                      isActive ? 'text-gold-500' : 'text-slate-300'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              <hr className="border-charcoal-800 my-2" />

              {/* Portal Links */}
              {adminUser ? (
                <div className="border border-gold-500/20 bg-gold-500/5 rounded-xl p-3 mb-2 space-y-2">
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-gold-400 py-1 font-semibold"
                  >
                    <Lock className="h-5 w-5 text-gold-500" />
                    <span>Admin Portal ({adminUser.username})</span>
                  </Link>
                  <button
                    onClick={handleAdminLogout}
                    className="flex items-center space-x-2 text-red-400 py-1 text-left w-full"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout Admin</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 text-slate-400 py-1"
                >
                  <Lock className="h-5 w-5 text-gold-500/80" />
                  <span>Admin Login Portal</span>
                </Link>
              )}

              {user ? (
                <div className="border border-charcoal-800 bg-charcoal-900/50 rounded-xl p-3 mb-2 space-y-2">
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-slate-300 py-1 font-semibold"
                  >
                    <User className="h-5 w-5 text-gold-500" />
                    <span>Client Portal ({user.name})</span>
                  </Link>
                  <button
                    onClick={handleClientLogout}
                    className="flex items-center space-x-2 text-red-400 py-1 text-left w-full"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout Client</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 text-slate-300 py-1"
                >
                  <User className="h-5 w-5 text-gold-500" />
                  <span>Client Login Portal</span>
                </Link>
              )}

              {/* Mobile Get Quotation Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setQuotationModalOpen(true);
                }}
                className="w-full bg-gold-500 text-charcoal-950 font-bold py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-gold-400 shadow-lg"
              >
                <FileSpreadsheet className="h-5 w-5" />
                <span>Request Quotation</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Page Area */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Global Quotation Request Modal */}
      <AnimatePresence>
        {quotationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuotationModalOpen(false)}
              className="absolute inset-0 bg-charcoal-950/80 backdrop-blur-md"
            ></motion.div>

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-panel p-6 sm:p-8 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setQuotationModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                  <FileSpreadsheet className="text-gold-500 h-6 w-6" /> Get Project Quotation
                </h3>
                <p className="text-xs text-slate-400 mt-1">Provide details of your project to receive a detailed engineering quote.</p>
              </div>

              {quoteStatus.message && (
                <div
                  className={`p-3 rounded-lg text-sm mb-4 ${
                    quoteStatus.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/10 border border-red-500/30 text-red-400'
                  }`}
                >
                  {quoteStatus.message}
                </div>
              )}

              <form onSubmit={submitQuotation} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={quoteForm.name}
                    onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                    className="w-full bg-charcoal-900 border border-charcoal-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={quoteForm.email}
                      onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                      className="w-full bg-charcoal-900 border border-charcoal-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={quoteForm.phone}
                      onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                      className="w-full bg-charcoal-900 border border-charcoal-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500"
                      placeholder="+123 456 7890"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={quoteForm.company}
                    onChange={(e) => setQuoteForm({ ...quoteForm, company: e.target.value })}
                    className="w-full bg-charcoal-900 border border-charcoal-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500"
                    placeholder="Your company name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Project Details *</label>
                  <textarea
                    required
                    rows={4}
                    value={quoteForm.details}
                    onChange={(e) => setQuoteForm({ ...quoteForm, details: e.target.value })}
                    className="w-full bg-charcoal-900 border border-charcoal-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500 text-sm resize-none"
                    placeholder="Describe building type, location, approximate built up area, structural requirements..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingQuote}
                  className="w-full bg-gold-500 text-charcoal-950 font-bold py-3 rounded-xl hover:bg-gold-400 transition-luxury flex items-center justify-center gap-2"
                >
                  {submittingQuote ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-charcoal-950 border-t-transparent"></div>
                  ) : (
                    <>
                      <span>Submit Quotation Request</span>
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
