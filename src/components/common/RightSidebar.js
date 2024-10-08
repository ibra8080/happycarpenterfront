import React from 'react';
import styles from './RightSidebar.module.css';
import AdvertisementSidebar from './AdvertisementSidebar';

const RightSidebar = () => {
  return (
    <div className={styles.rightSidebar}>
      <AdvertisementSidebar />
    </div>
  );
};

export default RightSidebar;
