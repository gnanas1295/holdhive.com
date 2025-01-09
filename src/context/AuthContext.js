import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          role: localStorage.getItem('userRole') || 'user', // Fetch role from localStorage
        });
        localStorage.setItem('id', currentUser.uid);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (role) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', role);
    window.location.reload(); // Hard refresh after login
  };

  const logout = async () => {
  try {
    await auth.signOut();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    setUser(null);
    window.location.replace('/auth');
  } catch (err) {
    console.error('Logout error:', err);
  }
};


  const refreshRole = () => {
    const newRole = localStorage.getItem('userRole') || 'user';
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        role: newRole,
      };
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
};
