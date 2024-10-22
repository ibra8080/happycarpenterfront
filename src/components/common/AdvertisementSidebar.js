import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styles from './AdvertisementSidebar.module.css';

const AdvertisementSidebar = ({ user }) => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await axios.get('https://happy-carpenter-ebf6de9467cb.herokuapp.com/advertisements/');
        if (Array.isArray(response.data)) {
          setAds(response.data.slice(0, 5));
        } else if (response.data && Array.isArray(response.data.results)) {
          setAds(response.data.results.slice(0, 5));
        } else {
          setError('Unexpected data format received from the server.');
          setAds([]);
        }
      } catch (err) {
        setError('Failed to load advertisements');
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  if (loading) return <div>Loading advertisements...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.adSidebar}>
      <h3>Recent Ads</h3>
      {ads.length > 0 ? (
        ads.map(ad => (
          <Card key={ad.id} className={styles.adCard}>
            {ad.image && (
              <Image 
                src={ad.image} 
                alt={ad.title} 
                className={styles.adImage}
              />
            )}
            <Card.Body>
              <Card.Title>{ad.title}</Card.Title>
              <Card.Text>{ad.description.substring(0, 50)}...</Card.Text>
              <Card.Text className={styles.location}>Location: {ad.place}</Card.Text>
              {user && (
                <Link to={`/job-offer/${ad.professional.id}/${ad.id}`}>
                  <Button variant="primary" size="sm" className={styles.offerButton}>Make Offer</Button>
                </Link>
              )}
            </Card.Body>
          </Card>
        ))
      ) : (
        <p>No recent advertisements available.</p>
      )}
    </div>
  );
};

export default AdvertisementSidebar;
