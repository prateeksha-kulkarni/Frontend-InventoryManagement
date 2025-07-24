import React from 'react';
import styles from './LeftPanel.module.css';
import logo from '../../assets/images/logo1.jpg';

const LeftPanel = ({ title = "Welcome Back", description = "Access your professional dashboard and manage your account with our secure login portal." }) => {
  return (
    <div className={styles.imageSection}>
      <div className={styles.logoCircle}>
        <img src={logo} alt="Company Logo" className={styles.logoImage} />
      </div>
      <div className={styles.welcomeContent}>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default LeftPanel;
