import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { FaHome, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaPlusSquare } from 'react-icons/fa';
import logo from '../../assets/images/happycarpenterlogo.png';
import styles from './Header.module.css';

const Header = ({ user, onLogout }) => {
  return (
    <Navbar expand="lg" className={styles.navbar}>
      <Container>
        {/* ... existing Navbar.Brand code ... */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className={styles.navLink}><FaHome /> Home</Nav.Link>
            {user ? (
              <>
                <Nav.Link as={Link} to="/create-post" className={styles.navLink}><FaPlusSquare /> Create Post</Nav.Link>
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
