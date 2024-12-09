import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

const PrivateRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    // Show a loading spinner or placeholder while the auth state is loading
    return <div>Loading...</div>;
  }

  return user ? children : <Navigate to="/auth" replace />;
};

export default PrivateRoute;
