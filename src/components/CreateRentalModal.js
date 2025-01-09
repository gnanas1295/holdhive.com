import React, { useState } from 'react';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';

const CreateRentalModal = ({ show, onClose, onRentalCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    storage_type: '',
    size: '',
    location: '',
    eircode: '',
    price_per_month: '',
    images_url: '',
    insurance_option: '0', // Default value
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    const apiUrl =
      'https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/storage-location/add-storage-location';

    const requestBody = {
      action: 'add_storage_location',
      user_id: 'r3u1PjtEUcXfkHYs8p6ITHUN7wn2', // Replace with dynamic user_id
      ...formData,
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to create rental');
      }

      const result = await response.json();
      setSuccess('Rental created successfully!');
      setFormData({
        title: '',
        description: '',
        storage_type: '',
        size: '',
        location: '',
        eircode: '',
        price_per_month: '',
        images_url: '',
        insurance_option: '0',
      });

      // Trigger callback to parent component
      if (onRentalCreated) {
        onRentalCreated(result.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Rental</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter title"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Storage Type</Form.Label>
            <Form.Control
              type="text"
              name="storage_type"
              value={formData.storage_type}
              onChange={handleChange}
              placeholder="Enter storage type (e.g., Basement, Roof)"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Size (in sq. ft.)</Form.Label>
            <Form.Control
              type="number"
              name="size"
              value={formData.size}
              onChange={handleChange}
              placeholder="Enter size"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Location</Form.Label>
            <Form.Control
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter location"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Eircode</Form.Label>
            <Form.Control
              type="text"
              name="eircode"
              value={formData.eircode}
              onChange={handleChange}
              placeholder="Enter eircode"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Price per Month</Form.Label>
            <Form.Control
              type="number"
              name="price_per_month"
              value={formData.price_per_month}
              onChange={handleChange}
              placeholder="Enter price per month"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Image URL</Form.Label>
            <Form.Control
              type="text"
              name="images_url"
              value={formData.images_url}
              onChange={handleChange}
              placeholder="Enter image URL"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Insurance Option</Form.Label>
            <Form.Select
              name="insurance_option"
              value={formData.insurance_option}
              onChange={handleChange}
            >
              <option value="1">Yes</option>
              <option value="0">No</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="warning"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <Spinner animation="border" size="sm" variant='warning' /> : 'Save'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateRentalModal;
