import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Alert,
  Spinner,
  Form,
} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Import Bootstrap Icons
import { format } from 'date-fns';

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { listing } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewsError, setReviewsError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [availabilityError, setAvailabilityError] = useState('');
  const [availability, setAvailability] = useState(null);
  const [startDate, setStartDate] = useState(() => {
    const savedStartDate = localStorage.getItem('startDate');
    return savedStartDate ? new Date(savedStartDate) : null;
  });
  const [endDate, setEndDate] = useState(() => {
    const savedEndDate = localStorage.getItem('endDate');
    return savedEndDate ? new Date(savedEndDate) : null;
  });
  const [ownerInfo, setOwnerInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const userId = localStorage.getItem('id');

  useEffect(() => {
    const fetchOwnerListings = async () => {
      if (!listing || !listing.owner_id) return;

      const apiUrl = `https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/storage-location/list-storage-location-by-owner-id?user_id=${listing.owner_id}`;
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch owner listings');
        }
        const data = await response.json();
        if (data.data.length > 0) {
          setOwnerInfo({
            name: data.data[0].owner_name || 'Not Available',
            email: data.data[0].owner_email || 'Not Available',
            phone: data.data[0].owner_phone || 'Not Available',
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      // 1) Guard: listing or review_ids missing
      if (!listing || !listing.review_ids) {
        console.warn('No listing or review_ids found. Skipping API call.');
        setReviews([]);
        return;
      }

      // 2) Check if review_ids is an actual array
      if (!Array.isArray(listing.review_ids)) {
        console.warn('listing.review_ids is not an array. Skipping API call.');
        setReviews([]);
        return;
      }

      // 3) Filter out the literal "[]"
      const filteredIds = listing.review_ids.filter(
        (id) => id !== '[]' && typeof id === 'string' && id.trim() !== ''
      );

      // 4) If after filtering there’s nothing to fetch, skip
      if (filteredIds.length === 0) {
        console.warn('No valid review IDs available. Skipping API call.');
        setReviews([]);
        return;
      }

      try {
        // 5) Fetch reviews in parallel
        const reviewPromises = filteredIds.map((id) =>
          fetch(
            `https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/review-service/list-reviews-by-review-id?review_id=${id}`
          ).then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch review ID: ${id}`);
            return res.json();
          })
        );

        const reviewResults = await Promise.all(reviewPromises);

        // 6) Flatten the nested arrays from the response
        const flattenedReviews = reviewResults.map((r) => r.data).flat();

        setReviews(flattenedReviews);
      } catch (err) {
        setReviewsError(err.message);
        console.error('Error fetching reviews:', err.message);
      }
    };


    fetchOwnerListings();
    fetchReviews();
    setLoading(false);
  }, [listing]);

  const checkAvailability = async () => {
    if (!startDate || !endDate) {
      setAvailabilityError('Please select both start and end dates.');
      return;
    }

    setLoading(true);
    setAvailability(null);
    setAvailabilityError('');
    const apiUrl = `https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/storage-location/check-availablity-date-storage-id?storage_id=${listing.storage_id
      }&start_date=${format(startDate, 'yyyy-MM-dd')}&end_date=${format(
        endDate,
        'yyyy-MM-dd'
      )}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to check availability.');
      }

      const data = await response.json();

      if (data.message === 'Storage location is available') {
        setAvailability({
          final_price: data.final_price,
          days: data.days,
        });
      } else {
        setAvailabilityError('Storage location is not available for the selected dates.');
      }
    } catch (err) {
      setAvailabilityError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!availability) {
      alert('Please check availability first.');
      return;
    }

    const bookingData = {
      action: 'create_rental',
      storage_id: listing.storage_id,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      renter_id: userId,
      total_price: availability.final_price,
      payment_status: 'paid',
    };

    try {
      const response = await fetch(
        'https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/rental-service/create-rental',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData),
        }
      );

      if (response.ok) {
        alert(`Booking confirmed for ${listing.title}.`);
        navigate('/rentals/listings');
      } else {
        throw new Error('Booking failed.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setShowModal(false);
    }
  };

  const redirectToAllStorages = () => {
    navigate(`/storages/all?start_date=${startDate?.toISOString()}&end_date=${endDate?.toISOString()}`);
  };

  const saveDatesToLocalStorage = (newStartDate, newEndDate) => {
    if (newStartDate) localStorage.setItem('startDate', newStartDate.toISOString());
    if (newEndDate) localStorage.setItem('endDate', newEndDate.toISOString());
  };

  if (!listing) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
      >
        <Container className="text-center">
          <h2>Invalid Booking</h2>
          <p>No listing details available.</p>
          <Button variant="warning" onClick={() => navigate('/storages/all')}>
            <i className="bi bi-arrow-left me-1"></i>Go to Listings
          </Button>
        </Container>
      </div>
    );
  }

  return (
    <div
      className="py-5"
    >
      <Container>
        <Row className="gy-4">
          {/* Left Column: Main Storage Details */}
          <Col lg={8} md={7} sm={12}>
            <Card className="shadow-lg border-0">
              <div style={{ maxHeight: '400px', overflow: 'hidden' }}>
                <Card.Img
                  variant="top"
                  src={listing.images_url}
                  alt={listing.title}
                  style={{ objectFit: 'cover', width: '100%' }}
                />
              </div>
              <Card.Body>
                <Card.Title className="text-warning fw-bold">{listing.title}</Card.Title>
                <Card.Text>
                  <strong>Description:</strong> {listing.description}
                </Card.Text>
                <Card.Text>
                  <strong>Address:</strong> {listing.location}
                </Card.Text>
                <Card.Text>
                  <strong>Eircode:</strong> {listing.eircode}
                </Card.Text>
                <Card.Text>
                  <strong>Size:</strong> {listing.size} sq ft
                </Card.Text>
                <Card.Text>
                  <strong>Storage Type:</strong> {listing.storage_type}
                </Card.Text>
                <Card.Text>
                  <strong>Price per Month:</strong> €{listing.price_per_month}
                </Card.Text>
                <Card.Text>
                  <strong>Availability:</strong> {listing.availability}
                </Card.Text>
                <Card.Text>
                  <strong>Insurance Option:</strong>{' '}
                  {listing.insurance_option ? 'Yes' : 'No'}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column: Availability Check, Owner Details, Reviews */}
          <Col lg={4} md={5} sm={12}>
            {/* Availability Check Card */}
            <Card className="shadow-lg border-0 mb-4">
              <Card.Header className="bg-warning text-center fw-bold">
                <i className="bi bi-calendar-check me-2"></i>Check Availability
              </Card.Header>
              <Card.Body className="text-center">
                <Form className="p-3">
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Start Date</Form.Label>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => {
                        setStartDate(date);
                        saveDatesToLocalStorage(date, endDate);
                      }}
                      minDate={new Date()}
                      placeholderText="Select Start Date"
                      className="form-control shadow-sm"
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">End Date</Form.Label>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => {
                        setEndDate(date);
                        saveDatesToLocalStorage(startDate, date);
                      }}
                      minDate={startDate || new Date()}
                      placeholderText="Select End Date"
                      className="form-control shadow-sm"
                    />
                  </Form.Group>
                  <Button
                    variant="warning"
                    className="w-100 py-2 fw-semibold shadow-sm"
                    onClick={checkAvailability}
                  >
                    <i className="bi bi-search me-1"></i>Check Availability
                  </Button>
                </Form>

                {/* Availability Result */}
                {availability && (
                  <div className="mt-4">
                    <Alert variant="success" className="shadow-sm">
                      <h5 className="mb-2">
                        <i className="bi bi-check-circle-fill me-2 text-success"></i>
                        Good News!
                      </h5>
                      <p className="mb-0">
                        Storage is available for <strong>{availability.days}</strong> day(s). <br />
                        Final Price: <strong>€{availability.final_price}</strong>
                      </p>
                    </Alert>
                    <Button
                      variant="warning"
                      className="mt-3 px-5 py-2 fw-bold shadow-sm"
                      onClick={() => setShowModal(true)}
                    >
                      <i className="bi bi-cart-check-fill me-1"></i>Book Now
                    </Button>
                  </div>
                )}

                {/* Availability Error */}
                {availabilityError && (
                  <div className="mt-4">
                    <Alert variant="danger" className="shadow-sm">
                      <h5 className="mb-2">
                        <i className="bi bi-exclamation-circle-fill me-2 text-danger"></i>
                        Oops!
                      </h5>
                      <p className="mb-0">{availabilityError}</p>
                    </Alert>
                    <Button
                      variant="outline-danger"
                      className="mt-3 px-5 py-2 fw-bold shadow-sm"
                      onClick={redirectToAllStorages}
                    >
                      <i className="bi bi-arrow-repeat me-1"></i>
                      Choose Another Listing
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Owner Details Card */}
            <Card className="shadow-lg border-0 mb-4">
              <Card.Header className="bg-light fw-bold">
                <i className="bi bi-person-check me-2"></i>Owner Details
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center">
                    <Spinner animation="border" variant="warning" />
                    <p className="mt-3">Fetching owner details...</p>
                  </div>
                ) : error ? (
                  <Alert variant="danger">{error}</Alert>
                ) : ownerInfo ? (
                  <>
                    <p>
                      <strong>Name:</strong> {ownerInfo.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {ownerInfo.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {ownerInfo.phone}
                    </p>
                  </>
                ) : (
                  <p>No owner information available.</p>
                )}
              </Card.Body>
            </Card>

            {/* Reviews Card */}
            <Card className="shadow-lg border-0">
              <Card.Header className="bg-light fw-bold">
                <i className="bi bi-star-fill me-2 text-warning"></i>Reviews
              </Card.Header>
              <Card.Body>
                {reviewsError ? (
                  <Alert variant="danger">{reviewsError}</Alert>
                ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.review_id} className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <img
                          src={
                            review.reviewer_profile_image ||
                            'https://via.placeholder.com/50'
                          }
                          alt={review.reviewer_name}
                          className="rounded-circle me-3"
                          style={{
                            width: '50px',
                            height: '50px',
                            objectFit: 'cover',
                          }}
                        />
                        <div>
                          <strong>{review.reviewer_name || 'Anonymous'}</strong>
                          <br />
                          <span
                            className="text-muted"
                            style={{ fontSize: '0.85rem' }}
                          >
                            {review.reviewer_email || 'Email not available'}
                          </span>
                        </div>
                      </div>
                      <p className="mb-1">
                        <strong>Rating:</strong> {review.rating} / 5
                      </p>
                      <p>{review.comment || 'No comments provided.'}</p>
                      <hr />
                    </div>
                  ))
                ) : (
                  <p>No reviews available.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-cart-check-fill me-2 text-warning"></i>
            Confirm Booking
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to book <strong>{listing.title}</strong> from{' '}
          <strong>{startDate?.toLocaleDateString()}</strong> to{' '}
          <strong>{endDate?.toLocaleDateString()}</strong> for €
          {availability?.final_price}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            <i className="bi bi-x-circle me-1"></i>Cancel
          </Button>
          <Button variant="warning" onClick={handleBooking}>
            <i className="bi bi-check-circle me-1"></i>Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Booking;
