import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';

const ReviewForm = ({ onSubmit, review = {}, isLoading }) => {
  const [formData, setFormData] = useState({
    rating: '',
    comment: '',
  });

  useEffect(() => {
    // Safely update the form data when `review` changes
    setFormData({
      rating: review?.rating || '', // Default to empty string if rating is null or undefined
      comment: review?.comment || '', // Default to empty string if comment is null or undefined
    });
  }, [review]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="rating" className="mb-3">
        <Form.Label>Rating</Form.Label>
        <Form.Control
          type="number"
          name="rating"
          value={formData.rating}
          onChange={handleChange}
          placeholder="Enter rating (1-5)"
          min="1"
          max="5"
          required
        />
      </Form.Group>
      <Form.Group controlId="comment" className="mb-3">
        <Form.Label>Comment</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="comment"
          value={formData.comment}
          onChange={handleChange}
          placeholder="Enter your comment"
          required
        />
      </Form.Group>
      <Button type="submit" variant="warning" className="w-100" disabled={isLoading}>
        {isLoading ? <Spinner animation="border" size="sm" variant='warning'/> : 'Submit'}
      </Button>
    </Form>
  );
};

export default ReviewForm;
