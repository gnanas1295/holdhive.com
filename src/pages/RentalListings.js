import React, { useState, useEffect } from 'react';
import { listRentalByRenterId, deleteRental } from '../services/rentalService';
import { Container, Table, Alert, Spinner, Button, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ReviewsModal from '../components/ReviewsModal';
import RentalDetailsModal from '../components/RentalDetailsModal';

const RentalsByRenter = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRental, setSelectedRental] = useState(null);
  const [rentalToDelete, setRentalToDelete] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
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

  const fetchReviews = async (storageId) => {
    try {
      const apiUrl = `https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/review-service/list-reviews-by-storage-id?storage_id=${storageId}`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      localStorage.setItem('storage_id', storageId);
      setReviews(data.data || []);
      setShowReviewsModal(true);

    } catch (err) {
      setError(err.message || 'Failed to fetch reviews.');
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

  // Helper function to check if a rental is deletable
  const isDeletable = (endDate) => {
    const today = new Date();
    const rentalEndDate = new Date(endDate);
    return rentalEndDate >= today; // Deletable only if the end date is today or in the future
  };

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">My Rentals</h2>
      {loading && (
        <div className="text-center">
          <Spinner animation="border" variant='warning' />
          <p>Loading rentals...</p>
        </div>
      )}
      {error && !loading && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        <>
          <div className="d-flex justify-content-between mb-3">
            <Button variant="warning" onClick={handleAddRental}>
              Add Rental
            </Button>
          </div>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Rental ID</th>
                <th>Storage Title</th>
                <th>Eircode</th>
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
                  <td>{rental.storage_title}</td>
                  <td>{rental.eircode}</td>
                  <td>{new Date(rental.start_date).toLocaleDateString()}</td>
                  <td>{new Date(rental.end_date).toLocaleDateString()}</td>
                  <td>€{rental.total_price}</td>
                  <td>{rental.payment_status}</td>
                  <td>
                    <OverlayTrigger
                      overlay={
                        !isDeletable(rental.end_date) ? (
                          <Tooltip id={`tooltip-${rental.rental_id}`}>
                            Rentals with a past end date cannot be deleted.
                          </Tooltip>
                        ) : (
                          <></> // Provide an empty fragment or valid React node when deletable
                        )
                      }
                    >
                      <span className="d-inline-block">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRentalToDelete(rental); // Open delete confirmation modal
                          }}
                          disabled={!isDeletable(rental.end_date)} // Disable button for past rentals
                        >
                          <i className="bi bi-trash-fill me-1"></i>
                        </Button>
                      </span>
                    </OverlayTrigger>
                    <Button
                      variant="warning"
                      size="sm"
                      className="ms-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchReviews(rental.storage_id); // Fetch reviews for the associated storage ID
                      }}
                      disabled={new Date(rental.end_date) >= new Date()} // Disable button if end date is in the future or today
                    >
                      View Reviews
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
      <RentalDetailsModal
        show={!!selectedRental}
        onHide={() => setSelectedRental(null)}
        rental={selectedRental}
        roomTypeImageUrls={roomTypeImageUrls}
      />
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
      {/* Reviews Modal */}
      <ReviewsModal
        show={showReviewsModal}
        onHide={() => setShowReviewsModal(false)}
        reviews={reviews}
        fetchReviews={fetchReviews}
      />
    </Container>
  );
};

export default RentalsByRenter;
