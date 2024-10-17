import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import styles from './SearchAndFilter.module.css';

const SearchAndFilter = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    categories: '',
    user_type: '',
    image_filter: '',
    ordering: '-created_at'
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ search: searchTerm, ...filters });
  };

  return (
    <Form onSubmit={handleSubmit} className={styles.searchForm}>
      <Row>
        <Col md={6}>
          <Form.Group className={styles.searchInput}>
            <Form.Control
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className={styles.filterSelect}>
            <Form.Control
              as="select"
              name="categories"
              value={filters.categories}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              <option value="furniture">Furniture</option>
              <option value="antiques">Antiques</option>
              <option value="renovation&repair">Renovation & Repair</option>
              <option value="artworks">Artworks</option>
              <option value="tools">Tools</option>
              <option value="construction">Construction</option>
              <option value="other">Other</option>
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          <Form.Group className={styles.filterSelect}>
            <Form.Control
              as="select"
              name="user_type"
              value={filters.user_type}
              onChange={handleFilterChange}
            >
              <option value="">All Users</option>
              <option value="amateur">Amateur</option>
              <option value="professional">Professional</option>
            </Form.Control>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className={styles.filterSelect}>
            <Form.Control
              as="select"
              name="image_filter"
              value={filters.image_filter}
              onChange={handleFilterChange}
            >
              <option value="">All Image Filters</option>
              <option value="normal">Normal</option>
              <option value="furniture">Furniture</option>
              <option value="antiques">Antiques</option>
              <option value="renovation&repair">Renovation & Repair</option>
              <option value="artworks">Artworks</option>
              <option value="tools">Tools</option>
              <option value="construction">Construction</option>
              <option value="other">Other</option>
            </Form.Control>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className={styles.filterSelect}>
            <Form.Control
              as="select"
              name="ordering"
              value={filters.ordering}
              onChange={handleFilterChange}
            >
              <option value="-created_at">Newest First</option>
              <option value="created_at">Oldest First</option>
              <option value="-updated_at">Recently Updated</option>
              <option value="updated_at">Least Recently Updated</option>
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>
      <Button type="submit" className={styles.searchButton}>Apply Filters</Button>
    </Form>
  );
};

export default SearchAndFilter;
