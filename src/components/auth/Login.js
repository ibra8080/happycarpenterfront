import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import styles from './Auth.module.css';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userData = await authService.login(credentials.username, credentials.password);
      if (userData) {
        onLogin(userData);
        navigate('/');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data) {
        // Handle specific error messages from the server
        setError(err.response.data.non_field_errors?.[0] || 'An error occurred. Please try again.');
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2>Login</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          value={credentials.username}
          onChange={handleInputChange}
          placeholder="Username"
          required
          className={styles.authInput}
          disabled={isLoading}
        />
        <input
          type="password"
          name="password"
          value={credentials.password}
          onChange={handleInputChange}
          placeholder="Password"
          required
          className={styles.authInput}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className={styles.authButton}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
