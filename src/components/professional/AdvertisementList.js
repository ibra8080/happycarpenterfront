import React, { useState, useEffect } from 'react';
import { ListGroup, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import AdvertisementForm from './AdvertisementForm';

const AdvertisementList = ({ user }) => {
  const [advertisements, setAdvertisements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      const response = await axios.get('https://happy-carpenter-ebf6de9467cb.herokuapp.com/advertisements/', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setAdvertisements(response.data);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
    }
  };

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
      }
    }
  };

  const handleFormSubmit = async (adData) => {
    try {
      if (editingAd) {
        await axios.put(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/advertisements/${editingAd.id}/`, adData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      } else {
        await axios.post('https://happy-carpenter-ebf6de9467cb.herokuapp.com/advertisements/', adData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      }
      setShowForm(false);
      fetchAdvertisements();
    } catch (error) {
      console.error('Error submitting advertisement:', error);
    }
  };

  return (
    <div>
      <h2>Your Advertisements</h2>
      <Button onClick={handleCreate} className="mb-3">Create New Advertisement</Button>
      <ListGroup>
        {advertisements.map(ad => (
          <ListGroup.Item key={ad.id} className="d-flex justify-content-between align-items-center">
            <div>
              <h5>{ad.title}</h5>
              <p>{ad.description}</p>
            </div>
            <div>
              <Button variant="outline-primary" onClick={() => handleEdit(ad)} className="mr-2">Edit</Button>
              <Button variant="outline-danger" onClick={() => handleDelete(ad.id)}>Delete</Button>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>

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
