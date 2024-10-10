import React, { useState, useEffect } from 'react';
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
  const [status, setStatus] = useState('pending');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    console.log('professionalId:', professionalId);
    console.log('adId:', adId);
  }, [professionalId, adId]);

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
      const professionalIdInt = parseInt(professionalId, 10);
      const adIdInt = parseInt(adId, 10);
  
      if (isNaN(professionalIdInt) || isNaN(adIdInt)) {
        throw new Error('Invalid professional ID or advertisement ID');
      }
  
      const postData = {
        ...formData,
        professional: professionalIdInt,
        advertisement: adIdInt,
        budget: parseFloat(formData.budget),
        status: status,
        feedback: feedback
      };
      console.log('Submitting data:', postData);
      
      const response = await axios.post('https://happy-carpenter-ebf6de9467cb.herokuapp.com/job-offers/', 
        postData,
        {
          headers: { 
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Job offer submitted successfully:', response.data);
      navigate('/'); // Redirect to home page after successful submission
    } catch (error) {
      console.error('Error submitting job offer:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.detail || 
                           Object.values(error.response?.data || {}).flat().join(', ') ||
                           error.message ||
                           'An error occurred while submitting the job offer.';
      setError(errorMessage);
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
          step="0.01"
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Status</Form.Label>
        <Form.Control 
          as="select" 
          name="status" 
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </Form.Control>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Feedback</Form.Label>
        <Form.Control 
          as="textarea" 
          rows={3} 
          name="feedback" 
          value={feedback} 
          onChange={(e) => setFeedback(e.target.value)} 
        />
      </Form.Group>
      <Button variant="primary" type="submit">
        Submit Job Offer
      </Button>
    </Form>
  );
};

export default JobOfferForm;
