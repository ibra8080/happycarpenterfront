import React, { useState, useEffect, useCallback } from 'react';
import { ListGroup, Alert, Button, Modal } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ReviewForm from '../reviews/ReviewForm';
import styles from './ReviewList.module.css';

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
      if (typeof onReviewStatusChange === 'function') {
        onReviewStatusChange(hasUserReviewed);
      }
      setLocalError(null);
    } catch (error) {
      if (error.response) {
      }
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

  const renderStarRating = (rating) => {
    return [...Array(5)].map((star, index) => (
      <FaStar key={index} className={index < rating ? styles.starFilled : styles.starEmpty} />
    ));
  };

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  if (localError) {
    return <Alert variant="danger">{localError}</Alert>;
  }

  return (
    <div>
      <h5 className={styles.sectionTitle}>Reviews {userHasReviewed && '(You have reviewed)'}</h5>
      {loading ? (
        <p>Loading reviews...</p>
      ) : localError ? (
        <Alert variant="danger">{localError}</Alert>
      ) : reviews.length > 0 ? (
        <ListGroup variant="flush">
          {reviews.map(review => (
            <ListGroup.Item key={review.id} className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <Link to={`/profile/${review.owner}`} className={styles.reviewAuthor}>{review.owner}</Link>
                <div className={styles.starRating}>{renderStarRating(review.rating)}</div>
              </div>
              <p className={styles.reviewContent}>{review.content}</p>
              {user.username === review.owner && (
                <div className={styles.reviewActions}>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={() => openEditModal(review)}
                    className={styles.actionButton}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={() => openDeleteModal(review.id)}
                    className={styles.actionButton}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <Alert variant="info">No reviews available for this professional.</Alert>
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
