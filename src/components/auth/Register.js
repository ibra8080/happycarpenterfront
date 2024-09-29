import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import styles from './Auth.module.css';

const Register = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    password2: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (userData.password !== userData.password2) {
      setError("Passwords don't match");
      return;
    }

    try {
      const response = await authService.register(userData);
      console.log('Registration successful:', response);
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      if (typeof err === 'object' && err !== null) {
        const errorMessages = Object.entries(err)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        setError(errorMessages);
      } else {
        setError('An error occurred during registration. Please try again.');
      }
    }
  };  

  return (
    <div className={styles.authContainer}>
      <h2>Register</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          value={userData.username}
          onChange={handleInputChange}
          placeholder="Username"
          required
          className={styles.authInput}
        />
        <input
          type="email"
          name="email"
          value={userData.email}
          onChange={handleInputChange}
          placeholder="Email"
          required
          className={styles.authInput}
        />
        <input
          type="password"
          name="password"
          value={userData.password}
          onChange={handleInputChange}
          placeholder="Password"
          required
          className={styles.authInput}
        />
        <input
          type="password"
          name="password2"
          value={userData.password2}
          onChange={handleInputChange}
          placeholder="Confirm Password"
          required
          className={styles.authInput}
        />
        <button type="submit" className={styles.authButton}>Register</button>
      </form>
    </div>
  );
};

export default Register;