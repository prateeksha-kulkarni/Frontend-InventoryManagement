import React, { useState } from "react";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import ShadDropdown from "../../components/Ui/ShadDropdown";
import styles from "./StockAdjustmentModal.module.css";
import axios from "../../services/axiosConfig";
import authService from "../../services/authService";
import { toast } from "react-toastify";

const StockAdjustmentModal = ({ isOpen, onClose, product, reloadDashboard }) => {
  if (!isOpen) return null;

  const user = authService.getCurrentUser();
  const storeId = user?.storeId;

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    productName: product?.product?.name || "",
    adjustmentType: "add",
    quantity: "",
    reason: "",
  });
  const [errors, setErrors] = useState({});

  const reasons = {
    add: ["New Shipment", "Return from Customer", "Inventory Count Correction"],
    remove: [
      "Sale",
      "Damaged",
      "Expired",
      "Theft/Loss",
      "Inventory Count Correction",
    ],
  };

  // Toast Helpers
  const notifySuccess = (msg) => toast.success(msg, { autoClose: 3000 });
  const notifyError = (msg) => toast.error(msg, { autoClose: 3000 });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = name === "quantity" ? Number(value) : value;
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleReasonChange = (value) => {
    setFormData((prev) => ({ ...prev, reason: value }));
    if (errors.reason) setErrors((prev) => ({ ...prev, reason: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.productName.trim())
      newErrors.productName = "Please enter a product name";
    if (!formData.quantity || formData.quantity <= 0)
      newErrors.quantity = "Please enter a valid quantity";
    if (!formData.reason) newErrors.reason = "Please select a reason";
    if (
      formData.adjustmentType === "remove" &&
      product &&
      formData.quantity > product.quantity
    ) {
      newErrors.quantity = `Cannot remove more than available stock (${product.quantity})`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!storeId) {
      notifyError("Store ID missing from user session. Please log in again.");
      return;
    }

    setIsLoading(true);
    try {
      const { productName, quantity, adjustmentType, reason } = formData;
      await axios.put(
        `/api/inventory/adjust/${encodeURIComponent(productName)}`,
        {
          quantity,
          type: adjustmentType.toUpperCase(),
          storeId,
          userId: user.userId,
          reason,
        }
      );

      notifySuccess("Stock adjustment completed successfully!");
      reloadDashboard();
      onClose();
    } catch (error) {
      console.error("Error adjusting stock:", error);
      notifyError("Failed to process stock adjustment. Please try again.");
      setErrors({
        submit: "Failed to process stock adjustment. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className="text-3xl font-semibold text-gray-700">
            Stock Adjustment
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.adjustmentForm}>
          {errors.submit && (
            <div className={styles.errorMessage}>{errors.submit}</div>
          )}

          {/* Product Details */}
          {product ? (
            <div className={styles.productBox}>
              <span className={styles.productLabel}>Product:</span>
              <span className={styles.productName}>{formData.productName}</span>
              <p className={styles.stockInfo}>
                Current Stock: <strong>{product.quantity}</strong> units
              </p>
            </div>
          ) : (
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

          {/* Add/Remove Toggle */}
          <div className={styles.toggleGroup}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${
                formData.adjustmentType === "add" ? styles.activeAdd : ""
              }`}
              onClick={() =>
                setFormData((p) => ({ ...p, adjustmentType: "add" }))
              }
              disabled={isLoading}
            >
              Add
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${
                formData.adjustmentType === "remove" ? styles.activeRemove : ""
              }`}
              onClick={() =>
                setFormData((p) => ({ ...p, adjustmentType: "remove" }))
              }
              disabled={isLoading}
            >
              Remove
            </button>
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

          {/* Reason */}
          <div className={styles.formGroup}>
            <label htmlFor="reason" className={styles.label}>
              Reason
            </label>
            <ShadDropdown
              items={reasons[formData.adjustmentType]}
              value={formData.reason}
              onChange={handleReasonChange}
              placeholder="Select reason"
            />
            {errors.reason && (
              <div className={styles.fieldError}>{errors.reason}</div>
            )}
          </div>

          <div className={styles.formActions}>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Processing..." : "Update Quantity"}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;