import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHeart, FaComment, FaChevronRight } from 'react-icons/fa';
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
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return <div className={styles.loadingSpinner}>Loading posts...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.postListContainer}>
      {posts.map(post => (
        <Card key={post.id} className={`${styles.postCard} mb-4`}>
          {post.image && (
            <div className={styles.postImageContainer}>
              <Card.Img variant="top" src={post.image} alt={post.title} className={styles.postImage} />
            </div>
          )}
          <Card.Body>
            <div className={styles.postHeader}>
              <Card.Title>{post.title}</Card.Title>
              <div className={styles.postMeta}>
                <span className={styles.postAuthor}>{post.owner}</span>
                <span className={styles.postDate}>{formatDate(post.created_at)}</span>
              </div>
            </div>
            <div className={styles.postStats}>
              <span 
                className={styles.postStat} 
                onClick={() => handleLike(post.id)}
                style={{ cursor: 'pointer' }}
              >
                <FaHeart className={likedPosts[post.id] ? styles.likedIcon : styles.icon} /> 
                {post.likes_count || 0}
              </span>
              <Link to={`/posts/${post.id}`} className={styles.postStat}>
                <FaComment className={styles.icon} /> {post.comments_count || 0}
              </Link>
            </div>
            <Card.Text>{post.content.substring(0, 100)}...</Card.Text>
            <Link to={`/posts/${post.id}`} className={styles.readMoreLink}>
              More <FaChevronRight /><FaChevronRight />
            </Link>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default PostList;
