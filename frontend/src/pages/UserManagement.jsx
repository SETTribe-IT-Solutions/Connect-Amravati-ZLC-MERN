import React from 'react';
import UserManagementComponent from '../components/features/users/UserManagementComponent';

const UserManagement = ({ user }) => {
  return <UserManagementComponent currentUser={user} />;
};

export default UserManagement;