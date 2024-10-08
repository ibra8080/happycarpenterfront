import React, { useState, useEffect, useCallback } from 'react';
import { ListGroup, Alert } from 'react-bootstrap';
import axios from 'axios';

const ReviewList = ({ user, setError }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localError, setLocalError] = useState(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://happy-carpenter-ebf6de9467cb.herokuapp.com/reviews/', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (Array.isArray(response.data)) {
        setReviews(response.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        setReviews(response.data.results);
      } else {
        console.error('Unexpected API response format:', response.data);
        setLocalError('Unexpected data format received from the server.');
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setLocalError('Failed to fetch reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user.token, setError]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  if (localError) {
    return <Alert variant="danger">{localError}</Alert>;
  }

  return (
    <div>
      <h2>Your Reviews</h2>
      {reviews.length === 0 ? (
        <Alert variant="info">You don't have any reviews yet.</Alert>
      ) : (
        <ListGroup>
          {reviews.map(review => (
            <ListGroup.Item key={review.id}>
              <h5>Rating: {review.rating}/5</h5>
              <p>{review.content}</p>
              <small>By: {review.reviewer}</small>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default ReviewList;
