import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { FaHome, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaPlusSquare, FaBriefcase, FaClipboardList, FaUserFriends } from 'react-icons/fa';
import logo from '../../assets/images/happycarpenterlogo.png';
import styles from './Header.module.css';

const Header = ({ user, onLogout, isMobile, followers }) => {
  return (
    <Navbar expand="lg" className={`${styles.navbar} fixed-top`}>
      <Container>
        <Navbar.Brand as={Link} to="/" className={styles.navbarBrand}>
          <img
            src={logo}
            height={isMobile ? "30" : "50"}
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
                <Nav.Link as={Link} to="/my-job-offers" className={styles.navLink}><FaClipboardList /> My Offers</Nav.Link>
                {user.profile && user.profile.user_type === 'professional' && (
                  <Nav.Link as={Link} to="/professional-dashboard" className={styles.navLink}>
                    <FaBriefcase /> Pro
                  </Nav.Link>
                )}
                
                <Nav.Link as={Link} to={`/profile/${user.username}`} className={styles.navLink}>
                  {user.profile && user.profile.image && (
                    <img 
                      src={user.profile.image}
                      alt="Profile" 
                      className={styles.profileImage}
                    />
                  )}
                  {user.username || 'User'}
                </Nav.Link>
                {isMobile && (
                  <NavDropdown 
                    title={<><FaUserFriends /> <span className={styles.ifollowText}>I follow</span></>} 
                    id="basic-nav-dropdown" 
                    className={`${styles.navLink} ${styles.followDropdown} ${styles.ifollow}`}
                  >
                    {followers && followers.length > 0 ? (
                      followers.map(follow => (
                        <NavDropdown.Item 
                          key={follow.id} 
                          as={Link} 
                          to={`/profile/${follow.followed}`}
                          className={styles.followItem}
                        >
                          {follow.followed}
                        </NavDropdown.Item>
                      ))
                    ) : (
                      <NavDropdown.Item className={styles.followItem}>You're not following anyone yet.</NavDropdown.Item>
                    )}
                  </NavDropdown>
                )}
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
