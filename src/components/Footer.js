import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-dark text-white text-center py-3">
    <div>
      <p>&copy; 2024 HoldHive. All Rights Reserved.</p>
      <div>
        <Link to="/aboutus" className="text-white me-3 text-decoration-none">
          About Us
        </Link>
        <Link to="/terms&conditions" className="text-white text-decoration-none">
          Terms & Conditions
        </Link>
      </div>
    </div>
  </footer>
);

export default Footer;
