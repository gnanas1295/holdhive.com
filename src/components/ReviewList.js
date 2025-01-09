import React from 'react';
import { ListGroup, Button, Image, OverlayTrigger, Tooltip } from 'react-bootstrap';

const ReviewList = ({ reviews, onEdit, onDelete }) => {
  return (
    <ListGroup>
      {reviews.map((review) => (
        <ListGroup.Item
          key={review.review_id}
          className="d-flex flex-column flex-md-row align-items-start justify-content-between p-4"
        >
          <div className="d-flex align-items-start">
            <Image
              src={review.reviewer_profile_image || 'https://via.placeholder.com/50'}
              roundedCircle
              width="50"
              height="50"
              className="me-3"
              alt={`${review.reviewer_name}'s profile`}
            />
            <div>
              <h5 className="mb-1">{review.reviewer_name}</h5>
              <p className="mb-1">
                <strong>Storage:</strong> {review.storage_title}
              </p>
              <p className="mb-1">
                <strong>Rating:</strong> {review.rating} / 5
              </p>
              <p className="text-muted">{review.comment}</p>
              <small className="text-muted">
                <strong>Reviewed on:</strong> {new Date(review.created_at).toLocaleDateString()}
              </small>
            </div>
          </div>
          <div className="d-flex align-items-center mt-3 mt-md-0">
            {/* Edit Button with Tooltip */}
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Edit this review</Tooltip>}
            >
              <Button variant="warning" size="sm" className="me-2" onClick={() => onEdit(review)}>
                <i className="bi bi-pencil-square"></i>
              </Button>
            </OverlayTrigger>

            {/* Delete Button with Tooltip */}
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Delete this review</Tooltip>}
            >
              <Button variant="danger" size="sm" onClick={() => onDelete(review.review_id)}>
                <i className="bi bi-trash-fill"></i>
              </Button>
            </OverlayTrigger>
          </div>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default ReviewList;
