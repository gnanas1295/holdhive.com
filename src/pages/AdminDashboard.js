import React, { useState, useEffect } from 'react';
import {
  Container,
  Table,
  Button,
  Spinner,
  Alert,
  Row,
  Col,
} from 'react-bootstrap';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const promoteToAdmin = async (userId) => {
    const apiUrl =
      'https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/profile/user-role-updation';
    const requestBody = {
      action: 'update_user_role',
      data: {
        user_email_id: userId,
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
        throw new Error('Failed to promote user.');
      }

      // Refetch the user list to update the table
      await fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const fetchUsers = async () => {
    const apiUrl =
      'https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/profile/list-all-users';
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch users.');
      }
      const data = await response.json();
      setUsers(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    const apiUrl =
      'https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/profile/remove-user';
    const requestBody = {
      action: 'remove_user',
      data: {
        user_id: userId,
      },
    };

    try {
      // Delete user from API
      const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseJson = await apiResponse.json();

      if (!apiResponse.ok) {
        throw new Error(responseJson.error || 'Failed to delete user from API.');
      }

      // Remove user locally if the userId matches
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser && currentUser.uid === userId) {
        alert('You cannot delete the currently logged-in admin user.');
        return;
      }

      if (currentUser && currentUser.uid !== userId) {
        alert('User deleted from API, but cannot delete another Firebase user.');
        // Remove user from local state
        setUsers((prev) => prev.filter((user) => user.user_id !== userId));
      }

      alert('User deleted successfully.');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };


  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="warning" />
        <p>Loading users...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (

    <Container className="py-4 rounded bg-white">
      {/* Title Section */}
      <Row className="mb-4">
        <Col>
          <h1 className="text-center display-5 fw-bold mb-0">
            Admin Dashboard
          </h1>
          <p className="text-center text-muted">
            Manage users, rentals, reviews, and storages
          </p>
        </Col>
      </Row>

      {/* Action Buttons */}
      <Row className="justify-content-center align-items-center mb-5">
        <Col
          md={3}
          sm={6}
          xs={12}
          className="mb-2 d-flex justify-content-center"
        >
          <Button
            variant="outline-warning"
            className="w-100 fw-semibold"
            onClick={() => navigate('/rentals/all')}
          >
            <i className="bi bi-briefcase me-2"></i>Manage Rentals
          </Button>
        </Col>
        <Col
          md={3}
          sm={6}
          xs={12}
          className="mb-2 d-flex justify-content-center"
        >
          <Button
            variant="outline-warning"
            className="w-100 fw-semibold"
            onClick={() => navigate('/reviews')}
          >
            <i className="bi bi-star me-2"></i>Manage Reviews
          </Button>
        </Col>
        <Col
          md={3}
          sm={6}
          xs={12}
          className="mb-2 d-flex justify-content-center"
        >
          <Button
            variant="outline-warning"
            className="w-100 fw-semibold"
            onClick={() => navigate('/storages/all')}
          >
            <i className="bi bi-box-seam me-2"></i>Manage Storages
          </Button>
        </Col>
      </Row>

      {/* User Management */}
      <Row>
        <Col>
          <h3 className="fw-bold mb-4">User Management</h3>
          <Table
            striped
            bordered
            hover
            responsive
            className="user-table align-middle"
            style={{ borderColor: '#dee2e6' }}
          >
            <thead className="table-light">
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Address</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.user_id}
                  style={{
                    transition: 'background 0.2s ease-in-out',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = '#fafafa')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = 'transparent')
                  }
                >
                  <td>{user.user_id}</td>
                  <td>{user.name || 'Not Provided'}</td>
                  <td>{user.email || 'Not Provided'}</td>
                  <td>{user.phone || 'Not Provided'}</td>
                  <td>{user.role_name || 'Not Provided'}</td>
                  <td>{user.address || 'Not Provided'}</td>
                  <td className="text-center">
                    <div className="d-inline-flex align-items-center">
                      <Button
                        variant={user.role_name === 'admin' ? 'danger' : 'warning'}
                        size="sm"
                        className="me-2"
                          onClick={() => promoteToAdmin(user.email)}
                      >
                        {user.role_name === 'admin' ? 'Demote' : 'Promote'}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => deleteUser(user.user_id)}
                      >
                        <i className="bi bi-trash-fill"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
