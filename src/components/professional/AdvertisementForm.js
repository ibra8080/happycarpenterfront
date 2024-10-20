import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

const AdvertisementForm = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null,
    place: ''
  });
  const [error, setError] = useState(null);
  const [isImageValid, setIsImageValid] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        place: initialData.place || '',
        image: null
      });
      setIsImageValid(true); // Assume existing image is valid
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image file too large (max 2MB)');
        setIsImageValid(false);
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Unsupported image format. Use JPG, PNG or GIF.');
        setIsImageValid(false);
        return;
      }
      setFormData(prevData => ({
        ...prevData,
        image: file
      }));
      setError(null);
      setIsImageValid(true);
    } else {
      setIsImageValid(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isImageValid && !initialData) {
      setError('Please select a valid image before submitting.');
      return;
    }
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'image' && formData[key] instanceof File) {
        formDataToSend.append(key, formData[key]);
      } else if (formData[key] !== null && formData[key] !== undefined) {
        formDataToSend.append(key, formData[key]);
      }
    });
    onSubmit(formDataToSend);
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group className="mb-3">
        <Form.Label>Title</Form.Label>
        <Form.Control 
          type="text" 
          name="title" 
          value={formData.title} 
          onChange={handleChange} 
          required 
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control 
          as="textarea" 
          rows={3} 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          required 
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Image</Form.Label>
        <Form.Control 
          type="file" 
          name="image" 
          onChange={handleImageChange} 
          accept="image/jpeg,image/png,image/gif"
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Place</Form.Label>
        <Form.Control 
          type="text" 
          name="place" 
          value={formData.place} 
          onChange={handleChange} 
        />
      </Form.Group>
      <Button type="submit" disabled={!isImageValid && !initialData}>
        {initialData ? 'Update Advertisement' : 'Create Advertisement'}
      </Button>
    </Form>
  );
};

export default AdvertisementForm;
