import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import ShadDropdown from "../../components/Ui/ShadDropdown";
import styles from "./AddProductModal.module.css";
import axios from "../../services/axiosConfig";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

Modal.setAppElement("#root");

function AddProductModal({ isOpen, onClose, storeId, reloadDashboard }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    sku: "",
    threshold: "",
    category: "",
  });

  const [checking, setChecking] = useState(false);
  const [existingStores, setExistingStores] = useState([]);
  const [showTransferPrompt, setShowTransferPrompt] = useState(false);
  const [error, setError] = useState("");

  const categoryItems = [
    "ELECTRONICS",
    "CLOTHING",
    "FOOD",
    "HOME_GOODS",
    "OFFICE_SUPPLIES",
  ];

  // Toast Helpers
  const notifySuccess = (msg) => toast.success(msg, { autoClose: 3000 });
  const notifyError = (msg) => toast.error(msg, { autoClose: 3000 });

  useEffect(() => {
    if (!isOpen) {
      setForm({ name: "", sku: "", threshold: "", category: "" });
      setError("");
      setShowTransferPrompt(false);
      setExistingStores([]);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (value) => {
    setForm({ ...form, category: value });
  };

  const handleCheckAndProceed = async () => {
    setError("");
    setChecking(true);
    try {
      const { sku, threshold } = form;
      const productRes = await axios.get(`/api/products`);
      const matchingProduct = productRes.data.find(
        (p) => p.sku.trim().toLowerCase() === sku.trim().toLowerCase()
      );

      if (matchingProduct) {
        const inventoryRes = await axios.get(`/api/inventory`);
        const alreadyExistsInThisStore = inventoryRes.data.some(
          (inv) =>
            inv.product?.productId === matchingProduct.productId &&
            inv.store?.storeId === storeId
        );

        if (alreadyExistsInThisStore) {
          notifyError("This product already exists in this store.");
          setChecking(false);
          return;
        }

        const otherStores = inventoryRes.data.filter(
          (inv) =>
            inv.product?.productId === matchingProduct.productId &&
            inv.store?.storeId !== storeId
        );

        if (otherStores.length > 0) {
          setExistingStores(otherStores);
          setShowTransferPrompt(true);
        } else {
          await axios.post("/api/inventory", {
            product: { productId: matchingProduct.productId },
            store: { storeId },
            minThreshold: parseInt(threshold),
            quantity: 0,
          });
          reloadDashboard();
          onClose();
          notifySuccess("Product added successfully!");
        }
      } else {
        const createdProduct = await axios.post("/api/products", {
          name: form.name,
          sku: form.sku,
          category: form.category,
          description: "Auto-added from modal",
        });

        await axios.post("/api/inventory", {
          product: { productId: createdProduct.data.productId },
          store: { storeId },
          minThreshold: parseInt(threshold),
          quantity: 0,
        });

        reloadDashboard();
        onClose();
        notifySuccess("New product created and added to inventory!");
      }
    } catch (err) {
      notifyError("Something went wrong. Try again.");
      setError("Something went wrong. Try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleTransfer = (store) => {
    navigate("/transfer", {
      state: {
        productName: store.product.name,
        productId: store.product.productId,
        fromStoreId: store.store.storeId,
        quantity: store.quantity,
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={styles.modalContent}
      overlayClassName={styles.modalOverlay}
    >
      {/* Modal Header */}
      <div className={styles.modalHeader}>
        <h2 className="text-3xl font-semibold text-gray-700">
          Add New Product
        </h2>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
      </div>

      {/* Input Form */}
      <div className={styles.formGroup}>
        <Input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter product name"
        />
        <Input
          name="sku"
          value={form.sku}
          onChange={handleChange}
          placeholder="Enter SKU"
        />
        <Input
          name="threshold"
          type="number"
          value={form.threshold}
          onChange={handleChange}
          placeholder="Enter threshold"
        />
        <ShadDropdown
          items={categoryItems}
          value={form.category}
          onChange={handleCategoryChange}
          placeholder="Select category"
        />
      </div>

      {/* Error Display */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Transfer Prompt */}
      {showTransferPrompt ? (
        <div className={styles.transferPrompt}>
          <p>This product exists in other stores. Do you want to transfer?</p>
          {existingStores.map((store) => (
            <div key={store.store.storeId} className={styles.transferRow}>
              <span>
                {store.store.name} — {store.quantity} units
              </span>
              <Button variant="primary" onClick={() => handleTransfer(store)}>
                Transfer
              </Button>
            </div>
          ))}
          <div className={styles.transferActions}>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const product = await axios.get(`/api/products`);
                  const matched = product.data.find(
                    (p) => p.sku === form.sku
                  );
                  await axios.post("/api/inventory", {
                    product: { productId: matched.productId },
                    store: { storeId },
                    minThreshold: parseInt(form.threshold),
                    quantity: 0,
                  });
                  reloadDashboard();
                  onClose();
                  notifySuccess("New product added!");
                } catch (err) {
                  setError("Couldn't skip transfer, try again");
                  notifyError("Couldn't skip transfer, try again");
                }
              }}
            >
              No, Add New Entry
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.modalActions}>
          <Button
            variant="primary"
            onClick={handleCheckAndProceed}
            disabled={checking}
          >
            {checking ? "Checking..." : "Add"}
          </Button>
          <Button variant="danger" onClick={onClose}>
            Cancel
          </Button>
        </div>
      )}
    </Modal>
  );
}

export default AddProductModal;