import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import styles from './CommentList.module.css';

const CommentList = ({ comments, postId, user, setComments }) => {
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

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
      const response = await axios.put(
        `https://happy-carpenter-ebf6de9467cb.herokuapp.com/comments/${commentId}/`, 
        { 
          content: editedContent,
          post: postId
        },
        { 
          headers: { 
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId ? response.data : comment
        )
      );
      setEditingCommentId(null);
    } catch (error) {
      console.error('Error updating comment:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  };

  const handleDeleteClick = (commentId) => {
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/comments/${commentToDelete}/`, 
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setComments(prevComments => prevComments.filter(comment => comment.id !== commentToDelete));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting comment:', error);
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
                  <Button variant="outline-primary" onClick={() => handleEdit(comment)} className={styles.actionButton}><FaEdit /> </Button>
                  <Button variant="outline-danger" onClick={() => handleDeleteClick(comment.id)} className={styles.actionButton}><FaTrash /> </Button>
                </div>
              )}
            </>
          )}
        </div>
      ))}

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this comment? This action cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CommentList;
