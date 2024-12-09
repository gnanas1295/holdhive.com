import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Admin from './pages/Admin';
import AuthForm from './components/AuthForm';
import PrivateRoute from './components/PrivateRoute';
import Listings from './pages/Listings';
import Booking from './pages/Booking';

const App = () => {
  // Get the login state from Firebase or localStorage
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  return (
    <BrowserRouter>
      <div>
        <Header />
        <div className="container my-4">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/booking" element={<Booking />} />

            {/* Authentication Route */}
            <Route
              path="/auth"
              element={isLoggedIn ? <Navigate to="/admin" replace /> : <AuthForm />}
            />

            {/* Protected Route */}
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <Admin />
                </PrivateRoute>
              }
            />

            {/* Catch-All Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
