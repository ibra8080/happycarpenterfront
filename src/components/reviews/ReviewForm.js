import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ReviewForm = ({ user, initialReview = null, onSubmitSuccess }) => {
  const [rating, setRating] = useState(initialReview ? initialReview.rating : 5);
  const [content, setContent] = useState(initialReview ? initialReview.content : '');
  const [error, setError] = useState('');
  const [professionalId, setProfessionalId] = useState(null);
  const { username } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialReview) {
      const fetchProfessionalAndCheckReview = async () => {
        try {
          const [profileResponse, reviewResponse] = await Promise.all([
            axios.get(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/profiles/`, {
              headers: { Authorization: `Bearer ${user.token}` }
            }),
            axios.get(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/reviews/?professional=${username}`, {
              headers: { Authorization: `Bearer ${user.token}` }
            })
          ]);

          const professionalProfile = profileResponse.data.find(profile => profile.owner === username);
          if (professionalProfile) {
            setProfessionalId(professionalProfile.id);
          } else {
            setError('Professional not found. Please check the username and try again.');
            return;
          }

          const reviews = reviewResponse.data.results || reviewResponse.data;
          const hasReviewed = reviews.some(review => review.owner === user.username);
          if (hasReviewed) {
            setError('You have already reviewed this professional.');
            navigate(`/profile/${username}`);
          }
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Failed to fetch information. Please try again.');
        }
      };

      fetchProfessionalAndCheckReview();
    }
  }, [username, user.token, user.username, navigate, initialReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let response;
      if (initialReview) {
        // Editing existing review
        response = await axios.put(
          `https://happy-carpenter-ebf6de9467cb.herokuapp.com/reviews/${initialReview.id}/`,
          { 
            rating,
            content
          },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      } else {
        // Creating new review
        response = await axios.post(
          'https://happy-carpenter-ebf6de9467cb.herokuapp.com/reviews/',
          { 
            professional: username,
            rating,
            content
          },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      }
      console.log('Review submitted successfully:', response.data);
      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
      } else {
        navigate(`/profile/${username}`);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      if (err.response && err.response.data.detail === "You have already reviewed this professional.") {
        setError("You have already reviewed this professional.");
        navigate(`/profile/${username}`);
      } else if (err.response) {
        setError(`Failed to submit review: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        setError('Failed to submit review. No response received from server.');
      } else {
        setError(`Failed to submit review: ${err.message}`);
      }
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h2>{initialReview ? 'Edit Review' : `Leave a Review for ${username}`}</h2>
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
      <Button type="submit" disabled={!initialReview && !professionalId}>
        {initialReview ? 'Update Review' : 'Submit Review'}
      </Button>
      <Button variant="secondary" onClick={() => navigate(`/profile/${username}`)}>Cancel</Button>
    </Form>
  );
};

export default ReviewForm;
