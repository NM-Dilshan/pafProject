// API Base URL
const API_URL = 'http://localhost:8081/api';

/**
 * Get stored authentication token
 */
const getToken = () => {
  return localStorage.getItem('smartcampus_token');
};

/**
 * Get all notifications for the current user
 */
export const getNotifications = async () => {
  const token = getToken();

  if (!token) {
    throw new Error('No authentication token');
  }

  try {
    const response = await fetch(`${API_URL}/notifications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Redirect to login
        window.location.href = '/login';
        return [];
      }
      throw new Error(data.message || 'Failed to load notifications');
    }

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (notificationId) => {
  const token = getToken();

  if (!token) {
    throw new Error('No authentication token');
  }

  try {
    const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to mark notification as read');
    }

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Clear all notifications for the current user
 */
export const clearAllNotifications = async () => {
  const token = getToken();

  if (!token) {
    throw new Error('No authentication token');
  }

  try {
    const response = await fetch(`${API_URL}/notifications/clear`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to clear notifications');
    }

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async () => {
  try {
    const notifications = await getNotifications();
    return notifications.filter(n => n.status === 'UNREAD').length;
  } catch (error) {
    return 0;
  }
};
