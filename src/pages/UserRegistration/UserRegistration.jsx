import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import styles from './UserRegistration.module.css';
import axios from '../../services/axiosConfig';

const UserRegistration = () => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    role: 'Associate',
    location: '',
    locations: [],
    phone_number: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [newLocation, setNewLocation] = useState('');
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

  useEffect(() => {
    if (formData.role === 'Analyst') {
      setFormData(prev => ({
        ...prev,
        location: '',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        locations: [],
      }));
    }
  }, [formData.role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewLocationChange = (e) => {
    setNewLocation(e.target.value);
  };

  const addLocation = () => {
    if (newLocation === '') return;
    if (formData.locations.includes(newLocation)) return;
    setFormData(prev => ({
      ...prev,
      locations: [...prev.locations, newLocation]
    }));
    setNewLocation('');
  };

  const removeLocation = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter((_, index) => index !== indexToRemove)
    }));
  };

  const validateForm = () => {
    const nameRegex = /^[A-Z][a-zA-Z ]*$/;
    const usernameRegex = /^\S+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    const phoneRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nameRegex.test(formData.name.trim())) {
      setError("Name must start with a capital letter and contain only letters and spaces.");
      return false;
    }

    if (!usernameRegex.test(formData.username)) {
      setError("Username must not contain spaces.");
      return false;
    }

    if (!passwordRegex.test(formData.password)) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
      return false;
    }

    if (!phoneRegex.test(formData.phone_number)) {
      setError("Phone number must be exactly 10 digits.");
      return false;
    }

    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    if (formData.role === 'Analyst' && formData.locations.length < 2) {
      setError('Analyst role requires at least 2 store assignments.');
      setIsLoading(false);
      return;
    }

    try {
      // Check for existing username/email
      const checkRes = await axios.get(`/api/users/check-duplicate`, {
        params: {
          username: formData.username,
          email: formData.email
        }
      });

      if (checkRes.data.usernameExists) {
        setError('Username already exists.');
        setIsLoading(false);
        return;
      }

      if (checkRes.data.emailExists) {
        setError('Email already exists.');
        setIsLoading(false);
        return;
      }

      const dataToSubmit = { ...formData, role: formData.role.toUpperCase() };
      if (formData.role === 'Analyst') {
        dataToSubmit.location = formData.locations.join(', ');
      }

      await axios.post('/api/users/register', dataToSubmit);
      setSuccessMessage(`User ${formData.username} has been successfully registered.`);

      setFormData({
        username: '',
        name: '',
        password: '',
        role: 'Associate',
        location: '',
        locations: [],
        phone_number: '',
        email: ''
      });
      setNewLocation('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register user. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className={styles.userRegistrationContainer}>
        <div className={styles.userRegistrationHeader}>
          <h1>User Registration</h1>
          <p>Add new users to the system</p>
        </div>

        <Card className={styles.formCard}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

          <form onSubmit={handleSubmit} className={styles.registrationForm}>
            <Input label="Username" type="text" name="username" value={formData.username} onChange={handleChange} required placeholder="Enter username" />
            <Input label="Name" type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter full name" />
            <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Enter password" />

            <div className={styles.formGroup}>
              <label htmlFor="role">Role</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} className={styles.selectInput} required>
                <option value="Associate">Associate</option>
                <option value="Analyst">Analyst</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {formData.role === 'Analyst' ? (
                <div className={styles.formGroup}>
                  <label>Store Assignments (at least 2 required)</label>
                  <div className={styles.locationInputContainer}>
                    <select value={newLocation} onChange={handleNewLocationChange} className={styles.locationInput}>
                      <option value="">Select a store</option>
                      {stores.map(store => (
                          <option key={store.id} value={store.name}>{store.name}</option>
                      ))}
                    </select>
                    <Button type="button" variant="secondary" onClick={addLocation} className={styles.addLocationBtn}>Add</Button>
                  </div>
                  {formData.locations.length > 0 && (
                      <div className={styles.locationsList}>
                        {formData.locations.map((loc, index) => (
                            <div key={index} className={styles.locationItem}>
                              <span>{loc}</span>
                              <button type="button" onClick={() => removeLocation(index)} className={styles.removeLocationBtn}>✕</button>
                            </div>
                        ))}
                      </div>
                  )}
                  {formData.locations.length < 2 && (
                      <div className={styles.locationError}>At least 2 store assignments are required for Analyst role</div>
                  )}
                </div>
            ) : (
                <div className={styles.formGroup}>
                  <label htmlFor="location">Store Assignment</label>
                  <select id="location" name="location" value={formData.location} onChange={handleChange} className={styles.selectInput} required>
                    <option value="">Select a store</option>
                    {stores.map(store => (
                        <option key={store.id} value={store.name}>{store.name}</option>
                    ))}
                  </select>
                </div>
            )}

            <Input label="Phone Number" type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} required placeholder="Enter phone number" />
            <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter email address" />

            <div className={styles.formActions}>
              <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? 'Registering...' : 'Register User'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
  );
};

export default UserRegistration;
