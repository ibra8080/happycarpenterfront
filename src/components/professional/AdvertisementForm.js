import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';

const AdvertisementForm = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null,
    place: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
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
    setFormData(prevData => ({
      ...prevData,
      image: e.target.files[0]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
      <Button type="submit">
        {initialData ? 'Update Advertisement' : 'Create Advertisement'}
      </Button>
    </Form>
  );
};

export default AdvertisementForm;
