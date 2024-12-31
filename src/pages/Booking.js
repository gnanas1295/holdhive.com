import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Modal, Alert, Spinner, Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { listing } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

    fetchOwnerListings();
  }, [listing]);

  const checkAvailability = async () => {
    if (!startDate || !endDate) {
      setAvailabilityError('Please select both start and end dates.');
      return;
    }

    setLoading(true);
    setAvailability(null);
    setAvailabilityError('');
    const apiUrl = `https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/storage-location/check-availablity-date-storage-id?storage_id=${listing.storage_id}&start_date=${format(
      startDate,
      'yyyy-MM-dd'
    )}&end_date=${format(endDate, 'yyyy-MM-dd')}`;

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
      <Container className="my-5 text-center">
        <h2>Invalid Booking</h2>
        <p>No listing details available.</p>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row className="gy-4">
        <Col lg={8} md={7} sm={12}>
          <Card className="shadow-lg border-0">
            <Card.Img
              variant="top"
              src={listing.images_url}
              alt={listing.title}
              className="rounded-top"
              style={{ maxHeight: '400px', objectFit: 'cover' }}
            />
            <Card.Body>
              <Card.Title className="text-primary">{listing.title}</Card.Title>
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
                <strong>Price per Month:</strong> ${listing.price_per_month}
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
        <Col lg={4} md={5} sm={12}>
          <Card className="shadow-lg border-0 rounded">
            <Card.Header className="bg-primary text-white text-center">
              <h4>Check Availability</h4>
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
                  variant="primary"
                  className="w-100 py-2 fw-bold shadow-sm"
                  onClick={checkAvailability}
                >
                  Check Availability
                </Button>
              </Form>

              {availability && (
                <div className="mt-4">
                  <Alert variant="success" className="shadow-sm">
                    <h5 className="mb-2">Good News!</h5>
                    <p className="mb-0">
                      Storage is available for <strong>{availability.days}</strong> day(s). <br />
                      Final Price: <strong>${availability.final_price}</strong>
                    </p>
                  </Alert>
                  <Button
                    variant="success"
                    className="mt-3 px-5 py-2 fw-bold shadow-sm"
                    onClick={() => setShowModal(true)}
                  >
                    Book Now
                  </Button>
                </div>
              )}

              {availabilityError && (
                <div className="mt-4">
                  <Alert variant="danger" className="shadow-sm">
                    <h5 className="mb-2">Oops!</h5>
                    <p className="mb-0">{availabilityError}</p>
                  </Alert>
                  <Button
                    variant="outline-danger"
                    className="mt-3 px-5 py-2 fw-bold shadow-sm"
                    onClick={redirectToAllStorages}
                  >
                    Choose Another Listing
                  </Button>
                </div>
    )}
  </Card.Body>
</Card>


          {/* Owner Details */}
          <Card className="shadow-lg border-0 mt-4">
            <Card.Body>
              <Card.Title>Owner Details</Card.Title>
              {loading ? (
                <Spinner animation="border" variant="primary" />
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
        </Col>
      </Row>

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to book <strong>{listing.title}</strong> from{' '}
          <strong>{startDate?.toLocaleDateString()}</strong> to{' '}
          <strong>{endDate?.toLocaleDateString()}</strong> for $
          {availability?.final_price}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleBooking}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Booking;
