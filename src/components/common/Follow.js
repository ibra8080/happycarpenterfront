import React, { useState, useCallback } from 'react';
import { Button } from 'react-bootstrap';

const Follow = React.memo(({ targetUserId, currentUser, isFollowing, onFollowChange }) => {
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await onFollowChange(!isFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, isFollowing, onFollowChange]);

  return (
    <Button
      variant={isFollowing ? "outline-primary" : "primary"}
      onClick={handleFollowToggle}
      disabled={loading}
    >
      {loading ? "Processing..." : (isFollowing ? "Unfollow" : "Follow")}
    </Button>
  );
});

export default Follow;
