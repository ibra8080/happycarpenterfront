import React from 'react';
import { Container } from 'react-bootstrap';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <Container>
        <p className={styles.footerText}>&copy; 2023 Happy Carpenter. All rights reserved.</p>
      </Container>
    </footer>
  );
};

export default Footer;