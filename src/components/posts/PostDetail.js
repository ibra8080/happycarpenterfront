import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import { FaHeart, FaComment } from 'react-icons/fa';
import axios from 'axios';
import styles from './PostDetail.module.css';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/posts/${id}/`);
        setPost(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch post. Please try again later.');
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) return <div>Loading post...</div>;
  if (error) return <div>{error}</div>;
  if (!post) return <div>Post not found.</div>;

  return (
    <Card className={styles.postDetailCard}>
      {post.image && (
        <Card.Img variant="top" src={post.image} alt={post.title} className={styles.postImage} />
      )}
      <Card.Body>
        <Card.Title>{post.title}</Card.Title>
        <Card.Text>{post.content}</Card.Text>
        <div className={styles.postMeta}>
          <span><FaHeart className={styles.icon} /> {post.likes_count || 0}</span>
          <span><FaComment className={styles.icon} /> {post.comments_count || 0}</span>
        </div>
        <Button variant="primary">Like</Button>
      </Card.Body>
    </Card>
  );
};

export default PostDetail;
