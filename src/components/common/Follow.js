import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';

const Follow = ({ targetUserId, currentUser }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const response = await axios.get(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/follows/?followed=${targetUserId}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        setIsFollowing(response.data.results.length > 0);
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    if (currentUser && targetUserId) {
      checkFollowStatus();
    }
  }, [currentUser, targetUserId]);

  const handleFollowToggle = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      if (isFollowing) {
        await axios.delete(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/follows/${targetUserId}/`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
      } else {
        await axios.post('https://happy-carpenter-ebf6de9467cb.herokuapp.com/follows/', 
          { followed: targetUserId },
          { headers: { Authorization: `Bearer ${currentUser.token}` } }
        );
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
    setIsLoading(false);
  };

  return (
    <Button
      variant={isFollowing ? "outline-primary" : "primary"}
      onClick={handleFollowToggle}
      disabled={isLoading || !currentUser || currentUser.id === targetUserId}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
};

export default Follow;
