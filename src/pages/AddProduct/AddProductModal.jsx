import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import styles from './AddProductModal.module.css';
import axios from '../../services/axiosConfig';
import { useNavigate } from 'react-router-dom';

function AddProductModal({ isOpen, onClose, storeId, reloadDashboard }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    sku: '',
    threshold: '',
    category: '',
  });

  const [checking, setChecking] = useState(false);
  const [existingStores, setExistingStores] = useState([]);
  const [showTransferPrompt, setShowTransferPrompt] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setForm({ name: '', sku: '', threshold: '', category: '' });
      setError('');
      setShowTransferPrompt(false);
      setExistingStores([]);
    }
  }, [isOpen]);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckAndProceed = async () => {
    setError('');
    setChecking(true);
    try {
      const { sku, threshold } = form;

      const productRes = await axios.get(`/api/products`);
      const matchingProduct = productRes.data.find(
        p => p.sku.trim().toLowerCase() === sku.trim().toLowerCase()
      );

      if (matchingProduct) {
        const inventoryRes = await axios.get(`/api/inventory`);
        console.log("📦 All Inventory Entries:", inventoryRes.data);

        const alreadyExistsInThisStore = inventoryRes.data.some(inv =>
          inv.product?.productId === matchingProduct.productId &&
          inv.store?.storeId === storeId
        );

        if (alreadyExistsInThisStore) {
          setError("This product already exists in this store's inventory.");
          setChecking(false);
          return;
        }

        const otherStores = inventoryRes.data.filter(inv =>
          inv.product?.productId === matchingProduct.productId &&
          inv.store?.storeId !== storeId
        );

        if (otherStores.length > 0) {
          setExistingStores(otherStores);
          setShowTransferPrompt(true);
        } else {
          await axios.post('/api/inventory', {
            product: { productId: matchingProduct.productId },
            store: { storeId },
            minThreshold: parseInt(threshold),
            quantity: 0
          });
          reloadDashboard();
          onClose();
        }
      } else {
        const createdProduct = await axios.post('/api/products', {
          name: form.name,
          sku: form.sku,
          category: form.category,
          description: 'Auto-added from modal'
        });

        await axios.post('/api/inventory', {
          product: { productId: createdProduct.data.productId },
          store: { storeId },
          minThreshold: parseInt(threshold),
          quantity: 0
        });

        reloadDashboard();
        onClose();
      }
    } catch (err) {
      console.error('Error while checking/adding product:', err);
      setError('Something went wrong. Try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleTransfer = (store) => {
    navigate('/transfer', {
      state: {
        productName: store.product.name,
        productId: store.product.productId,
        fromStoreId: store.store.storeId,
        quantity: store.quantity
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={styles.modalContent}
      overlayClassName={styles.modalOverlay}
    >
      <h2 className={styles.heading}>Add New Product</h2>

      <div className={styles.formGroup}>
        <Input name="name" value={form.name} onChange={handleChange} placeholder="Product Name" />
        <Input name="sku" value={form.sku} onChange={handleChange} placeholder="SKU" />
        <Input name="threshold" type="number" value={form.threshold} onChange={handleChange} placeholder="Threshold" />
        <select name="category" value={form.category} onChange={handleChange} className={styles.select}>
          <option value="">Select Category</option>
          <option value="ELECTRONICS">Electronics</option>
          <option value="CLOTHING">Clothing</option>
          <option value="FOOD">Food</option>
          <option value="HOME_GOODS">Home Goods</option>
          <option value="OFFICE_SUPPLIES">Office Supplies</option>
        </select>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {!showTransferPrompt ? (
        <div className={styles.modalActions}>
          <Button variant="primary" onClick={handleCheckAndProceed} disabled={checking}>
            {checking ? 'Checking...' : 'Submit'}
          </Button>
          <Button variant="danger" onClick={onClose}>Cancel</Button>
        </div>
      ) : (
        <div className={styles.transferPrompt}>
          <p>This product exists in other stores. Do you want to transfer?</p>
          {existingStores.map(store => (
            <div key={store.store.storeId} className={styles.transferRow}>
              <span>{store.store.name}</span>
              <span>{store.quantity} units</span>
              <Button
                variant="primary"
                onClick={() => handleTransfer(store)}
              >
                Transfer
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={async () => {
            try {
              const product = await axios.get(`/api/products`);
              const matched = product.data.find(p => p.sku === form.sku);
              await axios.post('/api/inventory', {
                product: { productId: matched.productId },
                store: { storeId },
                minThreshold: parseInt(form.threshold),
                quantity: 0
              });
              reloadDashboard();
              onClose();
            } catch (err) {
              console.error("Error while skipping transfer and creating inventory", err);
              setError("Couldn't skip transfer, try again");
            }
          }}>
            No, Add New Entry
          </Button>
        </div>
      )}
    </Modal>
  );
}

export default AddProductModal;
