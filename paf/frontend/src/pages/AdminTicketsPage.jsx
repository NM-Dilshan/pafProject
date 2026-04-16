import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminTicketsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/staff/login', { replace: true });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Admin Tickets</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Logout
        </button>
      </div>
      <p className="text-slate-500 mt-1">Ticket oversight for administrators.</p>
    </div>
  );
};

export default AdminTicketsPage;
