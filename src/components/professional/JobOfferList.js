import React, { useState, useEffect } from 'react';
import { ListGroup, Button } from 'react-bootstrap';
import axios from 'axios';

const JobOfferList = ({ user }) => {
  const [jobOffers, setJobOffers] = useState([]);

  useEffect(() => {
    fetchJobOffers();
  }, []);

  const fetchJobOffers = async () => {
    try {
      const response = await axios.get('https://happy-carpenter-ebf6de9467cb.herokuapp.com/job-offers/', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setJobOffers(response.data);
    } catch (error) {
      console.error('Error fetching job offers:', error);
    }
  };

  const handleAccept = async (offerId) => {
    try {
      await axios.put(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/job-offers/${offerId}/`, 
        { status: 'accepted' },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchJobOffers();
    } catch (error) {
      console.error('Error accepting job offer:', error);
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
    }
  };

  return (
    <div>
      <h2>Your Job Offers</h2>
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
    </div>
  );
};

export default JobOfferList;
