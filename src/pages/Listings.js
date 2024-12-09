import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';

const Listings = () => {
    const location = useLocation();
    const { location: searchLocation, date } = location.state || {};
    const navigate = useNavigate();

    const [storageListings, setStorageListings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Simulate an API call
    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);

            // Simulating API delay
            setTimeout(() => {
                const dummyListings = [
                    {
                        id: 1,
                        name: 'Boxes Chalon-sur-Saone',
                        address: '71100 Chalon-sur-Saone, 24km',
                        price: 'From 52€/month',
                        size: '2 to 10m²',
                        image: 'https://via.placeholder.com/300',
                        location: 'City A',
                    },
                    {
                        id: 2,
                        name: 'Boxes Chevroux',
                        address: '01190 Chevroux, 25km',
                        price: 'From 55€/month',
                        size: '2 to 9m²',
                        image: 'https://via.placeholder.com/300',
                        location: 'City A',
                    },
                    {
                        id: 3,
                        name: 'Storage Facility A',
                        address: 'City A, 5km',
                        price: 'From 45€/month',
                        size: '1 to 8m²',
                        image: 'https://via.placeholder.com/300',
                        location: 'City A',
                    },
                    {
                        id: 4,
                        name: 'Luxury Storage',
                        address: 'City B, 12km',
                        price: 'From 80€/month',
                        size: '3 to 12m²',
                        image: 'https://via.placeholder.com/300',
                        location: 'City B',
                    },
                    {
                        id: 5,
                        name: 'Affordable Storage',
                        address: 'City C, 18km',
                        price: 'From 65€/month',
                        size: '2 to 10m²',
                        image: 'https://via.placeholder.com/300',
                        location: 'City C',
                    },
                    {
                        id: 6,
                        name: 'The London Pub',
                        address: 'Rue Brocherie, Grenoble, France',
                        price: 'From 70€/month',
                        size: '3 to 11m²',
                        image: 'https://via.placeholder.com/300',
                        location: 'London',
                    },
                    {
                        id: 7,
                        name: 'London Pub',
                        address: 'Rue Borville Dupuis, Evreux, France',
                        price: 'From 68€/month',
                        size: '2 to 9m²',
                        image: 'https://via.placeholder.com/300',
                        location: 'London',
                    },
                    {
                        id: 8,
                        name: 'The London Town',
                        address: 'English Pub Toulouse',
                        price: 'From 75€/month',
                        size: '3 to 12m²',
                        image: 'https://via.placeholder.com/300',
                        location: 'London',
                    },
                    {
                        id: 9,
                        name: 'London Corner',
                        address: 'Place Marcel Bouilloux-Lafont, Toulouse, France',
                        price: 'From 60€/month',
                        size: '2 to 10m²',
                        image: 'https://via.placeholder.com/300',
                        location: 'London',
                    },
                ];

                const filteredListings = dummyListings.filter((listing) => {
                    const searchQuery = searchLocation?.toLowerCase() || '';
                    const searchTokens = searchQuery.split(/\s|,/).filter(Boolean); // Split by spaces and commas

                    // Check if any token matches name, address, or location fields
                    return searchTokens.some((token) =>
                      listing.location.toLowerCase().includes(token) ||
                      listing.address.toLowerCase().includes(token) ||
                      listing.name.toLowerCase().includes(token)
                    );
                  });


                setStorageListings(filteredListings);
                setLoading(false);
            }, 1000); // 1-second delay
        };

        fetchListings();
    }, [searchLocation]);

    const handleBookNow = (listing) => {
        navigate('/booking', { state: { listing, date } });
    };

    return (
        <Container className="my-5">
            <h2 className="text-center mb-4">Storage Listings</h2>
            <p className="text-center">
                Showing results for <strong>{searchLocation}</strong> on{' '}
                <strong>{date ? new Date(date).toLocaleDateString() : 'N/A'}</strong>
            </p>

            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : storageListings.length > 0 ? (
                <Row>
                    {storageListings.map((listing) => (
                        <Col md={3} key={listing.id} className="mb-4">
                            <Card className="h-100 d-flex flex-column">
                                <Card.Img variant="top" src={listing.image} alt={listing.name} />
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>{listing.name}</Card.Title>
                                    <Card.Text>
                                        <strong>Address:</strong> {listing.address}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Size:</strong> {listing.size}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Price:</strong> {listing.price}
                                    </Card.Text>
                                    <div className="mt-auto">
                                        <Button
                                            variant="danger"
                                            className="w-100"
                                            onClick={() => handleBookNow(listing)}
                                        >
                                            Book Now
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <p className="text-center text-muted">No listings found for "{searchLocation}".</p>
            )}
        </Container>
    );
};

export default Listings;
