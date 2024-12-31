import React, { useState, useEffect } from 'react';
import { listRentalByRenterId, deleteRental } from '../services/rentalService';
import { Container, Table, Alert, Spinner, Button, Modal, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const RentalsByRenter = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRental, setSelectedRental] = useState(null);
  const [rentalToDelete, setRentalToDelete] = useState(null);
  const navigate = useNavigate();

  const renterId = localStorage.getItem('id'); // Get Renter ID from localStorage

  const roomTypeImageUrls = {
    Basement: 'https://holdhive.s3.eu-west-1.amazonaws.com/Storage_Spaces_Images/Empty_Basement_Image.jpeg',
    Roof: 'https://holdhive.s3.eu-west-1.amazonaws.com/Storage_Spaces_Images/Empty_Roof.jpg',
    Room: 'https://holdhive.s3.eu-west-1.amazonaws.com/Storage_Spaces_Images/Empty_Room.jpg',
    Shed: 'https://holdhive.s3.eu-west-1.amazonaws.com/Storage_Spaces_Images/Empty_Shed.jpg',
  };

  // Fetch rentals for the renter
  useEffect(() => {
    if (renterId) {
      fetchRentals(renterId);
    } else {
      setLoading(false);
      setError('Renter ID not found in local storage.');
    }
  }, [renterId]);

  const fetchRentals = async (renterId) => {
    try {
      const data = await listRentalByRenterId(renterId);
      setRentals(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRental = async () => {
    if (!rentalToDelete) return;

    try {
      await deleteRental(rentalToDelete.rental_id);
      fetchRentals(renterId); // Refresh rentals list
      setRentalToDelete(null); // Close confirmation modal
    } catch (err) {
      setError(err.message || 'An error occurred while deleting the rental.');
    }
  };

  const handleAddRental = () => {
    navigate('/storages/all'); // Navigate to storage listings
  };

  const handleRentalClick = (rental) => {
    setSelectedRental(rental); // Set the selected rental for the modal
  };

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">My Rentals</h2>
      {loading && (
        <div className="text-center">
          <Spinner animation="border" />
          <p>Loading rentals...</p>
        </div>
      )}
      {error && !loading && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        <>
          <div className="d-flex justify-content-between mb-3">
            <Button variant="primary" onClick={handleAddRental}>
              Add Rental
            </Button>
          </div>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Rental ID</th>
                <th>Storage ID</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Total Price</th>
                <th>Payment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((rental) => (
                <tr key={rental.rental_id} onClick={() => handleRentalClick(rental)} style={{ cursor: 'pointer' }}>
                  <td>{rental.rental_id}</td>
                  <td>{rental.storage_id}</td>
                  <td>{new Date(rental.start_date).toLocaleDateString()}</td>
                  <td>{new Date(rental.end_date).toLocaleDateString()}</td>
                  <td>€{rental.total_price}</td>
                  <td>{rental.payment_status}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRentalToDelete(rental); // Open delete confirmation modal
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      {!loading && !error && rentals.length === 0 && (
        <p className="text-muted text-center">No rentals found for the provided Renter ID.</p>
      )}

      {/* Rental Details Modal */}
      <Modal show={!!selectedRental} onHide={() => setSelectedRental(null)} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Rental Details</Modal.Title>
        </Modal.Header>
        {selectedRental && (
          <Modal.Body>
            <Container>
              {/* Rental and Storage Details */}
              <Row>
                <Col md={6}>
                  <h5 className="text-primary mb-3"><i className="bi bi-box-seam"></i> Rental Information</h5>
                  <div className="p-3 border rounded">
                    <p><strong>Rental ID:</strong> {selectedRental.rental_id}</p>
                    <p><strong>Start Date:</strong> {new Date(selectedRental.start_date).toLocaleDateString()}</p>
                    <p><strong>End Date:</strong> {new Date(selectedRental.end_date).toLocaleDateString()}</p>
                    <p><strong>Total Price:</strong> €{selectedRental.total_price}</p>
                    <p>
                      <strong>Payment Status:</strong>{' '}
                      <span className={`ms-2 badge ${selectedRental.payment_status === 'paid' ? 'bg-success' : 'bg-warning'}`}>
                        {selectedRental.payment_status}
                      </span>
                    </p>
                  </div>
                </Col>
                <Col md={6}>
                  <h5 className="text-primary mb-3"><i className="bi bi-house-door"></i> Storage Information</h5>
                  <div className="p-3 border rounded d-flex align-items-center">
                    {/* Image Positioned Here */}
                    <img
                      src={
                        roomTypeImageUrls[selectedRental.storage_type] ||
                        'https://via.placeholder.com/300' // Default image if no type matches
                      }
                      alt={selectedRental.storage_type || 'Storage Type'}
                      className="img-fluid rounded shadow me-3"
                      style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    />
                    {/* Storage Details */}
                    <div>
                      <p><strong>Title:</strong> {selectedRental.storage_title}</p>
                      <p><strong>Description:</strong> {selectedRental.storage_description}</p>
                      <p><strong>Size:</strong> {selectedRental.storage_size}m²</p>
                      <p><strong>Location:</strong> {selectedRental.storage_location}</p>
                      <p><strong>Eircode:</strong> {selectedRental.eircode || 'N/A'}</p>
                      <p><strong>Type:</strong> {selectedRental.storage_type}</p>
                      <p><strong>Price Per Month:</strong> €{selectedRental.price_per_month}</p>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Additional Details */}
              <Row className="mt-4">
                <Col md={6}>
                  <h5 className="text-primary mb-3"><i className="bi bi-person"></i> Renter Information</h5>
                  <div className="p-3 border rounded">
                    <p><strong>Name:</strong> {selectedRental.renter_name}</p>
                    <p><strong>Email:</strong> {selectedRental.renter_email}</p>
                    <p><strong>Phone:</strong> {selectedRental.renter_phone || 'N/A'}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <h5 className="text-primary mb-3"><i className="bi bi-person-badge"></i> Owner Information</h5>
                  <div className="p-3 border rounded">
                    <p><strong>Name:</strong> {selectedRental.owner_name}</p>
                    <p><strong>Email:</strong> {selectedRental.owner_email}</p>
                    <p><strong>Phone:</strong> {selectedRental.owner_phone || 'N/A'}</p>
                  </div>
                </Col>
              </Row>
            </Container>
          </Modal.Body>
        )}
        <Modal.Footer className="justify-content-between">
          <Button variant="danger" onClick={() => setSelectedRental(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={!!rentalToDelete}
        onHide={() => setRentalToDelete(null)}
        centered
        size="sm"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this rental?</p>
          <p>
            <strong>Rental ID:</strong> {rentalToDelete?.rental_id}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setRentalToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteRental}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default RentalsByRenter;
