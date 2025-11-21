import React, { useContext } from 'react';
import { ThemeContext } from '../../context/themeContext.js';

const EmailHeader = ({ toggleSidebar }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      className="d-flex align-items-center justify-content-between px-4 py-2 shadow"
      style={{
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)',
        borderBottom: `1px solid var(--border-color)`,
      }}
    >


      {/* Hamburger Toggle */}
      <button
        onClick={toggleSidebar}
        className="btn"
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--text-color)',
        }}
        title="Toggle Sidebar"
      >
        <div style={{ lineHeight: '6px' }}>
          <div style={{ width: '20px', height: '2px', backgroundColor: 'var(--text-color)', margin: '3px 0' }}></div>
          <div style={{ width: '20px', height: '2px', backgroundColor: 'var(--text-color)', margin: '3px 0' }}></div>
          <div style={{ width: '20px', height: '2px', backgroundColor: 'var(--text-color)', margin: '3px 0' }}></div>
        </div>
      </button>

            {/* Title */}
      <h4 className="mb-0" style={{ fontWeight: 'bold' }}>
        Email Dashboard
      </h4>
    </div>
  );
};

export default EmailHeader;
