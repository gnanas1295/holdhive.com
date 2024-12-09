import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { Container, Row, Col, Form, Button, Card, ListGroup } from 'react-bootstrap';

const Admin = () => {
  const [user, loading] = useAuthState(auth); // Check Firebase auth state
  const navigate = useNavigate();

  const [storageUnits, setStorageUnits] = useState([
    { id: 1, title: 'Storage A', description: 'Affordable unit', price: 50, location: 'City A' },
    { id: 2, title: 'Storage B', description: 'Spacious unit', price: 75, location: 'City B' },
    { id: 3, title: 'Storage C', description: 'Secure unit', price: 100, location: 'City C' },
  ]);

  const [form, setForm] = useState({ id: null, title: '', description: '', price: '', location: '' });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.id) {
      // Update existing storage unit
      setStorageUnits((prev) =>
        prev.map((unit) => (unit.id === form.id ? { ...unit, ...form } : unit))
      );
    } else {
      // Add new storage unit
      setStorageUnits((prev) => [
        ...prev,
        { ...form, id: Date.now(), price: parseFloat(form.price) },
      ]);
    }
    // Reset form
    setForm({ id: null, title: '', description: '', price: '', location: '' });
  };

  const handleEdit = (unit) => {
    setForm(unit);
  };

  const handleDelete = (id) => {
    setStorageUnits((prev) => prev.filter((unit) => unit.id !== id));
  };

  if (loading) return <div className="text-center my-5">Loading...</div>;

  return (
    <Container className="my-5">
      <h1 className="text-center mb-5">Admin Panel</h1>
      <Row>
        {/* Form Section */}
        <Col md={6}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h4 className="mb-4">{form.id ? 'Edit Storage Unit' : 'Add New Storage Unit'}</h4>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Button type="submit" variant="primary" className="w-100">
                  {form.id ? 'Update Storage' : 'Add Storage'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Storage Units Section */}
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h4 className="mb-4">Storage Units</h4>
              {storageUnits.length === 0 ? (
                <p className="text-muted">No storage units available. Add a new unit to get started.</p>
              ) : (
                <ListGroup>
                  {storageUnits.map((unit) => (
                    <ListGroup.Item
                      key={unit.id}
                      className="d-flex justify-content-between align-items-start"
                    >
                      <div>
                        <h5 className="mb-1">{unit.title}</h5>
                        <p className="mb-1">{unit.description}</p>
                        <small>
                          <strong>Price:</strong> ${unit.price} | <strong>Location:</strong>{' '}
                          {unit.location}
                        </small>
                      </div>
                      <div>
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(unit)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(unit.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Admin;
