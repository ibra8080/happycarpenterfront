import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PostList from './components/posts/PostList';
import Sidebar from './components/common/Sidebar';
import RightSidebar from './components/common/RightSidebar';
import authService from './services/authService';
import styles from './App.module.css';

const Home = ({ user }) => (
  <Row>
    <Col md={3} className={styles.leftSidebar}>
      <Sidebar user={user} />
    </Col>
    <Col md={6} className={styles.mainContent}>
      {user && <p>Hello, {user.username || 'User'}! You're logged in.</p>}
      <PostList />
    </Col>
    <Col md={3} className={styles.rightSidebar}>
      <RightSidebar />
    </Col>
  </Row>
);


function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLogin = (userData) => {
    console.log('Login/Register data:', userData);  
    setUser(userData);
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
            </Routes>
          </Container>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
