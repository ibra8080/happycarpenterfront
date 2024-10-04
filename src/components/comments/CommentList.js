import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import styles from './CommentList.module.css';

const CommentList = ({ comments, postId, user, setComments }) => {
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState('');

  const handleEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditedContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedContent('');
  };

  const handleSaveEdit = async (commentId) => {
    try {
      const response = await axios.put(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/comments/${commentId}/`, 
        { content: editedContent },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId ? response.data : comment
        )
      );
      setEditingCommentId(null);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDelete = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await axios.delete(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/comments/${commentId}/`, 
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  return (
    <div className={styles.commentList}>
      {comments.map(comment => (
        <div key={comment.id} className={styles.commentItem}>
          {editingCommentId === comment.id ? (
            <Form>
              <Form.Group>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  value={editedContent} 
                  onChange={(e) => setEditedContent(e.target.value)} 
                />
              </Form.Group>
              <Button variant="primary" onClick={() => handleSaveEdit(comment.id)} className={styles.actionButton}>Save</Button>
              <Button variant="secondary" onClick={handleCancelEdit} className={styles.actionButton}>Cancel</Button>
            </Form>
          ) : (
            <>
              <p className={styles.commentContent}>{comment.content}</p>
              <div className={styles.commentMeta}>
                <span className={styles.commentAuthor}>{comment.owner}</span>
                <span className={styles.commentDate}>{new Date(comment.created_at).toLocaleString()}</span>
              </div>
              {user && user.username === comment.owner && (
                <div className={styles.commentActions}>
                  <Button variant="outline-primary" onClick={() => handleEdit(comment)} className={styles.actionButton}><FaEdit /> Edit</Button>
                  <Button variant="outline-danger" onClick={() => handleDelete(comment.id)} className={styles.actionButton}><FaTrash /> Delete</Button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentList;
