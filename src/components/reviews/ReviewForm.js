import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ReviewForm = ({ user }) => {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const { username } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(
        'https://happy-carpenter-ebf6de9467cb.herokuapp.com/reviews/',
        { 
          professional: username,
          rating,
          content
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      navigate(`/profile/${username}`);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h2>Leave a Review for {username}</h2>
      {error && <Alert variant="danger">{error}</Alert>}
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
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </Form.Group>
      <Button type="submit">Submit Review</Button>
      <Button variant="secondary" onClick={() => navigate(`/profile/${username}`)}>Cancel</Button>
    </Form>
  );
};

export default ReviewForm;
