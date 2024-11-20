import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const AddStorage = () => {
  const [formData, setFormData] = useState({ title: '', description: '' });

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    console.log('Submitted Data:', formData);
  };

  return (
    <Form onSubmit={handleSubmit} className="m-3">
      <Form.Group controlId="title">
        <Form.Label>Title</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter title"
          name="title"
          value={formData.title}
          onChange={handleChange}
        />
      </Form.Group>
      <Form.Group controlId="description">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Enter description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </Form.Group>
      <Button variant="primary" type="submit">
        Add Storage
      </Button>
    </Form>
  );
};

export default AddStorage;
