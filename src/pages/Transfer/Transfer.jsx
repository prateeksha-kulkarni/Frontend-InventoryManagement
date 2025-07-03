import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import styles from './Transfer.module.css';
import axios from '../../services/axiosConfig';
import authService from '../../services/authService';

const Transfer = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [formData, setFormData] = useState({
    productId: '',
    sourceStoreId: '',
    destinationStoreId: '',
    quantity: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [requestSent, setRequestSent] = useState(false);
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const user = authService.getCurrentUser();
  const currentStoreName = user?.location || '';

  // Fetch products and stores (mock implementation)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get current user and their store name (location)
        const user = authService.getCurrentUser();
        const currentStoreName = user?.location || '';
        // Fetch all stores
        const storesRes = await axios.get('/api/stores');
        setStores(storesRes.data);
        // Find the store object for the user's store
        const sourceStore = storesRes.data.find(
          s => s.name && currentStoreName && s.name.trim().toLowerCase() === currentStoreName.trim().toLowerCase()
        );
        const currentStoreId = sourceStore ? sourceStore.storeId || sourceStore.id : '';
        // Debug logs
        console.log('User location:', currentStoreName);
        console.log('All stores:', storesRes.data);
        console.log('Source store found:', sourceStore);
        console.log('StoreId used for inventory:', currentStoreId);
        // Fetch inventory for the current store (by storeId)
        let inventoryRes = { data: [] };
        if (currentStoreId) {
          inventoryRes = await axios.get(`/api/inventory/store/${currentStoreId}`);
        }
        setInventory(inventoryRes.data);
        // Fetch all products
        const productsRes = await axios.get('/api/products');
        setProducts(productsRes.data);
        // Set current store as default source
        setFormData(prev => ({
          ...prev,
          sourceStoreId: currentStoreId
        }));
        // Fetch pending transfers for this store (as destination)
        fetchPendingTransfers(currentStoreId);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch pending transfers for this store (as destination)
  const fetchPendingTransfers = useCallback(async (storeId) => {
    try {
      const res = await axios.get(`/api/transfers/to/${storeId}?status=REQUESTED`);
      setPendingTransfers(res.data);
    } catch (err) {
      setPendingTransfers([]);
    }
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.productId) {
      newErrors.productId = 'Please select a product';
    }
    
    if (!formData.sourceStoreId) {
      newErrors.sourceStoreId = 'Please select a source store';
    }
    
    if (!formData.destinationStoreId) {
      newErrors.destinationStoreId = 'Please select a destination store';
    }
    
    if (formData.sourceStoreId === formData.destinationStoreId) {
      newErrors.destinationStoreId = 'Source and destination stores cannot be the same';
    }
    
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Please enter a valid quantity';
    }
    
    // Check if quantity is not more than current stock
    if (formData.productId && formData.quantity) {
      const product = availableProducts.find(p => p && p.id && p.id.toString() === formData.productId);
      if (product && parseInt(formData.quantity) > product.currentStock) {
        newErrors.quantity = `Cannot transfer more than current stock (${product.currentStock})`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const payload = {
        product: { productId: formData.productId },
        fromStore: { storeId: formData.sourceStoreId },
        toStore: { storeId: formData.destinationStoreId },
        quantity: formData.quantity,
        status: 'REQUESTED',
        requestedBy: { username: user.username }
      };
      await axios.post('/api/transfers', payload);
      setRequestSent(true);
      fetchPendingTransfers(formData.destinationStoreId);
      setTimeout(() => setRequestSent(false), 3000);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ submit: 'Failed to process transfer request. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (transferId) => {
    try {
      // Fetch the transfer entity
      const res = await axios.get(`/api/transfers/${transferId}`);
      const transfer = res.data;
      transfer.status = 'APPROVED';
      // Ensure only IDs are sent for associations
      const payload = {
        ...transfer,
        fromStore: { storeId: transfer.fromStore?.storeId || transfer.fromStore?.id },
        toStore: { storeId: transfer.toStore?.storeId || transfer.toStore?.id },
        product: { productId: transfer.product?.productId || transfer.product?.id },
        requestedBy: { username: transfer.requestedBy?.username },
        approvedBy: { username: user.username }
      };
      await axios.put(`/api/transfers/${transferId}`, payload);
      fetchPendingTransfers(formData.sourceStoreId);
      alert('Transfer accepted and inventories updated!');
    } catch (err) {
      alert('Failed to accept transfer.');
    }
  };

  // Map inventory to available products for the dropdown
  const availableProducts = Array.isArray(inventory)
    ? inventory.map(inv => ({
        id: inv.product.productId,
        name: inv.product.name,
        sku: inv.product.sku,
        currentStock: inv.quantity
      })).filter(Boolean)
    : [];

  // Add debug logging
  console.log('Inventory:', inventory);
  console.log('Available products:', availableProducts);

  // Get selected product details
  const selectedProduct = formData.productId
    ? availableProducts.find(p => p && p.id && p.id.toString() === formData.productId)
    : null;

  // Get store names
  const getStoreName = (storeId) => {
    if (!storeId) return '';
    const store = stores.find(
      s =>
        (s.id && s.id.toString() === storeId.toString()) ||
        (s.storeId && s.storeId.toString() === storeId.toString())
    );
    return store ? store.name : '';
  };

  return (
    <div className={styles.transferContainer}>
      <div className={styles.transferHeader}>
        <h1>Inter-Store Transfer</h1>
        <p>Transfer products between store locations</p>
      </div>

      <Card className={styles.transferCard}>
        <form onSubmit={handleSubmit} className={styles.transferForm}>
          {errors.submit && <div className={styles.errorMessage}>{errors.submit}</div>}
          
          <div className={styles.formGroup}>
            <label htmlFor="productId" className={styles.label}>Select Product</label>
            <select
              id="productId"
              name="productId"
              value={formData.productId}
              onChange={handleInputChange}
              className={`${styles.select} ${errors.productId ? styles.inputError : ''}`}
              disabled={isLoading}
            >
              <option value="">-- Select a product --</option>
              {availableProducts.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku}) - Available: {product.currentStock}
                </option>
              ))}
            </select>
            {errors.productId && <div className={styles.fieldError}>{errors.productId}</div>}
          </div>

          {selectedProduct && (
            <div className={styles.productDetails}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Selected Product:</span>
                <span className={styles.detailValue}>{selectedProduct.name}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>SKU:</span>
                <span className={styles.detailValue}>{selectedProduct.sku}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Available Stock:</span>
                <span className={styles.detailValue}>{selectedProduct.currentStock}</span>
              </div>
            </div>
          )}

          {selectedProduct && (
            <div className={styles.formGroup}>
              <span className={styles.detailLabel}>Available Quantity:</span>
              <span className={styles.detailValue}>{selectedProduct.currentStock}</span>
            </div>
          )}

          <div className={styles.storeSelectionContainer}>
            <div className={styles.formGroup}>
              <label htmlFor="sourceStoreId" className={styles.label}>Source Store</label>
              <input
                type="text"
                id="sourceStoreId"
                name="sourceStoreId"
                value={getStoreName(formData.sourceStoreId)}
                className={styles.select}
                disabled
              />
              {errors.sourceStoreId && <div className={styles.fieldError}>{errors.sourceStoreId}</div>}
            </div>

            <div className={styles.transferArrow}>
              <span>→</span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="destinationStoreId" className={styles.label}>Destination Store</label>
              <select
                id="destinationStoreId"
                name="destinationStoreId"
                value={formData.destinationStoreId}
                onChange={handleInputChange}
                className={`${styles.select} ${errors.destinationStoreId ? styles.inputError : ''}`}
                disabled={isLoading}
              >
                <option value="">-- Select a destination store --</option>
                {stores.filter(store => store.id !== formData.sourceStoreId && store.storeId !== formData.sourceStoreId).map(store => (
                  <option key={store.id || store.storeId} value={store.id || store.storeId}>
                    {store.name}
                  </option>
                ))}
              </select>
              {errors.destinationStoreId && <div className={styles.fieldError}>{errors.destinationStoreId}</div>}
            </div>
          </div>

          <Input
            label="Quantity to Transfer"
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            required
            min="1"
            placeholder="Enter quantity"
            error={errors.quantity}
            disabled={isLoading}
          />

          <Input
            label="Notes (Optional)"
            type="textarea"
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Enter any additional notes or instructions"
            disabled={isLoading}
          />

          {formData.sourceStoreId && formData.destinationStoreId && formData.productId && formData.quantity && (
            <div className={styles.transferSummary}>
              <h3>Transfer Summary</h3>
              <p>
                Transfer <strong>{formData.quantity}</strong> units of <strong>{selectedProduct?.name}</strong> from <strong>{getStoreName(formData.sourceStoreId)}</strong> to <strong>{getStoreName(formData.destinationStoreId)}</strong>.
              </p>
            </div>
          )}

          <div className={styles.formActions}>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Submit Transfer'}
            </Button>
          </div>
        </form>
        {requestSent && (
          <div className={styles.successMessage}>Request sent!</div>
        )}
        {/* Pending Transfers UI */}
        <div className={styles.pendingTransfersSection}>
          <h3>Pending Transfer Requests to Your Store</h3>
          {pendingTransfers.length === 0 ? (
            <div>No pending requests.</div>
          ) : (
            <ul className={styles.pendingTransfersList}>
              {pendingTransfers.map(tr => (
                <li key={tr.transferId} className={styles.pendingTransferItem}>
                  <div>
                    <strong>Product:</strong> {tr.product?.name || tr.product?.productId}<br/>
                    <strong>Quantity:</strong> {tr.quantity}<br/>
                    <strong>From Store:</strong> {tr.fromStore?.name || tr.fromStore?.storeId}
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => handleAccept(tr.transferId)}
                  >
                    Accept
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Transfer;