import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Key, Phone, Building } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    company: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in Name, Email and Password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(formData.name, formData.email, formData.password, formData.phone, formData.company);
      navigate('/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="bg-gold-500/10 border border-gold-500/30 text-gold-500 p-3 rounded-full w-fit mx-auto">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Register Client</h2>
          <p className="text-xs text-slate-400 font-light">Create a login profile to track your building process structures.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-charcoal-900 border border-charcoal-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-gold-500 text-sm"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-charcoal-900 border border-charcoal-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-gold-500 text-sm"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Password *</label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-charcoal-900 border border-charcoal-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-gold-500 text-sm"
                placeholder="Minimum 6 characters"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-charcoal-900 border border-charcoal-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-gold-500 text-sm"
                  placeholder="+91 99880..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Company</label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full bg-charcoal-900 border border-charcoal-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-gold-500 text-sm"
                  placeholder="Company Name"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-500 text-charcoal-950 font-bold py-3 rounded-xl hover:bg-gold-400 transition-luxury flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-charcoal-950 border-t-transparent"></div>
            ) : (
              <span>Register Account</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-charcoal-800">
          Already registered?{' '}
          <Link to="/login" className="text-gold-500 hover:text-gold-400 font-bold transition-luxury">
            Client Login
          </Link>
        </div>
      </div>
    </div>
  );
}
