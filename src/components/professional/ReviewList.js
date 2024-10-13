import React, { useState, useEffect, useCallback } from 'react';
import { ListGroup, Alert, Button } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ReviewList = ({ user, professionalUsername, onReviewStatusChange }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localError, setLocalError] = useState(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/reviews/?professional=${professionalUsername}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const fetchedReviews = response.data.results || response.data;
      setReviews(fetchedReviews);
      const hasUserReviewed = fetchedReviews.some(review => review.reviewer === user.username);
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

  const handleEditReview = async (reviewId, newContent, newRating) => {
    try {
      const response = await axios.put(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/reviews/${reviewId}/`, 
        { content: newContent, rating: newRating },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setReviews(prevReviews => prevReviews.map(review => 
        review.id === reviewId ? response.data : review
      ));
    } catch (error) {
      setLocalError('Failed to edit review. Please try again.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/reviews/${reviewId}/`, 
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
    } catch (error) {
      setLocalError('Failed to delete review. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  if (localError) {
    return <Alert variant="danger">{localError}</Alert>;
  }

  return (
    <div>
      <h2>Reviews</h2>
      {reviews.length > 0 ? (
        <ListGroup>
          {reviews.map(review => (
            <ListGroup.Item key={review.id}>
              <p>Rating: {review.rating}/5</p>
              <p>{review.content}</p>
              <small>By: <Link to={`/profile/${review.reviewer}`}>{review.reviewer}</Link></small>
              {user.username === review.reviewer && (
                <div>
                  <Button variant="outline-primary" size="sm" onClick={() => handleEditReview(review.id, review.content, review.rating)}>Edit</Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDeleteReview(review.id)}>Delete</Button>
                </div>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <Alert variant="info">No reviews available.</Alert>
      )}
    </div>
  );
};

export default ReviewList;