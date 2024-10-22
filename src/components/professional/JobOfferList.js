import React, { useState, useEffect, useCallback } from 'react';
import { ListGroup, Button, Alert, Form, Image, Spinner } from 'react-bootstrap';
import { FaDollarSign, FaClipboardCheck, FaComment, FaUser, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import styles from './JobOfferList.module.css';
import { Link } from 'react-router-dom';


const JobOfferList = ({ user, setError, isProfessionalView = false }) => {
  const [jobOffers, setJobOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localError, setLocalError] = useState(null);
  const [feedback, setFeedback] = useState('');

  const fetchJobOffers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://happy-carpenter-ebf6de9467cb.herokuapp.com/job-offers/', {
        headers: { Authorization: `Bearer ${user.token}` },
        params: { role: isProfessionalView ? 'professional' : 'client' }
      });
      
      
      let offersData = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setJobOffers(offersData);
      setError(null);
    } catch (error) {
      setLocalError('Failed to fetch job offers. Please try again later.');
      setJobOffers([]);
    } finally {
      setLoading(false);
    }
  }, [user.token, setError, isProfessionalView]);

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
      setLocalError('Failed to update job offer status. Please try again.');
    }
  };

  if (loading) return <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>;
  if (localError) return <Alert variant="danger">{localError}</Alert>;

  return (
    <div className={styles.jobOfferListContainer}>
      <h2>{isProfessionalView ? "Received Job Offers" : "Your Job Offers"}</h2>
      {jobOffers.length === 0 ? (
        <Alert variant="info">You don't have any job offers yet.</Alert>
      ) : (
        <ListGroup>
          {jobOffers.map(offer => (
            <ListGroup.Item key={offer.id} className={styles.offerItem}>
              {offer.advertisement_details && offer.advertisement_details.image && (
                <div className={styles.offerImageContainer}>
                  <Image 
                    src={offer.advertisement_details.image} 
                    alt={offer.advertisement_details.title || 'Advertisement Image'} 
                    className={styles.offerImage}
                  />
                </div>
              )}
              <div className={styles.offerContent}>
                <h5>{offer.title}</h5>
                <p>{offer.description}</p>
                <div className={styles.offerDetails}>
                  <span className={styles.offerDetail}>
                    <FaDollarSign className={styles.icon} /> 
                    <span className={styles.detailLabel}>Budget:</span> 
                    <span className={styles.detailValue}>${offer.budget}</span>
                  </span>
                  <span className={styles.offerDetail}>
                    <FaClipboardCheck className={styles.icon} /> 
                    <span className={styles.detailLabel}>Status:</span> 
                    <span className={styles.detailValue}>{offer.status}</span>
                  </span>
                  {offer.feedback && (
                    <span className={styles.offerDetail}>
                      <FaComment className={styles.icon} /> 
                      <span className={styles.detailLabel}>Feedback:</span> 
                      <span className={styles.detailValue}>{offer.feedback}</span>
                    </span>
                  )}
                  <span className={styles.offerDetail}>
                    <FaUser className={styles.icon} /> 
                    <span className={styles.detailLabel}>
                      {isProfessionalView ? "Client:" : "Professional:"}
                    </span> 
                    <span className={styles.detailValue}>
                      {isProfessionalView ? (
                        <Link to={`/profile/${offer.client.username}`}>
                          {offer.client.username}
                        </Link>
                      ) : (
                        offer.advertisement_details && offer.advertisement_details.owner ? (
                          <Link to={`/profile/${offer.advertisement_details.owner.username}`}>
                            {offer.advertisement_details.owner.username}
                          </Link>
                        ) : (
                          'Unknown'
                        )
                      )}
                    </span>
                  </span>
                  {offer.advertisement_details && offer.advertisement_details.place && (
                    <span className={styles.offerDetail}>
                      <FaMapMarkerAlt className={styles.icon} /> 
                      <span className={styles.detailLabel}>Location:</span> 
                      <span className={styles.detailValue}>{offer.advertisement_details.place}</span>
                    </span>
                  )}
                </div>
                {!offer.advertisement_details?.image && <p className={styles.missingImage}>Advertisement Image: Missing</p>}
              </div>
              {isProfessionalView && offer.status === 'pending' && (
                <Form className={styles.offerActions}>
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
