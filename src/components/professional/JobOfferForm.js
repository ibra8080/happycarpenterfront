import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const JobOfferForm = ({ user }) => {
  const { professionalId, adId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://happy-carpenter-ebf6de9467cb.herokuapp.com/job-offers/', 
        {
          ...formData,
          professional: professionalId,
          advertisement: adId
        },
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );
      navigate('/'); // Redirect to home page after successful submission
    } catch (error) {
      setError('Failed to submit job offer. Please try again.');
      console.error('Error submitting job offer:', error);
    }
  };

  if (!user) {
    return <Alert variant="warning">Please log in to make a job offer.</Alert>;
  }

  return (
    <Form onSubmit={handleSubmit}>
      <h2>Make a Job Offer</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group className="mb-3">
        <Form.Label>Title</Form.Label>
        <Form.Control 
          type="text" 
          name="title" 
          value={formData.title} 
          onChange={handleChange} 
          required 
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control 
          as="textarea" 
          rows={3} 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          required 
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Budget</Form.Label>
        <Form.Control 
          type="number" 
          name="budget" 
          value={formData.budget} 
          onChange={handleChange} 
          required 
        />
      </Form.Group>
      <Button variant="primary" type="submit">
        Submit Job Offer
      </Button>
    </Form>
  );
};

export default JobOfferForm;
