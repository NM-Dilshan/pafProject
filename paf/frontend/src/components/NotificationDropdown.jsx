import { useState, useEffect, useRef } from 'react';
import { getNotifications, markAsRead, clearAllNotifications } from '../services/notificationService';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleNotificationsUpdated = () => {
      if (isOpen) {
        fetchNotifications();
      }
    };

    window.addEventListener('smartcampus-notifications-updated', handleNotificationsUpdated);

    return () => {
      window.removeEventListener('smartcampus-notifications-updated', handleNotificationsUpdated);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, status: 'READ' } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  if (!isOpen) {
    return null;
  }

  if (loading) {
    return (
      <div className="notification-dropdown" ref={dropdownRef}>
        <div className="dropdown-content">
          <div className="loading">Loading notifications...</div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <div className="dropdown-header">
        <h3>Notifications</h3>
        {unreadCount > 0 && (
          <span className="unread-count">{unreadCount} unread</span>
        )}
      </div>
      
      <div className="dropdown-content">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-icon" viewBox="0 0 24 24" width="48" height="48">
              <path
                fill="currentColor"
                d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"
              />
            </svg>
            <p>No notifications</p>
          </div>
        ) : (
          <ul className="notification-list">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`notification-item ${notification.status === 'UNREAD' ? 'unread' : ''}`}
              >
                <div className="notification-content">
                  <span className="notification-type">
                    {notification.type.replace('_', ' ')}
                  </span>
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-time">
                    {formatTimestamp(notification.createdAt)}
                  </span>
                </div>
                {notification.status === 'UNREAD' && (
                  <button
                    type="button"
                    className="mark-read-btn"
                    onClick={() => handleMarkAsRead(notification.id)}
                    aria-label="Mark as read"
                  >
                    ✓
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {notifications.length > 0 && (
        <div className="dropdown-footer">
          <button type="button" onClick={handleClearAll}>
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
