import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const BookingForm = ({ item, days, onClose }) => {
  const totalCost = item.price * days;

  return (
    <Modal show onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Book {item.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Description:</strong> {item.description}</p>
        <p><strong>Location:</strong> {item.location}</p>
        <p><strong>Price per Day:</strong> ${item.price}</p>
        <p><strong>Total Cost:</strong> ${totalCost} for {days} day(s)</p>
        <form>
          <div className="form-group">
            <label>Your Name</label>
            <input type="text" className="form-control" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-control" required />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" className="form-control" required />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary">Confirm Booking</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BookingForm;
