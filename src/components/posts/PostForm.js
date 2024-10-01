import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './PostForm.module.css';

const PostForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [imageFilter, setImageFilter] = useState('normal');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const imageFilterOptions = [
    'normal', 'furniture', 'antiques', 'renovation&repair', 'artworks', 'tools', 'construction', 'other'
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://happy-carpenter-ebf6de9467cb.herokuapp.com/categories/');
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          console.error('Unexpected response format for categories:', response.data);
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please try again later.');
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      const newCategoryObject = { id: `new-${Date.now()}`, name: newCategory.trim() };
      setCategories([...categories, newCategoryObject]);
      setSelectedCategories([...selectedCategories, newCategoryObject.id]);
      setNewCategory('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) {
      formData.append('image', image);
    }
    formData.append('image_filter', imageFilter);
  
    // Handle categories
    const categoriesData = selectedCategories.map(categoryId => {
      const category = categories.find(cat => cat.id === categoryId);
      return { name: category.name };
    });
  
    formData.append('categories', JSON.stringify(categoriesData));
  
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
          <Form.Label>Categories</Form.Label>
          <Form.Control 
            as="select" 
            multiple 
            value={selectedCategories}
            onChange={(e) => setSelectedCategories(Array.from(e.target.selectedOptions, option => option.value))}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Add New Category</Form.Label>
          <div className="d-flex">
            <Form.Control
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter new category"
            />
            <Button variant="secondary" onClick={handleAddCategory} className="ml-2">
              Add
            </Button>
          </div>
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
