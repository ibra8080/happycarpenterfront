import React, { useState, useEffect, useCallback } from 'react';
import { ListGroup, Button, Alert, Form, Image } from 'react-bootstrap';
import axios from 'axios';

const JobOfferList = ({ user }) => {
  const [jobOffers, setJobOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState('');

  const fetchJobOffers = useCallback(async () => {
    console.log('Attempting to fetch job offers');
    try {
      setLoading(true);
      const response = await axios.get('https://happy-carpenter-ebf6de9467cb.herokuapp.com/job-offers/', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      console.log('Job offers response:', response.data);
      if (Array.isArray(response.data)) {
        setJobOffers(response.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        setJobOffers(response.data.results);
      } else {
        console.error('Unexpected API response format:', response.data);
        setError('Unexpected data format received from the server.');
      }
    } catch (error) {
      console.error('Error fetching job offers:', error.response || error);
      setError('Failed to fetch job offers. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user.token]);

  useEffect(() => {
    fetchJobOffers();
  }, [fetchJobOffers]);

  const handleStatusUpdate = async (offerId, newStatus) => {
    try {
      await axios.post(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/job-offers/${offerId}/update-status/`, 
        { status: newStatus, feedback },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchJobOffers();
      setFeedback('');
    } catch (error) {
      console.error('Error updating job offer status:', error);
      setError('Failed to update job offer status. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading job offers...</div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }


  return (
    <div>
      <h2>Your Job Offers</h2>
      {jobOffers.length === 0 ? (
        <Alert variant="info">You don't have any job offers yet.</Alert>
      ) : (
        <ListGroup>
          {jobOffers.map(offer => (
            <ListGroup.Item key={offer.id}>
              <div className="d-flex">
                {offer.advertisement && offer.advertisement.image && (
                  <Image src={offer.advertisement.image} alt={offer.advertisement.title} style={{ width: '100px', height: '100px', objectFit: 'cover', marginRight: '15px' }} />
                )}
                <div>
                  <h5>{offer.title}</h5>
                  <p>{offer.description}</p>
                  <p>Budget: ${offer.budget}</p>
                  <p>Status: <strong>{offer.status}</strong></p>
                  {offer.feedback && <p>Feedback: {offer.feedback}</p>}
                  {offer.advertisement && <p>Related to advertisement: {offer.advertisement.title}</p>}
                  {user.profile.user_type === 'professional' ? (
                    <p>Client: {offer.client}</p>
                  ) : (
                    <p>Professional: {offer.professional}</p>
                  )}
                </div>
              </div>
              {user.profile.user_type === 'professional' && offer.status === 'pending' && (
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Feedback</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={3} 
                      value={feedback} 
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                  </Form.Group>
                  <Button variant="success" onClick={() => handleStatusUpdate(offer.id, 'accepted')}>Accept</Button>
                  <Button variant="danger" onClick={() => handleStatusUpdate(offer.id, 'rejected')}>Reject</Button>
                </Form>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default JobOfferList;