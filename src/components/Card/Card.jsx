import React from 'react';
import styles from './Card.module.css';

const Card = ({ 
  children, 
  title, 
  subtitle,
  footer,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  ...props 
}) => {
  return (
    <div className={`${styles.card} ${className}`} {...props}>
      {(title || subtitle) && (
        <div className={`${styles.cardHeader} ${headerClassName}`}>
          {title && <h3 className={styles.cardTitle}>{title}</h3>}
          {subtitle && <div className={styles.cardSubtitle}>{subtitle}</div>}
        </div>
      )}
      <div className={`${styles.cardBody} ${bodyClassName}`}>
        {children}
      </div>
      {footer && (
        <div className={`${styles.cardFooter} ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;