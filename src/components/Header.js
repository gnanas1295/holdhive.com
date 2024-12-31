import React, { useContext } from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import '../styles/Header.css'; // Optional for custom styles

const Header = () => {
  const { user } = useContext(AuthContext);

  // Retrieve the user name from localStorage
  const userName = localStorage.getItem('name');

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('name');
    localStorage.removeItem('id');
    localStorage.removeItem('startDate');
    localStorage.removeItem('endDate');

    // Sign out the user
    auth.signOut().then(() => {
      // Reload the page after signing out
      window.location.reload();
    }).catch((error) => {
      console.error('Error during logout:', error);
    });
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="py-3">
      <Container>
        {/* Brand Name */}
        <Navbar.Brand as={Link} to="/" className="fw-bold text-uppercase">
          HoldHive
        </Navbar.Brand>

        {/* Toggle for Responsive View */}
        <Navbar.Toggle aria-controls="navbar-nav" />

        {/* Collapsible Links */}
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto align-items-center">
            {/* Common Nav Links */}
            <Nav.Link as={Link} to="/" className="mx-2">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/about" className="mx-2">
              About
            </Nav.Link>
            <Nav.Link as={Link} to="/storages/all" className="mx-2">
              Available Storages
            </Nav.Link>

            {/* Admin-Only Links */}
            {user && user.role === 'admin' && (
              <>
                <Nav.Link as={Link} to="/rentals/all" className="mx-2">
                  All Rentals
                </Nav.Link>
              </>
            )}

            {/* User-Only Links */}
            {user && user.role === 'user' && (
              <>
                <Nav.Link as={Link} to="/rentals/listings" className="mx-2">
                  My Rentals
                </Nav.Link>
                <Nav.Link as={Link} to="/storage/listings" className="mx-2">
                  My Storages
                </Nav.Link>
              </>
            )}

            {/* Auth Buttons */}
            {user ? (
              <div className="d-flex align-items-center">
                <Nav.Link as={Link} to="/profile" className="mx-2">
                  {userName || 'User'}
                </Nav.Link>
                <Button
                  variant="outline-light"
                  className="mx-2"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Nav.Link as={Link} to="/auth" className="mx-2">
                <Button variant="outline-light">Login</Button>
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
