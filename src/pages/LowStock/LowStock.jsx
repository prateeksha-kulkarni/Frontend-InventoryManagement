import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Table from '../../components/Table/Table';
import Button from '../../components/Button/Button';
import styles from './LowStock.module.css';
import axios from '../../services/axiosConfig';
import authService from '../../services/authService';

const LowStock = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
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
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔎 Filter only LOW_STOCK products that match category (optional)
  const filteredLowStockItems = inventoryData.filter(item => {
    const isLowStock = item.status === 'LOW_STOCK';
    const matchesCategory = filterCategory
      ? item.product?.category === filterCategory
      : true;
    return isLowStock && matchesCategory;
  });

  return (
    <div className={styles.LowStockPageContainer}>
      <div className={styles.LowStockPageHeader}>
        <div className={styles.LowStockPageHeader}>
          <h2>Low Stock Products</h2>
          <p>These products have stock levels below their minimum threshold.</p>
        </div>

        <Card className={styles.inventoryCard}>
          <Table
            columns={columns}
            data={filteredLowStockItems}
            isLoading={isLoading}
            emptyMessage="No low stock products."
          />
        </Card>
      </div>
    </div>
  );
};

export default LowStock;
