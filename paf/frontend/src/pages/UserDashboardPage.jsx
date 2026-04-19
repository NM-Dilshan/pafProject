import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from '../components/NotificationBell'
import NotificationDropdown from '../components/NotificationDropdown'
import {
  Bell,
  BookOpen,
  CalendarCheck2,
  CircleAlert,
  ClipboardList,
  Home,
  LogOut,
  Menu,
  MessageSquareWarning,
  Search,
  UserRound,
} from 'lucide-react'

const navigationItems = [
  { label: 'Dashboard', icon: Home, href: '#dashboard' },
  { label: 'Study Areas', icon: BookOpen, to: '/study-areas' },
  { label: 'Bookings', icon: CalendarCheck2, href: '#bookings' },
  { label: 'My Bookings', icon: ClipboardList, href: '#my-bookings' },
  { label: 'Tickets', icon: MessageSquareWarning, href: '/incident-ticketing' },
  { label: 'Notifications', icon: Bell, href: '#notifications' },
  { label: 'Profile', icon: UserRound, href: '#profile' },
]

const statCards = [
  { title: 'Total Bookings', value: '128', icon: CalendarCheck2, change: '+12% this month' },
  { title: 'Pending Requests', value: '14', icon: ClipboardList, change: '3 awaiting approval' },
  { title: 'Open Tickets', value: '7', icon: CircleAlert, change: '2 urgent' },
  { title: 'Approved Bookings', value: '97', icon: BookOpen, change: '+18 this week' },
]

const recentBookings = [
  { resource: 'Computer Lab A', date: 'Apr 16, 2026', time: '10:00 AM', status: 'Approved' },
  { resource: 'Auditorium', date: 'Apr 17, 2026', time: '01:30 PM', status: 'Pending' },
  { resource: 'Meeting Room 2', date: 'Apr 18, 2026', time: '03:00 PM', status: 'Rejected' },
  { resource: 'Smart Class 4', date: 'Apr 19, 2026', time: '11:00 AM', status: 'Approved' },
]

const recentTickets = [
  { title: 'Projector not working', category: 'IT Support', status: 'Open', time: '10 min ago' },
  { title: 'AC maintenance request', category: 'Facilities', status: 'Pending', time: '1 hour ago' },
  { title: 'Network access issue', category: 'ICT', status: 'Resolved', time: 'Yesterday' },
]

function StatusBadge({ status }) {
  const styles = {
    Approved: 'bg-green-100 text-green-800 ring-green-200',
    Pending: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
    Rejected: 'bg-red-100 text-red-800 ring-red-200',
    Open: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    Resolved: 'bg-slate-100 text-slate-700 ring-slate-200',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  )
}

function Sidebar() {
  return (
    <aside className="hidden xl:flex xl:w-72 xl:flex-col xl:border-r xl:border-green-100 xl:bg-white/90 xl:backdrop-blur-md">
      <div className="flex items-center gap-3 border-b border-green-100 px-6 py-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-600 text-white shadow-lg shadow-green-200">
          <Home className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-green-700">Smart Campus</p>
          <h1 className="text-lg font-extrabold text-green-900">Operations Hub</h1>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const itemClassName = 'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-green-50 hover:text-green-700'

          if (item.to) {
            return (
              <Link key={item.label} to={item.to} className={itemClassName}>
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          }

          return (
            <a key={item.label} href={item.href} className={itemClassName}>
              <Icon className="h-5 w-5" />
              {item.label}
            </a>
          )
        })}
      </nav>

      <div className="border-t border-green-100 px-6 py-6">
        <div className="rounded-3xl bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-800">Campus status</p>
          <p className="mt-1 text-xs leading-5 text-green-700/80">
            All core services are operating normally. New booking slots open at 6 PM.
          </p>
        </div>
      </div>
    </aside>
  )
}

function Navbar({ user, onLogout, isNotificationOpen, setIsNotificationOpen }) {
  return (
    <header className="sticky top-0 z-30 border-b border-green-100 bg-white/90 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 xl:hidden">
          <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-green-100 bg-white text-green-700 shadow-sm">
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-600">Smart Campus</p>
            <h1 className="text-lg font-extrabold text-green-900">Operations Hub</h1>
          </div>
        </div>

        <div className="hidden xl:block">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-600">Smart Campus Operations Hub</p>
          <h2 className="text-2xl font-extrabold text-green-900">Dashboard Home</h2>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <button className="hidden items-center gap-2 rounded-2xl border border-green-100 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm sm:flex">
            <Search className="h-4 w-4 text-green-600" />
            Search
          </button>

          <div className="relative">
            <NotificationBell onBellClick={() => setIsNotificationOpen((value) => !value)} />
            <NotificationDropdown isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-white px-3 py-2 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-green-900">{user?.name || 'Student User'}</p>
              <p className="text-xs text-slate-500">{user?.email || 'smart.campus@my.sliit.lk'}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-green-200 transition hover:bg-green-700"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

function StatCard({ title, value, icon, change }) {
  return (
    <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-green-900">{value}</p>
          <p className="mt-2 text-xs font-medium text-green-600">{change}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
          {React.createElement(icon, { className: 'h-6 w-6' })}
        </div>
      </div>
    </div>
  )
}

function QuickActionButton({ title, description, icon, accent = 'bg-green-600', to, onClick }) {
  const handleClick = () => {
    if (onClick) onClick()
  }

  if (to) {
    return (
      <Link to={to} className="group flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white ${accent}`}>
          {React.createElement(icon, { className: 'h-5 w-5' })}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold text-green-900">{title}</span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
        </span>
      </Link>
    )
  }

  return (
    <button onClick={handleClick} className="group flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white ${accent}`}>
        {React.createElement(icon, { className: 'h-5 w-5' })}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-green-900">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
      </span>
    </button>
  )
}

const UserDashboardPage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showLocationPopup, setShowLocationPopup] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  const enableLocation = () => {
    setShowLocationPopup(false)
  }

  return (
    <div className="min-h-screen bg-green-50 text-slate-900">
      {showLocationPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Location Access</p>
            <h2 className="mt-2 text-xl font-extrabold text-emerald-900">Turn on location?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Enable location services to improve study area availability and live occupancy updates.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowLocationPopup(false)}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Not now
              </button>
              <button
                onClick={enableLocation}
                className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
              >
                Enable Location
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar
            user={user}
            onLogout={logout}
            isNotificationOpen={isNotificationOpen}
            setIsNotificationOpen={setIsNotificationOpen}
          />

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <section className="overflow-hidden rounded-[2rem] border border-green-100 bg-gradient-to-br from-white to-green-50 p-6 shadow-sm sm:p-8">
              <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">
                <div>
                  <p className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-green-700">
                    Welcome back
                  </p>
                  <h2 className="mt-4 text-3xl font-black tracking-tight text-green-900 sm:text-4xl">
                    Good to see you, {user?.name || 'Student'}.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                    Manage bookings, resources, support tickets, and notifications from a single campus operations dashboard.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <a href="#bookings" className="rounded-2xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-200 transition hover:bg-green-700">
                      Book a Resource
                    </a>
                    <a href="/incident-ticketing" className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-emerald-700 shadow-sm transition hover:bg-slate-100">
                      Report an Issue
                    </a>
                    <a href="#notifications" className="rounded-2xl border border-green-200 bg-white px-5 py-3 text-sm font-bold text-green-700 shadow-sm transition hover:bg-green-50">
                      View Notifications
                    </a>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-3xl bg-green-600 p-5 text-white shadow-xl shadow-green-200">
                    <p className="text-sm font-medium text-green-100">Today's overview</p>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-2xl font-black">24</p>
                        <p className="text-green-100/90">Active bookings</p>
                      </div>
                      <div>
                        <p className="text-2xl font-black">6</p>
                        <p className="text-green-100/90">New tickets</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-green-900">Campus alert</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Auditorium A is fully booked until 4 PM. Consider Computer Lab A or Meeting Room 2.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => (
                <StatCard key={card.title} {...card} />
              ))}
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm" id="dashboard">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-green-900">Quick Actions</h3>
                    <p className="mt-1 text-sm text-slate-500">Fast access to common campus workflows.</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3" id="resources">
                  <QuickActionButton
                    title="Book a Resource"
                    description="Reserve rooms, labs, or equipment in seconds."
                    icon={CalendarCheck2}
                    accent="bg-green-600"
                    to="/study-areas"
                  />
                  <QuickActionButton
                    title="Report an Issue"
                    description="Log facility or IT issues for quick follow-up."
                    icon={CircleAlert}
                    accent="bg-cyan-500"
                    to="/incident-ticketing"
                  />
                  <QuickActionButton
                    title="View Notifications"
                    description="Check approvals, updates, and reminders."
                    icon={Bell}
                    accent="bg-green-800"
                  />
                </div>
              </div>

              <div className="space-y-6" id="notifications">
                <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
                  <h4 className="text-lg font-bold text-green-900">Notifications</h4>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl bg-green-50 p-4">
                      <p className="text-sm font-semibold text-green-900">Booking approved</p>
                      <p className="mt-1 text-xs text-slate-600">Your Computer Lab A booking was approved.</p>
                    </div>
                    <div className="rounded-2xl bg-yellow-50 p-4">
                      <p className="text-sm font-semibold text-yellow-900">Pending review</p>
                      <p className="mt-1 text-xs text-slate-600">Meeting Room 2 request is waiting for staff approval.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

export default UserDashboardPage
