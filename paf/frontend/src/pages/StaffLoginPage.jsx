import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, ShieldAlert, User, User2 } from 'lucide-react';
import { staffLogin } from '../services/authService';

const StaffLoginPage = () => {
  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await staffLogin(username, password);
      const normalizedUser = {
        ...response,
        isStaff: true,
      };
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      localStorage.setItem('smartcampus_token', response.token);
      localStorage.setItem('smartcampus_user', JSON.stringify(normalizedUser));

      if (response.mustChangePassword) {
        navigate('/staff/change-password', {
          state: { forced: true, username: response.username },
        });
      } else {
        navigate(response.role === 'ADMIN' ? '/admin/dashboard' : '/technician/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 py-10">
      <div className="max-w-sm w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="text-center">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/15 border border-indigo-400/30 mx-auto flex items-center justify-center">
            <User className="h-6 w-6 text-indigo-400" />
          </div>
          <h1 className="text-white font-bold text-2xl mt-4">Staff Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Administration & Technician Access</p>
          <div className="border-t border-indigo-500/30 mt-4 mb-6" />
        </div>

        <div className="flex items-center gap-2 bg-slate-900/20 rounded-full p-1 mb-5">
          {['ADMIN', 'TECHNICIAN'].map((role) => {
            const active = selectedRole === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`flex-1 rounded-full px-4 py-1 text-sm transition-colors ${
                  active ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400'
                }`}
              >
                {role === 'ADMIN' ? 'Admin' : 'Technician'}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-5 flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-red-400 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-2">
              Username
            </label>
            <div className="relative">
              <User2 className="h-4 w-4 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. tech.kamal"
                className="w-full bg-white/5 border border-white/10 text-white rounded-lg pl-9 pr-3 py-2.5 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="h-4 w-4 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-lg pl-9 pr-10 py-2.5 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg py-2.5 transition active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-slate-500 text-xs hover:text-slate-300 transition-colors"
          >
            {'<- Back to student login'}
          </button>
        </div>

        <div className="mt-8 space-y-1 text-center">
          <p className="text-slate-600 text-xs">Smart Campus Operations Hub</p>
          <p className="text-slate-700 text-xs">Faculty of Computing - SLIIT</p>
        </div>
      </div>
    </div>
  );
};

export default StaffLoginPage;
