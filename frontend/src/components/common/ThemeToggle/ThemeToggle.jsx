import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import './ThemeToggle.css';

const icons = {
  light:  { Icon: Sun,     label: 'Light' },
  dark:   { Icon: Moon,    label: 'Dark' },
  system: { Icon: Monitor, label: 'System' },
};

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-toggle" role="group" aria-label="Theme selector">
      {Object.entries(icons).map(([key, { Icon, label }]) => (
        <button
          key={key}
          className={`theme-btn ${theme === key ? 'active' : ''}`}
          onClick={() => setTheme(key)}
          title={label}
          aria-pressed={theme === key}
        >
          <Icon size={15} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
