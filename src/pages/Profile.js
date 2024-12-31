import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const ProfileEdit = () => {
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

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user details from Firebase Auth and API
    const fetchUserProfile = async () => {
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid;
        setProfileData((prevData) => ({
          ...prevData,
          user_id: userId,
          email: user.email || '',
        }));

        const apiUrl = `https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/profile/users?action=get_user_profile&user_id=${userId}`;

        try {
          const response = await fetch(apiUrl);
          if (!response.ok) {
            throw new Error('Failed to fetch user profile.');
          }
          const data = await response.json();

          // Populate profile data from API response
          const userData = data;
          setProfileData((prevData) => ({
            ...prevData,
            name: userData.name || '',
            phone: userData.phone || '',
            address: userData.address || '',
            eircode: userData.eircode || '',
            profile_image_url: userData.profile_image_url || profileImageOptions[0],
          }));
          localStorage.setItem('userRole', userData.role_name);
          localStorage.setItem('name', userData.name);
          localStorage.setItem('id', userData.user_id);
        } catch (err) {
          setError(err.message);
        } finally {
          setFetching(false);
        }
      } else {
        navigate('/auth'); // Redirect to login if not authenticated
      }
    };

    fetchUserProfile();
  }, [navigate, profileImageOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const apiUrl = 'https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/profile/user-updation';

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

      if (!response.ok) {
        throw new Error('Failed to update profile.');
      }

      const data = await response.json();
      setSuccess('Profile updated successfully!');
      console.log('Profile update response:', data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ width: '100%', maxWidth: '600px' }} className="shadow">
        <Card.Body>
          <h3 className="text-center mb-4">Edit Profile</h3>
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
            <Form.Group controlId="email" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={profileData.email}
                disabled
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
                    alt="Profile Preview"
                    style={{ maxWidth: '100px', borderRadius: '50%' }}
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
              variant="primary"
              type="submit"
              className="w-100"
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : 'Save Changes'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProfileEdit;
