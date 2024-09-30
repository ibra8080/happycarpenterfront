import { Link } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = ({ user }) => {
  return (
    <div className={styles.sidebar}>
      <h3>Your Profile</h3>
      <ul className={styles.sidebarList}>
        <li><Link to="/profile">Your profile</Link></li>
        <li><Link to="/your-posts">Your posts</Link></li>
      </ul>
      <h3>You follow</h3>
      <ul className={styles.sidebarList}>
        <li>User 1</li>
        <li>User 2</li>
        <li>User 3</li>
      </ul>
    </div>
  );
};

export default Sidebar;
