import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaComment, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import likeService from '../../services/likeService';
import authService from '../../services/authService';
import ErrorBoundary from '../common/ErrorBoundary';
import SearchAndFilter from '../common/SearchAndFilter';
import styles from './PostList.module.css';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({});
  const [user] = useState(authService.getCurrentUser());
  const navigate = useNavigate();
  const currentPage = useRef(1);
  const isFetching = useRef(false);

  const fetchPosts = useCallback(async (pageToFetch, shouldAppend = true) => {
    if (isFetching.current) return;
    isFetching.current = true;

    try {
      setLoading(true);
      console.log(`Fetching posts for page ${pageToFetch}, shouldAppend: ${shouldAppend}`);

      const currentUser = authService.getCurrentUser();
      const headers = currentUser ? { Authorization: `Bearer ${currentUser.token}` } : {};
      
      const params = {
        page: pageToFetch.toString(),
        ...searchParams
      };

      Object.keys(params).forEach(key => params[key] === '' && delete params[key]);

      const urlParams = new URLSearchParams(params);
      const url = `https://happy-carpenter-ebf6de9467cb.herokuapp.com/posts/?${urlParams}`;
      
      console.log(`API call URL: ${url}`);
      const response = await axios.get(url, { headers });
      console.log('API Response:', response.data);

      const newPosts = response.data.results;
      console.log(`Fetched ${newPosts.length} new posts for page ${pageToFetch}`);

      if (newPosts.length === 0) {
        console.log('No more posts to fetch');
        setHasMore(false);
      } else {
        setPosts(prevPosts => shouldAppend ? [...prevPosts, ...newPosts] : newPosts);
        setHasMore(!!response.data.next);
        currentPage.current = shouldAppend ? currentPage.current + 1 : 2;
        console.log(`Updated current page to: ${currentPage.current}`);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to fetch posts. Please try again later.');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [searchParams]);

  useEffect(() => {
    currentPage.current = 1;
    fetchPosts(1, false);
  }, [fetchPosts, searchParams]);

  const handleSearch = useCallback((params) => {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== '')
    );
    setSearchParams(filteredParams);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!isFetching.current && hasMore) {
      fetchPosts(currentPage.current);
    }
  }, [fetchPosts, hasMore]);

  const handleLike = useCallback(async (postId) => {
    if (!user || !user.token) {
      navigate('/login');
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
  }, [user, likedPosts, navigate]);

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
              <span className={styles.postAuthor}>
                <Link to={`/profile/${post.owner}`}>{post.owner}</Link>
              </span>
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
  if (error) return <div className={styles.error}>{error}</div>;
  if (!loading && posts.length === 0) return <div className={styles.error}>No posts available.</div>;

  return (
    <ErrorBoundary>
      <div className={styles.postListContainer}>
        <SearchAndFilter onSearch={handleSearch} />
        <InfiniteScroll
          dataLength={posts.length}
          next={handleLoadMore}
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
