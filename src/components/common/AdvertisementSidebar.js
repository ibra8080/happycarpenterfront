import React, { useState, useEffect } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdvertisementSidebar = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const response = await axios.get('https://happy-carpenter-ebf6de9467cb.herokuapp.com/advertisements/');
        console.log('API Response:', response.data);
        setAdvertisements(response.data.results ? response.data.results.slice(0, 5) : []);
      } catch (error) {
        console.error('Error fetching advertisements:', error);
        setError('Failed to fetch advertisements. Please try again later.');
      }
    };

    fetchAdvertisements();
  }, []);

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <h3>Recent Advertisements</h3>
      {advertisements.length === 0 ? (
        <p>No recent advertisements available.</p>
      ) : (
        advertisements.map(ad => (
          <Card key={ad.id} className="mb-3">
            {ad.image && (
              <Card.Img 
                variant="top" 
                src={ad.image}
                alt={ad.title} 
              />
            )}
            <Card.Body>
              <Card.Title>{ad.title}</Card.Title>
              <Card.Text>{ad.description}</Card.Text>
              <Card.Text>{ad.place || 'Location not specified'}</Card.Text>
              <Link to={`/job-offer/${ad.professional.id}/${ad.id}`}>
                <Button variant="primary">Make an Offer</Button>
              </Link>
            </Card.Body>
          </Card>
        ))
      )}
    </div>
  );
};

export default AdvertisementSidebar;
