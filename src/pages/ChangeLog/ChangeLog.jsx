import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Table from '../../components/Table/Table';
import Input from '../../components/Input/Input';
import styles from './ChangeLog.module.css';
import axios from 'axios';
import authService from '../../services/authService';

const ChangeLog = () => {
  const [logData, setLogData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    searchTerm: '',
    actionType: '',
    dateFrom: '',
    dateTo: ''
  });

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
      render: (row) => <div>{row.productName}</div>
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
            {row.quantity}
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

  const actionTypes = ['Added', 'Removed', 'Transferred', 'Adjusted'];

  useEffect(() => {
    const fetchLogData = async () => {
      setIsLoading(true);
      try {
        const user = authService.getCurrentUser();
        const token = authService.getToken();
        const storeId = user?.storeId;
        const userId = user?.userId;

        const headers = {
          Authorization: `Bearer ${token}`
        };

        const [transferRes, adjustmentRes] = await Promise.all([
          axios.get('http://localhost:8081/api/transfers/logs', { headers }),
          axios.get('http://localhost:8081/api/stock-adjustments', { headers })
        ]);

        const transfers = transferRes.data
          .filter((item) =>
            item.status === 'COMPLETED' &&
            (item.fromStore?.storeId === storeId || item.toStore?.storeId === storeId)
          )
          .map((item) => ({
            id: item.transferId,
            timestamp: item.timestamp,
            productName: item.product?.name || 'Unknown',
            action: 'Transferred',
            details: `From ${item.fromStore?.name || 'N/A'} to ${item.toStore?.name || 'N/A'}`,
            quantity:
              item.fromStore?.storeId === storeId
                ? -Math.abs(item.quantity)
                : Math.abs(item.quantity),
            userName: item.requestedBy?.name || 'Unknown',
            userRole: 'Manager'
          }));

        const adjustments = adjustmentRes.data
          .filter((item) => item.user?.userId === userId)
          .map((item) => ({
            id: item.adjustmentId,
            timestamp: item.timestamp,
            productName: item.product?.name || 'Unknown',
            action: 'Adjusted',
            details: item.reason || 'Adjustment',
            quantity:
              item.changeType === 'ADD'
                ? Math.abs(item.quantityChange)
                : -Math.abs(item.quantityChange),
            userName: item.user?.name || 'Unknown',
            userRole: 'Manager'
          }));

        const combinedLogs = [...transfers, ...adjustments].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        setLogData(combinedLogs);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredData = logData.filter((item) => {
    const matchesSearch =
      filters.searchTerm === '' ||
      item.productName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.details.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.userName.toLowerCase().includes(filters.searchTerm.toLowerCase());

    const matchesAction = filters.actionType === '' || item.action === filters.actionType;

    const itemDate = new Date(item.timestamp);
    const matchesDateFrom = filters.dateFrom === '' || itemDate >= new Date(filters.dateFrom);
    const matchesDateTo =
      filters.dateTo === '' || itemDate <= new Date(`${filters.dateTo}T23:59:59`);

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
              placeholder="Search by product, details or user"
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
                {actionTypes.map((action) => (
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
