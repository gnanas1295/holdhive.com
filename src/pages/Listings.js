import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const Listings = () => {
  const location = useLocation();
  const { storageId } = location.state || {}; // Extract `storageId` from state
  const navigate = useNavigate();

  const [storageListings, setStorageListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!storageId) {
      setError('Storage ID not provided.');
      setLoading(false);
      return;
    }

    const fetchListings = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await axios.get(
          'https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/storage-location/list-storage-location-by-id',
          {
            params: { storage_id: storageId },
          }
        );

        if (response.data.message === 'Storage location fetched successfully') {
          setStorageListings(response.data.data || []);
        } else {
          setError('Failed to fetch storage listings.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while fetching storage listings.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [storageId]);

  const handleBookNow = (listing) => {
    navigate('/booking', { state: { listing } });
  };

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">Storage Listings</h2>
      <p className="text-center">
        Showing results for <strong>Storage ID: {storageId}</strong>
      </p>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      ) : storageListings.length > 0 ? (
        <Row>
          {storageListings.map((listing) => (
            <Col md={3} key={listing.storage_id} className="mb-4">
              <Card className="h-100 d-flex flex-column">
                <Card.Img
                  variant="top"
                  src={listing.images_url}
                  alt={listing.title || 'Storage Listing'}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{listing.title || 'Unnamed Storage'}</Card.Title>
                  <Card.Text>
                    <strong>Location:</strong> {listing.location || 'No Location Provided'}
                  </Card.Text>
                  <Card.Text>
                    <strong>Size:</strong> {listing.size || 'N/A'} m²
                  </Card.Text>
                  <Card.Text>
                    <strong>Price:</strong> €{listing.price_per_month || 'N/A'} per month
                  </Card.Text>
                  <Card.Text>
                    <strong>Type:</strong> {listing.storage_type || 'N/A'}
                  </Card.Text>
                  <Card.Text>
                    <strong>Status:</strong> {listing.availability || 'N/A'}
                  </Card.Text>
                  <Card.Text>
                    <strong>Insurance:</strong> {listing.insurance_option ? 'Available' : 'Not Available'}
                  </Card.Text>
                  <Card.Text>
                    <strong>Eircode:</strong> {listing.eircode || 'N/A'}
                  </Card.Text>
                  <div className="mt-auto">
                    <Button
                      variant="danger"
                      className="w-100"
                      onClick={() => handleBookNow(listing)}
                    >
                      Book Now
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

      ) : (
        <p className="text-center text-muted">No listings found for this Storage ID.</p>
      )}
    </Container>
  );
};

export default Listings;
