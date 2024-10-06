import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHeart, FaComment, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';
import likeService from '../../services/likeService';
import authService from '../../services/authService';
import styles from './PostList.module.css';
import InfiniteScroll from 'react-infinite-scroll-component';
import ErrorBoundary from '../common/ErrorBoundary';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const user = authService.getCurrentUser();

  const fetchLikedPosts = useCallback(async (newPosts) => {
    if (!user || !user.token) return;
    try {
      const newLikedPosts = {};
      const promises = newPosts.map(async (post) => {
        if (likedPosts[post.id] === undefined) {
          try {
            const likesResponse = await likeService.getLikes(post.id, user.token);
            newLikedPosts[post.id] = likesResponse.results.some(like => like.owner === user.username);
          } catch (error) {
            console.error(`Error fetching likes for post ${post.id}:`, error);
          }
        } else {
          newLikedPosts[post.id] = likedPosts[post.id];
        }
      });
      await Promise.all(promises);
      setLikedPosts(prev => ({ ...prev, ...newLikedPosts }));
    } catch (error) {
      console.error('Error fetching liked posts:', error);
    }
  }, [user, likedPosts]);

  const fetchPosts = useCallback(async () => {
    if (!hasMore) return;
    try {
      setLoading(true);
      const response = await axios.get(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/posts/?page=${page}`);
      const newPosts = response.data.results;
      if (newPosts.length === 0) {
        setHasMore(false);
        setLoading(false);
        return;
      }
      setPosts(prevPosts => [...prevPosts, ...newPosts]);
      setHasMore(!!response.data.next);
      setPage(prevPage => prevPage + 1);
      await fetchLikedPosts(newPosts);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      if (err.response && err.response.status === 404) {
        setHasMore(false);
        if (page === 1) {
          setError('No posts available at the moment.');
        }
      } else {
        setError('Failed to fetch posts. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, fetchLikedPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLike = useCallback(async (postId) => {
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
  }, [user, likedPosts]);

  const formatDate = useCallback((dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }, []);

  const memoizedPosts = useMemo(() => posts.map(post => (
    <Card key={`post-${post.id}`} className={`${styles.postCard} mb-4`}>
      {post.image && (
        <div className={styles.postImageContainer}>
          <Card.Img variant="top" src={post.image} alt={post.title} className={styles.postImage} />
        </div>
      )}
      <Card.Body>
        <div className={styles.postContent}>
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
        </div>
        <div className={styles.readMoreContainer}>
          <Link to={`/posts/${post.id}`} className={styles.readMoreLink}>
            More <FaChevronRight /><FaChevronRight />
          </Link>
        </div>
      </Card.Body>
    </Card>
  )), [posts, likedPosts, handleLike, formatDate]);

  if (loading && posts.length === 0) return <div className={styles.loadingSpinner}>Loading posts...</div>;
  if (error && posts.length === 0) return <div className={styles.error}>{error}</div>;

  return (
    <ErrorBoundary>
      <div className={styles.postListContainer}>
        <InfiniteScroll
          dataLength={posts.length}
          next={fetchPosts}
          hasMore={hasMore}
          loader={<div className={styles.loadingSpinner}>Loading more posts...</div>}
          endMessage={<p className={styles.endMessage}>No more posts to load.</p>}
        >
          {memoizedPosts}
        </InfiniteScroll>
      </div>
    </ErrorBoundary>
  );
};

export default PostList;
