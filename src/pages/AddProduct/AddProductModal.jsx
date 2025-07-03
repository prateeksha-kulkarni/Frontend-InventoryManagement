    import React, { useState } from 'react';
    import Modal from 'react-modal';
    import Input from '../../components/Input/Input';
    import Button from '../../components/Button/Button';
    import styles from './AddProductModal.module.css';

    const AddProductModal = ({ isOpen, onClose, onSubmit }) => {
      const [form, setForm] = useState({
        name: '',
        quantity: '',
        threshold: '',
        category: '',
      });

      const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

      const handleSubmit = () => {
        onSubmit({
          ...form,
          quantity: parseInt(form.quantity, 10),
          threshold: parseInt(form.threshold, 10),
        });
      };

      return (
        <Modal
          isOpen={isOpen}
          onRequestClose={onClose}
          className={styles.modalContent}
          overlayClassName={styles.modalOverlay}
        >
          <h2>Add New Product</h2>
          <div className={styles.formGroup}>
            <Input name="name" value={form.name} onChange={handleChange} placeholder="Product Name" />
            <Input name="quantity" value={form.quantity} onChange={handleChange} type="number" placeholder="Quantity" />
            <Input name="threshold" value={form.threshold} onChange={handleChange} type="number" placeholder="Threshold" />
            <select name="category" value={form.category} onChange={handleChange} className={styles.select}>
              <option value="">Select Category</option>
              <option>ELECTRONICS</option>
              <option>CLOTHING</option>
              <option>FOOD</option>
              <option>HOME_GOODS</option>
              <option>OFFICE_SUPPLIES</option>
            </select>
          </div>
          <div className={styles.modalActions}>
            <Button variant="primary" onClick={handleSubmit}>Add Product</Button>
            <Button variant="danger" onClick={onClose}>Cancel</Button>
          </div>
        </Modal>
      );
    };

    export default AddProductModal;
