import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { listAllStorages, listAvailableStorages } from '../services/storageService'; // API service for storage data
import { Container, Table, Spinner, Alert, Image, Form, Row, Col, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AllStorages = () => {
    const [storages, setStorages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Parse query parameters from the URL
    const queryParams = new URLSearchParams(location.search);
    const queryStartDate = queryParams.get('start_date');
    const queryEndDate = queryParams.get('end_date');

    // Fetch storages (all or available based on query params)
    useEffect(() => {
        const fetchStorages = async () => {
            try {
                setLoading(true);

                if (queryStartDate && queryEndDate) {
                    // Set start and end dates from query params
                    const parsedStartDate = new Date(queryStartDate);
                    const parsedEndDate = new Date(queryEndDate);
                    setStartDate(parsedStartDate);
                    setEndDate(parsedEndDate);
                    // Save start and end dates to localStorage
                    localStorage.setItem('startDate', parsedStartDate.toISOString());
                    localStorage.setItem('endDate', parsedEndDate.toISOString());

                    // Fetch available storages using these dates
                    const availableStorages = await listAvailableStorages(parsedStartDate, parsedEndDate);
                    setStorages(availableStorages.data || []);
                } else {
                    // Fetch all storages if no query params
                    const allStorages = await listAllStorages();
                    setStorages(allStorages.data || []);
                }
            } catch (err) {
                setError('Failed to fetch storage locations. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchStorages();
    }, [queryStartDate, queryEndDate]);

    // Filter storages by name or EIR
    const filteredStorages = storages.filter(
        (storage) =>
            storage.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (storage.eircode && storage.eircode.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Handle API call for available storages
    const handleSearchByDates = async () => {
        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }

        try {
            setLoading(true);
            const data = await listAvailableStorages(startDate, endDate); // API function to fetch available storages
            setStorages(data.data || []);
            // Save start and end dates to localStorage
            localStorage.setItem('startDate', startDate.toISOString());
            localStorage.setItem('endDate', endDate.toISOString());
        } catch (err) {
            setError('Failed to fetch available storage locations. Please try again.');
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

    if (loading)
        return (
            <div className="text-center my-5">
                <Spinner animation="border" variant="primary" />
                <p>Loading storage locations...</p>
            </div>
        );

    if (error)
        return (
            <Container className="my-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );

    return (
        <Container className="my-5">
            <h2>All Storage Locations</h2>

            {/* Filters Section */}
            <Form className="my-4">
                <Row className="align-items-center">
                    <Col md={4}>
                        <Form.Control
                            type="text"
                            placeholder="Search by Name or EIR"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Col>
                    <Col md={3}>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            placeholderText="Start Date"
                            className="form-control"
                            minDate={new Date()}
                        />
                    </Col>
                    <Col md={3}>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            placeholderText="End Date"
                            className="form-control"
                            minDate={startDate || new Date()}
                        />
                    </Col>
                    <Col md={2}>
                        <Button variant="primary" onClick={handleSearchByDates} disabled={loading}>
                            {loading ? 'Loading...' : 'Search'}
                        </Button>
                    </Col>
                </Row>
            </Form>

            {/* Storage Table */}
            {filteredStorages.length > 0 ? (
                <Table striped bordered hover responsive>
                    <thead>
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
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStorages.map((storage) => (
                            <tr
                                key={storage.storage_id}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleRowClick(storage)} // Navigate to details page
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
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p className="text-center text-muted">No storage locations available.</p>
            )}
        </Container>
    );
};

export default AllStorages;
