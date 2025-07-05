// components/Notification/NotificationIcon.js
import React from 'react';
import { Bell } from 'lucide-react';
import styles from './Notification.module.css';

const Notification = ({ count = 0, onClick }) => (
  <div className={styles.notificationWrapper} onClick={onClick}>
    <Bell className={styles.bellIcon} />
    {count > 0 && <span className={styles.badge}>{count}</span>}
  </div>
);

export default Notification;