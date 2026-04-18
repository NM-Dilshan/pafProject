import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, BookOpen, CalendarDays, LogOut, UserCircle } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import NotificationDropdown from '../components/NotificationDropdown';
import { useAuth } from '../context/AuthContext';

const UserDashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const displayName = useMemo(() => {
    return user?.fullName || user?.name || user?.username || 'Student';
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Smart Campus</p>
              <h1 className="text-2xl font-semibold text-slate-900">Welcome back, {displayName}</h1>
              <p className="mt-1 text-sm text-slate-500">Manage your activities, check notifications, and access campus services.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <NotificationBell onBellClick={() => setIsNotificationOpen((value) => !value)} />
                <NotificationDropdown
                  isOpen={isNotificationOpen}
                  onClose={() => setIsNotificationOpen(false)}
                />
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Upcoming Bookings</p>
              <CalendarDays className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-900">0</p>
            <p className="mt-1 text-xs text-slate-500">Bookings will appear here</p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Open Tickets</p>
              <Bell className="h-5 w-5 text-amber-500" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-900">0</p>
            <p className="mt-1 text-xs text-slate-500">Support tickets in progress</p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Profile Status</p>
              <UserCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">Active</p>
            <p className="mt-1 text-xs text-slate-500">Account is verified and ready</p>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                <UserCircle className="h-4 w-4" />
                View Profile
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <BookOpen className="h-4 w-4" />
                Refresh Dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Activity</h2>
            <p className="mt-4 text-sm text-slate-600">
              New notifications and updates will show automatically. Keep this page open to track your campus events.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserDashboardPage;
