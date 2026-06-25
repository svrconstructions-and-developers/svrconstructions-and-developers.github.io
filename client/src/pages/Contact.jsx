import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, ChevronRight } from 'lucide-react';
import api from '../services/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: 'Residential Construction',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const services = [
    'Residential Construction',
    'Commercial Construction',
    'Industrial Construction',
    'Interior & Renovation',
    'Infrastructure & Civil Works'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ type: 'error', message: 'Name, email, and message are required fields' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await api.post('/api/contact', formData);
      setStatus({ type: 'success', message: response.data.message });
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        service: 'Residential Construction',
        message: ''
      });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || 'Failed to send inquiry.' });
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      title: 'Headquarters Office',
      details: ['SVR Horizon Tower, 3rd Floor', 'Outer Ring Road, Bangalore - 560103', 'Karnataka, India'],
      icon: MapPin
    },
    {
      title: 'Email Address',
      details: ['info@svrconstruction.co.in', 'support@svrconstruction.co.in'],
      icon: Mail
    },
    {
      title: 'Contact Numbers',
      details: ['+91 80 4930 2200', '+91 99880 11223'],
      icon: Phone
    },
    {
      title: 'Business Hours',
      details: ['Monday - Saturday: 9:00 AM - 6:00 PM', 'Sunday: Closed'],
      icon: Clock
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <span className="text-gold-500 font-bold tracking-widest text-xs uppercase block">Get In Touch</span>
        <h1 className="text-4xl font-extrabold text-white">Contact SVR Construction</h1>
        <p className="text-slate-400 max-w-2xl font-light">Have structural drawings or property construction questions? Get in touch with our engineering estimators.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Side: Contact Form */}
        <div className="lg:col-span-7 bg-charcoal-900 border border-charcoal-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6">Send an Inquiry</h3>

          {status.message && (
            <div
              className={`p-4 rounded-xl text-sm mb-6 ${
                status.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}
            >
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-charcoal-950 border border-charcoal-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 text-sm"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-charcoal-950 border border-charcoal-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 text-sm"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-charcoal-950 border border-charcoal-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 text-sm"
                  placeholder="+91 99887 76655"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Company Name</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full bg-charcoal-950 border border-charcoal-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 text-sm"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Service Interested</label>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full bg-charcoal-950 border border-charcoal-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 text-sm cursor-pointer"
              >
                {services.map((ser, idx) => (
                  <option key={idx} value={ser}>{ser}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Message *</label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-charcoal-950 border border-charcoal-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 text-sm resize-none"
                placeholder="Details of your site construction requirements..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-500 text-charcoal-950 font-bold py-3.5 rounded-xl hover:bg-gold-400 transition-luxury flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-charcoal-950 border-t-transparent"></div>
              ) : (
                <>
                  <span>Send Message</span>
                  <Send className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Office Address Details */}
        <div className="lg:col-span-5 space-y-6">
          {contactInfo.map((info, idx) => {
            const Icon = info.icon;
            return (
              <div key={idx} className="glass-panel p-6 rounded-2xl flex items-start gap-4">
                <div className="bg-gold-500/10 border border-gold-500/30 text-gold-500 p-3.5 rounded-xl">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2 text-base">{info.title}</h4>
                  {info.details.map((detail, dIdx) => (
                    <p key={dIdx} className="text-slate-400 text-sm leading-relaxed font-light">{detail}</p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
