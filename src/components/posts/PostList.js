import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './PostList.module.css';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('https://happy-carpenter-ebf6de9467cb.herokuapp.com/posts/');
        setPosts(response.data.results);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch posts. Please try again later.');
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Row>
      {posts.map(post => (
        <Col md={4} key={post.id} className="mb-4">
          <Card className={styles.postCard}>
            {post.image && (
              <Card.Img variant="top" src={post.image} alt={post.title} className={styles.postImage} />
            )}
            <Card.Body>
              <Card.Title>{post.title}</Card.Title>
              <Card.Text>{post.content.substring(0, 100)}...</Card.Text>
              <Link to={`/posts/${post.id}`}>
                <Button variant="primary">Read More</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default PostList;
