import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Alert } from 'react-bootstrap';
import AdvertisementList from './AdvertisementList';
import ReviewList from './ReviewList';
import JobOfferList from './JobOfferList';

const ProfessionalDashboard = ({ user }) => {
  console.log('Rendering ProfessionalDashboard', user);
  const [activeTab, setActiveTab] = useState('advertisements');
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Active tab changed:', activeTab);
  }, [activeTab]);

  const handleTabChange = (tab) => {
    console.log('Tab change triggered:', tab);
    setActiveTab(tab);
  };

  const handleReviewStatusChange = (hasReviewed) => {
    console.log('Review status changed:', hasReviewed);
  };

  if (!user || !user.profile || user.profile.user_type !== 'professional') {
    return <Alert variant="danger">Access denied. This dashboard is for professional users only.</Alert>;
  }

  return (
    <Container>
      <h1>Professional Dashboard</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      <Nav variant="tabs" defaultActiveKey="advertisements">
        <Nav.Item>
          <Nav.Link eventKey="advertisements" onClick={() => handleTabChange('advertisements')}>
            Advertisements
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="reviews" onClick={() => handleTabChange('reviews')}>
            Reviews
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="jobOffers" onClick={() => handleTabChange('jobOffers')}>
            Job Offers
          </Nav.Link>
        </Nav.Item>
      </Nav>
      <Row className="mt-3">
        <Col>
          {activeTab === 'advertisements' && (
            <AdvertisementList user={user} setError={setError} />
          )}
          {activeTab === 'reviews' && (
            <ReviewList 
              user={user} 
              setError={setError}
              professionalUsername={user.username}
              onReviewStatusChange={handleReviewStatusChange}
            />
          )}
          {activeTab === 'jobOffers' && (
            <JobOfferList user={user} setError={setError} />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProfessionalDashboard;
