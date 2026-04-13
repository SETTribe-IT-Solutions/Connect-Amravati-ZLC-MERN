import React from 'react';

import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  UserGroupIcon,
  HeartIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ sidebarOpen, setSidebarOpen, isCollapsed, user, onLogout }) => {

  const role = user?.role || localStorage.getItem('role') || 'user';
  const roleLower = role.toLowerCase();

  const allNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, color: 'from-blue-500 to-blue-600' },
    { name: 'Tasks', href: '/tasks', icon: ClipboardDocumentListIcon, color: 'from-blue-500 to-blue-600' },
    { name: 'Communications', href: '/communications', icon: ChatBubbleLeftRightIcon, color: 'from-blue-500 to-blue-600' },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon, color: 'from-blue-500 to-blue-600' },
    { name: 'Users', href: '/users', icon: UserGroupIcon, color: 'from-blue-500 to-blue-600' },
    { name: 'Appreciation', href: '/appreciation', icon: HeartIcon, color: 'from-blue-500 to-blue-600' },
  ];

  let navigation = [];
  if (roleLower === 'system_administrator' || roleLower === 'system administrator') {
    navigation = allNavItems.filter(item => item.href === '/users');
  } else if (['collector', 'additional_deputy_collector', 'additional collector', 'sdo', 'tehsildar', 'bdo', 'talathi', 'gramsevak'].includes(roleLower)) {
    navigation = allNavItems.filter(item => item.href !== '/users');
  } else {
    // Default fallback (usually Dashboard and Tasks)
    navigation = allNavItems.filter(item => item.href !== '/users');
  }

  const sidebarWidth = isCollapsed ? 'lg:w-20' : 'lg:w-64';

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-[90] lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed lg:absolute left-0 top-0 lg:top-0 h-full lg:h-full bg-white border-r border-gray-100 z-[100] lg:z-30 transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } ${sidebarWidth} w-64 flex flex-col`}
      >
        {/* Logo Section - Hidden on collapsed desktop, visible on mobile */}
        <div className={`h-16 flex items-center justify-center border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 lg:hidden`}>
          <h1 className="text-xl font-bold text-white">Amravati Connect</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-gray-200">
          <ul className="space-y-2 px-3">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center ${isCollapsed ? 'lg:justify-center' : ''} px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-md`
                      : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                  title={isCollapsed ? item.name : ''}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`h-5 w-5 ${isCollapsed ? 'lg:m-0' : 'mr-3'} transition-transform group-hover:scale-110 flex-shrink-0`} />
                  <span className={`transition-opacity duration-300 ${isCollapsed ? 'lg:hidden opacity-0' : 'opacity-100'}`}>
                    {item.name}
                  </span>

                </NavLink>
              </li>
            ))}

            {/* Divider line */}
            <li className="border-t border-gray-100 my-4"></li>

            {/* Change Password Option */}
            <li>
              <NavLink
                to="/change-password"
                className={({ isActive }) =>
                  `flex items-center ${isCollapsed ? 'lg:justify-center' : ''} px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${isActive
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
                title={isCollapsed ? 'Change Password' : ''}
                onClick={() => setSidebarOpen(false)}
              >
                <KeyIcon className={`h-5 w-5 ${isCollapsed ? 'lg:m-0' : 'mr-3'} transition-transform group-hover:scale-110 flex-shrink-0`} />
                <span className={`transition-opacity duration-300 ${isCollapsed ? 'lg:hidden opacity-0' : 'opacity-100'}`}>
                  Change Password
                </span>
              </NavLink>
            </li>

            {/* Logout Button */}
            <li>
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  if (onLogout) onLogout();
                }}
                className={`w-full flex items-center ${isCollapsed ? 'lg:justify-center' : ''} px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group text-red-600 hover:bg-red-50`}
                title={isCollapsed ? 'Logout' : ''}
              >
                <ArrowRightOnRectangleIcon className={`h-5 w-5 ${isCollapsed ? 'lg:m-0' : 'mr-3'} transition-transform group-hover:scale-110 flex-shrink-0`} />
                <span className={`transition-opacity duration-300 ${isCollapsed ? 'lg:hidden opacity-0' : 'opacity-100'}`}>
                  Logout
                </span>
              </button>
            </li>
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className={`flex items-center ${isCollapsed ? 'lg:justify-center' : ''}`}>
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'CO'}
              </div>
            </div>
            {!isCollapsed && (
              <div className="ml-3 overflow-hidden flex flex-col">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user?.name || 'Collector Office'}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-md truncate uppercase tracking-wider">
                    {user?.role ? user.role.replace(/_/g, ' ') : 'USER'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium truncate flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  {user?.village && user.village !== 'ALL VILLAGES' ? user.village + ', ' : ''}{user?.taluka && user.taluka !== 'ALL TALUKAS' ? user.taluka : (user?.district || 'Amravati')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;