import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { Container, Row, Col, Form, Button, Card, ListGroup, Alert, Spinner } from 'react-bootstrap';

const Admin = () => {
  const [user, loading] = useAuthState(auth); // Check Firebase auth state
  const navigate = useNavigate();

  const [storageUnits, setStorageUnits] = useState([]);
  const [form, setForm] = useState({
    id: null,
    title: '',
    description: '',
    price_per_month: '',
    location: '',
    eircode: '',
    storage_type: '',
    size: '',
    images_url: '',
    insurance_option: false,
  });
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Fetch all storage units (simulating fetching from backend)
  useEffect(() => {
    const fetchStorageUnits = async () => {
      const apiUrl = 'https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/storage-location/list-storage-location';

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Failed to fetch storage units');

        const data = await response.json();
        setStorageUnits(data.data || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchStorageUnits();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  // Handle add or update storage unit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    setError('');
    setSuccess('');

    const apiUrl = form.id
      ? 'https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/storage-location/update-storage-location'
      : 'https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/storage-location/add-storage-location';

    const requestBody = form.id
      ? {
          action: 'update_storage_location',
          storage_id: form.id,
          update_data: {
            title: form.title,
            description: form.description,
            price_per_month: form.price_per_month,
            location: form.location,
            eircode: form.eircode,
            storage_type: form.storage_type,
            size: form.size,
            images_url: form.images_url,
            insurance_option: form.insurance_option ? '1' : '0',
          },
        }
      : {
          action: 'add_storage_location',
          user_id: user.uid,
          title: form.title,
          description: form.description,
          price_per_month: form.price_per_month,
          location: form.location,
          eircode: form.eircode,
          storage_type: form.storage_type,
          size: form.size,
          images_url: form.images_url,
          insurance_option: form.insurance_option ? '1' : '0',
        };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error('Failed to save storage unit');

      const data = await response.json();
      setSuccess(`Storage unit ${form.id ? 'updated' : 'added'} successfully!`);
      setStorageUnits((prev) =>
        form.id
          ? prev.map((unit) =>
              unit.storage_id === form.id ? { ...unit, ...requestBody.update_data } : unit
            )
          : [...prev, { ...requestBody, storage_id: data.storage_id }]
      );
      setForm({
        id: null,
        title: '',
        description: '',
        price_per_month: '',
        location: '',
        eircode: '',
        storage_type: '',
        size: '',
        images_url: '',
        insurance_option: false,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle delete storage unit
  const handleDelete = async (id) => {
    setLoadingAction(true);
    setError('');
    setSuccess('');

    const apiUrl = 'https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/storage-location/delete-storage-location';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_storage_location', storage_id: id }),
      });

      if (!response.ok) throw new Error('Failed to delete storage unit');

      setSuccess('Storage unit deleted successfully!');
      setStorageUnits((prev) => prev.filter((unit) => unit.storage_id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEdit = (unit) => {
    setForm({
      id: unit.storage_id,
      title: unit.title,
      description: unit.description,
      price_per_month: unit.price_per_month,
      location: unit.location,
      eircode: unit.eircode,
      storage_type: unit.storage_type,
      size: unit.size,
      images_url: unit.images_url,
      insurance_option: unit.insurance_option === '1',
    });
  };

  if (loading) return <div className="text-center my-5">Loading...</div>;

  return (
    <Container className="my-5">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
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
                    name="price_per_month"
                    value={form.price_per_month}
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
                {/* Other fields */}
                <Form.Group className="mb-3">
                  <Form.Label>Storage Type</Form.Label>
                  <Form.Control
                    type="text"
                    name="storage_type"
                    value={form.storage_type}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Eircode</Form.Label>
                  <Form.Control
                    type="text"
                    name="eircode"
                    value={form.eircode}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Image URL</Form.Label>
                  <Form.Control
                    type="text"
                    name="images_url"
                    value={form.images_url}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="insurance_option"
                    label="Insurance Option"
                    checked={form.insurance_option}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Size</Form.Label>
                  <Form.Control
                    type="number"
                    name="size"
                    value={form.size}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Button type="submit" variant="primary" className="w-100" disabled={loadingAction}>
                  {loadingAction ? <Spinner animation="border" size="sm" /> : form.id ? 'Update Storage' : 'Add Storage'}
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
                      key={unit.storage_id}
                      className="d-flex justify-content-between align-items-start"
                    >
                      <div>
                        <h5 className="mb-1">{unit.title}</h5>
                        <p className="mb-1">{unit.description}</p>
                        <small>
                          <strong>Price:</strong> €{unit.price_per_month} |{' '}
                          <strong>Location:</strong> {unit.location}
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
                          onClick={() => handleDelete(unit.storage_id)}
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
