import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import { 
  HomeIcon, 
  ClipboardDocumentListIcon, 
  ChatBubbleLeftRightIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  HeartIcon, 
  KeyIcon, 
  ArrowRightOnRectangleIcon, 
  ExclamationTriangleIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { GiIndiaGate } from 'react-icons/gi';

const Sidebar = ({ sidebarOpen, setSidebarOpen, isCollapsed, setIsCollapsed, user, onLogout }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const role = user?.role || localStorage.getItem('role') || 'user';
  const roleLower = role.toLowerCase();

  const allNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, color: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' },
    { name: 'Tasks', href: '/tasks', icon: ClipboardDocumentListIcon, color: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' },
    { name: 'Communications', href: '/communications', icon: ChatBubbleLeftRightIcon, color: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon, color: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' },
    { name: 'Users', href: '/users', icon: UserGroupIcon, color: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' },
    { name: 'Appreciation', href: '/appreciation', icon: HeartIcon, color: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' },
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

  const sidebarWidth = isCollapsed ? '80px' : '256px';

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="position-fixed inset-0 bg-dark bg-opacity-50 z-index-mobile-backdrop d-lg-none transition-all"
          style={{ zIndex: 1040, inset: 0 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className="position-fixed bg-white border-end z-index-sidebar transition-all d-flex flex-column shadow-sm"
        style={{
          width: sidebarWidth,
          left: sidebarOpen ? '0' : (window.innerWidth < 1024 ? '-256px' : '0'),
          top: 0,
          bottom: 0,
          zIndex: 1050,
          transition: 'all 0.3s ease-in-out',
        }}
      >
        {/* Tricolor Top Bar */}
        <div style={{ height: '4px', width: '100%', background: 'linear-gradient(90deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)' }}></div>

        {/* Sidebar Toggle & Logo Section */}
        <div className="d-flex align-items-center border-bottom px-3 bg-white" style={{ height: '60px', minHeight: '60px' }}>
          <div className={`d-flex align-items-center w-100 ${isCollapsed ? 'justify-content-center' : 'justify-content-between'}`}>
            {!isCollapsed && (
              <div className="d-flex align-items-center gap-2 overflow-hidden">
                <div className="bg-primary bg-opacity-10 p-1 rounded">
                   <GiIndiaGate className="text-primary" style={{ fontSize: '1.2rem' }} />
                </div>
                <span className="fw-bold text-dark text-truncate" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                  AMRAVATI
                </span>
              </div>
            )}
            
            {/* Toggle Button for Desktop (Collapse) and Mobile (Close) */}
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false);
                } else {
                  if (setIsCollapsed) setIsCollapsed(!isCollapsed);
                }
              }}
              className="btn btn-light border-0 p-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center hover-bg-primary-soft transition-all"
              style={{ width: '32px', height: '32px' }}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
               <Bars3Icon style={{ width: '1.2rem', height: '1.2rem' }} className="text-primary" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow-1 overflow-auto py-4 custom-scrollbar">
          <ul className="list-unstyled px-3 m-0">
            {navigation.map((item) => (
              <li key={item.name} className="mb-2">
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `d-flex align-items-center text-decoration-none rounded-3 px-3 py-2 transition-all ${
                      isActive ? 'text-white shadow-sm' : 'text-secondary bg-hover-light'
                    }`
                  }
                  style={({ isActive }) => ({
                    background: isActive ? item.color : 'transparent',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    fontWeight: '500'
                  })}
                  title={isCollapsed ? item.name : ''}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon style={{ width: '1.25rem', height: '1.25rem', marginRight: isCollapsed ? '0' : '0.75rem' }} />
                  {!isCollapsed && <span>{item.name}</span>}
                </NavLink>
              </li>
            ))}

            <li className="my-3 border-top opacity-50"></li>

            <li className="mb-2">
              <NavLink
                to="/change-password"
                className={({ isActive }) =>
                  `d-flex align-items-center text-decoration-none rounded-3 px-3 py-2 transition-all ${
                    isActive ? 'text-white shadow-sm bg-primary' : 'text-secondary bg-hover-light'
                  }`
                }
                style={{
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  fontWeight: '500'
                }}
                title={isCollapsed ? 'Change Password' : ''}
                onClick={() => setSidebarOpen(false)}
              >
                <KeyIcon style={{ width: '1.25rem', height: '1.25rem', marginRight: isCollapsed ? '0' : '0.75rem' }} />
                {!isCollapsed && <span>Change Password</span>}
              </NavLink>
            </li>

            <li>
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  setShowLogoutModal(true);
                }}
                className="btn w-100 d-flex align-items-center rounded-3 px-3 py-2 transition-all text-danger bg-hover-danger-soft border-0"
                style={{
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  fontWeight: '500'
                }}
                title={isCollapsed ? 'Logout' : ''}
              >
                <ArrowRightOnRectangleIcon style={{ width: '1.25rem', height: '1.25rem', marginRight: isCollapsed ? '0' : '0.75rem' }} />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </li>
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-3 border-top bg-light bg-opacity-50">
          <div className={`d-flex align-items-center ${isCollapsed ? 'justify-content-center' : ''}`}>
            <div className="flex-shrink-0">
              <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                  fontSize: '0.875rem'
                }}>
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'CO'}
              </div>
            </div>
            {!isCollapsed && (
              <div className="ms-3 overflow-hidden d-flex flex-column">
                <p className="small fw-bold text-dark mb-0 text-truncate" style={{ maxWidth: '140px' }}>
                  {user?.name || 'Collector Office'}
                </p>
                <div className="mt-1">
                  <span className="badge bg-primary bg-opacity-10 text-primary fw-bold p-1 px-2 rounded-pill uppercase tracking-wider" style={{ fontSize: '0.65rem' }}>
                    {user?.role ? user.role.replace(/_/g, ' ') : 'USER'}
                  </span>
                </div>
                <p className="text-muted mt-1 mb-0 text-truncate" style={{ fontSize: '0.65rem', fontWeight: '500' }}>
                  <span className="d-inline-block bg-success rounded-circle me-1" style={{ width: '6px', height: '6px' }}></span>
                  {user?.village && user.village !== 'ALL VILLAGES' ? user.village + ', ' : ''}{user?.taluka && user.taluka !== 'ALL TALUKAS' ? user.taluka : (user?.district || 'Amravati')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered className="fade">
        <Modal.Body className="p-4 text-center">
          <div className="bg-danger bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
            <ExclamationTriangleIcon style={{ width: '2.5rem', height: '2.5rem' }} className="text-danger" />
          </div>
          <h5 className="fw-bold mb-3">Confirm Logout</h5>
          <p className="text-muted mb-4">Are you sure you want to log out of your account?</p>
          <div className="d-flex gap-3">
            <Button variant="light" className="flex-grow-1 py-2 fw-semibold rounded-3" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" className="flex-grow-1 py-2 fw-semibold rounded-3 d-flex align-items-center justify-content-center gap-2 shadow-sm" onClick={() => {
              setShowLogoutModal(false);
              if (onLogout) onLogout();
            }}>
              <ArrowRightOnRectangleIcon style={{ width: '1.15rem', height: '1.15rem' }} />
              Logout
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Sidebar;