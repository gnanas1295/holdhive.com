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
import ProfileEdit from './pages/Profile';
import AllRentals from './pages/AllRentals';
import RentalsByRenter from './pages/RentalListings.js';
import RentalDetails from './pages/RentalDetails';
import StorageListings from './pages/StorageListings.js';
import AllStorages from './pages/AllStorages.js';
import NotFound from './pages/NotFound';

const App = () => {
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
            <Route path="/storage/:id" element={<Listings />} />
            <Route path="/storages/all" element={<AllStorages />} />
            {/* Authentication Route */}
            <Route
              path="/auth"
              element={isLoggedIn ? <Navigate to="/profile" replace /> : <AuthForm />}
            />

            {/* Admin-Only Route */}
            <Route
              path="/rentals/all"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AllRentals />
                </PrivateRoute>
              }
            />

            {/* Shared Protected Routes (Admin and User) */}
            <Route
              path="/booking"
              element={
                <PrivateRoute allowedRoles={['admin', 'user']}>
                  <Booking />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute allowedRoles={['admin', 'user']}>
                  <Admin />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfileEdit />
                </PrivateRoute>
              }
            />
            <Route
              path="/listings/renter"
              element={
                <PrivateRoute allowedRoles={['admin', 'user']}>
                  <RentalsByRenter />
                </PrivateRoute>
              }
            />
            <Route
              path="/rentals/listings"
              element={
                <PrivateRoute allowedRoles={['admin', 'user']}>
                  <RentalsByRenter />
                </PrivateRoute>
              }
            />
            <Route
              path="/rentals/details/:rentalId"
              element={
                <PrivateRoute allowedRoles={['admin', 'user']}>
                  <RentalDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/storage/listings"
              element={
                <PrivateRoute allowedRoles={['admin', 'user']}>
                  <StorageListings />
                </PrivateRoute>
              }
            />
            {/* Catch-All Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
