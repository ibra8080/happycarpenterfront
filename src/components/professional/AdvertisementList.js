import React, { useState, useEffect, useCallback } from 'react';
import { Button, Alert, Modal, Image } from 'react-bootstrap';
import axios from 'axios';
import AdvertisementForm from './AdvertisementForm';
import styles from './ProfessionalDashboard.module.css';

const AdvertisementList = ({ user, setError }) => {
  const [advertisements, setAdvertisements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [localError, setLocalError] = useState(null);

  const fetchAdvertisements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://happy-carpenter-ebf6de9467cb.herokuapp.com/advertisements/', {
        headers: { Authorization: `Bearer ${user.token}` },
        params: { professional: user.id }
      });
      console.log('API Response:', response.data);
      if (Array.isArray(response.data)) {
        setAdvertisements(response.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        setAdvertisements(response.data.results);
      } else {
        console.error('Unexpected API response format:', response.data);
        setLocalError('Unexpected data format received from the server.');
        setAdvertisements([]);
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      setLocalError('Failed to fetch advertisements. Please try again later.');
      setAdvertisements([]);
    } finally {
      setLoading(false);
    }
  }, [user.token, user.id, setError]);

  useEffect(() => {
    fetchAdvertisements();
  }, [fetchAdvertisements]);

  const handleCreate = () => {
    setEditingAd(null);
    setShowForm(true);
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setShowForm(true);
  };

  const handleDelete = async (adId) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      try {
        await axios.delete(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/advertisements/${adId}/`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        fetchAdvertisements();
      } catch (error) {
        console.error('Error deleting advertisement:', error);
        const errorMessage = error.response?.data?.detail || error.message;
        setLocalError(`Failed to delete advertisement: ${errorMessage}`);
      }
    }
  };  
  
  const handleFormSubmit = async (adData) => {
    try {
      console.log('Submitting advertisement data:', adData);
      
      let response;
      if (editingAd) {
        // If editing and no new image is provided, don't send the image field
        if (!adData.get('image') || adData.get('image').size === 0) {
          adData.delete('image');
        }
        response = await axios.put(
          `https://happy-carpenter-ebf6de9467cb.herokuapp.com/advertisements/${editingAd.id}/`, 
          adData,
          {
            headers: { 
              Authorization: `Bearer ${user.token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        response = await axios.post(
          'https://happy-carpenter-ebf6de9467cb.herokuapp.com/advertisements/', 
          adData,
          {
            headers: { 
              Authorization: `Bearer ${user.token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }
      console.log('Advertisement submitted:', response.data);
      setShowForm(false);
      fetchAdvertisements();
    } catch (error) {
      console.error('Error submitting advertisement:', error);
      if (error.response && error.response.data) {
        let errorMessage = '';
        if (typeof error.response.data === 'object') {
          errorMessage = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
        } else {
          errorMessage = error.response.data.detail || error.response.data;
        }
        setLocalError(`Failed to submit advertisement:\n${errorMessage}`);
      } else {
        setLocalError(`Failed to submit advertisement: ${error.message}`);
      }
    }
  };
  

  if (loading) {
    return <div>Loading advertisements...</div>;
  }

  if (localError) {
    return <Alert variant="danger">{localError}</Alert>;
  }

  return (
    <div>
      <Button onClick={handleCreate} className="mb-3">Create New Advertisement</Button>
      {advertisements.length === 0 ? (
        <Alert variant="info">You don't have any advertisements yet.</Alert>
      ) : (
        <div className={styles.advertisementGrid}>
          {advertisements.map(ad => (
            <div key={ad.id} className={styles.advertisementCard}>
              {ad.image && (
                <Image 
                  src={ad.image} 
                  alt={ad.title} 
                  className={styles.advertisementImage}
                />
              )}
              <div className={styles.advertisementContent}>
                <h3 className={styles.advertisementTitle}>{ad.title}</h3>
                <p className={styles.advertisementDescription}>{ad.description}</p>
                <p className={styles.advertisementPlace}>Location: {ad.place}</p>
                <div className={styles.advertisementActions}>
                  <Button 
                    variant="outline-primary" 
                    onClick={() => handleEdit(ad)} 
                    className={`${styles.actionButton} ${styles.editButton}`}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    onClick={() => handleDelete(ad.id)}
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal show={showForm} onHide={() => setShowForm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AdvertisementForm onSubmit={handleFormSubmit} initialData={editingAd} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdvertisementList;
