import React, { useState, useEffect, useCallback } from 'react';
import { ListGroup, Button, Alert, Form } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';


const ReviewList = ({ user, setError }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localError, setLocalError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewContent, setReviewContent] = useState('');
  const [rating, setRating] = useState(5);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://happy-carpenter-ebf6de9467cb.herokuapp.com/reviews/', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setReviews(response.data.results || response.data);
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

  const handleAddReview = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://happy-carpenter-ebf6de9467cb.herokuapp.com/reviews/', 
        { content: reviewContent, rating, professional: user.id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setReviews(prevReviews => [response.data, ...prevReviews]);
      setShowReviewForm(false);
      setReviewContent('');
      setRating(5);
    } catch (error) {
      setLocalError('Failed to add review. Please try again.');
    }
  };

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

  const canAddReview = user.username !== user.profile.owner;

  return (
    <div>
      <h2>Reviews</h2>
      {canAddReview && (
        <Button onClick={() => setShowReviewForm(!showReviewForm)}>
          {showReviewForm ? 'Cancel' : 'Add Review'}
        </Button>
      )}
      {showReviewForm && canAddReview && (
        <Form onSubmit={handleAddReview}>
          <Form.Group>
            <Form.Label>Rating</Form.Label>
            <Form.Control 
              as="select" 
              value={rating} 
              onChange={(e) => setRating(Number(e.target.value))}
            >
              {[5, 4, 3, 2, 1].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Review</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
            />
          </Form.Group>
          <Button type="submit">Submit Review</Button>
        </Form>
      )}
      {Array.isArray(reviews) && reviews.length > 0 ? (
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
