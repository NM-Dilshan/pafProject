import { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated, getUser, logout, getProfile } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (isAuthenticated()) {
        try {
          const userData = await getProfile();
          setUser(userData);
        } catch (error) {
          // Token is invalid or expired, clear it
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: isAuthenticated(),
    logout: () => {
      logout();
      setUser(null);
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
