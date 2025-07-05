import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Table from '../../components/Table/Table';
import Button from '../../components/Button/Button';
import styles from './LowStock.module.css';
import axios from '../../services/axiosConfig';

const LowStockPage = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get('/api/products/read/1');
        setInventoryData(response.data);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const lowStockItems = inventoryData.filter(item => item.status === 'LOW_STOCK');

  const columns = [
    { header: 'Product Name', accessor: 'name' },
    { header: 'Category', accessor: 'category' },
    { header: 'Quantity', accessor: 'quantity' },
    { header: 'Threshold', accessor: 'threshold' },
    {
      header: 'Status',
      render: (row) => (
        <div className={styles.statusCell}>
          <span
            className={`${styles.statusIndicator} ${
              row.status === 'LOW_STOCK'
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

  return (
    <div className={styles.LowStockPageContainer}>
      <div className={styles.LowStockPageHeader}>
        <h2>Low Stock Products</h2>
        <p>These products have stock levels below their minimum threshold.</p>
        
      </div>

      <Card className={styles.LowStockPagecard}>
        <Table
          columns={columns}
          data={lowStockItems}
          isLoading={isLoading}
          emptyMessage="No low stock products."
        />
      </Card>
    </div>
  );
};

export default LowStockPage;