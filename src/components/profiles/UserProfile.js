import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Button, Alert, Image } from 'react-bootstrap';
import axios from 'axios';
import styles from './UserProfile.module.css';
import ReviewList from '../professional/ReviewList';
import { useParams } from 'react-router-dom';

const UserProfile = ({ user }) => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
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

  const fetchProfile = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    try {
      const response = await axios.get('https://happy-carpenter-ebf6de9467cb.herokuapp.com/profiles/', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      console.log('API Response:', response.data);
  
      let userProfile;
      if (Array.isArray(response.data)) {
        userProfile = response.data.find(profile => profile.owner === username);
      } else if (response.data.results && Array.isArray(response.data.results)) {
        userProfile = response.data.results.find(profile => profile.owner === username);
      }
  
      if (!userProfile) {
        throw new Error('Profile not found');
      }
  
      setProfile(userProfile);
      setFormData(userProfile);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [username, user]);  

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, image: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        if (key === 'interests') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key === 'image') {
          if (formData[key] instanceof File) {
            formDataToSend.append(key, formData[key]);
          }
        } else if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      }

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
      if (err.response) {
        console.log('Error response:', err.response.data);
        setError(`Failed to update profile: ${JSON.stringify(err.response.data)}`);
      } else {
        setError('Failed to update profile. Please try again.');
      }
    }
  };

  const isOwnProfile = user && profile && user.username === profile.owner;

  return (
    <div className={styles.profileContainer}>
      <Card>
        <Card.Body>
          {loading ? (
            <p>Loading profile...</p>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : profile ? (
            editMode && isOwnProfile ? (
              <Form onSubmit={handleSubmit}>
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>About</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Profile Image</Form.Label>
                  {profile.image && (
                    <div className={styles.currentImage}>
                      <Image src={profile.image} alt="Current profile" thumbnail />
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => setFormData({...formData, image: null})}
                      >
                        Remove Image
                      </Button>
                    </div>
                  )}
                  <Form.Control
                    type="file"
                    onChange={handleImageChange}
                  />
                </Form.Group>
                <Form.Group>
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
                    <Form.Group>
                      <Form.Label>Years of Experience</Form.Label>
                      <Form.Control
                        type="number"
                        name="years_of_experience"
                        value={formData.years_of_experience}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Specialties</Form.Label>
                      <Form.Control
                        type="text"
                        name="specialties"
                        value={formData.specialties}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                    <Form.Group>
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
                <Form.Group>
                  <Form.Label>Interests</Form.Label>
                  <Form.Control
                    type="text"
                    name="interests"
                    value={formData.interests.join(', ')}
                    onChange={(e) => setFormData({...formData, interests: e.target.value.split(',')})}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Button type="submit" className={styles.submitButton}>Save Changes</Button>
                <Button variant="secondary" onClick={() => setEditMode(false)} className={styles.cancelButton}>Cancel</Button>
              </Form>
            ) : (
              <>
                <Card.Title>{profile.name}</Card.Title>
                <Card.Img src={profile.image} alt={profile.name} className={styles.profileImage} />
                <Card.Text>{profile.content}</Card.Text>
                <p><strong>User Type:</strong> {profile.user_type}</p>
                {profile.user_type === 'professional' && (
                  <>
                    <p><strong>Years of Experience:</strong> {profile.years_of_experience}</p>
                    <p><strong>Specialties:</strong> {profile.specialties}</p>
                    <p><strong>Portfolio:</strong> <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">{profile.portfolio_url}</a></p>
                  </>
                )}
                <p><strong>Interests:</strong> {profile.interests.join(', ')}</p>
                <p><strong>Address:</strong> {profile.address}</p>
                {isOwnProfile && (
                  <Button onClick={() => setEditMode(true)} className={styles.editButton}>Edit Profile</Button>
                )}
              </>
            )
          ) : (
            <Alert variant="warning">Profile not found.</Alert>
          )}
          {profile && profile.user_type === 'professional' && user && user.username !== profile.owner && (
            <ReviewList user={user} professionalUsername={profile.owner} setError={setError} />
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default UserProfile;
