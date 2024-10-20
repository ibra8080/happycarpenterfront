import React, { useState, useEffect } from 'react';
import { Container, Nav, Alert } from 'react-bootstrap';
import AdvertisementList from './AdvertisementList';
import ReviewList from './ReviewList';
import JobOfferList from './JobOfferList';
import styles from './ProfessionalDashboard.module.css';

const ProfessionalDashboard = ({ user }) => {
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
    <Container className={styles.dashboardContainer}>
      <h1 className={styles.dashboardTitle}>Professional Dashboard</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      <Nav variant="tabs" className={styles.tabNav} defaultActiveKey="advertisements">
        <Nav.Item>
          <Nav.Link 
            eventKey="advertisements" 
            onClick={() => handleTabChange('advertisements')}
            className={activeTab === 'advertisements' ? styles.active : ''}
          >
            Advertisements
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            eventKey="reviews" 
            onClick={() => handleTabChange('reviews')}
            className={activeTab === 'reviews' ? styles.active : ''}
          >
            Reviews
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            eventKey="jobOffers" 
            onClick={() => handleTabChange('jobOffers')}
            className={activeTab === 'jobOffers' ? styles.active : ''}
          >
            Job Offers
          </Nav.Link>
        </Nav.Item>
      </Nav>
      <div className={styles.tabContent}>
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
          <JobOfferList user={user} setError={setError} isProfessionalView={true} />
        )}
      </div>
    </Container>
  );
};

export default ProfessionalDashboard;
