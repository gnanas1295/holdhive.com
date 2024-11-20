import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Admin from './pages/Admin';
import AuthForm from './components/AuthForm';
import PrivateRoute from './components/PrivateRoute';

const App = () => (
  <Router>
    <Header />
    <div className="container my-4">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/auth" element={<AuthForm />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
    <Footer />
  </Router>
);

export default App;
