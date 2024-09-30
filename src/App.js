import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import authService from './services/authService';
import styles from './App.module.css';

const Home = ({ user }) => (
  <div>
    <h1>Welcome to Happy Carpenter</h1>
    {user && <p>Hello, {user.username || 'User'}! You're logged in.</p>}
  </div>
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
        <Container className={styles.Main}>
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
        <Footer />
      </div>
    </Router>
  );
}

export default App;