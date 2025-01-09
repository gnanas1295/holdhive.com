import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { listAllStorages, listAvailableStorages } from '../services/storageService';
import {
  Container,
  Table,
  Spinner,
  Alert,
  Image,
  Form,
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const AllStorages = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [storages, setStorages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const queryStartDate = queryParams.get('start_date');
  const queryEndDate = queryParams.get('end_date');

  useEffect(() => {
    const fetchStorages = async () => {
      try {
        setLoading(true);

        if (queryStartDate && queryEndDate) {
          const parsedStartDate = new Date(queryStartDate);
          const parsedEndDate = new Date(queryEndDate);
          setStartDate(parsedStartDate);
          setEndDate(parsedEndDate);
          localStorage.setItem('startDate', parsedStartDate.toISOString());
          localStorage.setItem('endDate', parsedEndDate.toISOString());
          const availableStorages = await listAvailableStorages(parsedStartDate, parsedEndDate);
          setStorages(availableStorages.data || []);
        } else {
          const allStorages = await listAllStorages();
          setStorages(allStorages.data || []);
        }
      } catch (err) {
        setGlobalError('Failed to fetch storage locations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStorages();
  }, [queryStartDate, queryEndDate]);

  const filteredStorages = storages.filter(
    (storage) =>
      storage.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (storage.eircode && storage.eircode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSearchByDates = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }

    try {
      setLoading(true);
      const data = await listAvailableStorages(startDate, endDate);
      setStorages(data.data || []);
      localStorage.setItem('startDate', startDate.toISOString());
      localStorage.setItem('endDate', endDate.toISOString());
    } catch (err) {
      setGlobalError('Failed to fetch available storage locations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (storage) => {
    navigate(`/storage/${storage.storage_id}`, {
      state: {
        storageId: storage.storage_id,
        location: storage.location,
        startDate,
        endDate,
      },
    });
  };

  const handleDelete = async (storageId) => {
    if (!window.confirm('Are you sure you want to delete this storage location?')) return;

    setDeleting(true);
    setDeleteError('');
    try {
      const apiUrl =
        'https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/storage-location/delete-storage-location';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_storage_location',
          storage_id: String(storageId),
        }),
      });

      if (!response.ok) throw new Error('Failed to delete the storage location.');

      // Remove the deleted storage from state
      setStorages((prevStorages) =>
        prevStorages.filter((storage) => String(storage.storage_id) !== String(storageId))
      );
      alert('Storage location deleted successfully.');
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container className="bg-white p-4 rounded">
      {/* Global Error Alert */}
      {globalError && <Alert variant="danger">{globalError}</Alert>}

      <Row className="mb-4">
        <Col>
          <h2 className="text-center fw-bold mb-0">All Storage Locations</h2>
          <p className="text-center text-muted">Find the perfect storage space for your needs</p>
        </Col>
      </Row>

      <Form className="mb-4">
        <Row className="align-items-center justify-content-center">
          <Col md={4} className="mb-2">
            <Form.Control
              type="text"
              placeholder="Search by Name or EIR"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="shadow-sm"
            />
          </Col>
          <Col md={3} className="mb-2">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              placeholderText="Start Date"
              className="form-control shadow-sm"
              minDate={new Date()}
            />
          </Col>
          <Col md={3} className="mb-2">
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              placeholderText="End Date"
              className="form-control shadow-sm"
              minDate={startDate || new Date()}
            />
          </Col>
          <Col md={2} className="mb-2">
            <Button
              variant="warning"
              className="w-100 fw-semibold shadow-sm"
              onClick={handleSearchByDates}
              disabled={loading}
            >
              {loading ? (
                <Spinner animation="border" size="sm" variant="warning" />
              ) : (
                <>
                  <i className="bi bi-search"></i> Search
                </>
              )}
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Delete Error Alert */}
      {deleteError && <Alert variant="danger">{deleteError}</Alert>}

      {filteredStorages.length > 0 ? (
        <Table striped bordered hover responsive className="align-middle" style={{ cursor: 'pointer' }}>
          <thead className="table-light">
            <tr>
              <th>Image</th>
              <th>EIR</th>
              <th>Title</th>
              <th>Description</th>
              <th>Location</th>
              <th>Size (m²)</th>
              <th>Price/Month (€)</th>
              <th>Type</th>
              <th>Availability</th>
              <th>Rating</th>
              <th>Insurance</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredStorages.map((storage) => (
              <tr
                key={storage.storage_id}
                onClick={() => handleRowClick(storage)}
                style={{
                  transition: 'background 0.2s ease-in-out',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f9f9f9')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td>
                  <Image
                    src={storage.images_url}
                    alt={storage.title}
                    thumbnail
                    style={{ maxWidth: '100px' }}
                  />
                </td>
                <td>{storage.eircode || 'N/A'}</td>
                <td>{storage.title}</td>
                <td>{storage.description}</td>
                <td>{storage.location}</td>
                <td>{storage.size}</td>
                <td>€{storage.price_per_month}</td>
                <td>{storage.storage_type || 'N/A'}</td>
                <td>
                  <span
                    className={`badge ${storage.availability === 'available' ? 'bg-success' : 'bg-danger'
                      }`}
                  >
                    {storage.availability}
                  </span>
                </td>
                <td>{storage.average_review_score || 'N/A'}</td>
                <td>
                  <span
                    className={`badge ${storage.insurance_option ? 'bg-success' : 'bg-secondary'}`}
                  >
                    {storage.insurance_option ? 'Yes' : 'No'}
                  </span>
                </td>
                {isAdmin && (
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(storage.storage_id);
                      }}
                      disabled={deleting}
                    >
                      Delete
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className="text-center text-muted mt-4">No storage locations available.</p>
      )}
    </Container>
  );
};

export default AllStorages;
