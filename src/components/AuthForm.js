import React, { useState } from 'react';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

const AuthForm = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Account created successfully!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Logged in successfully!');
      }
      setError('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container my-4">
      <h2 className="text-center">{isSignup ? 'Sign Up' : 'Login'}</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: '400px' }}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block">
          {isSignup ? 'Sign Up' : 'Login'}
        </button>
        <button
          type="button"
          className="btn btn-link btn-block"
          onClick={() => setIsSignup(!isSignup)}
        >
          {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
