import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check local storage for existing session
    const role = localStorage.getItem('role');
    if (role) {
      setUser({ role });
    }
  }, []);

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
