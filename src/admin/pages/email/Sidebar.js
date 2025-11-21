import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import {
  faPen,
  faInbox,
  faPaperPlane,
  faFileAlt,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ThemeContext } from '../../context/themeContext.js';
import './Sidebar.css'; // optional

const Sidebar = () => {
  const { theme } = useContext(ThemeContext);

  const navItems = [
    { to: '/email', icon: faPen, label: 'Compose' },
    { to: '/email/inbox', icon: faInbox, label: 'Inbox' },
    { to: '/email/sent', icon: faPaperPlane, label: 'Sent' },
    { to: '/email/drafts', icon: faFileAlt, label: 'Drafts' },
    { to: '/email/trash', icon: faTrash, label: 'Trash' },
  ];

  return (
    <div
      className={`email-sidebar d-flex flex-column p-3 ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}
      style={{
        width: '220px',
        height: '100vh',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)',
        borderRight: '1px solid var(--border-color)',
      }}
    >
      <div className="mb-4 text-center">
        <h5 className="fw-bold" style={{ color: 'var(--text-color)' }}>
          <span role="img" aria-label="mail">📧</span> Mail
        </h5>
      </div>

      <ul className="nav flex-column gap-2">
        {navItems.map(({ to, icon, label }) => (
          <li className="nav-item" key={label}>
            <NavLink
              to={to}
              end
              className={({ isActive }) =>
                `nav-link sidebar-link ${isActive ? 'active' : ''}`
              }
              style={({ isActive }) => ({
                color: 'var(--text-color)',
                backgroundColor: isActive ? 'var(--bgIconPOS)' : 'transparent',
                padding: '10px 14px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: isActive ? '600' : '400',
                transition: 'background-color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
              })}
            >
              <FontAwesomeIcon icon={icon} className="me-2" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
