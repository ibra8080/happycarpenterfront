import React, { useState, useEffect, useCallback } from 'react';
import { ListGroup, Button, Modal, Alert, Image } from 'react-bootstrap';
import axios from 'axios';
import AdvertisementForm from './AdvertisementForm';

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
        headers: { Authorization: `Bearer ${user.token}` }
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
  }, [user.token, setError]);

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
        setLocalError('Failed to delete advertisement. Please try again.');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const config = {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      let response;
      if (editingAd) {
        response = await axios.put(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/advertisements/${editingAd.id}/`, formData, config);
      } else {
        response = await axios.post('https://happy-carpenter-ebf6de9467cb.herokuapp.com/advertisements/', formData, config);
      }
      
      console.log('Advertisement submitted successfully:', response.data);
      setShowForm(false);
      fetchAdvertisements();
    } catch (error) {
      console.error('Error submitting advertisement:', error.response ? error.response.data : error);
      setLocalError('Failed to submit advertisement. Please try again.');
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
      <h2>Your Advertisements</h2>
      <Button onClick={handleCreate} className="mb-3">Create New Advertisement</Button>
      {advertisements.length === 0 ? (
        <Alert variant="info">You don't have any advertisements yet.</Alert>
      ) : (
        <ListGroup>
          {advertisements.map(ad => (
            <ListGroup.Item key={ad.id} className="d-flex justify-content-between align-items-center">
              <div>
                <h5>{ad.title}</h5>
                <p>{ad.description}</p>
                {ad.image && (
                  <Image 
                    src={`https://res.cloudinary.com/ds5wgelgc/${ad.image}`} 
                    alt={ad.title} 
                    style={{maxWidth: '200px', maxHeight: '200px'}} 
                  />
                )}
                <p>Place: {ad.place}</p>
              </div>
              <div>
                <Button variant="outline-primary" onClick={() => handleEdit(ad)} className="mr-2">Edit</Button>
                <Button variant="outline-danger" onClick={() => handleDelete(ad.id)}>Delete</Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
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
