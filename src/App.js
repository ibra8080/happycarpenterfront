import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PostList from './components/posts/PostList';
import PostForm from './components/posts/PostForm';
import Sidebar from './components/common/Sidebar';
import RightSidebar from './components/common/RightSidebar';
import authService from './services/authService';
import styles from './App.module.css';

const Home = ({ user }) => (
  <>
    <h1>Welcome to Happy Carpenter</h1>
    {user && <p>Hello, {user.username || 'User'}! You're logged in.</p>}
    <PostList />
  </>
);

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        const refreshedUser = await authService.refreshUserData();
        setUser(refreshedUser);
      }
    };

    fetchUserData();
  }, []);

  const handleLogin = async (userData) => {
    console.log('Login/Register data:', userData);
    const fullUserData = await authService.refreshUserData();
    setUser(fullUserData);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

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
                  <Route path="/" element={<Home user={user} />} />
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
