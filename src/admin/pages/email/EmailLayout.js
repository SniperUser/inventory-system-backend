import React, { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import EmailHeader from './EmailHeader.js';
import { ThemeContext } from '../../context/themeContext.js';

const EmailLayout = () => {
  const { theme } = useContext(ThemeContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  
  return (
    <div className={`d-flex flex-row ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`} style={{ height: '100vh' }}>
      {isSidebarOpen && <Sidebar />}

      <div className="flex-grow-1 d-flex flex-column bg-theme text-theme">
        {/* Themed Header */}
        <div className="theme-navbar shadow-sm">
          <EmailHeader toggleSidebar={toggleSidebar} />
        </div>

        {/* Themed Content */}
        <div className="p-4 flex-grow-1 overflow-auto bg-theme text-theme">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default EmailLayout;
