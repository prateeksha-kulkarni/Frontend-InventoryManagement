import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import Table from '../../components/Table/Table';
import styles from './StoreSetup.module.css';
import axios from '../../services/axiosConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StoreSetup = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: ''
  });

  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    { header: 'Store Name', accessor: 'name' },
    { header: 'Address', accessor: 'location' }
  ];

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setIsTableLoading(true);
    try {
      const response = await axios.get('/api/stores');
      setStores(response.data);
    } catch (error) {
      toast.error('Failed to fetch stores');
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

    try {
      // ✅ Check if store with the same name already exists
      const checkResponse = await axios.get(`/api/stores/check-name?name=${encodeURIComponent(formData.name.trim())}`);
      if (checkResponse.data.exists) {
        toast.error(`Store "${formData.name}" already exists.`);
        return;
      }

      const payload = { ...formData, location: formData.address };
      delete payload.address;

      const response = await axios.post('/api/stores', payload);
      toast.success(`Store "${formData.name}" added successfully`);

      setFormData({ name: '', address: '' });
      fetchStores();
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add store');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className={styles.storeSetupContainer}>
        <ToastContainer position="top-right" autoClose={3000} />

        <div className={styles.storeSetupHeader}>
          <div>
            <h1>Store Setup</h1>
            <p>Add and manage store locations</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>Add Store</Button>
        </div>

        {/* Existing Stores List */}
        <Card className={styles.storesCard}>
          <h2 className={styles.sectionTitle}>Existing Stores</h2>
          <Table
              columns={columns}
              data={stores}
              isLoading={isTableLoading}
              emptyMessage="No stores found."
          />
        </Card>

        {/* Add Store Modal */}
        {isModalOpen && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <h2>Add New Store</h2>

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
                    <Button type="submit" variant="primary" disabled={isLoading}>
                      {isLoading ? 'Adding...' : 'Add Store'}
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
};

export default StoreSetup;
