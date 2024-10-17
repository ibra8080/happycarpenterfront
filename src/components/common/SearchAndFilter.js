import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { ChevronDown } from 'react-bootstrap-icons';
import styles from './SearchAndFilter.module.css';

const SearchAndFilter = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    categories: '',
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
      <Row className="mb-3">
        <Col>
          <Form.Group className={styles.searchInput}>
            <Form.Control
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={3}>
          <Form.Group className={styles.filterSelect}>
            <div className={styles.selectWrapper}>
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
              <ChevronDown className={styles.selectIcon} />
            </div>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className={styles.filterSelect}>
            <div className={styles.selectWrapper}>
              <Form.Control
                as="select"
                name="image_filter"
                value={filters.image_filter}
                onChange={handleFilterChange}
              >
                <option value="">All Images</option>
                <option value="normal">Normal</option>
                <option value="furniture">Furniture</option>
                <option value="antiques">Antiques</option>
                <option value="renovation&repair">Renovation & Repair</option>
                <option value="artworks">Artworks</option>
                <option value="tools">Tools</option>
                <option value="construction">Construction</option>
                <option value="other">Other</option>
              </Form.Control>
              <ChevronDown className={styles.selectIcon} />
            </div>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className={styles.filterSelect}>
            <div className={styles.selectWrapper}>
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
              <ChevronDown className={styles.selectIcon} />
            </div>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Button type="submit" className={styles.searchButton}>Search</Button>
        </Col>
      </Row>
    </Form>
  );
};

export default SearchAndFilter;
