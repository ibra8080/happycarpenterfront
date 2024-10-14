import React, { useState, useEffect, useCallback } from 'react';
import { ListGroup, Alert, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ReviewForm from '../reviews/ReviewForm';

const ReviewList = ({ user, professionalUsername, onReviewStatusChange }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localError, setLocalError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/reviews/?professional=${professionalUsername}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const fetchedReviews = response.data.results || response.data;
      setReviews(fetchedReviews);
      const hasUserReviewed = fetchedReviews.some(review => review.owner === user.username);
      setUserHasReviewed(hasUserReviewed);
      onReviewStatusChange(hasUserReviewed);
      setLocalError(null);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setLocalError('Failed to fetch reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user.token, professionalUsername, user.username, onReviewStatusChange]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const openDeleteModal = (reviewId) => {
    setReviewToDelete(reviewId);
    setShowDeleteModal(true);
  };

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      await axios.delete(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/reviews/${reviewToDelete}/`, 
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewToDelete));
      onReviewStatusChange(false);
      setShowDeleteModal(false);
      setReviewToDelete(null);
    } catch (error) {
      console.error('Error deleting review:', error);
      if (error.response && error.response.data) {
        setLocalError(`Failed to delete review: ${error.response.data.detail}`);
      } else {
        setLocalError('Failed to delete review. Please try again.');
      }
      setShowDeleteModal(false);
      setReviewToDelete(null);
    }
  };

  const openEditModal = (review) => {
    setReviewToEdit(review);
    setShowEditModal(true);
  };

  const handleEditSubmit = (updatedReview) => {
    setReviews(prevReviews => prevReviews.map(review => 
      review.id === updatedReview.id ? updatedReview : review
    ));
    setShowEditModal(false);
    setReviewToEdit(null);
  };

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  if (localError) {
    return <Alert variant="danger">{localError}</Alert>;
  }

  return (
    <div>
      <h2>Reviews {userHasReviewed && '(You have reviewed)'}</h2>
      {reviews.length > 0 ? (
        <ListGroup>
          {reviews.map(review => (
            <ListGroup.Item key={review.id}>
              <p>Rating: {review.rating}/5</p>
              <p>{review.content}</p>
              <small>By: <Link to={`/profile/${review.owner}`}>{review.owner}</Link></small>
              {user.username === review.owner && (
                <div>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={() => openEditModal(review)}
                  >
                    Edit
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => openDeleteModal(review.id)}>Delete</Button>
                </div>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <Alert variant="info">No reviews available.</Alert>
      )}

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this review?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteReview}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reviewToEdit && (
            <ReviewForm 
              user={user} 
              initialReview={reviewToEdit}
              onSubmitSuccess={handleEditSubmit}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ReviewList;