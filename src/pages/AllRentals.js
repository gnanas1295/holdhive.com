import React, { useState, useEffect } from 'react';
import { listAllRentals, listRentalById } from '../services/rentalService';
import { Container, Table, Spinner, Alert } from 'react-bootstrap';
import RentalDetailsModal from '../components/RentalDetailsModal';

const AllRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRental, setSelectedRental] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const roomTypeImageUrls = {
    Basement: 'https://holdhive.s3.eu-west-1.amazonaws.com/Storage_Spaces_Images/Empty_Basement_Image.jpeg',
    Roof: 'https://holdhive.s3.eu-west-1.amazonaws.com/Storage_Spaces_Images/Empty_Roof.jpg',
    Room: 'https://holdhive.s3.eu-west-1.amazonaws.com/Storage_Spaces_Images/Empty_Room.jpg',
    Shed: 'https://holdhive.s3.eu-west-1.amazonaws.com/Storage_Spaces_Images/Empty_Shed.jpg',
  };

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

  const handleRowClick = async (rentalId) => {
    setModalLoading(true);
    setModalError('');
    try {
      const response = await listRentalById(rentalId);
      const rentalData = response.data[0]; // Assuming the API returns a single rental in `data`
      setSelectedRental(rentalData);
    } catch (err) {
      setModalError(err.message || 'Failed to load rental details.');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="warning" />
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>All Rentals</h2>
      </div>
      {rentals.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Rental ID</th>
              <th>Storage Title</th>
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
                onClick={() => handleRowClick(rental.rental_id)}
              >
                <td>{rental.rental_id}</td>
                <td>{rental.storage_title}</td>
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

      {/* Rental Details Modal */}
      <RentalDetailsModal
        show={!!selectedRental}
        onHide={() => setSelectedRental(null)}
        rental={selectedRental}
        roomTypeImageUrls={roomTypeImageUrls}
      />

      {/* Modal Loading/Error States */}
      {modalLoading && (
        <div className="text-center my-3">
          <Spinner animation="border" variant="warning" />
          <p>Loading rental details...</p>
        </div>
      )}
      {modalError && (
        <Alert variant="danger" className="mt-3">
          {modalError}
        </Alert>
      )}
    </Container>
  );
};

export default AllRentals;
