import React from 'react';
import styles from './Input.module.css';

const Input = ({
  label,
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder = '',
  error = '',
  required = false,
  disabled = false,
  fullWidth = true,
  className = '',
  ...props
}) => {
  return (
    <div className={`${styles.formGroup} ${fullWidth ? styles.fullWidth : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        {...props}
      />
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

export default Input;