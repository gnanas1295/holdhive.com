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
    <div className="homepage">

      {/* --- HERO SECTION --- */}
      <div
        className="hero-section d-flex align-items-center justify-content-center text-white position-relative"
        style={{
          minHeight: '80vh',
          background: `url('https://portal.storman.com/build/assets/images/storage-unit-fall-back.jpeg') center center/cover no-repeat`,
        }}
      >
        {/* Dark overlay for better text visibility */}
        <div
          className="overlay position-absolute w-100 h-100"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        />
        <Container className="position-relative">
          <h1 className="text-center display-4 fw-bold mb-3">
            Find a storage facility near you
          </h1>
          <p className="text-center lead mb-4">
            Cheap. Fast. And over 100,000 users.
          </p>

          {/* Search Form */}
          <Form
            className="search-form mx-auto d-flex align-items-center position-relative"
            style={{ maxWidth: '600px' }}
          >
            <Form.Control
              type="text"
              placeholder="Enter a location or eircode"
              value={search}
              onChange={handleSearch}
              className="me-2"
              disabled={loading}
            />
            <Button
              variant="warning"
              onClick={handleSearchSubmit}
              disabled={loading}
            >
              {loading ? 'Loading...' : <i className="bi bi-search"></i>}
            </Button>

            {/* Error Message */}
            {error && (
              <p className="text-danger text-center mt-3 w-100">{error}</p>
            )}

            {/* Autocomplete Dropdown */}
            {filteredLocations.length > 0 && (
              <ul
                className="list-group position-absolute autocomplete-list w-100 mt-2"
                style={{
                  zIndex: 1000,
                  top: '100%',
                  maxHeight: '200px',    // Adjust to suit your needs
                  overflowY: 'auto',     // Enables scrollbar when needed
                }}
              >
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

      {/* --- FEATURES SECTION --- */}
      <Container className="my-5">
        <h2 className="text-center mb-4 fw-bold">Why Choose Us?</h2>
        <Row className="text-center">
          <Col md={4} className="mb-4">
            <i className="bi bi-shield-lock-fill display-4 text-warning"></i>
            <h4 className="mt-3">Secure Storage</h4>
            <p className="text-muted">
              Top-notch security to keep your belongings safe at all times.
            </p>
          </Col>
          <Col md={4} className="mb-4">
            <i className="bi bi-clock-fill display-4 text-warning"></i>
            <h4 className="mt-3">Flexible Timing</h4>
            <p className="text-muted">
              Access your storage unit whenever it’s convenient for you.
            </p>
          </Col>
          <Col md={4} className="mb-4">
            <i className="bi bi-currency-dollar display-4 text-warning"></i>
            <h4 className="mt-3">Affordable Pricing</h4>
            <p className="text-muted">
              Transparent and competitive pricing with no hidden fees.
            </p>
          </Col>
        </Row>
      </Container>

      <div className="scrollable-container py-5">
        <h3 className="text-center mb-4 fw-bold">Available Storage Spaces</h3>

        {/* The scrollable-content holds 2 copies of the items */}
        <div className="scrollable-content">
          {data.map((location, idx) => (
            <div
              key={`${location.storage_id}-${idx}`}
              className="scrollable-card"
              onClick={() => handleCardClick(location)}
            >
              <img
                src={location.images_url || 'https://via.placeholder.com/300'}
                alt={location.title}
                className="scrollable-card-img"
              />
              <div className="scrollable-card-body">
                <h5 className="scrollable-card-title">{location.title}</h5>
                <p className="mb-1">
                  <strong>Location:</strong> {location.location}
                </p>
                <p className="mb-1">
                  <strong>Price:</strong> €{location.price_per_month} per month
                </p>
                <p className="mb-0">
                  <strong>Rating:</strong>{' '}
                  <span className="text-warning">
                    {'⭐'.repeat(location.average_review_score)}
                  </span>
                  <span className="text-muted">
                    {' '}({location.average_review_score})
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
    </div>

      {/* --- FAQ SECTION --- */}
      <Container className="my-5">
        <h2 className="text-center mb-4 fw-bold">Frequently Asked Questions</h2>
        <Accordion>
          <Accordion.Item eventKey="0">
            <Accordion.Header className="header-warning">What is HoldHive?</Accordion.Header>
            <Accordion.Body>
              HoldHive is a peer-to-peer (P2P) platform where individuals (Hosts)
              with spare storage space can connect with people (Renters) who
              need secure, short- or long-term storage solutions. Think of it as
              a marketplace for underused areas—garages, basements, or spare
              rooms—that can be rented out as storage.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header className="header-warning">How do I list my space on HoldHive?</Accordion.Header>
            <Accordion.Body>
              After creating a <strong>Host</strong> account, visit your profile
              dashboard and select “Create Listing.” You’ll add details such as
              location, size, photos, and any insurance options you may offer.
              Once published, your listing is visible to potential Renters.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2">
            <Accordion.Header className="header-warning">What type of items can be stored?</Accordion.Header>
            <Accordion.Body>
              Generally, any legal, non-perishable items are acceptable (e.g.,
              furniture, boxes, seasonal gear). Hazardous materials, illegal
              goods, or items violating our Terms of Use are strictly
              prohibited. If you’re unsure, consult the listing details or our
              platform guidelines for clarity.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="3">
            <Accordion.Header className="header-warning">
              Is it safe to store my belongings with someone else?
            </Accordion.Header>
            <Accordion.Body>
              We understand that trust is key. To foster safety, we recommend
              verifying identities and checking user reviews/ratings before
              finalizing any agreement. Each booking is recorded, helping us
              mediate if disputes arise.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="4">
            <Accordion.Header className="header-warning">How does insurance work?</Accordion.Header>
            <Accordion.Body>
              HoldHive does <strong>not</strong> provide insurance. Certain
              Hosts may have their own policies or offer insurance options in
              their listings—be sure to verify this before finalizing a booking.
              If no insurance is offered, you can arrange your own coverage
              independently.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="5">
            <Accordion.Header className="header-warning">What if something goes wrong with my booking?</Accordion.Header>
            <Accordion.Body>
              If there’s a misunderstanding about space details or if damage
              occurs, contact the Host first. If you cannot reach a resolution,
              our Support team can step in to assist. Refer to your Host’s
              insurance details (if any) and review our platform policies for
              additional guidance.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="6">
            <Accordion.Header className="header-warning">
              Can I cancel my booking or remove my listing?
            </Accordion.Header>
            <Accordion.Body>
              Absolutely. Hosts can remove or update their listings anytime from
              their profile. Renters can cancel bookings under conditions set by
              the Host. Clear, early communication helps avoid misunderstandings.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="7">
            <Accordion.Header className="header-warning">
              Where can I see all of your code and documentation?
            </Accordion.Header>
            <Accordion.Body>
              Only select portions of our front-end and back-end code are
              showcased on our site. The <strong>complete</strong> codebase, API
              documentation, Tableau analytics, and screenshots are available on
              our public GitHub repository (see our documentation for the link).
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="8">
            <Accordion.Header className="header-warning">
              Is there a limit on how long I can rent a space?
            </Accordion.Header>
            <Accordion.Body>
              There’s <strong>no fixed maximum</strong> length set by the
              platform; Hosts and Renters can arrange short- or long-term stays
              as they see fit. However, the <strong>minimum payment</strong> the
              Host requires is for <strong>one full month</strong>, meaning you
              must pay at least one month’s rental cost, even if you store items
              for fewer days. Be sure to confirm any additional conditions when
              you book.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="9">
            <Accordion.Header className="header-warning">
              Are partial refunds available if I remove my items before the month is up?
            </Accordion.Header>
            <Accordion.Body>
              Because the Host requires a <strong>minimum one-month payment</strong>,
              there’s typically <strong>no</strong> partial refund if you move
              out earlier. However, you may discuss any special arrangements
              directly with the Host.
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Container>
    </div>
  );
};

export default Home;
