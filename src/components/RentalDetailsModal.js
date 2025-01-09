import React from 'react';
import { Modal, Container, Row, Col, Button } from 'react-bootstrap';

const RentalDetailsModal = ({ show, onHide, rental, roomTypeImageUrls }) => {
  if (!rental) return null;
  console.log(rental)

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      scrollable
    >
      <Modal.Header closeButton className="bg-warning text-white border-0">
        <Modal.Title>Rental Details</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Container fluid>
          <Row className="gy-4">
            {/* Rental Information */}
            <Col md={6}>
              <h5 className="text-warning mb-3">
                <i className="bi bi-box-seam me-1"></i> Rental Information
              </h5>
              <div className="p-3 border rounded shadow-sm">
                <p><strong>Rental ID:</strong> {rental.rental_id}</p>
                <p><strong>Start Date:</strong> {new Date(rental.start_date).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {new Date(rental.end_date).toLocaleDateString()}</p>
                <p><strong>Total Price:</strong> €{rental.total_price}</p>
                <p>
                  <strong>Payment Status:</strong>{' '}
                  <span className={`ms-2 badge ${rental.payment_status === 'paid' ? 'bg-success' : 'bg-warning'}`}>
                    {rental.payment_status}
                  </span>
                </p>
              </div>
            </Col>

            {/* Storage Information */}
            <Col md={6}>
              <h5 className="text-warning mb-3">
                <i className="bi bi-house-door me-1"></i> Storage Information
              </h5>
              <div className="p-3 border rounded shadow-sm d-flex align-items-start">
                <img
                  src={roomTypeImageUrls[rental.storage_type] || 'https://via.placeholder.com/300'}
                  alt={rental.storage_type || 'Storage Type'}
                  className="img-fluid rounded shadow me-3"
                  style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                />
                <div>
                  <p><strong>Title:</strong> {rental.storage_title}</p>
                  <p><strong>Description:</strong> {rental.storage_description}</p>
                  <p><strong>Insurance:</strong> {rental.insurance_option ? 'Yes' : 'No'}</p>
                  <p><strong>Size:</strong> {rental.storage_size}m²</p>
                  <p><strong>Location:</strong> {rental.storage_location}</p>
                  <p><strong>Eircode:</strong> {rental.eircode || 'N/A'}</p>
                  <p><strong>Type:</strong> {rental.storage_type}</p>
                  <p><strong>Price Per Month:</strong> €{rental.price_per_month}</p>
                </div>
              </div>
            </Col>
          </Row>

          <Row className="gy-4 mt-4">
            {/* Renter Information */}
            <Col md={6}>
              <h5 className="text-warning mb-3">
                <i className="bi bi-person me-1"></i> Renter Information
              </h5>
              <div className="p-3 border rounded shadow-sm">
                <p><strong>Name:</strong> {rental.renter_name}</p>
                <p><strong>Email:</strong> {rental.renter_email}</p>
                <p><strong>Phone:</strong> {rental.renter_phone || 'N/A'}</p>
              </div>
            </Col>

            {/* Owner Information */}
            <Col md={6}>
              <h5 className="text-warning mb-3">
                <i className="bi bi-person-badge me-1"></i> Owner Information
              </h5>
              <div className="p-3 border rounded shadow-sm">
                <p><strong>Name:</strong> {rental.owner_name}</p>
                <p><strong>Email:</strong> {rental.owner_email}</p>
                <p><strong>Phone:</strong> {rental.owner_phone || 'N/A'}</p>
              </div>
            </Col>
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer className="justify-content-between border-0">
        <Button variant="danger" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RentalDetailsModal;
