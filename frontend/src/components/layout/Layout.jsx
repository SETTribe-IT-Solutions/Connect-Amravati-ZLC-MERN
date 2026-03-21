import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        user={user}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          setSidebarOpen={setSidebarOpen} 
          user={user}
          onLogout={onLogout}
        />

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>

        <Footer 
          setSidebarOpen={setSidebarOpen} 
          user={user}
          onLogout={onLogout}
        />
      </div>
    </div>
  );
};

export default Layout;