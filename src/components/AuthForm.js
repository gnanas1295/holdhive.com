import React, { useState } from 'react';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from 'react-bootstrap';

const AuthForm = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleApiCall = async (firebaseUid, email) => {
    const apiUrl =
      'https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/profile/user-creation';
    const requestBody = {
      action: 'create_account',
      data: {
        user_id: firebaseUid,
        email,
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
      await response.json();
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
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
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

      // `getAdditionalUserInfo` gives extra info about user status
      const info = getAdditionalUserInfo(result);
      const isNewUser = info?.isNewUser; // true if user is signing in for the first time

      const firebaseUid = result.user.uid;
      const email = result.user.email;

      // Only call your user-creation API if this is a brand-new user
      if (isNewUser) {
        await handleApiCall(firebaseUid, email);
      }

      alert('Logged in with Google successfully!');
      localStorage.setItem('isLoggedIn', 'true');
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
    >
      <Row className="w-100 mx-0 px-3">
        <Col
          md={{ span: 6, offset: 3 }}
          lg={{ span: 4, offset: 4 }}
          className="d-flex flex-column align-items-center"
        >
          <Card className="shadow border-0 w-100 p-4" style={{ borderRadius: '1rem' }}>
            <Card.Body>
              <h3 className="text-center mb-4 text-warning fw-bold">
                {isSignup ? 'Sign Up' : 'Login'}
              </h3>
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="email" className="mb-3">
                  <Form.Label className="fw-semibold">Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="py-2"
                  />
                </Form.Group>
                <Form.Group controlId="password" className="mb-4">
                  <Form.Label className="fw-semibold">Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="py-2"
                  />
                </Form.Group>

                <Button
                  variant="warning"
                  type="submit"
                  className="w-100 fw-semibold py-2"
                  disabled={loading}
                  style={{ borderRadius: '0.5rem' }}
                >
                  {loading ? (
                    <>
                      <Spinner
                        animation="border"
                        size="sm"
                        role="status"
                        className="me-2"
                      />
                      Processing...
                    </>
                  ) : isSignup ? (
                    'Sign Up'
                  ) : (
                    'Login'
                  )}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <Button
                  variant="link"
                  onClick={() => setIsSignup(!isSignup)}
                  className="text-decoration-none fw-semibold"
                >
                  {isSignup
                    ? 'Already have an account? Login'
                    : "Don't have an account? Sign Up"}
                </Button>
              </div>

              <div className="text-center mt-4">
                <hr className="my-3" />
                <p className="text-muted">Or sign in with</p>
                <Button
                  variant="outline-danger"
                  className="w-100 d-flex align-items-center justify-content-center fw-semibold"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  style={{ borderRadius: '0.5rem' }}
                >
                  {loading ? (
                    <>
                      <Spinner
                        animation="border"
                        size="sm"
                        role="status"
                        className="me-2"
                      />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-google me-2"></i> Google Sign-In
                    </>
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AuthForm;
