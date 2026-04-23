import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import store from './store';
import { setCredentials, logout, setLoading } from './store/slices/authSlice';
import { AnimatePresence } from 'framer-motion';

// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ROLES } from './constants/roles';

// Pages (Lazy Loaded for performance)
const Login = React.lazy(() => import('./pages/auth/Login'));
const Dashboard = React.lazy(() => import('./pages/dashboard/Dashboard'));
const Tasks = React.lazy(() => import('./pages/tasks/Tasks'));
const Communications = React.lazy(() => import('./pages/communications/Communications'));
const Reports = React.lazy(() => import('./pages/reports/Reports'));
const UserManagement = React.lazy(() => import('./pages/users/UserManagement'));
const Appreciation = React.lazy(() => import('./pages/appreciation/Appreciation'));
const Notifications = React.lazy(() => import('./pages/notifications/Notifications'));
const ChangePassword = React.lazy(() => import('./pages/auth/ChangePassword'));
import { changePassword, loginUser, getCurrentUser, logoutUser, verifyEmail, resetPasswordByEmail } from './services/auth/authService';

function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error", error);
    }
    
    // Clear all local storage data
    localStorage.clear();
    
    dispatch(logout());
    
    // Redirect to login
    window.location.href = '/login';
  };

  // Check for existing session on load
  React.useEffect(() => {
    const vaildateSession = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          dispatch(setCredentials(userData));
        } else {
          dispatch(setLoading(false));
        }
      } catch (error) {
        dispatch(setLoading(false));
      }
    };

    vaildateSession();
  }, [dispatch]);

  // Handle login
  const handleLogin = (userData) => {
    if (userData) {
      dispatch(setCredentials(userData));
      return true;
    }
    return false;
  };
  // Handle password verification (for step 1)
  const handleVerifyPassword = async (currentPassword) => {
    try {
      if (!user?.phone) return false;
      await loginUser(user.phone, currentPassword);
      return true; // Password is valid!
    } catch (error) {
      return false; // Password mismatch
    }
  };

  const handlePasswordChange = async (oldPassword, newPassword) => {
    try {
      if (!user?.userID) {
        toast.error('User session is invalid. Please log in again.');
        return false;
      }
      await changePassword(user.userID, oldPassword, newPassword);
      toast.success('Password changed successfully');
      return true;
    } catch (error) {
      let msg = 'Failed to change password';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          msg = error.response.data;
        } else if (error.response.data.message) {
          msg = error.response.data.message;
        } else if (error.response.data.errors) {
          // Validation errors
          msg = Object.values(error.response.data.errors).join(', ');
        }
      }
      toast.error(msg);
      return false;
    }
  };

  const handleVerifyEmail = async (email) => {
    try {
      await verifyEmail(email);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleForgotPassword = async (email, newPassword) => {
    try {
      await resetPasswordByEmail(email, newPassword);
      toast.success('Password reset successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data || 'Failed to reset password');
      return false;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)' }}>
        <div className="text-center">
          <div className="spinner-premium mx-auto mb-4" style={{ width: '3rem', height: '3rem' }}></div>
          <p className="text-white h5 fw-medium">Loading Amravati Connect...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-vh-100" style={{ backgroundColor: '#f8fafc' }}>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '10px',
                padding: '16px',
              },
              success: {
                icon: '✅',
                style: {
                  background: '#10b981',
                },
              },
              error: {
                icon: '❌',
                style: {
                  background: '#ef4444',
                },
              },
              loading: {
                icon: '⏳',
                style: {
                  background: '#3b82f6',
                },
              },
            }}
          />
          
          <AnimatePresence mode="wait">
            <React.Suspense fallback={
              <div className="d-flex align-items-center justify-content-center vh-100" style={{ background: '#f8fafc' }}>
                <div className="text-center">
                  <div className="spinner-premium mx-auto mb-4" style={{ width: '3rem', height: '3rem', borderTopColor: '#2563eb' }}></div>
                  <p className="text-primary h5 fw-medium">Loading Page...</p>
                </div>
              </div>
            }>
              <Routes>
              {/* Public Routes */}
              <Route 
                path="/login" 
                element={
                  isAuthenticated ? 
                  <Navigate to={user?.role === ROLES.SYSTEM_ADMINISTRATOR ? "/users" : "/dashboard"} replace /> : 
                  <Login onLogin={handleLogin} />
                } 
              />

              {/* Protected Routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to={user?.role === ROLES.SYSTEM_ADMINISTRATOR ? "/users" : "/dashboard"} replace />} />
                
                {/* Main Pages */}
                <Route 
                  path="dashboard" 
                  element={
                    user?.role === ROLES.SYSTEM_ADMINISTRATOR ? 
                    <Navigate to="/users" replace /> : 
                    <Dashboard />
                  } 
                />
                
                <Route 
                  path="tasks" 
                  element={
                    user?.role === ROLES.SYSTEM_ADMINISTRATOR ? 
                    <Navigate to="/users" replace /> : 
                    <Tasks />
                  } 
                />
                
                <Route 
                  path="communications" 
                  element={
                    user?.role === ROLES.SYSTEM_ADMINISTRATOR ? 
                    <Navigate to="/users" replace /> : 
                    <Communications />
                  } 
                />
                
                <Route 
                  path="reports" 
                  element={
                    user?.role === ROLES.SYSTEM_ADMINISTRATOR ? 
                    <Navigate to="/users" replace /> : 
                    <Reports />
                  } 
                />
                
                <Route 
                  path="users" 
                  element={
                    <RoleRoute allowedRoles={[ROLES.SYSTEM_ADMINISTRATOR]} fallbackPath="/dashboard">
                      <UserManagement />
                    </RoleRoute>
                  } 
                />
                
                <Route 
                  path="appreciation" 
                  element={
                    user?.role === ROLES.SYSTEM_ADMINISTRATOR ? 
                    <Navigate to="/users" replace /> : 
                    <Appreciation />
                  } 
                />
                
                <Route 
                  path="notifications" 
                  element={
                    user?.role === ROLES.SYSTEM_ADMINISTRATOR ? 
                    <Navigate to="/users" replace /> : 
                    <Notifications />
                  } 
                />

                {/* Change Password Page (Accessible to all) */}
                <Route 
                  path="change-password" 
                  element={
                    <ChangePassword 
                      onVerifyPassword={handleVerifyPassword}
                      onPasswordChange={handlePasswordChange}
                      onClose={() => window.history.back()}
                      mode="change"
                      currentUser={user}
                    />
                  } 
                />

                {/* Catch all unmatched routes */}
                <Route path="*" element={<Navigate to={user?.role === ROLES.SYSTEM_ADMINISTRATOR ? "/users" : "/dashboard"} replace />} />
              </Route>

              {/* Redirect root to appropriate page */}
              <Route 
                path="/forgot-password" 
                element={
                  <ChangePassword 
                    onVerifyEmail={handleVerifyEmail}
                    onForgotPassword={handleForgotPassword}
                    onClose={async () => {
                      try {
                        await logoutUser();
                      } catch (error) {
                        console.error("Logout error during reset", error);
                      }
                      localStorage.clear();
                      dispatch(logout());
                      window.location.href = '/login';
                    }}
                    mode="forgot"
                  />
                } 
              />
              </Routes>
            </React.Suspense>
          </AnimatePresence>

          {/* Global Session Status (optional) */}
          {isAuthenticated && (
            <div className="position-fixed bottom-0 end-0 m-4 p-3 z-3 d-none d-lg-block">
              <div className="bg-white border-start border-4 border-success rounded shadow-sm px-4 py-2 d-flex align-items-center gap-3">
                <div className="d-flex align-items-center">
                  <span className="bg-success rounded-circle me-2" style={{ width: '8px', height: '8px' }}></span>
                  <span className="small text-secondary">Session Active</span>
                </div>
                <div className="small text-muted fw-bold">
                  {user?.name || 'Collector'}
                </div>
              </div>
            </div>
          )}
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;