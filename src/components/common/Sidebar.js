import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './Sidebar.module.css';

const Sidebar = ({ user }) => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFollowing = async () => {
      if (!user || !user.token) {
        setFollowing([]);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/follows/?owner=${user.username}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        
        // Fetch profile details for each followed user
        const followingWithProfiles = await Promise.all(
          response.data.results.map(async (follow) => {
            const profileResponse = await axios.get(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/profiles/`, {
              headers: { Authorization: `Bearer ${user.token}` }
            });
            const userProfile = profileResponse.data.find(profile => profile.owner === follow.followed);
            return { ...follow, profile: userProfile };
          })
        );

        setFollowing(followingWithProfiles);
        setError(null);
      } catch (err) {
        console.error('Error fetching following:', err);
        setError('Failed to load following accounts.');
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [user]);

  if (loading) {
    return <div className={styles.sidebar}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.sidebar}>{error}</div>;
  }

  return (
    <div className={styles.sidebar}>
      <h3>Your Profile</h3>
      <ul className={styles.sidebarList}>
        <li><Link to="/profile">Your profile</Link></li>
        <li><Link to="/your-posts">Your posts</Link></li>
      </ul>
      <h3>You follow</h3>
      <ul className={styles.followingList}>
        {following.length > 0 ? (
          following.map(follow => (
            <li key={follow.id} className={styles.followingItem}>
              <Link to={`/profile/${follow.followed}`}>
                <img 
                  src={follow.profile?.image || '/default-avatar.png'} 
                  alt={`${follow.followed}'s avatar`} 
                  className={styles.followingAvatar}
                />
                <span>{follow.followed}</span>
              </Link>
            </li>
          ))
        ) : (
          <li>You're not following anyone yet.</li>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
