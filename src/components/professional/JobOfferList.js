import React, { useState, useEffect, useCallback } from 'react';
import { ListGroup, Button, Alert, Form, Image, Pagination } from 'react-bootstrap';
import axios from 'axios';

const JobOfferList = ({ user }) => {
  const [jobOffers, setJobOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbacks, setFeedbacks] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchJobOffers = useCallback(async (page) => {
    try {
      setLoading(true);
      const response = await axios.get(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/job-offers/?page=${page}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setJobOffers(response.data.results || []);
      setTotalPages(Math.ceil(response.data.count / 10)); // Assuming 10 items per page
      setError(null);
    } catch (error) {
      console.error('Error fetching job offers:', error.response || error);
      setError('Failed to fetch job offers. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user.token]);

  useEffect(() => {
    fetchJobOffers(currentPage);
  }, [fetchJobOffers, currentPage]);

  const handleStatusUpdate = async (offerId, newStatus) => {
    try {
      await axios.post(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/job-offers/${offerId}/update-status/`, 
        { status: newStatus, feedback: feedbacks[offerId] || '' },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchJobOffers(currentPage);
      setFeedbacks(prev => ({ ...prev, [offerId]: '' }));
    } catch (error) {
      console.error('Error updating job offer status:', error);
      setError('Failed to update job offer status. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
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
        <>
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
                    <p>Created on: {formatDate(offer.created_at)}</p>
                    {user.profile.user_type === 'professional' && (
                      <>
                        <p>Status: <strong>{offer.status}</strong></p>
                        {offer.feedback && <p>Feedback: {offer.feedback}</p>}
                        <p>Client: {offer.client}</p>
                      </>
                    )}
                    {user.profile.user_type !== 'professional' && (
                      <p>Professional: {offer.professional}</p>
                    )}
                    {offer.advertisement && <p>Related to advertisement: {offer.advertisement.title}</p>}
                  </div>
                </div>
                {user.profile.user_type === 'professional' && offer.status === 'pending' && (
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Feedback</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={3} 
                        value={feedbacks[offer.id] || ''}
                        onChange={(e) => setFeedbacks(prev => ({ ...prev, [offer.id]: e.target.value }))}
                      />
                    </Form.Group>
                    <Button variant="success" onClick={() => handleStatusUpdate(offer.id, 'accepted')}>Accept</Button>
                    <Button variant="danger" onClick={() => handleStatusUpdate(offer.id, 'rejected')}>Reject</Button>
                  </Form>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
          <Pagination className="mt-3">
            {[...Array(totalPages).keys()].map((number) => (
              <Pagination.Item 
                key={number + 1} 
                active={number + 1 === currentPage}
                onClick={() => setCurrentPage(number + 1)}
              >
                {number + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </>
      )}
    </div>
  );
};

export default JobOfferList;
