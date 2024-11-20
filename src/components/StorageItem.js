import React from 'react';
import { Card, Button } from 'react-bootstrap';

const StorageItem = ({ item, days, onBook }) => {
  const totalCost = item.price * days;

  return (
    <Card className="m-3" style={{ width: '18rem' }}>
      <Card.Body>
        <Card.Title>{item.title}</Card.Title>
        <Card.Text>{item.description}</Card.Text>
        <Card.Text>
          <strong>Location:</strong> {item.location}
        </Card.Text>
        <Card.Text>
          <strong>Price per Day:</strong> ${item.price}
        </Card.Text>
        <Card.Text>
          <strong>Total Cost for {days} Day(s):</strong> ${totalCost}
        </Card.Text>
        <Button variant="primary" onClick={() => onBook(item)}>Book Now</Button>
      </Card.Body>
    </Card>
  );
};

export default StorageItem;
