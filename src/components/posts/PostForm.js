import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './PostForm.module.css';

const PostForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imageFilter, setImageFilter] = useState('normal');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const imageFilterOptions = [
    'normal', 'furniture', 'antiques', 'renovation&repair', 'artworks', 'tools', 'construction', 'other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) {
      formData.append('image', image);
    }
    formData.append('image_filter', imageFilter);
  
    try {
      const response = await axios.post('https://happy-carpenter-ebf6de9467cb.herokuapp.com/posts/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      console.log('Post created successfully:', response.data);
      setSuccess('Post created successfully!');
      setTimeout(() => {
        navigate('/');
      }, 2000); // Redirect after 2 seconds
    } catch (err) {
      console.error('Error creating post:', err.response ? err.response.data : err.message);
      setError('Failed to create post. Please try again.');
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Content</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Image</Form.Label>
          <Form.Control
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Image Filter</Form.Label>
          <Form.Control 
            as="select" 
            value={imageFilter}
            onChange={(e) => setImageFilter(e.target.value)}
          >
            {imageFilterOptions.map(filter => (
              <option key={filter} value={filter}>{filter}</option>
            ))}
          </Form.Control>
        </Form.Group>
        <Button variant="primary" type="submit">
          Create Post
        </Button>
      </Form>
    </div>
  );
};

export default PostForm;
