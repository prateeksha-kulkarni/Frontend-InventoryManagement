import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card/Card";
import Table from "../../components/Table/Table";
import Button from "../../components/Button/Button";
import styles from "./Dashboard.module.css";
import AddProductModal from "../AddProduct/AddProductModal";
import axios from "../../services/axiosConfig";
import authService from "../../services/authService";
import NotificationIcon from "../../components/Notification/Notification";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
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
            className={`${styles.statusIndicator} ${row.status === "LOW_STOCK"
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
        console.error('No store ID found for user');
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
    const newFiltered = inventoryData.filter(item => {
      const productName = item.product?.name?.toLowerCase() || '';
      const productDescription = item.product?.description?.toLowerCase() || '';
      const productSku = item.product?.sku?.toLowerCase() || '';
      const productCategory = item.product?.category || '';
      const search = searchTerm.toLowerCase();

      // Match if search term is in product name, description, SKU, or category
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

  const handleAddClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.length >= 1) {
      setIsLoading(true);
      try {
        const user = authService.getCurrentUser();
        const storeId = user?.storeId || user?.location;
        if (!storeId) {
          console.error('No store ID found for user');
          return;
        }
        // Updated search endpoint to include name, description, and SKU
        const response = await axios.get(`/api/inventory/search?query=${term}&storeId=${storeId}&fields=name,description,sku`);
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
        console.error('No store ID found for user');
        return;
      }
      const response = await axios.post('/api/products/add', {
        ...newProduct,
        storeId: storeId,
      });

      console.log("Product added:", response.data);
      setIsModalOpen(false);

      // Refresh the inventory data
      await fetchInventory();

    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleAdjustStock = (product) => {
    navigate("/stock-adjustment", { state: { product } });
  };

  // const handleTransfer = (product) => {
  //   navigate("/transfer", { state: { product } });
  // // };
  // const handleRemove = async (row) => {
  //   const confirmDelete = window.confirm(
  //     `Are you sure you want to delete the product "${row.product?.name}"?`
  //   );

  //   if (!confirmDelete) {
  //     return; // user cancelled
  //   }
  //   try {
  //     await axios.post(`/api/products/delete`, row.product); // send full product

  // Refresh the inventory data instead of manually filtering
  //await fetchInventory();

  //     console.log("Product deleted");
  //   } catch (error) {
  //     console.error("Delete failed:", error);
  //   }
  // };

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
                onChange={(e) => setFilterCategory(e.target.value)}
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
      <AddProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        storeId={authService.getCurrentUser()?.storeId}
        reloadDashboard={fetchInventory}
      />
    </div>
  );
};

export default Dashboard;
