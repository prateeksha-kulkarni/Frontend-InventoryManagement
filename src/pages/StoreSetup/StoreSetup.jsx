import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import Table from '../../components/Table/Table';
import styles from './StoreSetup.module.css';
import axios from '../../services/axiosConfig';

const StoreSetup = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: ''
  });

  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Table columns configuration (removed 'id', changed 'address' to 'location')
  const columns = [
    { header: 'Store Name', accessor: 'name' },
    { header: 'Address', accessor: 'location' }
  ];

  // Fetch stores on component mount
  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setIsTableLoading(true);
    try {
      const response = await axios.get('/api/stores');
      setStores(response.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setIsTableLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Map 'address' to 'location' for backend
      const payload = {
        name: formData.name,
        location: formData.address
      };

      const response = await axios.post('/api/stores', payload);

      setSuccessMessage(`Store "${formData.name}" has been successfully added.`);

      // Reset form after success
      setFormData({ name: '', address: '' });

      // Refresh store list
      fetchStores();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add store. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className={styles.storeSetupContainer}>
        <div className={styles.storeSetupHeader}>
          <h1>Store Setup</h1>
          <p>Add and manage store locations</p>
        </div>

        <Card className={styles.formCard}>
          <h2 className={styles.sectionTitle}>Add New Store</h2>

          {error && <div className={styles.errorMessage}>{error}</div>}
          {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

          <form onSubmit={handleSubmit} className={styles.storeForm}>
            <Input
                label="Store Name"
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter store name"
            />

            <Input
                label="Address"
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Enter store address"
            />

            <div className={styles.formActions}>
              <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
              >
                {isLoading ? 'Adding...' : 'Add Store'}
              </Button>
            </div>
          </form>
        </Card>

        <Card className={styles.storesCard}>
          <h2 className={styles.sectionTitle}>Existing Stores</h2>
          <Table
              columns={columns}
              data={stores}
              isLoading={isTableLoading}
              emptyMessage="No stores found."
          />
        </Card>
      </div>
  );
};

export default StoreSetup;
