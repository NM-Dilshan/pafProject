import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpenCheck,
  CalendarCheck2,
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldUser,
  Ticket,
  UserRound,
  UserRoundCog,
  Users,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const sidebarItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard', active: true },
  { label: 'Resources', icon: Building2, to: '/admin/resources' },
  { label: 'Campus Alerts', icon: Bell, to: '/admin/alerts' },
  { label: 'Manage Technicians', icon: Wrench, to: '/admin/technicians' },
  { label: 'Manage Bookings', icon: CalendarCheck2, to: '/admin/bookings' },
  { label: 'Manage Tickets', icon: Ticket, to: '/admin/tickets' },
  { label: 'Profile', icon: UserRound, to: '/profile' },
];

const stats = [
  { label: 'Total Users', value: '2,846', icon: Users },
  { label: 'Active Technicians', value: '48', icon: UserRoundCog },
  { label: 'Pending Tickets', value: '21', icon: Ticket },
  { label: 'Total Bookings', value: '1,324', icon: CalendarCheck2 },
];

const recentBookings = [
  { id: 'BK-1092', resource: 'Computer Lab A', date: 'Apr 17, 2026', requester: 'Nadeesha', status: 'Approved' },
  { id: 'BK-1091', resource: 'Main Auditorium', date: 'Apr 17, 2026', requester: 'Harini', status: 'Pending' },
  { id: 'BK-1088', resource: 'Meeting Room 2', date: 'Apr 16, 2026', requester: 'Sahan', status: 'Rejected' },
  { id: 'BK-1085', resource: 'Smart Classroom 4', date: 'Apr 16, 2026', requester: 'Nipun', status: 'Approved' },
];

const recentTickets = [
  { id: 'TK-622', issue: 'Projector failure in Hall B', category: 'IT Support', time: '15 min ago', status: 'Pending' },
  { id: 'TK-619', issue: 'Air conditioning maintenance', category: 'Facilities', time: '45 min ago', status: 'Approved' },
  { id: 'TK-613', issue: 'Access card validation issue', category: 'Security', time: '2 hours ago', status: 'Rejected' },
  { id: 'TK-610', issue: 'Network speed degradation', category: 'ICT', time: 'Yesterday', status: 'Approved' },
];

function StatusBadge({ status }) {
  const statusStyles = {
    Approved: 'bg-green-100 text-green-800 ring-green-200',
    Pending: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
    Rejected: 'bg-red-100 text-red-800 ring-red-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        statusStyles[status] || statusStyles.Pending
      }`}
    >
      {status}
    </span>
  );
}

function Sidebar({ onLogout }) {
  return (
    <aside className="hidden xl:flex xl:w-72 xl:flex-col xl:border-r xl:border-green-100 xl:bg-white">
      <div className="flex items-center gap-3 border-b border-green-100 px-6 py-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-600 text-white">
          <ShieldUser className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-800">Smart Campus</p>
          <h1 className="text-lg font-extrabold text-slate-900">Operations Hub</h1>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                item.active
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-green-50 hover:text-green-800'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-green-100 px-6 py-6">
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm font-semibold text-green-800 transition hover:bg-green-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

function TopNavbar({ onLogout, user }) {
  return (
    <header className="sticky top-0 z-20 border-b border-green-100 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-green-100 text-green-800 xl:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-800">Smart Campus Admin</p>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Dashboard</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-green-100 text-green-800">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          <div className="hidden items-center gap-2 rounded-xl border border-green-100 bg-white px-3 py-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <p className="text-sm font-semibold text-slate-700">{user?.name || 'Admin'}</p>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
          {React.createElement(icon, { className: 'h-5 w-5' })}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, to }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-3 text-sm font-semibold text-green-800 transition hover:-translate-y-0.5 hover:bg-green-50"
    >
      {React.createElement(icon, { className: 'h-4 w-4' })}
      {label}
    </Link>
  );
}

function BookingsTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-green-100 bg-white">
      <table className="min-w-full divide-y divide-green-100 text-left text-sm">
        <thead className="bg-green-50">
          <tr>
            <th className="px-4 py-3 font-semibold text-slate-900">Booking ID</th>
            <th className="px-4 py-3 font-semibold text-slate-900">Resource</th>
            <th className="px-4 py-3 font-semibold text-slate-900">Date</th>
            <th className="px-4 py-3 font-semibold text-slate-900">Requester</th>
            <th className="px-4 py-3 font-semibold text-slate-900">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-green-50 bg-white">
          {recentBookings.map((booking) => (
            <tr key={booking.id}>
              <td className="px-4 py-3 font-semibold text-slate-700">{booking.id}</td>
              <td className="px-4 py-3 text-slate-600">{booking.resource}</td>
              <td className="px-4 py-3 text-slate-600">{booking.date}</td>
              <td className="px-4 py-3 text-slate-600">{booking.requester}</td>
              <td className="px-4 py-3">
                <StatusBadge status={booking.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TicketsList() {
  return (
    <div className="space-y-3">
      {recentTickets.map((ticket) => (
        <div key={ticket.id} className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900">{ticket.issue}</p>
              <p className="mt-1 text-sm text-slate-600">{ticket.category}</p>
            </div>
            <StatusBadge status={ticket.status} />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {ticket.id} • {ticket.time}
          </p>
        </div>
      ))}
    </div>
  );
}

function OverviewPanel() {
  const chartBars = [56, 72, 43, 88, 64, 79, 52];

  return (
    <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-slate-900">System Overview</h3>
      <p className="mt-1 text-sm text-slate-600">Bookings trend over the past 7 days</p>

      <div className="mt-5 flex h-36 items-end gap-2">
        {chartBars.map((height, index) => (
          <div key={index} className="flex-1 rounded-t-md bg-green-200">
            <div className="w-full rounded-t-md bg-green-600" style={{ height: `${height}%` }} />
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-green-50 p-3">
          <p className="text-slate-600">Resolution Rate</p>
          <p className="mt-1 text-lg font-extrabold text-slate-900">92%</p>
        </div>
        <div className="rounded-xl bg-green-50 p-3">
          <p className="text-slate-600">System Health</p>
          <p className="mt-1 text-lg font-extrabold text-slate-900">Optimal</p>
        </div>
      </div>
    </div>
  );
}

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/staff/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-green-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar onLogout={handleLogout} />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavbar onLogout={handleLogout} user={user} />

          <main className="flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
              <h1 className="text-2xl font-extrabold text-slate-900">Welcome back, Admin</h1>
              <p className="mt-2 text-sm text-slate-600">
                Here is your operational summary for Smart Campus facilities, bookings, and support services.
              </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((item) => (
                <StatCard key={item.label} {...item} />
              ))}
            </section>

            <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <ActionButton icon={UserRoundCog} label="Add Technician" to="/admin/technicians" />
                <ActionButton icon={Ticket} label="View Tickets" to="/admin/tickets" />
                <ActionButton icon={BookOpenCheck} label="View Bookings" to="/admin/bookings" />
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-6">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Recent Bookings</h2>
                    <Link to="/admin/bookings" className="text-sm font-semibold text-green-700 hover:text-green-800">
                      View all
                    </Link>
                  </div>
                  <BookingsTable />
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Recent Tickets</h2>
                    <Link to="/admin/tickets" className="text-sm font-semibold text-green-700 hover:text-green-800">
                      Open queue
                    </Link>
                  </div>
                  <TicketsList />
                </div>
              </div>

              <OverviewPanel />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
