import React, { useState } from 'react';
import { listRentalByStorageId } from '../services/rentalService';
import { Container, Form, Button, Table, Alert, Spinner } from 'react-bootstrap';

const RentalsByStorage = () => {
  const [storageId, setStorageId] = useState('');
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetchRentals = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listRentalByStorageId(storageId);
      setRentals(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <h2>Rentals by Storage ID</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          handleFetchRentals();
        }}
        className="mb-4"
      >
        <Form.Group className="mb-3">
          <Form.Label>Storage ID</Form.Label>
          <Form.Control
            type="text"
            value={storageId}
            onChange={(e) => setStorageId(e.target.value)}
            placeholder="Enter Storage ID"
            required
          />
        </Form.Group>
        <Button type="submit" variant="warning" disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" variant='warning'/> : 'Fetch Rentals'}
        </Button>
      </Form>

      {rentals.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Rental ID</th>
              <th>Renter ID</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Total Price</th>
              <th>Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental) => (
              <tr key={rental.rental_id}>
                <td>{rental.rental_id}</td>
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
        !loading && <p className="text-muted">No rentals found for this Storage ID.</p>
      )}
    </Container>
  );
};

export default RentalsByStorage;
