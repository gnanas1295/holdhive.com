import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
} from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Listings = () => {
  const location = useLocation();
  const { storageId } = location.state || {};
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
        setError(
          err.response?.data?.message ||
            'An error occurred while fetching storage listings.'
        );
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
        <h2 className="text-center mb-3">
          Showing results for <strong>Storage ID: {storageId}</strong>
        </h2>

        {/* Loading / Error Handling */}
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant='warning' />
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        ) : storageListings.length > 0 ? (
          <Row>
            {storageListings.map((listing) => (
              <Col
                md={6}
                lg={4}
                xl={3}
                key={listing.storage_id}
                className="mb-4 d-flex"
              >
                <Card
                  className="w-100 shadow-sm overflow-hidden"
                  style={{ transition: 'transform 0.2s' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Card.Img
                    variant="top"
                    src={listing.images_url || 'https://via.placeholder.com/300'}
                    alt={listing.title || 'Storage Listing'}
                    style={{ objectFit: 'cover', height: '180px' }}
                  />
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>{listing.title || 'Unnamed Storage'}</Card.Title>
                    <Card.Text className="mb-1">
                      <strong>Location:</strong>{' '}
                      {listing.location || 'No Location Provided'}
                    </Card.Text>
                    <Card.Text className="mb-1">
                      <strong>Size:</strong>{' '}
                      {listing.size ? `${listing.size} m²` : 'N/A'}
                    </Card.Text>
                    <Card.Text className="mb-1">
                      <strong>Price:</strong>{' '}
                      {listing.price_per_month
                        ? `€${listing.price_per_month} per month`
                        : 'N/A'}
                    </Card.Text>
                    <Card.Text className="mb-1">
                      <strong>Type:</strong> {listing.storage_type || 'N/A'}
                    </Card.Text>
                    <Card.Text className="mb-1">
                      <strong>Status:</strong> {listing.availability || 'N/A'}
                    </Card.Text>
                    <Card.Text className="mb-1">
                      <strong>Insurance:</strong>{' '}
                      {listing.insurance_option ? 'Available' : 'Not Available'}
                    </Card.Text>
                    <Card.Text className="mb-1">
                      <strong>Eircode:</strong> {listing.eircode || 'N/A'}
                    </Card.Text>
                    <Card.Text className="mb-2">
                      <strong>Rating:</strong>{' '}
                      <span className="text-warning">
                        {'⭐'.repeat(listing.average_review_score)}
                      </span>
                      <span className="text-muted">
                        {' '}
                        ({listing.average_review_score})
                      </span>
                    </Card.Text>

                    {/* Book Now Button (sticks to bottom of Card) */}
                    <div className="mt-auto">
                      <Button
                        variant="warning"
                        className="w-100 text-uppercase fw-bold"
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
          <p className="text-center text-muted">
            No listings found for this Storage ID.
          </p>
        )}
      </Container>
  );
};

export default Listings;
