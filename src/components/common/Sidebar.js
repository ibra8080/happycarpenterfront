import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './Sidebar.module.css';

const Sidebar = ({ user }) => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.token) {
        setFollowing([]);
        setLoading(false);
        return;
      }

      try {
        const [followsResponse, profileResponse] = await Promise.all([
          axios.get(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/follows/?owner=${user.username}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          }),
          axios.get(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/profiles/`, {
            headers: { Authorization: `Bearer ${user.token}` }
          })
        ]);

        const userProfile = profileResponse.data.find(profile => profile.owner === user.username);
        if (userProfile) {
          user.profileImage = userProfile.image || '/default-avatar.png';
          user.isProfessional = userProfile.user_type === 'professional';
        }

        const followingWithProfiles = await Promise.all(
          followsResponse.data.results.map(async (follow) => {
            const followedProfile = profileResponse.data.find(profile => profile.owner === follow.followed);
            return { ...follow, profile: followedProfile };
          })
        );

        setFollowing(followingWithProfiles);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div className={styles.sidebar}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.sidebar}>{error}</div>;
  }

  return (
    <div className={styles.sidebar}>
      {user && (
        <>
          <div className={styles.userProfile}>
            <img 
              src={user.profileImage || '/default-avatar.png'} 
              alt={`${user.username}'s avatar`} 
              className={styles.userAvatar}
            />
          </div>
          <ul className={styles.sidebarList}>
            <li><Link to={`/profile/${user.username}`}>My Profile</Link></li>
            <li><Link to="/create-post">Create Post</Link></li>
            <li><Link to="/my-job-offers">My Offers</Link></li>
            {user.isProfessional && (
              <li><Link to="/professional-dashboard">Pro</Link></li>
            )}
          </ul>
        </>
      )}
      <h3>I follow...</h3>
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
