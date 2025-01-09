import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

const ReviewsModal = ({ show, onHide, reviews, fetchReviews }) => {
    const [editMode, setEditMode] = useState(false);
    const [reviewToEdit, setReviewToEdit] = useState(null);
    const [formData, setFormData] = useState({ rating: '', comment: '' });
    const [alert, setAlert] = useState({ type: '', message: '' });
    const storageId = localStorage.getItem('storage_id');

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle review submission (create or update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlert({ type: '', message: '' });
        const apiUrl = reviewToEdit
            ? 'https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/review-service/update-review-by-id'
            : 'https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/review-service/create-review';

        const requestBody = reviewToEdit
            ? {
                action: 'update_review',
                review_id: reviewToEdit.review_id,
                rating: formData.rating,
                comment: formData.comment,
            }
            : {
                action: 'create_review',
                storage_id: storageId,
                user_id: localStorage.getItem('id'),
                rating: formData.rating,
                comment: formData.comment,
            };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error('Failed to submit review.');
            }

            setAlert({
                type: 'success',
                message: reviewToEdit
                    ? 'Review updated successfully!'
                    : 'Review created successfully!',
            });

            setFormData({ rating: '', comment: '' });
            setReviewToEdit(null);
            setEditMode(false);

            // Refresh the reviews
            fetchReviews(storageId);
        } catch (err) {
            setAlert({ type: 'danger', message: err.message });
        }
    };

    // Handle edit button click
    const handleEdit = (review) => {
        setReviewToEdit(review);
        setFormData({ rating: review.rating, comment: review.comment });
        setEditMode(true);
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setFormData({ rating: '', comment: '' });
        setReviewToEdit(null);
        setEditMode(false);
    };

    // Automatically hide the alert after 3 seconds
    useEffect(() => {
        if (alert.message) {
            const timer = setTimeout(() => setAlert({ type: '', message: '' }), 3000);
            return () => clearTimeout(timer); // Cleanup timeout
        }
    }, [alert]);

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>{editMode ? 'Edit Review' : 'Reviews'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {alert.message && <Alert variant={alert.type}>{alert.message}</Alert>}

                {editMode ? (
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Rating</Form.Label>
                            <Form.Control
                                type="number"
                                name="rating"
                                value={formData.rating}
                                onChange={handleChange}
                                min="1"
                                max="5"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Comment</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="comment"
                                value={formData.comment}
                                onChange={handleChange}
                                rows={3}
                                required
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" onClick={handleCancelEdit} className="me-2">
                                Cancel
                            </Button>
                            <Button type="submit" variant="warning">
                                Save Changes
                            </Button>
                        </div>
                    </Form>
                ) : (
                    <>
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <div key={review.review_id} className="border p-3 rounded mb-3">
                                    <h5>{review.comment}</h5>
                                    <p>
                                        <strong>Rating:</strong> {review.rating}/5
                                    </p>
                                    <p>
                                        <strong>Reviewer:</strong> {review.reviewer_name} ({review.reviewer_email})
                                    </p>
                                    <p>
                                        <strong>Review Date:</strong>{' '}
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </p>
                                    <Button
                                        variant="outline-warning"
                                        size="sm"
                                        onClick={() => handleEdit(review)}
                                        className="me-2"
                                    >
                                        Edit
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted">No reviews found for this storage.</p>
                        )}

                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                {/* <Button variant="secondary" onClick={onHide}>
                    Close
                </Button> */}
                <Button
                    variant="warning"
                    onClick={() => {
                        setEditMode(true);
                        setFormData({ rating: '', comment: '' });
                    }}
                >
                    Add Review
                </Button>

            </Modal.Footer>
        </Modal>
    );
};

export default ReviewsModal;
