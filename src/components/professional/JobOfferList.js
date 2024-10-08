import React, { useState, useEffect, useCallback } from 'react';
import { ListGroup, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const JobOfferList = ({ user, setError }) => {
  const [jobOffers, setJobOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localError, setLocalError] = useState(null);

  const fetchJobOffers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://happy-carpenter-ebf6de9467cb.herokuapp.com/job-offers/', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
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
      console.error('Error fetching job offers:', error);
      setLocalError('Failed to fetch job offers. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user.token, setError]);

  useEffect(() => {
    fetchJobOffers();
  }, [fetchJobOffers]);

  const handleAccept = async (offerId) => {
    try {
      await axios.put(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/job-offers/${offerId}/`, 
        { status: 'accepted' },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchJobOffers();
    } catch (error) {
      console.error('Error accepting job offer:', error);
      setLocalError('Failed to accept job offer. Please try again.');
    }
  };

  const handleReject = async (offerId) => {
    try {
      await axios.put(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/job-offers/${offerId}/`, 
        { status: 'rejected' },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchJobOffers();
    } catch (error) {
      console.error('Error rejecting job offer:', error);
      setLocalError('Failed to reject job offer. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading job offers...</div>;
  }

  if (localError) {
    return <Alert variant="danger">{localError}</Alert>;
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
              <h5>{offer.title}</h5>
              <p>{offer.description}</p>
              <p>Budget: ${offer.budget}</p>
              <p>Status: {offer.status}</p>
              {offer.status === 'pending' && (
                <div>
                  <Button variant="success" onClick={() => handleAccept(offer.id)}>Accept</Button>
                  <Button variant="danger" onClick={() => handleReject(offer.id)}>Reject</Button>
                </div>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default JobOfferList;
