import { useState, useEffect, useRef } from 'react';
import { getNotifications } from '../services/notificationService';

const NotificationBell = ({ onBellClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const bellRef = useRef(null);
  const previousUnreadCountRef = useRef(0);
  const hasLoadedOnceRef = useRef(false);
  const flashTimeoutRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const notifications = await getNotifications();
      const unreadCount = notifications.filter((n) => n.read === false || n.status === 'UNREAD').length;

      if (hasLoadedOnceRef.current && unreadCount > previousUnreadCountRef.current) {
        setHasNewNotification(true);

        window.dispatchEvent(new CustomEvent('smartcampus-notifications-updated'));

        if (flashTimeoutRef.current) {
          clearTimeout(flashTimeoutRef.current);
        }

        flashTimeoutRef.current = window.setTimeout(() => {
          setHasNewNotification(false);
        }, 3500);
      }

      previousUnreadCountRef.current = unreadCount;
      hasLoadedOnceRef.current = true;
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    setIsOpen(!isOpen);
    if (onBellClick) {
      onBellClick();
    }
  };

  const handleClickOutside = (event) => {
    if (bellRef.current && !bellRef.current.contains(event.target)) {
      setIsOpen(false);
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

  if (loading) {
    return (
      <div className="notification-bell" ref={bellRef}>
        <div className="bell-icon loading">...</div>
      </div>
    );
  }

  return (
    <div className="notification-bell" ref={bellRef}>
      <button
        type="button"
        className={`bell-button ${hasNewNotification ? 'animate-pulse ring-2 ring-red-400 ring-offset-2 ring-offset-white' : ''}`}
        onClick={handleClick}
        aria-label="Notifications"
      >
        <svg
          className="bell-icon"
          style={{ color: unreadCount > 0 ? '#dc2626' : undefined }}
          viewBox="0 0 24 24"
          width="24"
          height="24"
        >
          <path
            fill="currentColor"
            d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"
          />
        </svg>
        {unreadCount > 0 && (
          <span className={`notification-badge ${hasNewNotification ? 'animate-ping bg-red-500' : 'bg-red-600'}`}>
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default NotificationBell;
