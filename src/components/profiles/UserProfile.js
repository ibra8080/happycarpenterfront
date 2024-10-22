import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Button, Alert, ListGroup, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import styles from './UserProfile.module.css';
import ReviewList from '../professional/ReviewList';
import Follow from '../common/Follow';
import { FaUser, FaBriefcase, FaTools, FaLink, FaTags, FaMapMarkerAlt } from 'react-icons/fa';

const UserProfile = ({ user }) => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState([]);
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

  // Fetch follow data
  const fetchFollowData = useCallback(async (profileId) => {
    if (!user || !user.token || !profileId) return;
    try {
      const [followersResponse] = await Promise.all([
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
      
      // Fetch all profiles in one request
      const profilesResponse = await axios.get('https://happy-carpenter-ebf6de9467cb.herokuapp.com/profiles/', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
  
      const profilesMap = new Map(profilesResponse.data.map(profile => [profile.owner, profile]));
  
      const mapFollowsToProfiles = (follows) => follows.map(follow => ({
        ...follow,
        profile: profilesMap.get(follow.owner) || profilesMap.get(follow.followed) || {}
      }));
  
      setFollowers(mapFollowsToProfiles(followersResponse.data.results));
    } catch (error) {
      setError('Failed to load follow data. Please try again.');
    }
  }, [user, username]);  


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
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, username, fetchFollowData]);

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

  const renderProfileDetail = (icon, label, value) => {
    if (!value) return null;
    return (
      <div className={styles.profileDetail}>
        {icon}
        <span className={styles.detailLabel}>{label}:</span>
        <span className={styles.detailValue}>{value}</span>
      </div>
    );
  };

  const renderFollowList = (list, title) => (
    <div className={styles.followSection}>
      <h5>{title} ({list.length})</h5>
      <ListGroup className={styles.followList}>
        {list.map(follow => (
          <ListGroup.Item key={follow.id} className={styles.followItem}>
            <img 
              src={follow.profile?.image || '/default-avatar.png'} 
              alt={`${follow.owner || follow.followed}'s avatar`} 
              className={styles.followAvatar}
            />
            <Link to={`/profile/${follow.owner || follow.followed}`}>
              {follow.owner || follow.followed}
            </Link>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );

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
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>About</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Profile Image</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={handleImageChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>User Type</Form.Label>
                  <Form.Control
                    as="select"
                    name="user_type"
                    value={formData.user_type}
                    onChange={handleInputChange}
                  >
                    <option value="amateur">Amateur</option>
                    <option value="professional">Professional</option>
                  </Form.Control>
                </Form.Group>
                {formData.user_type === 'professional' && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Years of Experience</Form.Label>
                      <Form.Control
                        type="number"
                        name="years_of_experience"
                        value={formData.years_of_experience}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Specialties</Form.Label>
                      <Form.Control
                        type="text"
                        name="specialties"
                        value={formData.specialties}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Portfolio URL</Form.Label>
                      <Form.Control
                        type="url"
                        name="portfolio_url"
                        value={formData.portfolio_url}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </>
                )}
                <Form.Group className="mb-3">
                  <Form.Label>Interests</Form.Label>
                  <Form.Control
                    type="text"
                    name="interests"
                    value={formData.interests.join(', ')}
                    onChange={handleInterestsChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Button type="submit" className={styles.submitButton} disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="secondary" onClick={() => setEditMode(false)} className={styles.cancelButton}>
                  Cancel
                </Button>
              </Form>
            ) : (
              <>
                {profile.image && (
                  <div className={styles.profileImageContainer}>
                    <img src={profile.image} alt={profile.name} className={styles.profileImage} />
                  </div>
                )}
                <div className={styles.profileInfo}>
                  <Card.Title>{profile.name}</Card.Title>
                  <Card.Text>{profile.content}</Card.Text>
                </div>
                <div className={styles.profileDetails}>
                  {renderProfileDetail(<FaUser />, "User Type", profile.user_type)}
                  {renderProfileDetail(<FaBriefcase />, "Years of Experience", profile.years_of_experience)}
                  {renderProfileDetail(<FaTools />, "Specialties", profile.specialties)}
                  {profile.portfolio_url && renderProfileDetail(<FaLink />, "Portfolio", 
                    <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">{profile.portfolio_url}</a>
                  )}
                  {profile.interests && profile.interests.length > 0 && renderProfileDetail(<FaTags />, "Interests", profile.interests.join(', '))}
                  {renderProfileDetail(<FaMapMarkerAlt />, "Address", profile.address)}
                </div>
                {!profile.user_type && !profile.years_of_experience && !profile.specialties && 
                 !profile.portfolio_url && (!profile.interests || profile.interests.length === 0) && !profile.address && (
                  <p className={styles.noData}>There is no additional profile data to show.</p>
                )}
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
                {renderFollowList(followers, 'Followers')}
              </>
            )
          ) : (
            <Alert variant="warning">Profile not found.</Alert>
          )}
          {profile && profile.user_type === 'professional' && (
            <>
              {user && user.username !== profile.owner && !userHasReviewed && (
                <Link to={`/review/${profile.owner}`}>
                  <Button variant="primary" className={styles.reviewButton}>Leave a Review</Button>
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