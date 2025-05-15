// src/frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    return userId && username ? { userId, username } : null;
  });

  const login = (userData) => {
    if (!userData || !userData.userId || !userData.username) {
      console.error('Invalid user data:', userData);
      return;
    }
    localStorage.setItem('userId', userData.userId);
    localStorage.setItem('username', userData.username);
    setCurrentUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;