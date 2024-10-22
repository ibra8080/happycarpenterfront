import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PostList from './components/posts/PostList';
import PostDetail from './components/posts/PostDetail';
import PostForm from './components/posts/PostForm';
import UserProfile from './components/profiles/UserProfile';
import ProfessionalDashboard from './components/professional/ProfessionalDashboard';
import JobOfferForm from './components/professional/JobOfferForm';
import JobOfferList from './components/professional/JobOfferList';
import Sidebar from './components/common/Sidebar';
import ReviewForm from './components/reviews/ReviewForm';
import authService from './services/authService';
import styles from './App.module.css';
import AdvertisementSidebar from './components/common/AdvertisementSidebar';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [followers, setFollowers] = useState([]);


  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.initializeAuth();
        console.log('Initialized user in App:', currentUser);
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setError('Failed to initialize authentication. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    console.log('User state updated in App:', user);
    if (user) {
      console.log('User token:', user.token);
      console.log('User profile:', user.profile);
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      console.error('App-level error:', error);
    }
  }, [error]);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            await authService.refreshToken();
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
              originalRequest.headers['Authorization'] = `Bearer ${currentUser.token}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            authService.logout();
            setUser(null);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchFollowers = async () => {
      if (user && user.token) {
        try {
          const response = await axios.get(`https://happy-carpenter-ebf6de9467cb.herokuapp.com/follows/?owner=${user.username}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setFollowers(response.data.results || []);
        } catch (error) {
          console.error('Error fetching followers:', error);
        }
      }
    };

    fetchFollowers();
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
    authService.setAuthHeader(userData.token);
    setError(null);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className={styles.App}>
        <Header user={user} onLogout={handleLogout} isMobile={isMobile} followers={followers} />
        <main className={styles.Main}>
          <Container fluid>
            <Row>
              {!isMobile && (
                <Col md={3} className={styles.leftSidebar}>
                  <Sidebar user={user} />
                </Col>
              )}
              <Col md={isMobile ? 12 : 6} className={styles.mainContent}>
                <Routes>
                  <Route path="/" element={<PostList user={user} />} />
                  <Route path="/profile/:username" element={<UserProfile user={user} />} />
                  <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
                  <Route path="/register" element={user ? <Navigate to="/" /> : <Register onRegister={handleLogin} />} />
                  <Route path="/create-post" element={user ? <PostForm /> : <Navigate to="/login" />} />
                  <Route path="/posts/:id" element={<PostDetail user={user} />} />
                  <Route 
                    path="/professional-dashboard" 
                    element={user && user.profile && user.profile.user_type === 'professional' 
                      ? <ProfessionalDashboard user={user} /> 
                      : <Navigate to="/" />
                    } 
                  />
                  <Route path="/job-offer/:professionalId/:adId" element={user ? <JobOfferForm user={user} /> : <Navigate to="/login" />} />
                  <Route path="/my-job-offers" element={user ? <JobOfferList user={user} setError={setError} isProfessionalView={false} /> : <Navigate to="/login" />} />
                  <Route path="/review/:username" element={user ? <ReviewForm user={user} /> : <Navigate to="/login" />} />
                </Routes>
              </Col>
              <Col md={3} className={styles.rightSidebar}>
                <AdvertisementSidebar user={user} />
              </Col>
            </Row>
          </Container>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
