import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Form, Button, Card, ListGroup, Badge, Alert, Spinner } from 'react-bootstrap';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { AuthContext } from '../context/AuthContext';

const ProfileEdit = () => {
  const { setUserName } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profileData, setProfileData] = useState({
    user_id: '',
    email: '',
    name: '',
    phone: '',
    profile_image_url: '',
    address: '',
    eircode: '',
  });

  const [profileImageOptions] = useState([
    'https://holdhive.s3.eu-west-1.amazonaws.com/Avator/Profile_Image_Men_1.png',
    'https://holdhive.s3.eu-west-1.amazonaws.com/Avator/Profile_Image_Men_2.png',
    'https://holdhive.s3.eu-west-1.amazonaws.com/Avator/Profile_Image_Men_3.png',
    'https://holdhive.s3.eu-west-1.amazonaws.com/Avator/Profile_Image_Men_4.png',
    'https://holdhive.s3.eu-west-1.amazonaws.com/Avator/Profile_Image_Men_5.png',
    'https://holdhive.s3.eu-west-1.amazonaws.com/Avator/Profile_Image_Women_1.png',
    'https://holdhive.s3.eu-west-1.amazonaws.com/Avator/Profile_Image_Women_2.png',
    'https://holdhive.s3.eu-west-1.amazonaws.com/Avator/Profile_Image_Women_3.png',
    'https://holdhive.s3.eu-west-1.amazonaws.com/Avator/Profile_Image_Women_4.png',
    'https://holdhive.s3.eu-west-1.amazonaws.com/Avator/Profile_Image_Women_5.png'
  ]);

  const [reviewsByUser, setReviewsByUser] = useState([]);
  const [reviewsForOwner, setReviewsForOwner] = useState([]);

  const navigate = useNavigate();
  const { refreshRole } = useContext(AuthContext);

  // Cache states
  const [profileCache, setProfileCache] = useState({});
  const [reviewsCache, setReviewsCache] = useState({});

  useEffect(() => {
    // We want to fetch only once (on mount)
    const fetchUserProfileAndReviews = async () => {
      const user = auth.currentUser;

      if (!user) {
        navigate('/auth');
        return;
      }

      // Fill in user_id and email from Firebase
      setProfileData((prevData) => ({
        ...prevData,
        user_id: user.uid,
        email: user.email || '',
      }));

      // Prepare API URLs
      const userId = user.uid;
      const profileApiUrl = `https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/profile/users?action=get_user_profile&user_id=${userId}`;
      const reviewsByUserApiUrl = `https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/review-service/list-reviews-by-user-id?user_id=${userId}`;
      const reviewsForOwnerApiUrl = `https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/review-service/list-reviews-by-owner-id?owner_id=${userId}`;

      try {
        // Helper functions with simple caching:
        const fetchProfile = async () => {
          if (profileCache[userId]) return profileCache[userId];
          const response = await fetch(profileApiUrl);
          if (!response.ok) throw new Error('Failed to fetch user profile.');
          const data = await response.json();
          setProfileCache((prevCache) => ({ ...prevCache, [userId]: data }));
          return data;
        };

        const fetchReviewsByUser = async () => {
          if (reviewsCache[`reviewsByUser-${userId}`]) {
            return reviewsCache[`reviewsByUser-${userId}`];
          }
          const response = await fetch(reviewsByUserApiUrl);
          if (!response.ok) throw new Error('Failed to fetch reviews by user.');
          const data = await response.json();
          setReviewsCache((prevCache) => ({
            ...prevCache,
            [`reviewsByUser-${userId}`]: data,
          }));
          return data;
        };

        const fetchReviewsForOwner = async () => {
          if (reviewsCache[`reviewsForOwner-${userId}`]) {
            return reviewsCache[`reviewsForOwner-${userId}`];
          }
          const response = await fetch(reviewsForOwnerApiUrl);
          if (!response.ok) throw new Error('Failed to fetch reviews for owner.');
          const data = await response.json();
          setReviewsCache((prevCache) => ({
            ...prevCache,
            [`reviewsForOwner-${userId}`]: data,
          }));
          return data;
        };

        // Fetched data - rename variables to avoid clashing with `profileData` in state
        const [fetchedProfile, fetchedReviewsByUser, fetchedReviewsForOwner] =
          await Promise.all([
            fetchProfile(),
            fetchReviewsByUser(),
            fetchReviewsForOwner(),
          ]);

        // Update localStorage, contexts, etc.
        localStorage.setItem('name', fetchedProfile.name);
        localStorage.setItem('userRole', fetchedProfile.role_name);
        refreshRole();
        setUserName(fetchedProfile.name);

        // Merge fetched data into state
        setProfileData((prevData) => ({
          ...prevData,
          name: fetchedProfile.name || '',
          phone: fetchedProfile.phone || '',
          address: fetchedProfile.address || '',
          eircode: fetchedProfile.eircode || '',
          profile_image_url:
            fetchedProfile.profile_image_url || profileImageOptions[0],
        }));

        // Set reviews
        setReviewsByUser(fetchedReviewsByUser.data || []);
        setReviewsForOwner(fetchedReviewsForOwner.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setFetching(false);
      }
    };

    fetchUserProfileAndReviews();
    // Empty dependency array -> runs once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update local state as the user types
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission to save changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const apiUrl =
      'https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/profile/user-updation';

    const requestBody = {
      action: 'update_profile',
      data: {
        user_id: profileData.user_id,
        profile_data: {
          email: profileData.email,
          name: profileData.name,
          phone: profileData.phone,
          profile_image_url: profileData.profile_image_url,
          address: profileData.address,
          eircode: profileData.eircode,
        },
      },
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error('Failed to update profile.');
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="warning" />
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row className="g-4">
        {/* Profile Edit Section */}
        <Col lg={6}>
          <Card className="shadow-lg border-0">
            <Card.Body>
              <h4 className="text-center mb-4 text-warning">Edit Profile</h4>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="name" className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your name"
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                {/* If you want to allow editing email, remove "disabled" */}
                <Form.Group controlId="email" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={profileData.email}
                    disabled
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="phone" className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your phone number"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="profile_image_url" className="mb-3">
                  <Form.Label>Profile Image</Form.Label>
                  <Form.Select
                    name="profile_image_url"
                    value={profileData.profile_image_url}
                    onChange={handleChange}
                  >
                    {profileImageOptions.map((url, index) => (
                      <option key={index} value={url}>
                        {url}
                      </option>
                    ))}
                  </Form.Select>
                  {profileData.profile_image_url && (
                    <div className="mt-3 text-center">
                      <img
                        src={profileData.profile_image_url}
                        alt="Profile"
                        className="rounded-circle shadow-sm"
                        style={{ width: '100px', height: '100px' }}
                      />
                    </div>
                  )}
                </Form.Group>

                <Form.Group controlId="address" className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your address"
                    name="address"
                    value={profileData.address}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="eircode" className="mb-3">
                  <Form.Label>Eircode</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your Eircode"
                    name="eircode"
                    value={profileData.eircode}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Button
                  variant="warning"
                  type="submit"
                  className="w-100 shadow-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" variant="warning" />
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Reviews Section */}
        <Col lg={6}>
          <Card className="shadow-lg border-0">
            <Card.Body>
              <h4 className="text-center mb-4 text-warning">Reviews By You</h4>
              {reviewsByUser.length === 0 ? (
                <Alert variant="warning">No reviews found.</Alert>
              ) : (
                <ListGroup className="mb-4">
                  {reviewsByUser.map((review, idx) => (
                    <ListGroup.Item
                      key={idx}
                      className="border-0 bg-light mb-3 shadow-sm"
                    >
                      <h6 className="fw-bold">{review.storage_title}</h6>
                      <p>
                        <Badge bg="warning" className="me-2">
                          {review.rating}/5
                        </Badge>
                        {review.comment}
                      </p>
                      <small className="text-muted">
                        <strong>Location:</strong> {review.storage_location} |{' '}
                        <strong>Price:</strong> €{review.storage_price}/month
                      </small>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}

              <h4 className="text-center mb-4 text-warning">
                Reviews For Your Storages
              </h4>
              {reviewsForOwner.length === 0 ? (
                <Alert variant="warning">No reviews found.</Alert>
              ) : (
                <ListGroup>
                  {reviewsForOwner.map((review, idx) => (
                    <ListGroup.Item
                      key={idx}
                      className="border-0 bg-light mb-3 shadow-sm"
                    >
                      <h6 className="fw-bold">{review.storage_title}</h6>
                      <p>
                        <Badge bg="warning" className="me-2">
                          {review.rating}/5
                        </Badge>
                        {review.comment}
                      </p>
                      <small className="text-muted">
                        <strong>Location:</strong> {review.storage_location} |{' '}
                        <strong>Price:</strong> €{review.storage_price}/month |{' '}
                        <strong>Reviewer:</strong> {review.reviewer_name} (
                        {review.reviewer_email})
                      </small>
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

export default ProfileEdit;
