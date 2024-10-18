import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, ProgressBar, Image } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './PostForm.module.css';

const PostForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    image: null,
    content: '',
    image_filter: 'furniture' // Default to 'furniture' since we removed 'normal'
  });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedForm = localStorage.getItem('postFormDraft');
    if (savedForm) {
      const parsedForm = JSON.parse(savedForm);
      setFormData(parsedForm);
      if (parsedForm.image) {
        // We can't store the actual file in localStorage, so we'll just set preview to null here
        setPreview(null);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('postFormDraft', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    if (formData.title.length > 255) {
      setError('Title must be less than 255 characters');
      return false;
    }
    if (formData.content.length < 10) {
      setError('Content must be at least 10 characters long');
      return false;
    }
    if (formData.image && formData.image.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const postData = new FormData();
    postData.append('title', formData.title);
    postData.append('content', formData.content);
    if (formData.image) {
      postData.append('image', formData.image);
    }
    postData.append('image_filter', formData.image_filter);
  
    try {
      const response = await axios.post('https://happy-carpenter-ebf6de9467cb.herokuapp.com/posts/', postData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      console.log('Post created successfully:', response.data);
      setSuccess('Post created successfully!');
      localStorage.removeItem('postFormDraft');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Error creating post:', err.response ? err.response.data : err.message);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.postForm}>
      <h2>Create a New Post</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={255}
          />
          <Form.Text>{formData.title.length}/255</Form.Text>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Image</Form.Label>
          <Form.Control
            type="file"
            name="image"
            onChange={handleChange}
            accept="image/*"
          />
          {preview && (
            <Image 
              src={preview} 
              alt="Preview" 
              fluid 
              className="mt-2" 
              style={{ maxHeight: '200px' }} 
            />
          )}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Work Type</Form.Label>
          <Form.Control 
            as="select" 
            name="image_filter"
            value={formData.image_filter}
            onChange={handleChange}
          >
            <option value="furniture">Furniture</option>
            <option value="antiques">Antiques</option>
            <option value="renovation&repair">Renovation & Repair</option>
            <option value="artworks">Artworks</option>
            <option value="tools">Tools</option>
            <option value="construction">Construction</option>
            <option value="other">Other</option>
          </Form.Control>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Content</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            minLength={10}
          />
          <Form.Text>{formData.content.length} characters (minimum 10)</Form.Text>
        </Form.Group>
        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Creating Post...' : 'Create Post'}
        </Button>
        <Button variant="secondary" onClick={() => navigate(-1)} className="ml-2">
          Cancel
        </Button>
      </Form>
      {isLoading && <ProgressBar animated now={100} className="mt-3" />}
    </div>
  );
};

export default PostForm;
