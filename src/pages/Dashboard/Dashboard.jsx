import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card/Card";
import Table from "../../components/Table/Table";
import Button from "../../components/Button/Button";
import styles from "./Dashboard.module.css";
import AddProductModal from "../AddProduct/AddProductModal";
import StockAdjustmentModal from "../StockAdjustment/StockAdjustmentModal"; // NEW IMPORT
import axios from "../../services/axiosConfig";
import authService from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/Ui/Search";
import AddProduct from "../../components/Ui/Button";
import ShadDropdown from "../../components/Ui/ShadDropdown";

const Dashboard = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false); // NEW STATE
  const [selectedProduct, setSelectedProduct] = useState(null); // NEW STATE

  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const categories = [
    "ELECTRONICS",
    "CLOTHING",
    "FOOD",
    "HOME_GOODS",
    "OFFICE_SUPPLIES",
  ];

  const baseColumns = [
    {
      header: "Product Name",
      render: (row) => row.product?.name || "N/A",
    },

    {
        header: "SKU",
        render: (row) => row.product?.sku || "N/A",
    },

    {
      header: "Category",
      render: (row) => row.product?.category || "N/A",
    },
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
          onClick={() => handleAdjustStock(row)}
        >
          Adjust
        </Button>
      </div>
    ),
  };

  const columns =
    hasRole("Manager") || hasRole("Admin")
      ? [...baseColumns, actionsColumn]
      : baseColumns;

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const user = authService.getCurrentUser();
      const storeId = user?.storeId;
      if (!storeId) {
        console.error("No store ID found for user");
        return;
      }
      const response = await axios.get(`/api/inventory/store/${storeId}`);
      setInventoryData(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const newFiltered = inventoryData.filter((item) => {
      const productName = item.product?.name?.toLowerCase() || "";
      const productDescription = item.product?.description?.toLowerCase() || "";
      const productSku = item.product?.sku?.toLowerCase() || "";
      const productCategory = item.product?.category || "";
      const search = searchTerm.toLowerCase();

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
        if (!storeId) {
          console.error("No store ID found for user");
          return;
        }
        const response = await axios.get(
          `/api/inventory/search?query=${term}&storeId=${storeId}&fields=name,description,sku`
        );
        setInventoryData(response.data);
        console.log("Search results:", response.data);
      } catch (error) {
        console.error("Error searching products:", error);
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
      if (!storeId) {
        console.error("No store ID found for user");
        return;
      }
      const response = await axios.post("/api/products/add", {
        ...newProduct,
        storeId: storeId,
      });

      console.log("Product added:", response.data);
      setIsAddModalOpen(false);
      await fetchInventory();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
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
                <AddProduct variant="primary" onClick={handleAddClick}>
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

        <Table
          columns={columns}
          data={filteredData}
          isLoading={isLoading}
          emptyMessage="No inventory items found matching your criteria."
        />
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
    </div>
  );
};

export default Dashboard;
