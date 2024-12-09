import React, { useState } from 'react';
import StorageItem from './StorageItem';
import BookingForm from './BookingForm';
import { Container, Row, Col } from 'react-bootstrap';

const dummyData = [
  { id: 1, title: 'Storage A', description: 'Affordable unit', price: 50, location: 'City A' },
  { id: 2, title: 'Storage B', description: 'Spacious unit', price: 75, location: 'City B' },
  { id: 3, title: 'Storage C', description: 'Secure unit', price: 100, location: 'City C' },
];

const StorageList = ({ days }) => {
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // Filtered Data Based on Search Input
  const filteredData = dummyData.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container className="my-4">
      {/* Search Bar */}
      <h2 className="text-center mb-4">Search Storage Units</h2>
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search by title, description, or location"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Storage Items */}
      {filteredData.length > 0 ? (
        <Row>
          {filteredData.map((item) => (
            <Col md={4} sm={6} xs={12} key={item.id} className="mb-4">
              <StorageItem item={item} days={days} onBook={setSelectedItem} />
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center my-4">
          <h4>No results found for "{search}"</h4>
          <p>Try adjusting your search criteria.</p>
        </div>
      )}

      {/* Booking Form */}
      {selectedItem && (
        <BookingForm
          item={selectedItem}
          days={days}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </Container>
  );
};

export default StorageList;
