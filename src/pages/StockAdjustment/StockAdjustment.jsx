import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../../services/axiosConfig';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import styles from './StockAdjustment.module.css';

const StockAdjustment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const passedProduct = location.state?.product || null;

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    productName: passedProduct?.name || '',
    adjustmentType: 'add',
    quantity: '',
    reason: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const reasons = {
    add: ['New Shipment', 'Return from Customer', 'Inventory Count Correction', 'Transfer from Another Store', 'Other'],
    remove: ['Sale', 'Damaged', 'Expired', 'Transfer to Another Store', 'Theft/Loss', 'Inventory Count Correction', 'Other']
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Always store quantity as number
    const parsedValue = name === 'quantity' ? Number(value) : value;

    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.productName.trim()) {
      newErrors.productName = 'Please enter a product name';
    }

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Please enter a valid quantity';
    }

    if (!formData.reason) {
      newErrors.reason = 'Please select a reason';
    }

    // Disallow removal beyond available stock
    if (
      formData.adjustmentType === 'remove' &&
      passedProduct &&
      formData.quantity > passedProduct.quantity
    ) {
      newErrors.quantity = `Cannot remove more than available stock (${passedProduct.quantity})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { productName, quantity, adjustmentType } = formData;

      const url = `/api/products/adjust/${encodeURIComponent(productName)}?quantity=${quantity}&type=${adjustmentType}`;
      console.log("Calling API:", url);

      await axios.put(url);

      alert('Stock adjustment completed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error adjusting stock:', error);
      setErrors({ submit: 'Failed to process stock adjustment. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.adjustmentContainer}>
      <div className={styles.adjustmentHeader}>
        <h1>Stock Adjustment</h1>
        <p>Add or remove items from inventory</p>
      </div>

      <Card className={styles.adjustmentCard}>
        <form onSubmit={handleSubmit} className={styles.adjustmentForm}>
          {errors.submit && <div className={styles.errorMessage}>{errors.submit}</div>}

          {!passedProduct && (
            <Input
              label="Product Name"
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              placeholder="Enter product name"
              error={errors.productName}
              disabled={isLoading}
            />
          )}

          {passedProduct && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Product:</span>
              <span className={styles.detailValue}>{formData.productName}</span>
            </div>
          )}

          <div className={styles.adjustmentTypeGroup}>
            <label className={styles.label}>Adjustment Type</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="adjustmentType"
                  value="add"
                  checked={formData.adjustmentType === 'add'}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <span>Add</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="adjustmentType"
                  value="remove"
                  checked={formData.adjustmentType === 'remove'}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <span>Remove</span>
              </label>
            </div>
          </div>

          <Input
            label="Quantity"
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            placeholder="Enter quantity"
            error={errors.quantity}
            disabled={isLoading}
            min={1}
          />

          <div className={styles.formGroup}>
            <label htmlFor="reason" className={styles.label}>Reason</label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              className={`${styles.select} ${errors.reason ? styles.inputError : ''}`}
              disabled={isLoading}
            >
              <option value="">-- Select a reason --</option>
              {reasons[formData.adjustmentType].map((reason) => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
            {errors.reason && <div className={styles.fieldError}>{errors.reason}</div>}
          </div>

          <Input
            label="Notes (Optional)"
            type="textarea"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Any notes..."
            disabled={isLoading}
          />

          <div className={styles.formActions}>
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard')} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Submit Adjustment'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default StockAdjustment;
