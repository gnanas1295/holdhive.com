import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

const Header = () => {
  const [user] = useAuthState(auth);

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand as={Link} to="/">Storage Space</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          <Nav.Link as={Link} to="/">Home</Nav.Link>
          <Nav.Link as={Link} to="/about">About</Nav.Link>
          {user && <Nav.Link as={Link} to="/admin">Admin</Nav.Link>}
          {user ? (
            <Button variant="link" className="text-white" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Nav.Link as={Link} to="/auth">Login</Nav.Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
