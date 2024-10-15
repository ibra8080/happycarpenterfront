import React, { useState, useEffect, useCallback } from 'react';
import { ListGroup, Button, Alert, Form, Image } from 'react-bootstrap';
import axios from 'axios';

const JobOfferList = ({ user, setError, isProfessionalView = false }) => {
  console.log('JobOfferList component mounted', user);
  const [jobOffers, setJobOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localError, setLocalError] = useState(null);
  const [feedback, setFeedback] = useState('');

  const fetchJobOffers = useCallback(async () => {
    console.log('Attempting to fetch job offers');
    try {
      setLoading(true);
      const response = await axios.get('https://happy-carpenter-ebf6de9467cb.herokuapp.com/job-offers/', {
        headers: { Authorization: `Bearer ${user.token}` },
        params: { role: isProfessionalView ? 'professional' : 'client' }
      });
      console.log('Job offers response:', response.data);
      if (Array.isArray(response.data)) {
        setJobOffers(response.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        setJobOffers(response.data.results);
      } else {
        console.error('Unexpected API response format:', response.data);
        setLocalError('Unexpected data format received from the server.');
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching job offers:', error.response || error);
      setLocalError('Failed to fetch job offers. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user.token, setError, isProfessionalView]);

  useEffect(() => {
    console.log('JobOfferList useEffect triggered');
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
      setLocalError('Failed to update job offer status. Please try again.');
    }
  };

  if (loading) return <div>Loading job offers...</div>;
  if (localError) return <Alert variant="danger">{localError}</Alert>;

  return (
    <div>
      <h2>{isProfessionalView ? "Received Job Offers" : "Your Job Offers"}</h2>
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
                  <p>Status: {offer.status}</p>
                  {offer.feedback && <p>Feedback: {offer.feedback}</p>}
                  {offer.advertisement && <p>Related to advertisement: {offer.advertisement.title}</p>}
                  {isProfessionalView ? (
                    <p>Client: {offer.client}</p>
                  ) : (
                    <p>Professional: {offer.professional}</p>
                  )}
                </div>
              </div>
              {isProfessionalView && offer.status === 'pending' && (
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
