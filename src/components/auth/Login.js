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
      if (typeof err === 'object' && err !== null) {
        const errorMessages = Object.entries(err)
          .map(([key, value]) => {
            // Remove "non_field_errors: " prefix
            if (key === 'non_field_errors') {
              return Array.isArray(value) ? value.join(', ') : value;
            }
            return `${key}: ${Array.isArray(value) ? value.join(', ') : value}`;
          })
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
      <h2>Login</h2>
      {error && <pre className={styles.error}>{error}</pre>}
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
