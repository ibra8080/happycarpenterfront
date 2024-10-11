import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { FaHome, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaPlusSquare, FaBriefcase, FaClipboardList } from 'react-icons/fa';
import logo from '../../assets/images/happycarpenterlogo.png';
import styles from './Header.module.css';

const Header = ({ user, onLogout }) => {
  console.log('Header user data:', user);

  return (
    <Navbar bg="light" expand="lg" className={`${styles.navbar} fixed-top`}>
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
                <Nav.Link as={Link} to="/create-post" className={styles.navLink}><FaPlusSquare /> Create Post</Nav.Link>
                {user.profile && user.profile.user_type !== 'professional' && (
                  <Nav.Link as={Link} to="/my-job-offers" className={styles.navLink}><FaClipboardList /> My Offers</Nav.Link>
                )}
                {user.profile && user.profile.user_type === 'professional' && (
                  <Nav.Link as={Link} to="/professional-dashboard" className={styles.navLink}>
                    <FaBriefcase /> Pro
                  </Nav.Link>
                )}
                <Nav.Link as={Link} to="/profile" className={styles.navLink}>
                  {user.profile && user.profile.image && (
                    <img 
                      src={user.profile.image}
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
