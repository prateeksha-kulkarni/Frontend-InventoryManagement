import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card/Card";
import Table from "../../components/Table/Table";
import Button from "../../components/Button/Button";
import styles from "./Dashboard.module.css";
import AddProductModal from "../AddProduct/AddProductModal";
import StockAdjustmentModal from "../StockAdjustment/StockAdjustmentModal";
import axios from "../../services/axiosConfig";
import authService from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/Ui/Search";
import AddProduct from "../../components/Ui/Button";
import ShadDropdown from "../../components/Ui/ShadDropdown";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiPackage } from "react-icons/fi";
import { Calendar, Store, TrendingUp, Package } from 'lucide-react';

const Dashboard = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [storeName, setStoreName] = useState("");

  const navigate = useNavigate();
  const { hasRole } = useAuth();

  // Toast Helpers
  const notifySuccess = (msg) => toast.success(msg, { autoClose: 3000 });
  const notifyError = (msg) => toast.error(msg, { autoClose: 3000 });

  const categories = [
    "ELECTRONICS",
    "CLOTHING",
    "FOOD",
    "HOME_GOODS",
    "OFFICE_SUPPLIES",
  ];

  const baseColumns = [
    { header: "Product Name", render: (row) => row.product?.name || "N/A" },
    { header: "SKU", render: (row) => row.product?.sku || "N/A" },
    { header: "Category", render: (row) => row.product?.category || "N/A" },
    { header: "Quantity", accessor: "quantity" },
    { header: "Threshold", accessor: "minThreshold" },
    {
      header: "Status",
      render: (row) => (
        <div className={styles.statusCell}>
          <span
            className={`${styles.statusIndicator} ${
              row.status === "LOW_STOCK"
                ? styles.statusLow
                : row.status === "REORDER_SOON"
                ? styles.statusMedium
                : styles.statusGood
            }`}
          ></span>
          {row.status.replace("_", " ")}
        </div>
      ),
    },
  ];

  const actionsColumn = {
    header: "Actions",
    render: (row) => (
      <div className={styles.actionButtons}>
        <Button
          variant="outline"
          size="small"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => handleAdjustStock(row)}
        >
          Adjust
        </Button>
        <Button
          variant="outline"
          size="small"
          onClick={() => handleRemove(row)}
        >
          Remove
        </Button>
      </div>
    ),
  };

  const columns =
    hasRole("Manager") || hasRole("Admin")
      ? [...baseColumns, actionsColumn]
      : baseColumns;

  // Fetch inventory data
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const user = authService.getCurrentUser();
      const storeId = user?.storeId;
      if (!storeId) return notifyError("No store ID found for user.");

      const response = await axios.get(`/api/inventory/store/${storeId}`);
      setInventoryData(response.data);
      setFilteredData(response.data);

      const storeRes = await axios.get(`/api/stores/${storeId}`);
      setStoreName(storeRes.data?.name || "Store");
    } catch (error) {
      notifyError("Failed to fetch inventory.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data on search/filter
  useEffect(() => {
    const search = searchTerm.toLowerCase();
    const newFiltered = inventoryData.filter((item) => {
      const productName = item.product?.name?.toLowerCase() || "";
      const productDescription = item.product?.description?.toLowerCase() || "";
      const productSku = item.product?.sku?.toLowerCase() || "";
      const productCategory = item.product?.category || "";

      const matchesSearch =
        productName.includes(search) ||
        productDescription.includes(search) ||
        productSku.includes(search) ||
        productCategory.toLowerCase().includes(search);

      const matchesCategory = filterCategory
        ? productCategory === filterCategory
        : true;

      return matchesSearch && matchesCategory;
    });
    setFilteredData(newFiltered);
  }, [inventoryData, searchTerm, filterCategory]);

  const handleAddClick = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const handleAdjustStock = (product) => {
    setSelectedProduct(product);
    setIsAdjustModalOpen(true);
  };
  const handleCloseAdjustModal = () => {
    setSelectedProduct(null);
    setIsAdjustModalOpen(false);
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.length >= 1) {
      setIsLoading(true);
      try {
        const user = authService.getCurrentUser();
        const storeId = user?.storeId || user?.location;
        if (!storeId) return notifyError("No store ID found for user.");

        const response = await axios.get(
          `/api/inventory/search?query=${term}&storeId=${storeId}&fields=name,description,sku`
        );
        setInventoryData(response.data);
      } catch (error) {
        notifyError("Search failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      fetchInventory();
    }
  };

  const handleAddSubmit = async (newProduct) => {
    try {
      const user = authService.getCurrentUser();
      const storeId = user?.storeId;
      if (!storeId) return notifyError("No store ID found for user.");

      await axios.post("/api/products/add", { ...newProduct, storeId });
      notifySuccess("Product added successfully!");
      setIsAddModalOpen(false);
      await fetchInventory();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  // const handleAdjustStock = (product) => {
  //   navigate("/stock-adjustment", { state: { product } });
  // };

  // const handleTransfer = (product) => {
  //   navigate("/transfer", { state: { product } });
  // // };
 
  const handleRemove = async (row) => {
    try {
      await axios.post(
        "/api/products/delete",
        row.product, // Full ProductEntity
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
  
      await fetchInventory(); // Refresh inventory data
      toast.success(`Product "${row.product?.name}" deleted successfully`);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete the product. Please try again.");
    }
  };

  return (
    <div className="max-w-[95em] mx-auto p-6">
      <div className={styles.dashboardHeader}>
        <div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center"><Package className="mr-3" />Inventory Dashboard</h1>
          <p>Current stock levels and product information</p>
        </div>
        {/* <div className={styles.notificationArea}>
          {/* <h2 className={styles.notificationLabel}>Low Stock</h2> */}
          {/* <NotificationIcon
            count={
              filteredData.filter((item) => item.status === "LOW_STOCK").length
            }
            //    onClick={() => {
            //   const lowStockSection = document.querySelector(`.${styles.lowStockSection}`);
            //   lowStockSection?.scrollIntoView({ behavior: 'smooth' });
            // }}
            onClick={() => navigate("/low-stock-alerts")}
          />
        </div> */} 
      </div>

      <div className={styles.seamlessSearchTable}>
        <Card className={styles.filterCard}>
          <div className={styles.filterControls}>
            <div className={styles.searchInput}>
              <Input
                type="search"
                placeholder="Search by product name, description, or SKU"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            {(hasRole("Manager") || hasRole("Admin")) && (
              <div className={styles.addProductButton}>
                <AddProduct
                  variant="primary"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleAddClick}
                >
                  Add Product
                </AddProduct>
              </div>
            )}
            <div>
              <ShadDropdown
                items={categories}
                value={filterCategory}
                onChange={(value) => setFilterCategory(value)}
                placeholder="All Categories"
              />
            </div>
          </div>
        </Card>

        <Card className="mt-4 rounded-lg shadow-sm p-2">
          <Table
            columns={columns}
            data={filteredData}
            isLoading={isLoading}
            emptyMessage="No inventory items found matching your criteria."
          />
        </Card>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        storeId={authService.getCurrentUser()?.storeId}
        reloadDashboard={fetchInventory}
      />

      {/* Stock Adjustment Modal */}
      {isAdjustModalOpen && (
        <StockAdjustmentModal
          isOpen={isAdjustModalOpen}
          onClose={handleCloseAdjustModal}
          product={selectedProduct}
          reloadDashboard={fetchInventory}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Dashboard;