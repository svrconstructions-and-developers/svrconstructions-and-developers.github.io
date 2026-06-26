import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate(redirectPath);
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
            <LogIn className="h-6 w-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Client Portal Login</h2>
          <p className="text-xs text-slate-400">Track project milestones, structural photos, and chat with SVR site engineers.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-charcoal-900 border border-charcoal-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-gold-500 text-sm"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Password</label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-charcoal-900 border border-charcoal-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-gold-500 text-sm"
                placeholder="••••••••"
              />
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
              <span>Login to Dashboard</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-charcoal-800">
          New SVR Client?{' '}
          <Link to="/register" className="text-gold-500 hover:text-gold-400 font-bold transition-luxury">
            Register Client Account
          </Link>
        </div>
      </div>
    </div>
  );
}
