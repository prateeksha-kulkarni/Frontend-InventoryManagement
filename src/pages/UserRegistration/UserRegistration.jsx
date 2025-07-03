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

  // Fetch stores on component mount
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

  // Effect to handle role changes
  useEffect(() => {
    if (formData.role === 'Analyst') {
      // For Analyst role, ensure locations array is initialized
      setFormData(prev => ({
        ...prev,
        location: '', // Clear single location field
      }));
    } else {
      // For other roles, use single location and clear locations array
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

  // Handle new location input change
  const handleNewLocationChange = (e) => {
    setNewLocation(e.target.value);
  };

  // Add a new location to the locations array
  const addLocation = () => {
    if (newLocation === '') return;

    // Check if the location is already in the array
    if (formData.locations.includes(newLocation)) return;

    setFormData(prev => ({
      ...prev,
      locations: [...prev.locations, newLocation]
    }));
    setNewLocation(''); // Clear the input after adding
  };

  // Remove a location from the locations array
  const removeLocation = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    // Validate that Analyst role has at least 2 store assignments
    if (formData.role === 'Analyst' && formData.locations.length < 2) {
      setError('Analyst role requires at least 2 store assignments.');
      setIsLoading(false);
      return;
    }

    try {
      // Prepare data for submission
      const dataToSubmit = { ...formData, role: formData.role.toUpperCase() };
      // For Analyst role, use the locations array
      if (formData.role === 'Analyst') {
        dataToSubmit.location = formData.locations.join(', ');
      }
      const response = await axios.post('/api/users/register', dataToSubmit);
      setSuccessMessage(`User ${formData.username} has been successfully registered.`);

      // Reset form after successful submission
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
          <Input
            label="Username"
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="Enter username"
          />

          <Input
            label="Name"
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter full name"
          />

          <Input
            label="Password"
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter password"
          />

          <div className={styles.formGroup}>
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={styles.selectInput}
              required
            >
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
                <select
                  value={newLocation}
                  onChange={handleNewLocationChange}
                  className={styles.locationInput}
                >
                  <option value="">Select a store</option>
                  {stores.map(store => (
                    <option key={store.id} value={store.name}>
                      {store.name}
                    </option>
                  ))}
                </select>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={addLocation}
                  className={styles.addLocationBtn}
                >
                  Add
                </Button>
              </div>

              {formData.locations.length > 0 && (
                <div className={styles.locationsList}>
                  {formData.locations.map((loc, index) => (
                    <div key={index} className={styles.locationItem}>
                      <span>{loc}</span>
                      <button 
                        type="button" 
                        onClick={() => removeLocation(index)}
                        className={styles.removeLocationBtn}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {formData.locations.length < 2 && (
                <div className={styles.locationError}>
                  At least 2 store assignments are required for Analyst role
                </div>
              )}
            </div>
          ) : (
            <div className={styles.formGroup}>
              <label htmlFor="location">Store Assignment</label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={styles.selectInput}
                required
              >
                <option value="">Select a store</option>
                {stores.map(store => (
                  <option key={store.id} value={store.name}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Input
            label="Phone Number"
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            required
            placeholder="Enter phone number"
          />

          <Input
            label="Email"
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter email address"
          />

          <div className={styles.formActions}>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register User'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UserRegistration;
