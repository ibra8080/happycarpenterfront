import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';

const Register = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'amateur'
  });
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // TODO: Implement actual registration logic here
    console.log('Registration attempted with:', userData);
    // For now, we'll just redirect to login page
    navigate('/login');
  };

  return (
    <div className={styles.authContainer}>
      <h2>Register</h2>
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
          name="confirmPassword"
          value={userData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Confirm Password"
          required
          className={styles.authInput}
        />
        <select
          name="userType"
          value={userData.userType}
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
