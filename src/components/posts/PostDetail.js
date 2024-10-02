import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Button, Form, Alert } from 'react-bootstrap';
import { FaHeart, FaComment, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import styles from './PostDetail.module.css';

const PostDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentError, setCommentError] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeError, setLikeError] = useState(null);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const [postResponse, commentsResponse, likesResponse] = await Promise.all([
          axios.get(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/posts/${id}/`),
          axios.get(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/comments/?post=${id}`),
          user ? axios.get(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/likes/?post=${id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          }) : Promise.resolve({ data: { results: [] } })
        ]);
        setPost(postResponse.data);
        setComments(commentsResponse.data.results || []);
        setLiked(likesResponse.data.results.some(like => like.owner === user?.username));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching post and comments:', err);
        setError('Failed to fetch post and comments. Please try again later.');
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLikeError(null);
    try {
      if (liked) {
        await axios.delete(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/likes/${id}/`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setLiked(false);
        setPost(prevPost => ({ ...prevPost, likes_count: Math.max((prevPost.likes_count || 0) - 1, 0) }));
      } else {
        await axios.post('https://happy-carpenter-ebf6de9467cb.herokuapp.com/likes/', 
          { post: id },
          { 
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setLiked(true);
        setPost(prevPost => ({ ...prevPost, likes_count: (prevPost.likes_count || 0) + 1 }));
      }
    } catch (error) {
      console.error('Error handling like:', error);
      setLikeError(error.response?.data?.detail || 'An error occurred while processing your like.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setSubmittingComment(true);
    setCommentError(null);
    try {
      const response = await axios.post(
        'https://happy-carpenter-ebf6de9467cb.herokuapp.com/comments/', 
        { 
          post: id, 
          content: newComment,
        },
        { 
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setComments(prevComments => [response.data, ...prevComments]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      if (error.response && error.response.data) {
        setCommentError(Object.values(error.response.data).flat().join(' '));
      } else {
        setCommentError('Failed to add comment. Please try again.');
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  if (loading) return <div className={styles.loadingSpinner}>Loading post...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!post) return <Alert variant="warning">Post not found.</Alert>;

  return (
    <div className={styles.postDetailContainer}>
      <Link to="/" className={styles.backLink}>
        <FaArrowLeft /> Back to Posts
      </Link>
      <Card className={styles.postDetailCard}>
        {post.image && (
          <Card.Img variant="top" src={post.image} alt={post.title} className={styles.postImage} />
        )}
        <Card.Body>
          <Card.Title>{post.title}</Card.Title>
          <Card.Text>{post.content}</Card.Text>
          <div className={styles.postMeta}>
            <Button 
              variant={liked ? "danger" : "outline-danger"} 
              onClick={handleLike}
            >
              <FaHeart /> {post.likes_count || 0}
            </Button>
            <span><FaComment className={styles.icon} /> {comments.length}</span>
          </div>
          {likeError && <Alert variant="danger">{likeError}</Alert>}
        </Card.Body>
      </Card>

      <div className={styles.commentsSection}>
        <h3>Comments</h3>
        {user ? (
          <Form onSubmit={handleAddComment}>
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                required
              />
            </Form.Group>
            {commentError && <Alert variant="danger">{commentError}</Alert>}
            <Button variant="primary" type="submit" disabled={submittingComment}>
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </Button>
          </Form>
        ) : (
          <Alert variant="info">
            Please <Link to="/login">log in</Link> to post a comment.
          </Alert>
        )}
        
        {comments.length > 0 ? (
          comments.map(comment => (
            <Card key={comment.id} className={styles.commentCard}>
              <Card.Body>
                <Card.Text>{comment.content}</Card.Text>
                <Card.Subtitle className="mb-2 text-muted">
                  By {comment.owner || 'Unknown user'} on {formatDate(comment.created_at)}
                </Card.Subtitle>
              </Card.Body>
            </Card>
          ))
        ) : (
          <p className={styles.noComments}>No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default PostDetail;
