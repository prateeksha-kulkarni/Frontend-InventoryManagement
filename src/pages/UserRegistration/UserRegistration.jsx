import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Key, Plus, X } from 'lucide-react';
import styles from './UserRegistration.module.css';
import axios from '../../services/axiosConfig';

const UserRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    role: '',
    password: '',
    phoneNumber: '',
    email: '',
    stores: [''] // Changed to array for multiple stores
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [stores, setStores] = useState([]);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axios.get('/api/stores');
        setStores(response.data);
      } catch (error) {
        console.error('Error fetching stores:', error);
      }
    };
    fetchStores();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStoreChange = (index, value) => {
    const newStores = [...formData.stores];
    newStores[index] = value;
    setFormData(prev => ({
      ...prev,
      stores: newStores
    }));
  };

  const getAvailableStores = (currentIndex) => {
    // Only filter for analysts with multiple stores
    if (formData.role === 'analyst') {
      const selectedStores = formData.stores.filter((store, index) =>
          index !== currentIndex && store.trim() !== ''
      );
      return stores.filter(store => !selectedStores.includes(store.name));
    }
    // For other roles, return all stores
    return stores;
  };

  const addStore = () => {
    if (formData.role === 'analyst') {
      setFormData(prev => ({
        ...prev,
        stores: [...prev.stores, '']
      }));
    }
  };

  const removeStore = (index) => {
    if (formData.role === 'analyst' && formData.stores.length > 1) {
      const newStores = formData.stores.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        stores: newStores
      }));
    }
  };

  const generatePassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';

    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly (total length: 12)
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    setFormData(prev => ({
      ...prev,
      password: password
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = async () => {
    // First name validation: only letters, no spaces, no special characters, no numbers
    const nameRegex = /^[A-Za-z]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    const phoneRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstName.trim()) {
      setError("First name is required.");
      return false;
    }

    if (!nameRegex.test(formData.firstName.trim())) {
      setError("First name must contain only letters, no spaces, special characters, or numbers.");
      return false;
    }

    // Last name validation (optional but if provided, should not have special characters or spaces)
    if (formData.lastName.trim() && !nameRegex.test(formData.lastName.trim())) {
      setError("Last name must contain only letters, no spaces or special characters.");
      return false;
    }

    if (!formData.username.trim()) {
      setError("Username is required.");
      return false;
    }

    if (!formData.role) {
      setError("Please select a role.");
      return false;
    }

    // Analyst role validation - must have at least 2 stores
    if (formData.role === 'analyst') {
      const validStores = formData.stores.filter(store => store.trim() !== '');
      if (validStores.length < 2) {
        setError("Analyst role requires at least 2 stores to be selected.");
        return false;
      }
    }

    if (!passwordRegex.test(formData.password)) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
      return false;
    }

    if (!phoneRegex.test(formData.phoneNumber)) {
      setError("Phone number must be exactly 10 digits.");
      return false;
    }

    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    // Check for duplicate phone number and email in database
    try {
      const checkRes = await axios.get(`/api/users/check-duplicate`, {
        params: {
          username: formData.username,
          email: formData.email,
          phoneNumber: formData.phoneNumber
        }
      });

      if (checkRes.data.usernameExists) {
        setError('Username already exists.');
        return false;
      }

      if (checkRes.data.emailExists) {
        setError('Email already exists.');
        return false;
      }

      if (checkRes.data.phoneExists) {
        setError('Phone number already exists.');
        return false;
      }
    } catch (err) {
      setError('Error checking for duplicates. Please try again.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    if (!(await validateForm())) {
      setIsLoading(false);
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        name: formData.lastName.trim()
            ? `${formData.firstName} ${formData.lastName}`
            : formData.firstName,
        phone_number: formData.phoneNumber,
        location: formData.role === 'analyst'
            ? formData.stores.filter(store => store.trim() !== '').join(',')
            : formData.stores[0],
        role: formData.role.toUpperCase(),
        stores: formData.stores.filter(store => store.trim() !== '')
      };

      await axios.post('/api/users/register', dataToSubmit);
      setSuccessMessage(`User ${formData.username} has been successfully registered.`);

      // Send email to user (placeholder for actual email service)
      console.log('Email would be sent to:', formData.email);

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        username: '',
        role: '',
        password: '',
        phoneNumber: '',
        email: '',
        stores: ['']
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register user. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className={styles.userRegistrationContainer}>
        <div className={styles.formWrapper}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

          <form onSubmit={handleSubmit} className={styles.registrationForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName">First Name *</label>
                <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Enter first name"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName">Last Name</label>
                <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name (optional)"
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="role">Role</label>
                <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                >
                  <option value="">Select a role</option>
                  <option value="associate">Associate</option>
                  <option value="analyst">Analyst</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <div className={styles.passwordContainer}>
                  <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                  />
                  <button
                      type="button"
                      className={styles.eyeButton}
                      onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>&nbsp;</label>
                <button
                    type="button"
                    className={styles.generatePasswordBtn}
                    onClick={generatePassword}
                >
                  <Key size={16} />
                  Generate password
                </button>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="phoneNumber">Phone number</label>
                <input
                    id="phoneNumber"
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    placeholder="Enter 10-digit phone number"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>
                {formData.role === 'analyst' ? 'Stores (minimum 2 required)' : 'Store'}
              </label>

              {formData.role === 'analyst' ? (
                  // Multiple stores for analyst
                  formData.stores.map((store, index) => (
                      <div key={index} className={styles.storeRow}>
                        <select
                            name={`store-${index}`}
                            value={store}
                            onChange={(e) => handleStoreChange(index, e.target.value)}
                            required={index === 0 || (formData.role === 'analyst' && index === 1)}
                        >
                          <option value="">Select a store</option>
                          {getAvailableStores(index).map(storeOption => (
                              <option key={storeOption.id} value={storeOption.name}>
                                {storeOption.name}
                              </option>
                          ))}
                        </select>

                        {formData.stores.length > 1 && (
                            <button
                                type="button"
                                className={styles.removeStoreBtn}
                                onClick={() => removeStore(index)}
                            >
                              <X size={16} />
                            </button>
                        )}

                        {index === formData.stores.length - 1 && (
                            <button
                                type="button"
                                className={styles.addStoreBtn}
                                onClick={addStore}
                            >
                              <Plus size={16} />
                            </button>
                        )}
                      </div>
                  ))
              ) : (
                  // Single store for associate and manager
                  <select
                      name="store"
                      value={formData.stores[0] || ''}
                      onChange={(e) => handleStoreChange(0, e.target.value)}
                      required
                  >
                    <option value="">Select a store</option>
                    {stores.map(storeOption => (
                        <option key={storeOption.id} value={storeOption.name}>
                          {storeOption.name}
                        </option>
                    ))}
                  </select>
              )}
            </div>

            <div className={styles.submitContainer}>
              <button
                  type="submit"
                  className={styles.registerBtn}
                  disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Register User'}
              </button>

            </div>
          </form>
        </div>
      </div>
  );
};

export default UserRegistration;