import React, { useState, useEffect } from 'react';
import { Container, Table, Alert, Spinner, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

const StorageListings = () => {
  const [storageLocations, setStorageLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false); // For the create/update modal
  const [modalData, setModalData] = useState({}); // Data for the modal
  const [isEditing, setIsEditing] = useState(false); // Determines if the modal is for editing
  const [selectedRentals, setSelectedRentals] = useState([]); // Rentals for a specific storage
  const [rentalLoading, setRentalLoading] = useState(false);
  const [showRentalsModal, setShowRentalsModal] = useState(false); // Controls the visibility of the Rentals modal

  const ownerId = localStorage.getItem('id'); // Fetch Owner ID from localStorage

  const roomTypeImageUrls = {
    Basement: 'https://holdhive.s3.eu-west-1.amazonaws.com/Storage_Spaces_Images/Empty_Basement_Image.jpeg',
    Roof: 'https://holdhive.s3.eu-west-1.amazonaws.com/Storage_Spaces_Images/Empty_Roof.jpg',
    Room: 'https://holdhive.s3.eu-west-1.amazonaws.com/Storage_Spaces_Images/Empty_Room.jpg',
    Shed: 'https://holdhive.s3.eu-west-1.amazonaws.com/Storage_Spaces_Images/Empty_Shed.jpg',
  };

  useEffect(() => {
    if (ownerId) {
      fetchStorageLocations(ownerId);
    } else {
      setLoading(false);
      setError('Owner ID not found in local storage.');
    }
  }, [ownerId]);

  const fetchStorageLocations = async (ownerId) => {
    try {
      const response = await axios.get(
        `https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/storage-location/list-storage-location-by-owner-id`,
        {
          params: { user_id: ownerId },
        }
      );
      setStorageLocations(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while fetching storage locations.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRentalsByStorageId = async (storageId) => {
    setRentalLoading(true);
    setShowRentalsModal(true); // Explicitly open the modal
    try {
      const response = await axios.get(
        `https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/rental-service/list-rental-by-storage-id`,
        {
          params: { storage_id: storageId },
        }
      );
      setSelectedRentals(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while fetching rentals.');
      setSelectedRentals([]); // Ensure rentals are cleared on error
    } finally {
      setRentalLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (modalData.storage_type) {
        modalData.images_url = roomTypeImageUrls[modalData.storage_type];
      }

      const url = isEditing
        ? `https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/storage-location/update-storage-location`
        : `https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/storage-location/add-storage-location`;

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
          availability: 'available', // Default availability for new storage
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
      setError(err.response?.data?.message || 'An error occurred while saving the storage location.');
    }
  };

  const handleDelete = async (storageId) => {
    const confirmed = window.confirm('Are you sure you want to delete this storage location? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await axios.post(
        `https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/storage-location/delete-storage-location`,
        {
          action: 'delete_storage_location',
          storage_id: storageId,
        }
      );

      fetchStorageLocations(ownerId);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while deleting the storage location.');
    }
  };

  const handleEditClick = (storage) => {
    setModalData(storage);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleAddClick = () => {
    setModalData({});
    setIsEditing(false);
    setShowModal(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModalData({ ...modalData, [name]: value });
  };

  return (
    <Container className="my-5">
      <h2>Storage List</h2>
      {loading && (
        <div className="text-center">
          <Spinner animation="border" />
          <p>Loading storage locations...</p>
        </div>
      )}
      {error && !loading && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        <>
          <Button variant="primary" className="mb-3" onClick={handleAddClick}>
            Add Storage
          </Button>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Location</th>
                <th>Size (sq ft)</th>
                <th>Price (per month)</th>
                <th>Status</th>
                <th>Eircode</th>
                <th>Insurance</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {storageLocations.map((storage) => (
                <tr key={storage.storage_id}>
                  <td>
                    <img
                      src={roomTypeImageUrls[storage.storage_type] || storage.images_url}
                      alt={storage.storage_type}
                      style={{ width: '80px', height: '60px', objectFit: 'cover' }}
                    />
                  </td>
                  <td>{storage.title}</td>
                  <td>{storage.location}</td>
                  <td>{storage.size}</td>
                  <td>€{storage.price_per_month}</td>
                  <td>{storage.availability}</td>
                  <td>{storage.eircode || 'N/A'}</td>
                  <td>{storage.insurance_option ? 'Yes' : 'No'}</td>
                  <td>{storage.storage_type}</td>
                  <td>
                    <div className="d-flex justify-content-around">
                      <Button variant="warning" size="sm" className="mx-1" onClick={() => handleEditClick(storage)}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" className="mx-1" onClick={() => handleDelete(storage.storage_id)}>
                        Delete
                      </Button>
                      <Button
                        variant="info"
                        size="sm"
                        className="mx-1"
                        onClick={() => fetchRentalsByStorageId(storage.storage_id)}
                      >
                        Rentals
                      </Button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </Table>

          {/* Rentals Modal */}
          <Modal
            size="lg"
            show={showRentalsModal}
            onHide={() => setShowRentalsModal(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>Rentals for Selected Storage</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {rentalLoading ? (
                <div className="text-center">
                  <Spinner animation="border" />
                  <p>Loading rentals...</p>
                </div>
              ) : error ? (
                <Alert variant="danger" className="text-center">
                  {error}
                </Alert>
              ) : selectedRentals.length > 0 ? (
                <>
                  {/* Renter Details */}
                  <h5 className="mb-3">Renter Information</h5>
                  <Table bordered>
                    <tbody>
                      <tr>
                        <th>Name</th>
                        <td>{selectedRentals[0]?.renter_name}</td>
                      </tr>
                      <tr>
                        <th>Email</th>
                        <td>{selectedRentals[0]?.renter_email}</td>
                      </tr>
                      <tr>
                        <th>Phone</th>
                        <td>{selectedRentals[0]?.renter_phone}</td>
                      </tr>
                    </tbody>
                  </Table>

                  {/* Owner Details */}
                  <h5 className="mt-4 mb-3">Owner Information</h5>
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

                  {/* Storage Details */}
                  <h5 className="mt-4 mb-3">Storage Unit Information</h5>
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
                    </tbody>
                  </Table>

                  {/* Rental Details */}
                  <h5 className="mt-4 mb-3">Rental Information</h5>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Rental ID</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Total Price</th>
                        <th>Payment Status</th>
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
                        </tr>
                      ))}
                    </tbody>
                  </Table>
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
        </>
      )}

      {!loading && !error && storageLocations.length === 0 && (
        <p className="text-muted">No storage locations found for the provided Owner ID.</p>
      )}

      {/* Modal for Create/Update */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Storage Location' : 'Add Storage Location'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
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
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={modalData.location || ''}
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
            <Form.Group className="mb-3">
              <Form.Label>Price (per month)</Form.Label>
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
                If set to "Rented", this storage unit will not be visible for new rentals.
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
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StorageListings;
