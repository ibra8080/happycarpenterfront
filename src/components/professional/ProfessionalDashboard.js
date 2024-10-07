import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import AdvertisementList from './AdvertisementList';
import ReviewList from './ReviewList';
import JobOfferList from './JobOfferList';

const ProfessionalDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('advertisements');

  return (
    <Container>
      <h1>Professional Dashboard</h1>
      <Nav variant="tabs" defaultActiveKey="advertisements">
        <Nav.Item>
          <Nav.Link eventKey="advertisements" onSelect={() => setActiveTab('advertisements')}>
            Advertisements
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="reviews" onSelect={() => setActiveTab('reviews')}>
            Reviews
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="jobOffers" onSelect={() => setActiveTab('jobOffers')}>
            Job Offers
          </Nav.Link>
        </Nav.Item>
      </Nav>
      <Row className="mt-3">
        <Col>
          {activeTab === 'advertisements' && <AdvertisementList user={user} />}
          {activeTab === 'reviews' && <ReviewList user={user} />}
          {activeTab === 'jobOffers' && <JobOfferList user={user} />}
        </Col>
      </Row>
    </Container>
  );
};

export default ProfessionalDashboard;
