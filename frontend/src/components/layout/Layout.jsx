import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">

      {/* Fixed Header */}
      <Header
        setSidebarOpen={setSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        user={user}
        onLogout={onLogout}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isCollapsed={isCollapsed}
          user={user}
          onLogout={onLogout}
        />

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
            }`}
        >
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-8">
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