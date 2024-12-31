import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { listRentalById } from '../services/rentalService';
import { Container, Card, Alert, Spinner } from 'react-bootstrap';

const RentalById = () => {
  const { rentalId } = useParams(); // Extract rentalId from the URL
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch rental details when the component mounts or rentalId changes
  useEffect(() => {
    const fetchRentalDetails = async () => {
      if (!rentalId) return;

      setLoading(true);
      setError('');
      try {
        const response = await listRentalById(rentalId); // API call to fetch rental details
        const rentalData = response.data[0]; // Extract the first item in the data array
        setRental(rentalData);
      } catch (err) {
        setError(err.message || 'Failed to fetch rental details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRentalDetails();
  }, [rentalId]);

  return (
    <Container className="my-5">
      <h2>Rental Details</h2>
      {loading && (
        <div className="text-center my-4">
          <Spinner animation="border" variant="primary" />
          <p>Loading rental details...</p>
        </div>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
      {rental ? (
        <Card className="mt-4">
          <Card.Body>
            <Card.Text>
              <strong>Rental ID:</strong> {rental.rental_id}
            </Card.Text>
            <Card.Text>
              <strong>Storage Title:</strong> {rental.storage_title}
            </Card.Text>
            <Card.Text>
              <strong>Storage Description:</strong> {rental.storage_description}
            </Card.Text>
            <Card.Text>
              <strong>Storage Location:</strong> {rental.storage_location}
            </Card.Text>
            <Card.Text>
              <strong>Storage Size:</strong> {rental.storage_size} m²
            </Card.Text>
            <Card.Text>
              <strong>Price per Month:</strong> €{rental.price_per_month}
            </Card.Text>
            <Card.Text>
              <strong>Start Date:</strong> {new Date(rental.start_date).toLocaleDateString()}
            </Card.Text>
            <Card.Text>
              <strong>End Date:</strong> {new Date(rental.end_date).toLocaleDateString()}
            </Card.Text>
            <Card.Text>
              <strong>Total Price:</strong> €{rental.total_price}
            </Card.Text>
            <Card.Text>
              <strong>Payment Status:</strong> {rental.payment_status}
            </Card.Text>
            <Card.Text>
              <strong>Renter Name:</strong> {rental.renter_name}
            </Card.Text>
            <Card.Text>
              <strong>Renter Email:</strong> {rental.renter_email}
            </Card.Text>
            <Card.Text>
              <strong>Renter Phone:</strong> {rental.renter_phone || 'N/A'}
            </Card.Text>
            <Card.Text>
              <strong>Owner Name:</strong> {rental.owner_name}
            </Card.Text>
            <Card.Text>
              <strong>Owner Email:</strong> {rental.owner_email}
            </Card.Text>
            <Card.Text>
              <strong>Owner Phone:</strong> {rental.owner_phone || 'N/A'}
            </Card.Text>
          </Card.Body>
        </Card>
      ) : (
        !loading && <p className="text-muted">No rental details found for ID: {rentalId}</p>
      )}
    </Container>
  );
};

export default RentalById;
