import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import styles from './Auth.module.css';

const Register = ({ onRegister }) => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password1: '',
    password2: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    if (userData.password1 !== userData.password2) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.register(userData);
      console.log('Registration successful:', response);
      setSuccessMessage('Registration successful! Logging you in...');
      
      // Attempt to log in the user immediately after registration
      try {
        const loginData = await authService.login(userData.username, userData.password1);
        onRegister(loginData);
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } catch (loginErr) {
        console.error('Auto-login failed:', loginErr);
        setError('Registration successful, but auto-login failed. Please log in manually.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (typeof err === 'object' && err !== null) {
        const errorMessages = Object.entries(err)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        setError(errorMessages);
      } else {
        setError(err.toString());
      }
    } finally {
      setIsLoading(false);
    }
  };  

  return (
    <div className={styles.authContainer}>
      <h2>Register</h2>
      {error && <pre className={styles.error}>{error}</pre>}
      {successMessage && <p className={styles.success}>{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          value={userData.username}
          onChange={handleInputChange}
          placeholder="Username"
          required
          className={styles.authInput}
          disabled={isLoading}
        />
        <input
          type="email"
          name="email"
          value={userData.email}
          onChange={handleInputChange}
          placeholder="Email"
          required
          className={styles.authInput}
          disabled={isLoading}
        />
        <input
          type="password"
          name="password1"
          value={userData.password1}
          onChange={handleInputChange}
          placeholder="Password"
          required
          className={styles.authInput}
          disabled={isLoading}
        />
        <input
          type="password"
          name="password2"
          value={userData.password2}
          onChange={handleInputChange}
          placeholder="Confirm Password"
          required
          className={styles.authInput}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className={styles.authButton}
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;
