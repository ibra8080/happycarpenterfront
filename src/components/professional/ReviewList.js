import React, { useState, useEffect, useCallback } from 'react';
import { ListGroup } from 'react-bootstrap';
import axios from 'axios';

const ReviewList = ({ user }) => {
  const [reviews, setReviews] = useState([]);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await axios.get('https://happy-carpenter-ebf6de9467cb.herokuapp.com/reviews/', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, [user.token]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return (
    <div>
      <h2>Your Reviews</h2>
      <ListGroup>
        {reviews.map(review => (
          <ListGroup.Item key={review.id}>
            <h5>Rating: {review.rating}/5</h5>
            <p>{review.content}</p>
            <small>By: {review.reviewer}</small>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default ReviewList;
