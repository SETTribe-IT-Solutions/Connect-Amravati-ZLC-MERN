import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROLES } from '../../constants/roles';

const RoleRoute = ({ children, allowedRoles, fallbackPath = '/dashboard' }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // System Administrators generally have access to everything, but we check specifically
  // if their role is in the allowedRoles array.
  const hasAccess = user && allowedRoles.includes(user.role);

  if (!hasAccess) {
    // If the user is a system admin but accessing a non-admin path that is restricted,
    // or vice versa, redirect them to their appropriate dashboard.
    const redirectPath = user?.role === ROLES.SYSTEM_ADMINISTRATOR ? '/users' : fallbackPath;
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default RoleRoute;
