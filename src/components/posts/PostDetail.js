import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Form } from 'react-bootstrap';
import { FaHeart, FaComment } from 'react-icons/fa';
import axios from 'axios';
import styles from './PostDetail.module.css';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const [postResponse, commentsResponse] = await Promise.all([
          axios.get(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/posts/${id}/`),
          axios.get(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/comments/?post=${id}`)
        ]);
        setPost(postResponse.data);
        setComments(commentsResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch post and comments. Please try again later.');
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [id]);

  const handleLike = async () => {
    try {
      await axios.post('https://happy-carpenter-ebf6de9467cb.herokuapp.com/likes/', { post: id }, { withCredentials: true });
      setPost(prevPost => ({ ...prevPost, likes_count: prevPost.likes_count + 1 }));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://happy-carpenter-ebf6de9467cb.herokuapp.com/comments/', 
        { post: id, content: newComment },
        { withCredentials: true }
      );
      setComments(prevComments => [...prevComments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) return <div>Loading post...</div>;
  if (error) return <div>{error}</div>;
  if (!post) return <div>Post not found.</div>;

  return (
    <div className={styles.postDetailContainer}>
      <Card className={styles.postDetailCard}>
        {post.image && (
          <Card.Img variant="top" src={post.image} alt={post.title} className={styles.postImage} />
        )}
        <Card.Body>
          <Card.Title>{post.title}</Card.Title>
          <Card.Text>{post.content}</Card.Text>
          <div className={styles.postMeta}>
            <span><FaHeart className={styles.icon} /> {post.likes_count || 0}</span>
            <span><FaComment className={styles.icon} /> {comments.length}</span>
          </div>
          <Button variant="primary" onClick={handleLike}>Like</Button>
        </Card.Body>
      </Card>

      <div className={styles.commentsSection}>
        <h3>Comments</h3>
        {comments.map(comment => (
          <Card key={comment.id} className={styles.commentCard}>
            <Card.Body>
              <Card.Text>{comment.content}</Card.Text>
              <Card.Subtitle className="mb-2 text-muted">
                By {comment.owner} on {new Date(comment.created_at).toLocaleString()}
              </Card.Subtitle>
            </Card.Body>
          </Card>
        ))}

        <Form onSubmit={handleAddComment}>
          <Form.Group className="mb-3">
            <Form.Label>Add a comment</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Post Comment
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default PostDetail;
