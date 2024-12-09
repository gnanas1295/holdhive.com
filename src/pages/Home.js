import React, { useState, useEffect } from 'react';
import { Button, Container, Form, Accordion, Row, Col } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [search, setSearch] = useState('');
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [locations, setLocations] = useState([]); // Dynamic locations from API
  const [selectedLocation, setSelectedLocation] = useState('');
  const [startDate, setStartDate] = useState(null);
  const navigate = useNavigate();

  // Simulate fetching locations from an API
  useEffect(() => {
    const fetchLocations = async () => {
      // Dummy API response
      const response = [
        'London Savigny-sur-Seille, France',
        'The London Pub, Rue Brocherie, Grenoble, France',
        'London Pub, Rue Borville Dupuis, Evreux, France',
        'The London Town, English Pub Toulouse',
        'London Corner, Place Marcel Bouilloux-Lafont, Toulouse, France',
        'Storage Facility A, City A',
        'Storage Facility B, City B',
        'Secure Storage Center, City C',
        'Affordable Storage, City D',
        'Luxury Storage, City E',
      ];

      // Simulate network delay
      setTimeout(() => {
        setLocations(response);
      }, 1000); // Delay of 1 second
    };

    fetchLocations();
  }, []);

  // Handle search input
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    if (query.length > 0) {
      const results = locations.filter((location) =>
        location.toLowerCase().includes(query)
      );
      setFilteredLocations(results);
    } else {
      setFilteredLocations([]);
    }
  };

  // Handle search selection
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setSearch(location);
    setFilteredLocations([]);
  };

  // Handle form submission
  const handleSearchSubmit = () => {
    if (selectedLocation && startDate) {
      navigate('/listings', {
        state: { location: selectedLocation, date: startDate },
      });
    } else {
      alert('Please select a location and date.');
    }
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
              placeholder="Enter a location"
              value={search}
              onChange={handleSearch}
              className="w-50 me-2"
            />
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              minDate={new Date()}
              placeholderText="Select a date"
              className="form-control me-2"
            />
            <Button variant="danger" onClick={handleSearchSubmit}>
              Search
            </Button>

            {filteredLocations.length > 0 && (
              <ul className="list-group position-absolute w-50" style={{ top: '100%', zIndex: 1000 }}>
                {filteredLocations.map((location, index) => (
                  <li
                    key={index}
                    className="list-group-item"
                    onClick={() => handleLocationSelect(location)}
                    style={{ cursor: 'pointer' }}
                  >
                    {location}
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
