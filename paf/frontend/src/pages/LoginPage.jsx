import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { login, googleLogin, isValidCampusEmail } from '../services/authService';
import AuthLayout from '../components/auth/AuthLayout';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    // Check for OAuth error in URL
    const oauthError = searchParams.get('error');
    if (oauthError) {
      setError(decodeURIComponent(oauthError));
    }
  }, [searchParams]);

  const validateEmail = (val) => {
    if (!val) return 'Email is required';
    if (!isValidCampusEmail(val)) return 'Use your @my.sliit.lk email';
    return '';
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'email') {
      setEmailError(validateEmail(email));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const eError = validateEmail(email);
    if (eError) {
      setEmailError(eError);
      setTouched(prev => ({ ...prev, email: true }));
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setTouched(prev => ({ ...prev, password: true }));
      return;
    }

    setLoading(true);

    try {
      const response = await login(email, password);
      setUser(response.user);

      if (response.user?.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (response.user?.role === 'TECHNICIAN') {
        navigate('/technician/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
    } catch (err) {
      setError(err.message || 'Google login failed.');
    }
  };

  return (
    <AuthLayout>
      <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 w-full max-w-sm mx-auto">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Welcome back</h2>
          <p className="text-slate-500 font-medium tracking-wide">Access your Smart Campus dashboard</p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50/50 backdrop-blur-sm border border-red-100/50 text-red-600 text-sm font-medium mb-8 flex items-center gap-3 animate-in zoom-in-95 duration-300">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            {error}
          </div>
        )}

        <div className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] ml-1">
                University Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={cn(
                    "block w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border rounded-2xl text-sm transition-all duration-300 outline-none",
                    emailError && touched.email 
                      ? "border-red-300 bg-red-50/20 focus:ring-4 focus:ring-red-500/5" 
                      : "border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 shadow-sm hover:border-slate-300"
                  )}
                  placeholder="IT23763180@my.sliit.lk"
                  required
                />
              </div>
              {emailError && touched.email && (
                <p className="mt-2 text-xs text-red-500 font-semibold ml-1 flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-red-500" />
                  {emailError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em]">
                  Security Key
                </label>
                <Link to="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                  Recovery?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={cn(
                    "block w-full pl-12 pr-12 py-3.5 bg-slate-50/50 border rounded-2xl text-sm transition-all duration-300 outline-none",
                    touched.password && password.length < 8 
                      ? "border-red-300 bg-red-50/20 focus:ring-4 focus:ring-red-500/5" 
                      : "border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 shadow-sm hover:border-slate-300"
                  )}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:translate-y-0 group"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Sign in to Hub
                </span>
              )}
            </button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
              <span className="bg-white lg:bg-transparent px-4 text-slate-400">Security Check</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 active:scale-[0.98] shadow-sm hover:shadow"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Institution
          </button>

          <p className="text-center text-sm font-medium text-slate-500 pt-4">
            New to Smart Campus?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
