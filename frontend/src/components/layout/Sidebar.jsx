import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  UserGroupIcon,
  HeartIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { t } = useTranslation();

  const navigation = [
    { name: t('navigation.dashboard'), href: '/dashboard', icon: HomeIcon, color: 'from-blue-500 to-blue-600' },
    { name: t('navigation.tasks'), href: '/tasks', icon: ClipboardDocumentListIcon, color: 'from-green-500 to-green-600' },
    { name: t('navigation.communications'), href: '/communications', icon: ChatBubbleLeftRightIcon, color: 'from-yellow-500 to-yellow-600' },
    { name: t('navigation.reports'), href: '/reports', icon: ChartBarIcon, color: 'from-purple-500 to-purple-600' },
    { name: t('navigation.users'), href: '/users', icon: UserGroupIcon, color: 'from-pink-500 to-pink-600' },
    { name: t('navigation.appreciation'), href: '/appreciation', icon: HeartIcon, color: 'from-red-500 to-red-600' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-white border-r border-gray-200 z-30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <h1 className="text-xl font-bold text-white">{t('app.name')}</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                      isActive
                        ? `bg-gradient-to-r ${item.color} text-white shadow-md`
                        : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`h-5 w-5 mr-3 transition-transform group-hover:scale-110`} />
                  <span>{item.name}</span>
                  {item.href === '/tasks' && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      3
                    </span>
                  )}
                </NavLink>
              </li>
            ))}

            {/* Divider line before Change Password */}
            <li className="border-t border-gray-200 my-4"></li>

            {/* Change Password Option */}
            <li>
              <NavLink
                to="/change-password"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <KeyIcon className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" />
                <span>Change Password</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-md">
                CO
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{t('dashboard.collectorOffice')}</p>
              <p className="text-xs text-gray-500">Amravati</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;