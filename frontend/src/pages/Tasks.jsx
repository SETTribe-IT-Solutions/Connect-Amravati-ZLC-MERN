import React from 'react';
import TaskDashboard from '../components/features/tasks/TaskDashboard';

const Tasks = ({ user }) => {
  return <TaskDashboard user={user} />;
};

export default Tasks;