import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';

const Follow = ({ targetUserId, currentUser, onFollowChange }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUser || !targetUserId) return;
      try {
        const response = await axios.get(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/follows/?followed=${targetUserId}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        setIsFollowing(response.data.results.some(follow => follow.owner === currentUser.username));
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    checkFollowStatus();
  }, [currentUser, targetUserId]);

  const handleFollowToggle = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      if (isFollowing) {
        // Find the follow ID first
        const response = await axios.get(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/follows/?followed=${targetUserId}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        const followId = response.data.results.find(follow => follow.owner === currentUser.username)?.id;
        if (followId) {
          await axios.delete(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/follows/${followId}/`, {
            headers: { Authorization: `Bearer ${currentUser.token}` }
          });
        } else {
          throw new Error('Follow relationship not found');
        }
      } else {
        console.log('Sending follow request for user:', targetUserId);
        const response = await axios.post('https://happy-carpenter-ebf6de9467cb.herokuapp.com/follows/', 
          { followed: targetUserId },
          { 
            headers: { 
              Authorization: `Bearer ${currentUser.token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
        console.log('Follow response:', response.data);
      }
      setIsFollowing(!isFollowing);
      if (onFollowChange) {
        onFollowChange(!isFollowing);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser || currentUser.username === targetUserId) return null;

  return (
    <Button
      variant={isFollowing ? "outline-primary" : "primary"}
      onClick={handleFollowToggle}
      disabled={isLoading}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
};

export default Follow;
