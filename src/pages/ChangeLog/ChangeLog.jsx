// Converted to Tailwind CSS
import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Table from '../../components/Table/Table';
import Input from '../../components/Input/Input';
import axios from 'axios';
import authService from '../../services/authService';
import { FileText } from 'lucide-react';

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
            <div className="text-sm text-gray-500">{date.toLocaleTimeString()}</div>
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
        const colorMap = {
          Added: 'bg-green-100 text-green-700',
          Removed: 'bg-red-100 text-red-700',
          Transferred: 'bg-blue-100 text-blue-700',
          Adjusted: 'bg-yellow-100 text-yellow-700'
        };

        return (
          <div className="flex flex-col">
            <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium mb-1 w-fit ${colorMap[row.action] || ''}`}>{row.action}</span>
            <div className="text-sm">{row.details}</div>
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
          <div className={`font-semibold ${isNegative ? 'text-red-600' : 'text-green-600'}`}>{row.quantity}</div>
        );
      }
    },
    {
      header: 'User',
      accessor: 'user',
      render: (row) => (
        <div>
          <div>{row.userName}</div>
          <div className="text-sm text-gray-500">{row.userRole}</div>
        </div>
      )
    }
  ];

  const actionTypes = ['Removed', 'Transferred', 'Adjusted'];

  useEffect(() => {
    const fetchLogData = async () => {
      setIsLoading(true);
      try {
        const user = authService.getCurrentUser();
        const role = authService.getRole();
        const token = authService.getToken();
        const storeId = user?.storeId;
        const userId = user?.userId;

        const headers = { Authorization: `Bearer ${token}` };

        const [transferRes, adjustmentRes] = await Promise.all([
          axios.get('http://localhost:8081/api/transfers/logs', { headers }),
          axios.get('http://localhost:8081/api/stock-adjustments', { headers })
        ]);

        const transfers = transferRes.data
          .filter(item =>
            item.status === 'COMPLETED' &&
            (role === 'ADMIN' || item.fromStore?.storeId === storeId || item.toStore?.storeId === storeId)
          )
          .map(item => ({
            id: item.transferId,
            timestamp: item.timestamp,
            productName: item.product?.name || 'Unknown',
            action: 'Transferred',
            details: `From ${item.toStore?.name || 'N/A'} to ${item.fromStore?.name || 'N/A'}`,
            quantity: item.fromStore?.storeId === storeId ? Math.abs(item.quantity) : -Math.abs(item.quantity),
            userName: item.requestedBy?.name || 'Unknown',
            userRole: 'Manager'
          }));

        const adjustments = adjustmentRes.data
          .filter(item => role === 'ADMIN' || item.user?.userId === userId)
          .map(item => ({
            id: item.adjustmentId,
            timestamp: item.timestamp,
            productName: item.product?.name || 'Unknown',
            action: 'Adjusted',
            details: item.reason || 'Adjustment',
            quantity: item.changeType === 'ADD' ? Math.abs(item.quantityChange) : -Math.abs(item.quantityChange),
            userName: item.user?.name || 'Unknown',
            userRole: 'Manager'
          }));

        const combinedLogs = [...transfers, ...adjustments].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
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
    setFilters((prev) => ({ ...prev, [name]: value }));
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
    const matchesDateTo = filters.dateTo === '' || itemDate <= new Date(`${filters.dateTo}T23:59:59`);

    return matchesSearch && matchesAction && matchesDateFrom && matchesDateTo;
  });

  return (
    <div className="px-6 py-8 max-w-screen bg-gray-50">
      <Card className="p-6 mb-6">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6" />
              <h2 className="text-3xl font-semibold">Change Log</h2>
            </div>
            <div className="max-w-sm w-full">
              <div className="h-4"></div>
              <Input
                type="search"
                placeholder="Search by product, details or user"
                name="searchTerm"
                value={filters.searchTerm}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="min-w-[180px] flex-1">
              <label className="block text-sm font-medium mb-1">Action Type</label>
              <select
                name="actionType"
                value={filters.actionType}
                onChange={handleFilterChange}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All Actions</option>
                {actionTypes.map((action) => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>

            <div className="min-w-[180px] flex-1">
              <label className="block text-sm font-medium mb-1">From Date</label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="min-w-[180px] flex-1">
              <label className="block text-sm font-medium mb-1">To Date</label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 text-gray-700">
          <Card>
            <Table
              columns={columns}
              data={filteredData}
              isLoading={isLoading}
              emptyMessage="No log entries found matching your criteria."
            />
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default ChangeLog;
