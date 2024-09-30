import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { FaHome, FaSignInAlt, FaUserPlus, FaSignOutAlt } from 'react-icons/fa';
import logo from '../../assets/images/happycarpenterlogo.png';
import styles from './Header.module.css';

const Header = ({ user, onLogout }) => {
  return (
    <Navbar bg="light" expand="lg" className={`mb-3 ${styles.navbar}`}>
      <Container>
        <Navbar.Brand as={Link} to="/" className={styles.navbarBrand}>
          <img
            src={logo}
            height="50"
            className="d-inline-block align-top"
            alt="Happy Carpenter Logo"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className={styles.navLink}><FaHome /> Home</Nav.Link>
            {user ? (
              <>
                <Nav.Link as={Link} to="/profile" className={styles.navLink}>
                  {user.profile_image && (
                    <img 
                      src={user.profile_image} 
                      alt="Profile" 
                      className={styles.profileImage}
                    />
                  )}
                  {user.username || 'User'}
                </Nav.Link>
                <Nav.Link onClick={onLogout} className={styles.navLink}><FaSignOutAlt /> Logout</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className={styles.navLink}><FaSignInAlt /> Login</Nav.Link>
                <Nav.Link as={Link} to="/register" className={styles.navLink}><FaUserPlus /> Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;