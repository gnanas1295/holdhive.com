import React, { useState } from 'react';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';

const AuthForm = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleApiCall = async (firebaseUid, email) => {
    const apiUrl = 'https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/profile/user-creation';
    const requestBody = {
      action: 'create_account',
      data: {
        user_id: firebaseUid,
        email
      },
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to create user in the database.');
      }

      const data = await response.json();
      console.log('User created in DB:', data);
    } catch (err) {
      console.error('API Error:', err.message);
      throw new Error('Failed to create user in the database.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignup) {
        // Firebase Sign-Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUid = userCredential.user.uid;

        // Call the external API
        await handleApiCall(firebaseUid, email);

        alert('Account created successfully!');
      } else {
        // Firebase Login
        await signInWithEmailAndPassword(auth, email, password);
      }

      // Save session to localStorage
      localStorage.setItem('isLoggedIn', 'true');
      setEmail('');
      setPassword('');
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    setError('');

    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUid = result.user.uid;
      const email = result.user.email;

      // Call the external API
      await handleApiCall(firebaseUid, email);

      alert('Logged in with Google successfully!');
      localStorage.setItem('isLoggedIn', 'true');
      navigate('/profile'); // Redirect to the protected page
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ width: '100%', maxWidth: '400px' }} className="shadow">
        <Card.Body>
          <h3 className="text-center mb-4">{isSignup ? 'Sign Up' : 'Login'}</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="email" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="password" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={loading}
            >
              {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Login'}
            </Button>
          </Form>
          <div className="text-center mt-3">
            <Button
              variant="link"
              onClick={() => setIsSignup(!isSignup)}
              className="text-decoration-none"
            >
              {isSignup
                ? 'Already have an account? Login'
                : "Don't have an account? Sign Up"}
            </Button>
          </div>
          <div className="text-center mt-4">
            <p>Or sign in with</p>
            <Button
              variant="outline-danger"
              className="w-100"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Google Sign-In'}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AuthForm;
