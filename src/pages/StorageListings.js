import React, { useState, useEffect } from 'react';
import {
  Container,
  Table,
  Alert,
  Spinner,
  Button,
  Modal,
  Form,
  Row,
  Col, OverlayTrigger, Tooltip
} from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Import Bootstrap Icons

const StorageListings = () => {
  const navigate = useNavigate();
  const [storageLocations, setStorageLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRentals, setSelectedRentals] = useState([]);
  const [rentalLoading, setRentalLoading] = useState(false);
  const [showRentalsModal, setShowRentalsModal] = useState(false);

  const ownerId = localStorage.getItem('id'); // Fetch Owner ID from localStorage

  const roomTypeImageUrls = {
    Basement:
      'https://holdhive.s3.eu-west-1.amazonaws.com/Storage_Spaces_Images/Empty_Basement_Image.jpeg',
    Roof: 'https://holdhive.s3.eu-west-1.amazonaws.com/Storage_Spaces_Images/Empty_Roof.jpg',
    Room: 'https://holdhive.s3.eu-west-1.amazonaws.com/Storage_Spaces_Images/Empty_Room.jpg',
    Shed: 'https://holdhive.s3.eu-west-1.amazonaws.com/Storage_Spaces_Images/Empty_Shed.jpg',
  };

  useEffect(() => {
    if (ownerId) {
      fetchStorageLocations(ownerId);
    } else {
      setLoading(false);
      setStorageLocations([]);
    }
  }, [ownerId]);


  const fetchStorageLocations = async (ownerId) => {
    try {
      const response = await axios.get(
        'https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/storage-location/list-storage-location-by-owner-id',
        { params: { user_id: ownerId } }
      );
      setStorageLocations(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'An error occurred while fetching storage locations.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchRentalsByStorageId = async (storageId) => {
    setRentalLoading(true);
    setShowRentalsModal(true);
    try {
      const response = await axios.get(
        'https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/rental-service/list-rental-by-storage-id',
        {
          params: { storage_id: storageId },
        }
      );
      setSelectedRentals(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'An error occurred while fetching rentals.'
      );
      setSelectedRentals([]);
    } finally {
      setRentalLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Set default image based on storage_type
      if (modalData.storage_type) {
        modalData.images_url = roomTypeImageUrls[modalData.storage_type];
      }

      const url = isEditing
        ? 'https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/storage-location/update-storage-location'
        : 'https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/storage-location/add-storage-location';

      const payload = isEditing
        ? {
          action: 'update_storage_location',
          storage_id: modalData.storage_id,
          update_data: {
            title: modalData.title,
            description: modalData.description,
            storage_type: modalData.storage_type,
            availability: modalData.availability || 'available',
            size: modalData.size,
            location: modalData.location,
            eircode: modalData.eircode,
            price_per_month: modalData.price_per_month,
            images_url: modalData.images_url,
            insurance_option: modalData.insurance_option,
          },
        }
        : {
          action: 'add_storage_location',
          user_id: ownerId,
          title: modalData.title,
          description: modalData.description,
          storage_type: modalData.storage_type,
          availability: 'available', // Default for new storage
          size: modalData.size,
          location: modalData.location,
          eircode: modalData.eircode,
          price_per_month: modalData.price_per_month,
          images_url: modalData.images_url,
          insurance_option: modalData.insurance_option,
        };

      await axios.post(url, payload);

      fetchStorageLocations(ownerId);
      setShowModal(false);
      setModalData({});
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'An error occurred while saving the storage location.'
      );
    }
  };

  const handleDelete = async (storageId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this storage location? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      await axios.post(
        'https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/storage-location/delete-storage-location',
        {
          action: 'delete_storage_location',
          storage_id: storageId,
        }
      );
      fetchStorageLocations(ownerId);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'An error occurred while deleting the storage location.'
      );
    }
  };

  const handleEditClick = (storage, e) => {
    e.stopPropagation();
    setModalData(storage);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleAddClick = () => {
    setModalData({});
    setIsEditing(false);
    setShowModal(true);
  };

  const handleRowClick = (storage) => {
    navigate(`/storage/${storage.storage_id}`, {
      state: {
        storageId: storage.storage_id,
        location: storage.location,
      },
    });
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModalData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Container className="bg-white p-4 rounded">
      <h2 className="mb-4 text-center">My Storages</h2>
      {loading && (
        <div className="text-center">
          <Spinner animation="border" variant='warning' />
          <p>Loading storage locations...</p>
        </div>
      )}
      {error && !loading && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && storageLocations.length === 0 && (
        <div className="text-center my-4">
          <h5>No listings available</h5>
          <p>
            You can create a new storage location by clicking the
            <strong> "Add Storage" </strong> button above.
          </p>
        </div>
      )}
      {!loading && !error && (
        <>
          <div className="d-flex justify-content-end mb-3">
            <Button variant="warning" onClick={handleAddClick}>
              <i className="bi bi-plus-circle me-2"></i>Add Storage
            </Button>
          </div>

          <Table
            striped
            bordered
            hover
            responsive
            className="align-middle"
            style={{ cursor: 'pointer' }}
          >
            <thead className="table-light">
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Description</th>
                <th>Location</th>
                <th>Size (sq ft)</th>
                <th>Price (per month)</th>
                <th>Status</th>
                <th>Eircode</th>
                <th>Insurance</th>
                <th>Type</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {storageLocations.map((storage) => (
                <tr
                  key={storage.storage_id}
                  onClick={() => handleRowClick(storage)}
                  style={{
                    transition: 'background 0.2s ease-in-out',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = '#f7f9fa')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = 'transparent')
                  }
                >
                  <td>
                    <img
                      src={
                        roomTypeImageUrls[storage.storage_type] ||
                        storage.images_url
                      }
                      alt={storage.storage_type}
                      style={{ width: '80px', height: '60px', objectFit: 'cover' }}
                    />
                  </td>
                  <td>{storage.title}</td>
                  <td>{storage.description}</td>
                  <td>{storage.location}</td>
                  <td>{storage.size}</td>
                  <td>€{storage.price_per_month}</td>
                  <td>{storage.availability}</td>
                  <td>{storage.eircode || 'N/A'}</td>
                  <td>{storage.insurance_option ? 'Yes' : 'No'}</td>
                  <td>{storage.storage_type}</td>
                  <td className="text-center" onClick={(e) => e.stopPropagation()}>
                    {/* Edit Storage Button with Tooltip */}
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip id={`tooltip-edit-${storage.storage_id}`}>Edit Storage Location</Tooltip>}
                    >
                      <Button
                        variant="warning"
                        size="sm"
                        className="m-1"
                        onClick={(e) => handleEditClick(storage, e)}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </Button>
                    </OverlayTrigger>

                    {/* Delete Storage Button with Tooltip */}
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip id={`tooltip-delete-${storage.storage_id}`}>Delete Storage Location</Tooltip>}
                    >
                      <Button
                        variant="danger"
                        size="sm"
                        className="m-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(storage.storage_id);
                        }}
                      >
                        <i className="bi bi-trash-fill"></i>
                      </Button>
                    </OverlayTrigger>

                    {/* View Rentals Button with Tooltip */}
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip id={`tooltip-rentals-${storage.storage_id}`}>View Rentals</Tooltip>}
                    >
                      <Button
                        variant="info"
                        size="sm"
                        className="m-1 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchRentalsByStorageId(storage.storage_id);
                        }}
                      >
                        <i className="bi bi-people"></i>
                      </Button>
                    </OverlayTrigger>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {!loading && !error && storageLocations.length === 0 && (
            <p className="text-muted">
              No storage locations found for the provided Owner ID.
            </p>
          )}
        </>
      )}

      {/* --- Rentals Modal --- */}
      <Modal size="xl" show={showRentalsModal} onHide={() => setShowRentalsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Rentals for Selected Storage</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {rentalLoading ? (
            <div className="text-center">
              <Spinner animation="border" variant="warning" />
              <p>Loading rentals...</p>
            </div>
          ) : error ? (
            <Alert variant="danger" className="text-center">
              {error}
            </Alert>
          ) : selectedRentals.length > 0 ? (
            <>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Rental ID</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Total Price</th>
                    <th>Payment Status</th>
                    <th>Renter Name</th>
                    <th>Renter Email</th>
                    <th>Renter Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRentals.map((rental) => (
                    <tr key={rental.rental_id}>
                      <td>{rental.rental_id}</td>
                      <td>{new Date(rental.start_date).toLocaleDateString()}</td>
                      <td>{new Date(rental.end_date).toLocaleDateString()}</td>
                      <td>€{rental.total_price}</td>
                      <td>{rental.payment_status}</td>
                      <td>{rental.renter_name}</td>
                      <td>{rental.renter_email}</td>
                      <td>{rental.renter_phone}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Side-by-side: Owner Details and Storage Unit Information */}
              <Row className="mt-4">
                <Col md={6}>
                  <h5 className="mb-3">Owner Information</h5>
                  <Table bordered>
                    <tbody>
                      <tr>
                        <th>Name</th>
                        <td>{selectedRentals[0]?.owner_name}</td>
                      </tr>
                      <tr>
                        <th>Email</th>
                        <td>{selectedRentals[0]?.owner_email}</td>
                      </tr>
                      <tr>
                        <th>Phone</th>
                        <td>{selectedRentals[0]?.owner_phone}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h5 className="mb-3">Storage Unit Information</h5>
                  <Table bordered>
                    <tbody>
                      <tr>
                        <th>Title</th>
                        <td>{selectedRentals[0]?.storage_title}</td>
                      </tr>
                      <tr>
                        <th>Description</th>
                        <td>{selectedRentals[0]?.storage_description}</td>
                      </tr>
                      <tr>
                        <th>Size</th>
                        <td>{selectedRentals[0]?.storage_size} m²</td>
                      </tr>
                      <tr>
                        <th>Location</th>
                        <td>{selectedRentals[0]?.storage_location}</td>
                      </tr>
                      <tr>
                        <th>Eircode</th>
                        <td>{selectedRentals[0]?.eircode}</td>
                      </tr>
                      <tr>
                        <th>Price per Month</th>
                        <td>€{selectedRentals[0]?.price_per_month}</td>
                      </tr>
                      <tr>
                        <th>Insurance Option</th>
                        <td>{selectedRentals[0]?.insurance_option ? 'Yes' : 'No'}</td>
                      </tr>
                      <tr>
                        <th>Storage Type</th>
                        <td>{selectedRentals[0]?.storage_type}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </>
          ) : (
            <div className="text-center">
              <p>No rentals found for this storage unit.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRentalsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- Create/Edit Modal --- */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg" // Make the modal large
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? 'Edit Storage Location' : 'Add Storage Location'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Row>
              {/* Left column */}
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={modalData.title || ''}
                    onChange={handleModalChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    name="description"
                    value={modalData.description || ''}
                    onChange={handleModalChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={modalData.location || ''}
                    onChange={handleModalChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Eircode</Form.Label>
                  <Form.Control
                    type="text"
                    name="eircode"
                    value={modalData.eircode || ''}
                    onChange={handleModalChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Size (sq ft)</Form.Label>
                  <Form.Control
                    type="number"
                    name="size"
                    value={modalData.size || ''}
                    onChange={handleModalChange}
                  />
                </Form.Group>
              </Col>

              {/* Right column */}
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (per month in €)</Form.Label>
                  <Form.Control
                    type="number"
                    name="price_per_month"
                    value={modalData.price_per_month || ''}
                    onChange={handleModalChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Availability</Form.Label>
                  <Form.Select
                    name="availability"
                    value={modalData.availability || 'available'}
                    onChange={handleModalChange}
                  >
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    If set to "Rented", this storage unit will not be visible for
                    new rentals.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Room Type</Form.Label>
                  <Form.Select
                    name="storage_type"
                    value={modalData.storage_type || ''}
                    onChange={handleModalChange}
                  >
                    <option value="">Select Room Type</option>
                    <option value="Basement">Basement</option>
                    <option value="Roof">Roof</option>
                    <option value="Room">Room</option>
                    <option value="Shed">Shed</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Insurance Option</Form.Label>
                  <Form.Select
                    name="insurance_option"
                    value={modalData.insurance_option || '0'}
                    onChange={handleModalChange}
                  >
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleSave}>
            <i className="bi bi-check-lg me-1"></i>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StorageListings;
