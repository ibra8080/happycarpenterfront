import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHeart, FaComment } from 'react-icons/fa';
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
    <div className={styles.postListContainer}>
      {posts.map(post => (
        <Card key={post.id} className={`${styles.postCard} mb-4`}>
          {post.image && (
            <Card.Img variant="top" src={post.image} alt={post.title} className={styles.postImage} />
          )}
          <Card.Body>
            <Card.Title>{post.title}</Card.Title>
            <Card.Text>{post.content.substring(0, 100)}...</Card.Text>
            <div className={styles.postMeta}>
              <span><FaHeart className={styles.icon} /> {post.likes_count || 0}</span>
              <span><FaComment className={styles.icon} /> {post.comments_count || 0}</span>
            </div>
            <Link to={`/posts/${post.id}`}>
              <Button variant="primary">Read More</Button>
            </Link>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default PostList;

