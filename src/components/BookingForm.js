import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const BookingForm = ({ item, days, onClose }) => {
  const totalCost = (item.price || 0) * (days || 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Storage Unit "${item.title}" booked successfully for ${days} days at a total cost of $${totalCost.toFixed(2)}!`);
    onClose(); // Close the modal after booking
  };

  return (
    <Modal show onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Book {item.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <p>
            <strong>Location:</strong> {item.location}
          </p>
          <p>
            <strong>Price per Day:</strong> ${item.price.toFixed(2)}
          </p>
          <p>
            <strong>Total Cost for {days} Day(s):</strong> ${totalCost.toFixed(2)}
          </p>
          <Form.Group controlId="userName">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" placeholder="Enter your name" required />
          </Form.Group>
          <Form.Group controlId="userEmail" className="mt-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" placeholder="Enter your email" required />
          </Form.Group>
          <Button variant="primary" type="submit" className="mt-4 w-100">
            Confirm Booking
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BookingForm;
