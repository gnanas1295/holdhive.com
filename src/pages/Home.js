import React, { useState, useEffect } from 'react';
import { Button, Container, Form, Accordion, Row, Col } from 'react-bootstrap';
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const [search, setSearch] = useState('');
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [locations, setLocations] = useState([]); // Locations fetched from API
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [data, setData] = useState([]);

useEffect(() => {
  const fetchLocations = async () => {
    const apiUrl =
      'https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/storage-location/list-storage-location';

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      const data = await response.json();

      setData(data.data);

      const locationTitles = data.data.map((item) => ({
        id: item.storage_id,
        title: item.title,
        location: item.location,
        eircode: item.eircode, // Add Eircode
      }));

      setLocations(locationTitles);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  fetchLocations();
}, []);

  // Handle search input
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    if (query.length > 0) {
      const results = locations.filter((loc) =>
          loc.title.toLowerCase().includes(query) ||
          loc.location.toLowerCase().includes(query) ||
          (loc.eircode && loc.eircode.toLowerCase().includes(query)) // Include Eircode in the search
      );
      setFilteredLocations(results);
    } else {
      setFilteredLocations([]);
    }
  };

  // Handle search selection
  const handleLocationSelect = (location) => {
    setSelectedLocation(location); // Store the full location object
    setSearch(location.title);
    setFilteredLocations([]);
  };

  // Handle form submission
  const handleSearchSubmit = () => {
    if (selectedLocation) {
      navigate(`/storage/${selectedLocation.id}`, {
        state: { storageId: selectedLocation.id, location: selectedLocation.location },
      });
    } else {
      alert('Please select a location.');
    }
  };

  const handleCardClick = (location) => {
    navigate(`/storage/${location.storage_id}`, {
      state: {
        storageId: location.storage_id,
        location: location.location,
      },
    });
  };

  return (
    <div>
      <div className="hero-section bg-light py-5">
        <Container>
          <h1 className="text-center display-4 mb-4">Find a storage facility near you</h1>
          <p className="text-center mb-4">Cheap. Fast. And over 100,000 users.</p>

          <Form className="position-relative d-flex justify-content-center align-items-center mb-4">
            <Form.Control
              type="text"
              placeholder="Enter a location or eircode"
              value={search}
              onChange={handleSearch}
              className="w-50 me-2"
              disabled={loading}
            />
            <Button variant="danger" onClick={handleSearchSubmit} disabled={loading}>
              {loading ? 'Loading...' : 'Search'}
            </Button>

            {error && <p className="text-danger text-center mt-3">{error}</p>}

            {filteredLocations.length > 0 && (
              <ul className="list-group position-absolute w-50" style={{ top: '100%', zIndex: 1000 }}>
                {filteredLocations.map((location) => (
                  <li
                    key={location.id}
                    className="list-group-item"
                    onClick={() => handleLocationSelect(location)}
                    style={{ cursor: 'pointer' }}
                  >
                    {location.title} - {location.location}
                  </li>
                ))}
              </ul>
            )}
          </Form>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="my-5">
        <h2 className="text-center mb-4">Why Choose Us?</h2>
        <Row className="text-center">
          <Col md={4}>
            <i className="bi bi-shield-lock-fill display-4 text-primary"></i>
            <h4 className="mt-3">Secure Storage</h4>
            <p>Top-notch security to keep your belongings safe at all times.</p>
          </Col>
          <Col md={4}>
            <i className="bi bi-clock-fill display-4 text-primary"></i>
            <h4 className="mt-3">Flexible Timing</h4>
            <p>Access your storage unit whenever it’s convenient for you.</p>
          </Col>
          <Col md={4}>
            <i className="bi bi-currency-dollar display-4 text-primary"></i>
            <h4 className="mt-3">Affordable Pricing</h4>
            <p>Transparent and competitive pricing with no hidden fees.</p>
          </Col>
        </Row>
      </Container>

      {/* Storage Listings Marquee */}
      <div className="scrollable-container bg-light py-4">
        <Container>
          <h3 className="text-center mb-4">Available Storage Spaces</h3>
          <div className="scrollable-content">
            {[...data, ...data].map((location, index) => (
              <div
                key={`${location.storage_id}-${index}`}
                className="scrollable-card"
                onClick={() => handleCardClick(location)}
                style={{ cursor: 'pointer' }} // Add a pointer cursor
              >
                <img
                  src={location.images_url || 'https://via.placeholder.com/300'}
                  alt={location.title}
                  className="scrollable-card-img"
                />
                <div className="scrollable-card-body">
                  <h5 className="scrollable-card-title">{location.title}</h5>
                  <p><strong>Location:</strong> {location.location}</p>
                  <p><strong>Price:</strong> €{location.price_per_month} per month</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>



      {/* FAQ Section */}
      <Container className="my-5">
        <h2 className="text-center mb-4">Frequently Asked Questions</h2>
        <Accordion>
          <Accordion.Item eventKey="0">
            <Accordion.Header>How secure are the storage units?</Accordion.Header>
            <Accordion.Body>
              Our storage units are equipped with state-of-the-art security systems, including 24/7 monitoring and access control.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header>Can I access my storage unit anytime?</Accordion.Header>
            <Accordion.Body>
              Yes, you can access your storage unit during our operating hours or opt for 24/7 access for certain units.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2">
            <Accordion.Header>Are there any hidden fees?</Accordion.Header>
            <Accordion.Body>
              No, we believe in transparent pricing. You only pay for what you use with no hidden charges.
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Container>
    </div>
  );
};

export default Home;
