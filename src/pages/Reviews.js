import React, { useState, useEffect } from 'react';
import { Container, Card, Spinner, Alert, Row, Col } from 'react-bootstrap';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import {
  listReviews,
  addReview,
  updateReview,
  deleteReview,
} from '../services/reviewService';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Fetch reviews on component mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await listReviews();
        setReviews(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Add or Update Review
  const handleSubmit = async (reviewData) => {
    setFormLoading(true);
    try {
      if (editingReview) {
        await updateReview(editingReview.review_id, reviewData);
        setReviews((prev) =>
          prev.map((r) => (r.review_id === editingReview.review_id ? { ...r, ...reviewData } : r))
        );
      } else {
        const newReview = await addReview({
          ...reviewData,
          storage_id: '10005',
          user_id: 'firebase_uid_129',
        });
        setReviews((prev) => [...prev, newReview.data]);
      }
      setEditingReview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Review
  const handleDelete = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.review_id !== reviewId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="warning" />
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">Manage Reviews</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>{editingReview ? 'Edit Review' : 'Add Review'}</h5>
              <ReviewForm
                onSubmit={handleSubmit}
                review={editingReview}
                isLoading={formLoading}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-4">All Reviews</h5>
              <ReviewList reviews={reviews} onEdit={setEditingReview} onDelete={handleDelete} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Reviews;
