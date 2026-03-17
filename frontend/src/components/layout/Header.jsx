import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bars3Icon, BellIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Logout from '../../pages/Logout'; // This path should be correct

const Header = ({ setSidebarOpen }) => {
  const { t } = useTranslation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    // Clear any stored data
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionToken');
    
    // Clear session storage
    sessionStorage.clear();
    
    // Redirect to login
    window.location.href = '/login';
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600 lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Title Section */}
            <div className="flex-1 px-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {t('dashboard.collectorOffice')}
              </h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                {t('app.tagline')}
              </p>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Notification Bell */}
              <button className="relative p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors group">
                <BellIcon className="h-5 w-5 md:h-6 md:w-6" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white group-hover:animate-ping" />
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Notifications
                </span>
              </button>

              {/* Logout Button */}
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center px-2 md:px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors group relative"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 md:mr-1" />
                <span className="hidden md:inline">Logout</span>
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap md:hidden">
                  Logout
                </span>
              </button>

              {/* User Profile */}
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="flex-shrink-0 relative group">
                  <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-md cursor-pointer">
                    CO
                  </div>
                  {/* Online status indicator */}
                  <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white"></span>
                </div>
                
                {/* User info - hidden on mobile */}
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-700">{t('dashboard.collectorOffice')}</p>
                  <p className="text-xs text-gray-500">Amravati</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Logout Modal */}
      {showLogoutModal && (
        <Logout 
          onLogout={handleLogout}
          onClose={() => setShowLogoutModal(false)}
        />
      )}
    </>
  );
};

export default Header;