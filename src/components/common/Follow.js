import React, { useState, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

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

Follow.propTypes = {
  targetUserId: PropTypes.string.isRequired,
  currentUser: PropTypes.object,
  isFollowing: PropTypes.bool.isRequired,
  onFollowChange: PropTypes.func.isRequired,
};

Follow.displayName = 'Follow';

export default Follow;
