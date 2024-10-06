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
import Sidebar from './components/common/Sidebar';
import RightSidebar from './components/common/RightSidebar';
import authService from './services/authService';
import styles from './App.module.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        try {
          const refreshedUser = await authService.refreshUserData();
          setUser(refreshedUser);
          authService.setAuthHeader(refreshedUser.token);
        } catch (error) {
          console.error('Failed to refresh user data:', error);
          await authService.logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Set up axios interceptor
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const newToken = await authService.refreshToken();
            if (newToken) {
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            await authService.logout();
            setUser(null);
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    // Clean up function
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const handleLogin = async (userData) => {
    setUser(userData);
    authService.setAuthHeader(userData.token);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className={styles.App}>
        <Header user={user} onLogout={handleLogout} />
        <main className={styles.Main}>
          <Container fluid>
            <Row>
              <Col md={3} className={styles.leftSidebar}>
                <Sidebar user={user} />
              </Col>
              <Col md={6} className={styles.mainContent}>
                <Routes>
                  <Route path="/" element={<PostList user={user} />} />
                  <Route 
                    path="/login" 
                    element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} 
                  />
                  <Route 
                    path="/register" 
                    element={user ? <Navigate to="/" /> : <Register onRegister={handleLogin} />} 
                  />
                  <Route 
                    path="/create-post" 
                    element={user ? <PostForm /> : <Navigate to="/login" />} 
                  />
                  <Route path="/posts/:id" element={<PostDetail user={user} />} />
                  <Route 
                    path="/profile" 
                    element={user ? <UserProfile user={user} /> : <Navigate to="/login" />} 
                  />
                </Routes>
              </Col>
              <Col md={3} className={styles.rightSidebar}>
                <RightSidebar />
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
