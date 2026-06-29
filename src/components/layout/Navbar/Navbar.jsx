import { Bell } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import ThemeToggle from '../../common/ThemeToggle/ThemeToggle';
import './Navbar.css';

export default function Navbar({ title }) {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">{title}</h1>
      </div>
      <div className="navbar-right">
        <ThemeToggle />
        <button className="navbar-icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="navbar-notif-dot" />
        </button>
        <div className="navbar-avatar" title={user?.name}>
          {initials}
        </div>
      </div>
    </header>
  );
}
