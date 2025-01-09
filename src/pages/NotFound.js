// src/pages/NotFound.js
import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container className="text-center my-5">
      <h1 className="display-4 text-danger">404</h1>
      <p className="lead">Oops! The page you are looking for doesn't exist.</p>
      <Button variant="warning" onClick={() => navigate('/')}>
        Go to Home
      </Button>
    </Container>
  );
};

export default NotFound;
