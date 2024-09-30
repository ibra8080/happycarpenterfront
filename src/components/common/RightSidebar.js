import React from 'react';
import styles from './RightSidebar.module.css';

const RightSidebar = () => {
  return (
    <div className={styles.rightSidebar}>
      <h3>Advertisement</h3>
      <div className={styles.adPlaceholder}>
        Ad space
      </div>
    </div>
  );
};

export default RightSidebar;
