import React, { useState, useEffect } from 'react';
import { listAllRentals } from '../services/rentalService';
import { useNavigate } from 'react-router-dom';
import { Container, Table, Spinner, Alert } from 'react-bootstrap';

const AllRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const data = await listAllRentals();
        setRentals(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRentals();
  }, []);

  const handleRowClick = (rentalId) => {
    navigate(`/rentals/details/${rentalId}`);
  };

  if (loading)
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading rentals...</p>
      </div>
    );

  if (error)
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );

  return (
    <Container className="my-5">
      <h2>All Rentals</h2>
      {rentals.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Rental ID</th>
              <th>Storage ID</th>
              <th>Renter ID</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Total Price</th>
              <th>Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental) => (
              <tr
                key={rental.rental_id}
                style={{ cursor: 'pointer' }}
                onClick={() => handleRowClick(rental.rental_id)} // Navigate to details page
              >
                <td>{rental.rental_id}</td>
                <td>{rental.storage_id}</td>
                <td>{rental.renter_id}</td>
                <td>{new Date(rental.start_date).toLocaleDateString()}</td>
                <td>{new Date(rental.end_date).toLocaleDateString()}</td>
                <td>€{rental.total_price}</td>
                <td>{rental.payment_status}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className="text-center text-muted">No rentals available.</p>
      )}
    </Container>
  );
};

export default AllRentals;
