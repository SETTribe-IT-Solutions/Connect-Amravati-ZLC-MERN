import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const role = localStorage.getItem('role');
    return role ? { role } : null;
  });

  const login = (role) => {
    localStorage.setItem('role', role);
    setUser({ role });
  };

  const logout = () => {
    localStorage.removeItem('role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
