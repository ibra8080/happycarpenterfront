import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Button, Alert, Image, ListGroup, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import styles from './UserProfile.module.css';
import ReviewList from '../professional/ReviewList';
import Follow from '../common/Follow';

const UserProfile = ({ user }) => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Follow-related state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  // Form-related state
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    image: null,
    user_type: '',
    years_of_experience: '',
    specialties: '',
    portfolio_url: '',
    interests: [],
    address: ''
  });

  const [userHasReviewed, setUserHasReviewed] = useState(false);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    if (!user || !user.token) return;
    setLoading(true);
    try {
      const response = await axios.get('https://happy-carpenter-ebf6de9467cb.herokuapp.com/profiles/', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const userProfile = response.data.find(profile => profile.owner === username);
      if (userProfile) {
        setProfile(userProfile);
        setFormData({
          name: userProfile.name,
          content: userProfile.content,
          user_type: userProfile.user_type,
          years_of_experience: userProfile.years_of_experience,
          specialties: userProfile.specialties,
          portfolio_url: userProfile.portfolio_url,
          interests: userProfile.interests,
          address: userProfile.address
        });
        await fetchFollowData(userProfile.id);
      } else {
        setError('Profile not found');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, username]);

  // Fetch follow data
  const fetchFollowData = useCallback(async (profileId) => {
    if (!user || !user.token || !profileId) return;
    try {
      const [followersResponse, followingResponse, isFollowingResponse] = await Promise.all([
        axios.get(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/follows/?followed=${username}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        }),
        axios.get(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/follows/?owner=${username}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        }),
        axios.get(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/follows/?followed=${username}&owner=${user.username}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
      ]);
      
      setFollowers(followersResponse.data.results || []);
      setFollowing(followingResponse.data.results || []);
      setIsFollowing((isFollowingResponse.data.results || []).length > 0);
    } catch (error) {
      console.error('Error fetching follow data:', error);
      setError('Failed to load follow data. Please try again.');
    }
  }, [user, username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Handle follow/unfollow
  const handleFollowChange = async (newFollowState) => {
    if (!user || !profile) return;
  
    const originalFollowState = isFollowing;
    const originalFollowers = [...followers];
  
    setIsFollowing(newFollowState);
    setFollowers(prev => newFollowState 
      ? [...prev, { owner: user.username }] 
      : prev.filter(f => f.owner !== user.username)
    );
  
    try {
      if (newFollowState) {
        await axios.post('https://happy-carpenter-ebf6de9467cb.herokuapp.com/follows/', 
          { followed: username },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      } else {
        await axios.delete(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/follows/${username}/`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      }
  
      await fetchFollowData(profile.id);
    } catch (error) {
      console.error('Error toggling follow:', error);
      setIsFollowing(originalFollowState);
      setFollowers(originalFollowers);
      if (error.response) {
        if (error.response.status === 404) {
          setError('User not found or you are not following this user.');
        } else if (error.response.status === 400) {
          setError(error.response.data.detail || 'You are not following this user.');
        } else {
          setError(error.response.data.detail || 'An error occurred. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    }
  };

  // Form-related handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleInterestsChange = (e) => {
    const interestsArray = e.target.value.split(',').map(item => item.trim());
    setFormData(prevState => ({ ...prevState, interests: interestsArray }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'interests') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key === 'image' && formData[key] instanceof File) {
          formDataToSend.append(key, formData[key]);
        } else if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await axios.put(
        `https://happy-carpenter-ebf6de9467cb.herokuapp.com/profiles/${profile.id}/`,
        formDataToSend,
        {
          headers: { 
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setProfile(response.data);
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewStatusChange = useCallback((hasReviewed) => {
    setUserHasReviewed(hasReviewed);
  }, []);

  const isOwnProfile = user && user.username === username;

  if (!user) {
    return (
      <div className={styles.profileContainer}>
        <Card>
          <Card.Body>
            <Alert variant="info">
              To view user profiles, please <Link to="/login">sign in</Link>.
            </Alert>
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.profileContainer}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.profileContainer}>
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <Card>
        <Card.Body>
          {profile ? (
            editMode && isOwnProfile ? (
              <Form onSubmit={handleSubmit}>
                {/* Form fields */}
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                {/* ... other form fields ... */}
                <Button type="submit" className={styles.submitButton} disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="secondary" onClick={() => setEditMode(false)} className={styles.cancelButton}>
                  Cancel
                </Button>
              </Form>
            ) : (
              <>
                <Card.Title>{profile.name}</Card.Title>
                {profile.image && (
                  <Card.Img src={profile.image} alt={profile.name} className={styles.profileImage} />
                )}
                <Card.Text>{profile.content}</Card.Text>
                {/* ... display other profile information ... */}
                <div className={styles.profileActions}>
                  {isOwnProfile && (
                    <Button onClick={() => setEditMode(true)} className={styles.editButton}>
                      Edit Profile
                    </Button>
                  )}
                  {!isOwnProfile && user && (
                    <Follow 
                      targetUserId={profile.id}
                      currentUser={user} 
                      isFollowing={isFollowing}
                      onFollowChange={handleFollowChange}
                    />
                  )}
                </div>
                {/* Followers and Following lists */}
                <p>Followers ({followers.length})</p>
                <ListGroup className={styles.followList}>
                  {followers.map(follower => (
                    <ListGroup.Item key={follower.id}>
                      <Link to={`/profile/${follower.owner}`}>{follower.owner}</Link>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <h4>Following ({following.length})</h4>
                <ListGroup className={styles.followList}>
                  {following.map(followed => (
                    <ListGroup.Item key={followed.id}>
                      <Link to={`/profile/${followed.followed}`}>{followed.followed}</Link>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </>
            )
          ) : (
            <Alert variant="warning">Profile not found.</Alert>
          )}
          {profile && profile.user_type === 'professional' && (
            <>
              {user && user.username !== profile.owner && !userHasReviewed && (
                <Link to={`/review/${profile.owner}`}>
                  <Button variant="primary" className="mt-3">Leave a Review</Button>
                </Link>
              )}
              <ReviewList 
                professionalUsername={profile.owner} 
                user={user} 
                onReviewStatusChange={handleReviewStatusChange}
              />
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );  
};

export default UserProfile;
