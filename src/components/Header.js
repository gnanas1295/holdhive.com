import React from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import '../styles/Header.css'; // Optional for custom styles

const Header = () => {
  const [user] = useAuthState(auth);

  const handleLogout = () => {
    auth.signOut();
    localStorage.removeItem('isLoggedIn');
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
            {/* Nav Links */}
            <Nav.Link as={Link} to="/" className="mx-2">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/about" className="mx-2">
              About
            </Nav.Link>
            {user && (
              <Nav.Link as={Link} to="/admin" className="mx-2">
                Admin
              </Nav.Link>
            )}

            {/* Auth Buttons */}
            {user ? (
              <div className="d-flex align-items-center">
                <span className="text-white me-3">Hello, {user.displayName || 'User'}</span>
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
