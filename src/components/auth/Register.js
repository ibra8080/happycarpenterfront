import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import styles from './Auth.module.css';

const Register = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password1: '',
    password2: '',
    user_type: 'amateur'
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
    if (userData.password1 !== userData.password2) {
      setError("Passwords don't match");
      return;
    }
    try {
      await authService.register(userData);
      navigate('/login');
    } catch (err) {
      setError('Failed to register. Please try again.');
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
          name="password1"
          value={userData.password1}
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
        <select
          name="user_type"
          value={userData.user_type}
          onChange={handleInputChange}
          className={styles.authInput}
        >
          <option value="amateur">Amateur</option>
          <option value="professional">Professional</option>
        </select>
        <button type="submit" className={styles.authButton}>Register</button>
      </form>
    </div>
  );
};

export default Register;
