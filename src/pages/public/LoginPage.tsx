import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { HeartPulse, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'patient') navigate('/patient/dashboard');
      else if (user.role === 'doctor') navigate('/doctor/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('Password123!');
    setError('');
    setLoading(true);
    try {
      const user = await login(roleEmail, 'Password123!');
      if (user.role === 'patient') navigate('/patient/dashboard');
      else if (user.role === 'doctor') navigate('/doctor/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-11 h-11 rounded-lg bg-slate-900 flex items-center justify-center text-white mx-auto shadow-xs mb-3">
            <HeartPulse className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h2 className="text-xl font-heading font-extrabold text-slate-900 tracking-tight">Sign In to MEDIVAULT</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your centralized healthcare records & clinical dashboard
          </p>
        </div>

        {/* Demo Quick Selection */}
        <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2 text-center">
            One-Click Clinical Demo Profiles
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('patient@medivault.com')}
              className="py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-800 rounded-md text-xs font-semibold transition-all border border-slate-200 text-center shadow-2xs"
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('doctor@medivault.com')}
              className="py-1.5 px-2 bg-white hover:bg-blue-50 text-blue-800 rounded-md text-xs font-semibold transition-all border border-blue-200 text-center shadow-2xs"
            >
              Doctor
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@medivault.com')}
              className="py-1.5 px-2 bg-white hover:bg-indigo-50 text-indigo-800 rounded-md text-xs font-semibold transition-all border border-indigo-200 text-center shadow-2xs"
            >
              Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-blue-600 text-white font-semibold text-xs sm:text-sm rounded-lg transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Sign In to MEDIVAULT <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Need an account?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
