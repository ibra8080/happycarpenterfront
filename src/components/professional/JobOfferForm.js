import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const JobOfferForm = ({ user }) => {
  const params = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const professionalId = params.professionalId || (params.object && params.object.id);
    const adId = params.adId;
    console.log('Extracted IDs - professionalId:', professionalId, 'adId:', adId);
  }, [params]);

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
      const professionalId = params.professionalId || (params.object && params.object.id);
      const adId = params.adId;
      
      if (!professionalId || !adId) {
        throw new Error('Missing professional ID or advertisement ID');
      }
  
      const dataToSend = {
        ...formData,
        professional: professionalId,
        advertisement: adId
      };
  
  
      const response = await axios.post(
        'https://happy-carpenter-ebf6de9467cb.herokuapp.com/job-offers/create/', 
        dataToSend,
        {
          headers: { 
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );      
      console.log('Job offer submitted:', response.data);
      navigate('/my-job-offers');
    } catch (error) {  
      const errorMessage = error.response?.data?.detail || 
                           Object.values(error.response?.data || {}).flat().join(', ') ||
                           error.message ||
                           'An error occurred while submitting the job offer.';
      setError(errorMessage);
    }
  };

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
      <Button variant="primary" type="submit">
        Submit Job Offer
      </Button>
    </Form>
  );
};

export default JobOfferForm;
