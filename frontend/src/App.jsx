import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { store } from './store';
import { AnimatePresence } from 'framer-motion';

// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Tasks from './pages/tasks/Tasks';
import Communications from './pages/communications/Communications';
import Reports from './pages/reports/Reports';
import UserManagement from './pages/users/UserManagement';
import Appreciation from './pages/appreciation/Appreciation';
import Notifications from './pages/notifications/Notifications';
import ChangePassword from './pages/auth/ChangePassword';
import { changePassword, loginUser, getCurrentUser, logoutUser } from './services/auth/authService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error", error);
    }
    
    setIsAuthenticated(false);
    setUser(null);
    
    // Redirect to login
    window.location.href = '/login';
  };

  // Check for existing session on load
  useEffect(() => {
    const vaildateSession = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          const userToStore = {
            userID: userData.id,
            name: userData.name,
            role: userData.role,
            email: userData.email,
            district: userData.district,
            taluka: userData.taluka,
            village: userData.village,
            loginTime: new Date().toISOString(),
            permissions: userData.role === 'SYSTEM_ADMINISTRATOR' ? ['all'] : ['view_tasks']
          };
          setUser(userToStore);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Not authenticated or session expired
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    vaildateSession();
  }, []);

  // Handle login
  const handleLogin = (userData) => {
    if (userData) {
      const normalizedRole = userData.role;
      
      const userToStore = {
        userID: userData.id,
        name: userData.name,
        role: normalizedRole,
        email: userData.email,
        district: userData.district,
        taluka: userData.taluka,
        village: userData.village,
        loginTime: new Date().toISOString(),
        permissions: normalizedRole === 'SYSTEM_ADMINISTRATOR' ? ['all'] : ['view_tasks']
      };
 
      setIsAuthenticated(true);
      setUser(userToStore);
      
      return true;
    }
    return false;
  };
  // Handle password verification (for step 1)
  const handleVerifyPassword = async (currentPassword) => {
    try {
      if (!user?.userID) return false;
      await loginUser(user.userID, currentPassword);
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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading Amravati Connect...</p>
        </div>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/login" 
                element={
                  isAuthenticated ? 
                  <Navigate to={user?.role === 'SYSTEM_ADMINISTRATOR' ? "/users" : "/dashboard"} replace /> : 
                  <Login onLogin={handleLogin} />
                } 
              />

              {/* Protected Routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Layout 
                      user={user} 
                      onLogout={handleLogout}
                    />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to={user?.role === 'SYSTEM_ADMINISTRATOR' ? "/users" : "/dashboard"} replace />} />
                
                {/* Main Pages */}
                <Route 
                  path="dashboard" 
                  element={<Dashboard user={user} />} 
                />
                
                <Route 
                  path="tasks" 
                  element={<Tasks user={user} />} 
                />
                
                <Route 
                  path="communications" 
                  element={<Communications user={user} />} 
                />
                
                <Route 
                  path="reports" 
                  element={<Reports user={user} />} 
                />
                
                <Route 
                  path="users" 
                  element={<UserManagement user={user} />} 
                />
                
                <Route 
                  path="appreciation" 
                  element={<Appreciation user={user} />} 
                />

                <Route 
                  path="notifications" 
                  element={<Notifications user={user} />} 
                />

                {/* Change Password Page */}
                <Route 
                  path="change-password" 
                  element={
                    <ChangePassword 
                      onPasswordChange={handlePasswordChange}
                      onVerifyPassword={handleVerifyPassword}
                      onClose={() => window.history.back()}
                    />
                  } 
                />

                {/* Catch all unmatched routes */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>

              {/* Redirect root to appropriate page */}
              <Route 
                path="/forgot-password" 
                element={
                  <ChangePassword 
                    onPasswordChange={handlePasswordChange}
                    onVerifyPassword={handleVerifyPassword}
                    onClose={() => window.location.href = '/login'}
                    initialTab="forgot"
                    hideTabs={true}
                  />
                } 
              />
            </Routes>
          </AnimatePresence>

          {/* Global Session Status (optional) */}
          {isAuthenticated && (
            <div className="fixed bottom-4 right-4 z-50 hidden lg:block">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2 flex items-center space-x-3 border-l-4 border-green-500">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
                  <span className="text-sm text-gray-600">Session Active</span>
                </div>
                <div className="text-xs text-gray-400">
                  {user?.name || 'Collector'}
                </div>
              </div>
            </div>
          )}
        </div>
      </Router>
    </Provider>
  );
}

export default App;