// API Base URL
const API_URL = 'http://localhost:8081/api';

// Campus email pattern: 2 letters (case-insensitive) + 8 digits + @my.sliit.lk
// Examples: IT12345678@my.sliit.lk, it12345678@my.sliit.lk, CS87654321@my.sliit.lk
const CAMPUS_EMAIL_PATTERN = /^[A-Za-z]{2}\d{8}@my\.sliit\.lk$/;

// Token storage key
const TOKEN_KEY = 'smartcampus_token';
const USER_KEY = 'smartcampus_user';

/**
 * Validate campus email format
 */
export const isValidCampusEmail = (email) => {
  if (!email || email.trim() === '') {
    return false;
  }
  return CAMPUS_EMAIL_PATTERN.test(email.trim());
};

/**
 * Store authentication token
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Get stored authentication token
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove authentication token
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Store user data
 */
export const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Get stored user data
 */
export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Remove user data
 */
export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};

/**
 * Register a new user
 */
export const register = async (name, email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Store token and user data
    setToken(data.token);
    setUser(data.user);

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Login with email and password
 */
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Store token and user data
    setToken(data.token);
    setUser(data.user);

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Login with Google OAuth
 */
export const googleLogin = async () => {
  try {
    // Fetch the Google authorization URL from backend
    const response = await fetch(`${API_URL}/auth/google`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get Google authorization URL');
    }

    const googleAuthUrl = await response.text();
    
    // Redirect to Google authorization page
    window.location.href = googleAuthUrl;
  } catch (error) {
    console.error('Google login error:', error);
    throw new Error('Failed to initiate Google login');
  }
};

/**
 * Get current user profile
 */
export const getProfile = async () => {
  const token = getToken();

  if (!token) {
    throw new Error('No authentication token');
  }

  try {
    const response = await fetch(`${API_URL}/user/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        logout();
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(data.message || 'Failed to fetch profile');
    }

    // Update stored user data
    setUser(data);

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Logout user
 */
export const logout = () => {
  removeToken();
  removeUser();
  window.location.href = '/login';
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Check if user has required role
 */
export const hasRole = (requiredRole) => {
  const user = getUser();
  return user && user.role === requiredRole;
};
