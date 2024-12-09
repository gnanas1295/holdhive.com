import React from 'react';
import { Card, Button } from 'react-bootstrap';

const StorageItem = ({ item, days, onBook }) => {
  const totalCost = (item.price || 0) * (days || 1);

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title>{item.title}</Card.Title>
        <Card.Text>{item.description || 'No description available'}</Card.Text>
        <Card.Text>
          <strong>Location:</strong> {item.location || 'Unknown'}
        </Card.Text>
        <Card.Text>
          <strong>Price per Day:</strong> ${item.price.toFixed(2) || 'N/A'}
        </Card.Text>
        <Card.Text>
          <strong>Total Cost for {days} Day(s):</strong> ${totalCost.toFixed(2)}
        </Card.Text>
        <Button variant="primary" onClick={() => onBook(item)}>
          Book Now
        </Button>
      </Card.Body>
    </Card>
  );
};

export default StorageItem;
