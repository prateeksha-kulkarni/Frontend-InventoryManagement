import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Table from '../../components/Table/Table';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import styles from './Dashboard.module.css';
import AddProductModal from '../AddProduct/AddProductModal';
import axios from '../../services/axiosConfig'
import authService from '../../services/authService';
import NotificationIcon from '../../components/Notification/Notification';

const Dashboard = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const categories = ['ELECTRONICS', 'CLOTHING', 'FOOD', 'HOME_GOODS', 'OFFICE_SUPPLIES'];

  const columns = [
    {
      header: 'Product Name',
      render: (row) => row.product?.name || 'N/A'
    },
    {
      header: 'Category',
      render: (row) => row.product?.category || 'N/A'
    },
    { header: 'Quantity', accessor: 'quantity' },
    { header: 'Threshold', accessor: 'minThreshold' },
    {
      header: 'Status',
      render: (row) => (
        <div className={styles.statusCell}>
          <span
            className={`${styles.statusIndicator} ${row.status === 'LOW_STOCK'
              ? styles.statusLow
              : row.status === 'REORDER_SOON'
                ? styles.statusMedium
                : styles.statusGood
              }`}
          ></span>
          {row.status.replace('_', ' ')}
        </div>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className={styles.actionButtons}>
          <Button
            variant="outline"
            size="small"
            onClick={() => handleAdjustStock(row)}
          >
            Adjust
          </Button>
          <Button
            variant="outline"
            size="small"
            onClick={() => handleTransfer(row)}
          >
            Transfer
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
    },
  ];

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const user = authService.getCurrentUser();
      const storeId = user?.storeId;
      const response = await axios.get(`/api/inventory/store/${storeId}`);
      setInventoryData(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const newFiltered = inventoryData.filter(item => {
      const productName = item.product?.name?.toLowerCase() || '';
      const productCategory = item.product?.category || '';
      const search = searchTerm.toLowerCase();

      // Match if search term is in product name OR in category
      const matchesSearch =
        productName.includes(search) ||
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
        const storeId = user?.storeId || user?.location || 1;
        const response = await axios.get(`/api/inventory/search?query=${term}&storeId=${storeId}`);
        setInventoryData(response.data);
        console.log('Search results:', response.data);
      } catch (error) {
        console.error('Error searching products:', error);
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
      const response = await axios.post('/api/products/add', {
        ...newProduct,
        storeId: storeId,
      });

      console.log('Product added:', response.data);
      setIsModalOpen(false);


      const refreshed = await axios.get(`/api/products/read/${storeId}`);
      setInventoryData(refreshed.data);

    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleAdjustStock = (product) => {
    navigate('/stock-adjustment', { state: { product } });
  };

  const handleTransfer = (product) => {
    navigate('/transfer', { state: { product } });
  };
 const handleRemove = async (row) => {
   const confirmDelete = window.confirm(
    `Are you sure you want to delete the product "${row.product?.name}"?`
  );

  if (!confirmDelete) {
    return; // user cancelled
  }
  try {
    await axios.post(`/api/products/delete`, row.product); // send full product

    setInventoryData(prev =>
      prev.filter(item => item.product?.productId !== row.product?.productId)
    );

    console.log('Product deleted');
  } catch (error) {
    console.error('Delete failed:', error);
  }
};

  return (
      <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <div>
        <h1>Inventory Dashboard</h1>
        <p>Current stock levels and product information</p>
        </div>
        <div className={styles.notificationArea}>
         <h2 className={styles.notificationLabel}>Low Stock</h2>
        <NotificationIcon
          
           count={filteredData.filter(item => item.status === 'LOW_STOCK').length}
      //    onClick={() => {
      //   const lowStockSection = document.querySelector(`.${styles.lowStockSection}`);
      //   lowStockSection?.scrollIntoView({ behavior: 'smooth' });
      // }}
         onClick={() => navigate('/low-stock-alerts')}
       />
        
       </div>
      </div>
      <div className={styles.filterSection}>
        <Card className={styles.filterCard}>
          <div className={styles.filterControls}>
            <div className={styles.searchInput}>
              <Input
                type="search"
                placeholder="Search by product name"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className={styles.categoryFilter}>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={styles.categorySelect}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </div>

      <Card className={styles.inventoryCard}>
        <Table
          columns={columns}
          data={filteredData}
          isLoading={isLoading}
          emptyMessage="No inventory items found matching your criteria."
        />
      </Card>

      <div className={styles.dashboardActions}>
        <Button variant="primary" onClick={handleAddClick}>
          Add New Product
        </Button>
        <Button variant="secondary" onClick={() => console.log('View restock suggestions')}>
          View Restock Suggestions
        </Button>
      </div>

      <AddProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddSubmit}
      />
    </div>
  );
};

export default Dashboard;

