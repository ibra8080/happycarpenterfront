import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHeart, FaComment } from 'react-icons/fa';
import axios from 'axios';
import likeService from '../../services/likeService';
import authService from '../../services/authService';
import styles from './PostList.module.css';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const user = authService.getCurrentUser();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('https://happy-carpenter-ebf6de9467cb.herokuapp.com/posts/');
        setPosts(response.data.results);
        setLoading(false);

        if (user && user.token) {
          fetchLikedPosts(response.data.results);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to fetch posts. Please try again later.');
        setLoading(false);
      }
    };

    const fetchLikedPosts = async (fetchedPosts) => {
      try {
        const likedPostsData = {};
        for (const post of fetchedPosts) {
          try {
            const likesResponse = await likeService.getLikes(post.id, user.token);
            likedPostsData[post.id] = likesResponse.results.some(like => like.owner === user.username);
          } catch (error) {
            console.error(`Error fetching likes for post ${post.id}:`, error);
            // Continue with other posts even if one fails
          }
        }
        setLikedPosts(likedPostsData);
      } catch (error) {
        console.error('Error fetching liked posts:', error);
      }
    };

    fetchPosts();
  }, [user]);

  const handleLike = async (postId) => {
    if (!user || !user.token) {
      // Redirect to login or show a message
      console.log('User not authenticated. Please log in to like posts.');
      return;
    }

    try {
      if (likedPosts[postId]) {
        await likeService.unlikePost(postId, user.token);
        setLikedPosts(prev => ({ ...prev, [postId]: false }));
        setPosts(prevPosts => prevPosts.map(post => 
          post.id === postId ? { ...post, likes_count: post.likes_count - 1 } : post
        ));
      } else {
        await likeService.likePost(postId, user.token);
        setLikedPosts(prev => ({ ...prev, [postId]: true }));
        setPosts(prevPosts => prevPosts.map(post => 
          post.id === postId ? { ...post, likes_count: post.likes_count + 1 } : post
        ));
      }
    } catch (error) {
      console.error('Error handling like:', error);
      // Optionally set an error state to display to the user
    }
  };

  if (loading) return <div className={styles.loadingSpinner}>Loading posts...</div>;
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
              <Button 
                variant={likedPosts[post.id] ? "danger" : "outline-danger"}
                onClick={() => handleLike(post.id)}
              >
                <FaHeart /> {post.likes_count || 0}
              </Button>
              <Link to={`/posts/${post.id}`}>
                <FaComment className={styles.icon} /> {post.comments_count || 0}
              </Link>
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
