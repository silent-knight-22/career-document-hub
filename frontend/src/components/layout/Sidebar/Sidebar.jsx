import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, PenLine, FileText, User, LogOut,
  Signature, ChevronRight, Archive, Award, AlarmClock,
  FileEdit, Brain
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import './Sidebar.css';

const navGroups = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    ],
  },
  {
    label: 'Documents',
    items: [
      { to: '/vault',        icon: Archive,    label: 'Document Vault' },
      { to: '/documents',    icon: FileText,   label: 'Sign Documents' },
      { to: '/certificates', icon: Award,      label: 'Certificates' },
      { to: '/expiry',       icon: AlarmClock, label: 'Expiry Tracker' },
      { to: '/ai',           icon: Brain,      label: 'AI Insights',   badge: 'AI' },
    ],
  },
  {
    label: 'Create',
    items: [
      { to: '/resume',            icon: FileEdit,  label: 'Resume Builder' },
      { to: '/signatures/create', icon: PenLine,   label: 'Create Signature' },
      { to: '/signatures',        icon: Signature, label: 'My Signatures' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/profile', icon: User, label: 'Profile' },
    ],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Signature size={22} color="white" />
        </div>
        <div>
          <span className="sidebar-logo-text">Career</span>
          <span className="sidebar-logo-sub">Document Hub</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav" aria-label="Main navigation">
        {navGroups.map((group) => (
          <div key={group.label} className="sidebar-group">
            <p className="sidebar-group-label">{group.label}</p>
            <ul>
              {group.items.map(({ to, icon: Icon, label, end, badge }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''}`
                    }
                  >
                    <Icon size={17} />
                    <span>{label}</span>
                    {badge && (
                      <span style={{
                        marginLeft: 'auto', fontSize: '0.58rem', fontWeight: 800,
                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        color: 'white', padding: '1px 6px', borderRadius: '999px',
                        letterSpacing: '0.04em',
                      }}>{badge}</span>
                    )}
                    {!badge && <ChevronRight size={13} className="sidebar-link-arrow" />}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom user area */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.name || 'User'}</p>
            <p className="sidebar-user-email">{user?.email || ''}</p>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout} title="Log out">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
