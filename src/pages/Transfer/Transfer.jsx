import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import styles from './Transfer.module.css';
import axios from '../../services/axiosConfig';
import authService from '../../services/authService';
import { toast } from 'react-toastify';


const Transfer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [availableStock, setAvailableStock] = useState(null);

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
  const [transferHistory, setTransferHistory] = useState([]);
  const user = authService.getCurrentUser();
  const currentStoreName = user?.location || '';
  const [historyStatus, setHistoryStatus] = useState('All');
  const [historySearch, setHistorySearch] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const rowsPerPage = 10;
  const [productQuery, setProductQuery] = useState('');
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch pending transfers for this store (as destination)
  const fetchPendingTransfers = useCallback(async (storeId) => {
    try {
const res = await axios.get(`/api/transfers/to/${storeId}/dto?status=REQUESTED`);
      setPendingTransfers(res.data);
    } catch (err) {
      setPendingTransfers([]);
    }
  }, []);

  const fetchTransferHistory = useCallback(async (storeId) => {
    try {
      const res = await axios.get(`/api/transfers/history/${storeId}`);
      setTransferHistory(res.data);
    } catch (error) {
      console.error('Failed to fetch transfer history', error);
    }
  }, []);

  const fetchAvailableStockAtStore = async (storeId, productId) => {
  try {
    const res = await axios.get(`/api/inventory/store/${storeId}/product/${productId}`);
    const inventory = res.data;
    setAvailableStock(inventory?.quantity || 0);
  } catch (error) {
    console.error("Error fetching available stock:", error);
    setAvailableStock(0);
  }
};


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
        fetchTransferHistory(currentStoreId);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    // Prefill data if redirected from AddProductModal
    const productId = location.state?.productId;
    if (productId && !selectedProduct) {
      const prod = availableProducts.find(p => p.id === productId);
      if (prod) {
        setSelectedProduct(prod);
      }
    }
  }, [fetchPendingTransfers, fetchTransferHistory]);

  useEffect(() => {
  if (formData.destinationStoreId && formData.productId) {
    fetchAvailableStockAtStore(formData.destinationStoreId, formData.productId);
  } else {
    setAvailableStock(null);
  }
}, [formData.destinationStoreId, formData.productId]);


  useEffect(() => {
    const fetchSuggestions = async () => {
      if (productQuery.length < 2) {
        setProductSuggestions([]);
        return;
      }
      try {
        const res = await axios.get(`/api/products/search?query=${productQuery}`);
        setProductSuggestions(res.data);
      } catch (err) {
        console.error("Product search error", err);
      }
    };
    fetchSuggestions();
  }, [productQuery]);

  useEffect(() => {
    if (location.state) {
      const { productName, quantity, fromStoreId, productId } = location.state;
      if (productName) setProductQuery(productName);
      if (productId) setFormData(prev => ({ ...prev, productId }));
      if (fromStoreId) setFormData(prev => ({ ...prev, destinationStoreId: fromStoreId }));
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
      newErrors.destinationStoreId = 'Please select a store';
    }
    
    if (formData.sourceStoreId === formData.destinationStoreId) {
      newErrors.destinationStoreId = 'Source and destination stores cannot be the same';
    }
    
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Please enter a valid quantity';
    }
    
    // Check if quantity is not more than current stock
    if (formData.productId && formData.quantity) {
      const product = selectedProduct || products.find(p => p && p.id && p.id.toString() === formData.productId);
      if (product && parseInt(formData.quantity) > product.currentStock) {
        newErrors.quantity = `Cannot transfer more than current stock (${product.currentStock})`;
      }
    }
    if (formData.quantity && availableStock !== null && parseInt(formData.quantity) > availableStock) {
  newErrors.quantity = `Cannot request more than available stock (${availableStock}) at ${getStoreName(formData.destinationStoreId)}.`;
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
      toast.success('Transfer request sent successfully');
      setRequestSent(true);
      fetchPendingTransfers(formData.sourceStoreId);
      fetchTransferHistory(formData.sourceStoreId);
      setTimeout(() => setRequestSent(false), 3000);
      document.getElementById('pendingTransfers')?.scrollIntoView({ behavior: 'smooth' });
      // navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to process transfer request');
      setErrors({ submit: 'Failed to process transfer request. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };
  const handleAccept = async (transferId) => {
    try {
      const res = await axios.get(`/api/transfers/${transferId}`);
      const transfer = res.data;
      transfer.status = 'COMPLETED';
      const payload = {
        ...transfer,
        fromStore: { storeId: transfer.fromStore?.storeId || transfer.fromStore?.id },
        toStore: { storeId: transfer.toStore?.storeId || transfer.toStore?.id },
        product: { productId: transfer.product?.productId || transfer.product?.id },
        requestedBy: { username: transfer.requestedBy?.username },
        approvedBy: { username: user.username }
      };
      await axios.put(`/api/transfers/${transferId}`, payload);
      toast.success('Transfer approved and inventory updated');
      fetchPendingTransfers(formData.sourceStoreId);
      fetchTransferHistory(formData.sourceStoreId);
    } catch (err) {
        const errorMessage =
          err.response?.data?.message || 'Failed to accept transfer.';
        alert(errorMessage);
      }
  };

  const handleReject = async (transferId) => {
    try {
      await axios.put(`/api/transfers/${transferId}/reject`);
      alert('Transfer rejected successfully');
      fetchPendingTransfers(formData.sourceStoreId); // Refresh the list
      fetchTransferHistory(formData.sourceStoreId); // Refresh the history
    } catch (err) {
      alert('Failed to reject transfer: ' + (err.response?.data || err.message));
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

  // Helper functions for frontend mapping
  const getProductName = (productId) => {
    if (!productId) return '';
    const product = products.find(
      p =>
        (p.productId && p.productId.toString() === productId.toString()) ||
        (p.id && p.id.toString() === productId.toString())
    );
    if (product) return product.name;
    // Try to get from transfer history
    const historyEntry = transferHistory.find(tr => {
      if (tr.product?.productId && tr.product.productId.toString() === productId.toString()) return true;
      if (tr.product?.id && tr.product.id.toString() === productId.toString()) return true;
      return false;
    });
    return historyEntry?.product?.name || productId;
  };
  const getStoreName = (storeId) => {
    const store = stores.find(s => s.storeId === storeId || s.id === storeId);
    return store ? store.name : storeId;
  };

  // Helper for status badge
  const getStatusBadge = (status) => {
    const colorMap = {
      COMPLETED: '#27ae60',
      REJECTED: '#e74c3c',
      REQUESTED: '#2980d9',
    };
    return (
      <span style={{
        background: colorMap[status] || '#bdc3c7',
        color: '#fff',
        borderRadius: '12px',
        padding: '0.2em 0.7em',
        fontSize: '0.85em',
        fontWeight: 600,
        letterSpacing: '0.03em',
        display: 'inline-block',
      }}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>
    );
  };

  // Sort transfer history by timestamp descending before filtering/pagination
  const sortedTransferHistory = [...transferHistory].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const filteredHistory = sortedTransferHistory.filter(tr => {
    const statusMatch = historyStatus === 'All' || tr.status === historyStatus;
    const search = historySearch.toLowerCase();
    const product = tr.product?.name?.toLowerCase() || '';
    const from = tr.fromStore?.name?.toLowerCase() || '';
    const to = tr.toStore?.name?.toLowerCase() || '';
    return statusMatch && (
      product.includes(search) || from.includes(search) || to.includes(search)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / rowsPerPage);
  const paginatedHistory = filteredHistory.slice((historyPage-1)*rowsPerPage, historyPage*rowsPerPage);

  return (
    <div className={styles.transferContainer}>
      <div className={styles.transferHeader}>
        <h1>Inter-Store Transfer</h1>
        <p>Transfer products between store locations</p>
      </div>

      {/* Transfer Form Card */}
      <Card className={styles.transferCard} style={{ marginBottom: '24px' }}>
        <form onSubmit={handleSubmit} className={styles.transferForm}>
          {errors.submit && <div className={styles.errorMessage}>{errors.submit}</div>}
          
          {/* Product Autocomplete Input */}
          <div className={styles.formGroup} style={{ position: 'relative' }}>
            <label htmlFor="productSearch" className={styles.label}>Search Product</label>
            <input
              type="text"
              id="productSearch"
              name="productSearch"
              value={productQuery}
              onChange={(e) => {
                setProductQuery(e.target.value);
                setSelectedProduct(null); // reset selection
                setFormData(prev => ({ ...prev, productId: '' }));
              }}
              className={styles.input}
              placeholder="Type product name..."
              autoComplete="off"
            />
            {productSuggestions.length > 0 && !selectedProduct && (
              <ul className={styles.suggestionsList}>
                {productSuggestions.map(p => (
                  <li key={p.productId} className={styles.suggestionItem} onClick={() => {
                    setSelectedProduct(p);
                    setProductQuery(p.name);
                    setFormData(prev => ({ ...prev, productId: p.productId }));
                    setProductSuggestions([]);
                  }}>
                    {p.name} ({p.sku})
                  </li>
                ))}
              </ul>
            )}
          </div>

          


          

          <div className={styles.storeSelectionContainer}>
            <div className={styles.formGroup}>
              <label htmlFor="destinationStoreId" className={styles.label}>Requesting From</label>
              <select
                id="destinationStoreId"
                name="destinationStoreId"
                value={formData.destinationStoreId}
                onChange={handleInputChange}
                className={`${styles.select} ${errors.destinationStoreId ? styles.inputError : ''}`}
                disabled={isLoading}
              >
                <option value="">-- Select a store --</option>
                {stores.filter(store => store.id !== formData.sourceStoreId && store.storeId !== formData.sourceStoreId).map(store => (
                  <option key={store.id || store.storeId} value={store.id || store.storeId}>
                    {store.name}
                  </option>
                ))}
              </select>
              {errors.destinationStoreId && <div className={styles.fieldError}>{errors.destinationStoreId}</div>}
            </div>
          </div>

          {selectedProduct && formData.destinationStoreId && (
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
      <span className={styles.detailLabel}>Available Stock at {getStoreName(formData.destinationStoreId)}:</span>
      <span className={styles.detailValue}>{availableStock ?? 'Loading...'}</span>
    </div>
  </div>
)}

          <Input
            label="Required Quantity"
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
                  Requesting <strong>{formData.quantity}</strong> units of <strong>{selectedProduct?.name}</strong> from <strong>{getStoreName(formData.destinationStoreId)}</strong> .
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
              {isLoading ? 'Processing...' : 'Request Transfer'}
            </Button>
          </div>
        </form>
        {requestSent && (
          <div className={styles.successMessage}>Request sent!</div>
        )}
      </Card>

      {/* Pending Requests Card */}
      <Card className={styles.transferCard} style={{ marginBottom: '24px' }}>
        <div id="pendingTransfers" className={styles.pendingTransfersSection}>
          <h3>Pending Requests</h3>
          {pendingTransfers.length === 0 ? (
            <div>No pending requests.</div>
          ) : (
            <ul className={styles.pendingTransfersList}>
              {pendingTransfers.map(tr => (
                <li key={tr.transferId} className={styles.pendingTransferItem}>
                  <div>
                    <strong>Product:</strong> {tr.product?.name || getProductName(tr.product?.productId || tr.productId)}<br/>
                    <strong>Quantity:</strong> {tr.quantity}<br/>
                    <strong>From Store:</strong> {tr.fromStore?.name || getStoreName(tr.fromStoreId)}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => handleAccept(tr.transferId)}
                    >
                      Accept
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => handleReject(tr.transferId)}
                    >
                      Reject
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      {/* Transfer History Card */}
      <Card className={styles.transferCard}>
        <div className={styles.transferHistorySection}>
          <h3>Transfer History</h3>
          {/* Filter & Search Controls */}
          <div className={styles.historyFilterBar}>
            <select value={historyStatus} onChange={e => { setHistoryStatus(e.target.value); setHistoryPage(1); }} className={styles.historySelect}>
              <option value="All">All</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
              <option value="REQUESTED">Requested</option>
            </select>
            <input
              type="text"
              placeholder="Search product or store..."
              value={historySearch}
              onChange={e => { setHistorySearch(e.target.value); setHistoryPage(1); }}
              className={styles.historySearchInput}
            />
          </div>
          {filteredHistory.length === 0 ? (
            <p>No past transfers found.</p>
          ) : (
            <>
              <table className={styles.transferHistoryTable + ' ' + styles.enhancedHistoryTable}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>From Store</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Requested By</th>
                    <th>Approved By</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistory.map((tr) => (
                    <tr key={tr.transferId}>
                      <td>{tr.product?.name}</td>
                      <td>{tr.fromStore?.name}</td>
                      <td>{tr.quantity}</td>
                      <td>{getStatusBadge(tr.status)}</td>
                      <td>{tr.requestedBy?.name || '-'}</td>
                      <td>{tr.approvedBy?.name || '-'}</td>
                      <td>{new Date(tr.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination Controls */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                <Button type="button" variant="outline" disabled={historyPage === 1} onClick={() => setHistoryPage(p => Math.max(1, p-1))}>Prev</Button>
                <span>Page {historyPage} of {totalPages}</span>
                <Button type="button" variant="outline" disabled={historyPage === totalPages} onClick={() => setHistoryPage(p => Math.min(totalPages, p+1))}>Next</Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Transfer;