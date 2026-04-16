import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setToken, setUser } from '../services/authService';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      // Handle error
      console.error('OAuth error:', error);
      navigate('/login?error=' + encodeURIComponent(error));
      return;
    }

    if (token && userStr) {
      try {
        // Store token and user data
        setToken(token);
        const user = JSON.parse(decodeURIComponent(userStr));
        setUser(user);

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (err) {
        console.error('Failed to parse user data:', err);
        navigate('/login?error=Authentication failed');
      }
    } else {
      navigate('/login?error=Missing authentication data');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h2>Authenticating...</h2>
        <p>Please wait while we complete your login.</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
