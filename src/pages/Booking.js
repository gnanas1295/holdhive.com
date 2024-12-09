import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';

const Booking = () => {
  const location = useLocation();
  const { listing, date } = location.state || {};
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      `Booking confirmed for ${listing.name} on ${new Date(date).toLocaleDateString()}.\nContact: ${formData.name}, ${formData.email}, ${formData.phone}`
    );
  };

  if (!listing) {
    return (
      <Container className="my-5 text-center">
        <h2>Invalid Booking</h2>
        <p>No listing details available.</p>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row>
        <Col md={6}>
          <img src={listing.image} alt={listing.name} className="img-fluid mb-3" />
          <h2>{listing.name}</h2>
          <p>
            <strong>Address:</strong> {listing.address}
          </p>
          <p>
            <strong>Size:</strong> {listing.size}
          </p>
          <p>
            <strong>Price:</strong> {listing.price}
          </p>
        </Col>
        <Col md={6}>
          <h3>Reserve Storage Space</h3>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Button variant="danger" type="submit" className="w-100">
              Confirm Booking
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Booking;
