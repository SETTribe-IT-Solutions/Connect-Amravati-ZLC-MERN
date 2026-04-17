import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="d-flex flex-column vh-100 overflow-hidden" style={{ backgroundColor: '#f8fafc' }}>
      <div className="d-flex flex-grow-1 overflow-hidden position-relative">
        {/* Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          user={user}
          onLogout={onLogout}
        />

        {/* Content Column */}
        <div
          className={`d-flex flex-column flex-grow-1 overflow-hidden transition-all layout-content-wrapper ${isCollapsed ? 'with-sidebar-collapsed' : 'with-sidebar'}`}
          style={{ 
            marginLeft: 0,
            transition: 'all 0.3s ease-in-out',
          }}
        >
          {/* Header (Now inside content column to prevent overlap) */}
          <Header
            setSidebarOpen={setSidebarOpen}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            user={user}
            onLogout={onLogout}
          />

          <main className="flex-grow-1 overflow-auto p-3 p-lg-4" style={{ backgroundColor: '#f8fafc' }}>
            <Outlet />
          </main>

          <Footer
            user={user}
            onLogout={onLogout}
          />
        </div>
      </div>
    </div>
  );
};

export default Layout;