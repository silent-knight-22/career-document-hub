import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useLayout } from '../../../context/LayoutContext';
import ThemeToggle from '../../common/ThemeToggle/ThemeToggle';
import './Navbar.css';

export default function Navbar({ title }) {
  const { user } = useAuth();
  const { openSidebar } = useLayout();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="navbar-menu-btn"
          onClick={openSidebar}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="navbar-title">{title}</h1>
      </div>
      <div className="navbar-right">
        <ThemeToggle />
        <button type="button" className="navbar-icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="navbar-notif-dot" aria-hidden="true" />
        </button>
        <div className="navbar-avatar" title={user?.name} aria-hidden="true">
          {initials}
        </div>
      </div>
    </header>
  );
}
