import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Table from '../../components/Table/Table';
import Input from '../../components/Input/Input';
import styles from './ChangeLog.module.css';

const ChangeLog = () => {
  const [logData, setLogData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    searchTerm: '',
    actionType: '',
    dateFrom: '',
    dateTo: ''
  });

  // Table columns configuration
  const columns = [
    {
      header: 'Timestamp',
      accessor: 'timestamp',
      render: (row) => {
        const date = new Date(row.timestamp);
        return (
          <div>
            <div>{date.toLocaleDateString()}</div>
            <div className={styles.timeText}>{date.toLocaleTimeString()}</div>
          </div>
        );
      }
    },
    {
      header: 'Product',
      accessor: 'productName',
      render: (row) => (
        <div>
          <div>{row.productName}</div>
          <div className={styles.skuText}>SKU: {row.sku}</div>
        </div>
      )
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row) => {
        let actionClass = '';
        
        switch (row.action) {
          case 'Added':
            actionClass = styles.actionAdded;
            break;
          case 'Removed':
            actionClass = styles.actionRemoved;
            break;
          case 'Transferred':
            actionClass = styles.actionTransferred;
            break;
          case 'Adjusted':
            actionClass = styles.actionAdjusted;
            break;
          default:
            actionClass = '';
        }
        
        return (
          <div className={`${styles.actionCell} ${actionClass}`}>
            <span className={styles.actionBadge}>{row.action}</span>
            <div className={styles.actionDetails}>{row.details}</div>
          </div>
        );
      }
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      render: (row) => {
        const isNegative = row.quantity < 0;
        return (
          <div className={`${styles.quantityCell} ${isNegative ? styles.negativeQuantity : styles.positiveQuantity}`}>
            {row.quantity > 0 ? `+${row.quantity}` : row.quantity}
          </div>
        );
      }
    },
    {
      header: 'User',
      accessor: 'user',
      render: (row) => (
        <div>
          <div>{row.userName}</div>
          <div className={styles.roleText}>{row.userRole}</div>
        </div>
      )
    }
  ];

  // Action types for filter
  const actionTypes = ['Added', 'Removed', 'Transferred', 'Adjusted'];

  // Fetch log data (mock implementation)
  useEffect(() => {
    const fetchLogData = async () => {
      setIsLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockData = [
          {
            id: 1,
            timestamp: new Date(2023, 5, 15, 9, 30).toISOString(),
            productName: 'Laptop',
            sku: 'ELEC-001',
            action: 'Added',
            details: 'New shipment received',
            quantity: 10,
            userName: 'John Doe',
            userRole: 'Manager'
          },
          {
            id: 2,
            timestamp: new Date(2023, 5, 15, 10, 45).toISOString(),
            productName: 'Smartphone',
            sku: 'ELEC-002',
            action: 'Removed',
            details: 'Sold to customer',
            quantity: -2,
            userName: 'Jane Smith',
            userRole: 'Associate'
          },
          {
            id: 3,
            timestamp: new Date(2023, 5, 16, 14, 20).toISOString(),
            productName: 'T-shirt',
            sku: 'CLTH-001',
            action: 'Transferred',
            details: 'Transferred to North Branch',
            quantity: -5,
            userName: 'Mike Johnson',
            userRole: 'Manager'
          },
          {
            id: 4,
            timestamp: new Date(2023, 5, 17, 11, 15).toISOString(),
            productName: 'Coffee',
            sku: 'FOOD-002',
            action: 'Adjusted',
            details: 'Inventory count correction',
            quantity: -3,
            userName: 'Sarah Williams',
            userRole: 'Analyst'
          },
          {
            id: 5,
            timestamp: new Date(2023, 5, 17, 16, 30).toISOString(),
            productName: 'Desk Lamp',
            sku: 'HOME-001',
            action: 'Added',
            details: 'Return from customer',
            quantity: 1,
            userName: 'Jane Smith',
            userRole: 'Associate'
          },
          {
            id: 6,
            timestamp: new Date(2023, 5, 18, 9, 0).toISOString(),
            productName: 'Jeans',
            sku: 'CLTH-002',
            action: 'Adjusted',
            details: 'Damaged inventory',
            quantity: -2,
            userName: 'John Doe',
            userRole: 'Manager'
          },
          {
            id: 7,
            timestamp: new Date(2023, 5, 18, 14, 45).toISOString(),
            productName: 'Notebook',
            sku: 'OFFC-001',
            action: 'Transferred',
            details: 'Transferred from East Branch',
            quantity: 15,
            userName: 'Mike Johnson',
            userRole: 'Manager'
          },
          {
            id: 8,
            timestamp: new Date(2023, 5, 19, 10, 30).toISOString(),
            productName: 'Cereal',
            sku: 'FOOD-001',
            action: 'Removed',
            details: 'Expired product',
            quantity: -4,
            userName: 'Sarah Williams',
            userRole: 'Analyst'
          }
        ];
        
        setLogData(mockData);
      } catch (error) {
        console.error('Error fetching log data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogData();
  }, []);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters to log data
  const filteredData = logData.filter(item => {
    // Search term filter (product name, SKU, details, user)
    const matchesSearch = filters.searchTerm === '' || 
      item.productName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.details.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.userName.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    // Action type filter
    const matchesAction = filters.actionType === '' || item.action === filters.actionType;
    
    // Date range filter
    const itemDate = new Date(item.timestamp);
    const matchesDateFrom = filters.dateFrom === '' || itemDate >= new Date(filters.dateFrom);
    const matchesDateTo = filters.dateTo === '' || itemDate <= new Date(`${filters.dateTo}T23:59:59`);
    
    return matchesSearch && matchesAction && matchesDateFrom && matchesDateTo;
  });

  return (
    <div className={styles.changeLogContainer}>
      <div className={styles.changeLogHeader}>
        <h1>Change Log</h1>
        <p>Track all inventory changes and activities</p>
      </div>

      <Card className={styles.filterCard}>
        <div className={styles.filterControls}>
          <div className={styles.searchInput}>
            <Input
              type="search"
              placeholder="Search by product, SKU, details or user"
              name="searchTerm"
              value={filters.searchTerm}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className={styles.filterGroup}>
            <div className={styles.filterItem}>
              <label htmlFor="actionType" className={styles.filterLabel}>Action Type</label>
              <select
                id="actionType"
                name="actionType"
                value={filters.actionType}
                onChange={handleFilterChange}
                className={styles.filterSelect}
              >
                <option value="">All Actions</option>
                {actionTypes.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>
            
            <div className={styles.filterItem}>
              <label htmlFor="dateFrom" className={styles.filterLabel}>From Date</label>
              <input
                type="date"
                id="dateFrom"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className={styles.filterDate}
              />
            </div>
            
            <div className={styles.filterItem}>
              <label htmlFor="dateTo" className={styles.filterLabel}>To Date</label>
              <input
                type="date"
                id="dateTo"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className={styles.filterDate}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className={styles.logCard}>
        <Table
          columns={columns}
          data={filteredData}
          isLoading={isLoading}
          emptyMessage="No log entries found matching your criteria."
        />
      </Card>
    </div>
  );
};

export default ChangeLog;