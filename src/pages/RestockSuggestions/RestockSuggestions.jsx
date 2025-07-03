import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Table from '../../components/Table/Table';
import styles from './RestockSuggestions.module.css';

const RestockSuggestions = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'priority',
    direction: 'desc'
  });

  // Table columns configuration
  const columns = [
    {
      header: 'Select',
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedItems.includes(row.id)}
          onChange={() => handleItemSelect(row.id)}
          className={styles.checkbox}
        />
      )
    },
    {
      header: 'Product',
      accessor: 'productName',
      render: (row) => (
        <div>
          <div className={styles.productName}>{row.productName}</div>
          <div className={styles.skuText}>SKU: {row.sku}</div>
        </div>
      )
    },
    {
      header: 'Current Stock',
      accessor: 'currentStock',
      render: (row) => (
        <div className={`${styles.stockCell} ${getStockLevelClass(row.currentStock, row.threshold)}`}>
          {row.currentStock}
        </div>
      )
    },
    {
      header: 'Threshold',
      accessor: 'threshold',
    },
    {
      header: 'Suggested Order',
      accessor: 'suggestedOrder',
    },
    {
      header: 'Priority',
      accessor: 'priority',
      render: (row) => (
        <div className={styles.priorityCell}>
          <span className={`${styles.priorityBadge} ${styles[`priority${row.priority}`]}`}>
            {getPriorityLabel(row.priority)}
          </span>
        </div>
      )
    },
    {
      header: 'Reason',
      accessor: 'reason',
    },
    {
      header: 'Actions',
      render: (row) => (
        <Button
          variant="outline"
          size="small"
          onClick={() => handleGenerateSinglePO(row)}
        >
          Generate PO
        </Button>
      )
    }
  ];

  // Helper function to get stock level class
  const getStockLevelClass = (stock, threshold) => {
    if (stock <= threshold * 0.25) return styles.criticalStock;
    if (stock <= threshold * 0.5) return styles.lowStock;
    if (stock <= threshold) return styles.mediumStock;
    return '';
  };

  // Helper function to get priority label
  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 1: return 'Critical';
      case 2: return 'High';
      case 3: return 'Medium';
      case 4: return 'Low';
      default: return 'Unknown';
    }
  };

  // Fetch restock suggestions (mock implementation)
  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockSuggestions = [
          {
            id: 1,
            productName: 'Laptop',
            sku: 'ELEC-001',
            currentStock: 2,
            threshold: 10,
            suggestedOrder: 15,
            priority: 1,
            reason: 'Low stock, high demand',
            salesVelocity: 5,
            category: 'Electronics',
            lastOrdered: '2023-05-01',
            supplier: 'Tech Distributors Inc.'
          },
          {
            id: 2,
            productName: 'Smartphone',
            sku: 'ELEC-002',
            currentStock: 5,
            threshold: 15,
            suggestedOrder: 20,
            priority: 2,
            reason: 'Below threshold',
            salesVelocity: 4,
            category: 'Electronics',
            lastOrdered: '2023-05-10',
            supplier: 'Tech Distributors Inc.'
          },
          {
            id: 3,
            productName: 'T-shirt',
            sku: 'CLTH-001',
            currentStock: 12,
            threshold: 20,
            suggestedOrder: 30,
            priority: 3,
            reason: 'Approaching threshold',
            salesVelocity: 3,
            category: 'Clothing',
            lastOrdered: '2023-04-15',
            supplier: 'Fashion Wholesale Co.'
          },
          {
            id: 4,
            productName: 'Jeans',
            sku: 'CLTH-002',
            currentStock: 3,
            threshold: 15,
            suggestedOrder: 25,
            priority: 1,
            reason: 'Low stock, seasonal demand',
            salesVelocity: 4,
            category: 'Clothing',
            lastOrdered: '2023-04-20',
            supplier: 'Fashion Wholesale Co.'
          },
          {
            id: 5,
            productName: 'Cereal',
            sku: 'FOOD-001',
            currentStock: 4,
            threshold: 25,
            suggestedOrder: 40,
            priority: 1,
            reason: 'Critical stock level',
            salesVelocity: 6,
            category: 'Food',
            lastOrdered: '2023-05-05',
            supplier: 'Global Foods Inc.'
          },
          {
            id: 6,
            productName: 'Coffee',
            sku: 'FOOD-002',
            currentStock: 8,
            threshold: 10,
            suggestedOrder: 15,
            priority: 2,
            reason: 'Fast-selling item',
            salesVelocity: 5,
            category: 'Food',
            lastOrdered: '2023-05-12',
            supplier: 'Global Foods Inc.'
          },
          {
            id: 7,
            productName: 'Desk Lamp',
            sku: 'HOME-001',
            currentStock: 7,
            threshold: 10,
            suggestedOrder: 10,
            priority: 3,
            reason: 'Approaching threshold',
            salesVelocity: 2,
            category: 'Home Goods',
            lastOrdered: '2023-04-25',
            supplier: 'Home Essentials Ltd.'
          },
          {
            id: 8,
            productName: 'Notebook',
            sku: 'OFFC-001',
            currentStock: 15,
            threshold: 20,
            suggestedOrder: 20,
            priority: 4,
            reason: 'Regular restock',
            salesVelocity: 2,
            category: 'Office Supplies',
            lastOrdered: '2023-04-10',
            supplier: 'Office Depot'
          }
        ];
        
        setSuggestions(mockSuggestions);
      } catch (error) {
        console.error('Error fetching restock suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  // Handle item selection
  const handleItemSelect = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === suggestions.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(suggestions.map(item => item.id));
    }
  };

  // Handle generate PO for selected items
  const handleGeneratePO = () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item to generate a purchase order.');
      return;
    }
    
    // In a real app, you would pass the selected items to the PO page
    // For now, we'll just navigate to the PO page
    navigate('/purchase-order', { 
      state: { 
        items: suggestions.filter(item => selectedItems.includes(item.id)) 
      } 
    });
  };

  // Handle generate PO for a single item
  const handleGenerateSinglePO = (item) => {
    navigate('/purchase-order', { 
      state: { 
        items: [item] 
      } 
    });
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort suggestions
  const sortedSuggestions = [...suggestions].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Get summary stats
  const criticalItems = suggestions.filter(item => item.priority === 1).length;
  const totalSuggestedItems = suggestions.length;

  return (
    <div className={styles.restockContainer}>
      <div className={styles.restockHeader}>
        <div>
          <h1>Smart Restock Suggestions</h1>
          <p>Inventory items that need to be reordered based on stock levels and sales velocity</p>
        </div>
        <div className={styles.headerActions}>
          <Button 
            variant="primary" 
            onClick={handleGeneratePO}
            disabled={selectedItems.length === 0}
          >
            Generate Purchase Order ({selectedItems.length})
          </Button>
        </div>
      </div>

      <div className={styles.summaryCards}>
        <Card className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <span className={styles.criticalIcon}>!</span>
          </div>
          <div className={styles.summaryContent}>
            <h3>{criticalItems}</h3>
            <p>Critical Items</p>
          </div>
        </Card>
        
        <Card className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <span className={styles.totalIcon}>∑</span>
          </div>
          <div className={styles.summaryContent}>
            <h3>{totalSuggestedItems}</h3>
            <p>Total Suggested Items</p>
          </div>
        </Card>
      </div>

      <Card className={styles.restockCard}>
        <div className={styles.tableControls}>
          <div className={styles.selectAllContainer}>
            <label className={styles.selectAllLabel}>
              <input 
                type="checkbox" 
                checked={selectedItems.length === suggestions.length && suggestions.length > 0}
                onChange={handleSelectAll}
                className={styles.checkbox}
              />
              <span>Select All</span>
            </label>
          </div>
          
          <div className={styles.sortContainer}>
            <label htmlFor="sortBy" className={styles.sortLabel}>Sort by:</label>
            <select 
              id="sortBy" 
              value={`${sortConfig.key}-${sortConfig.direction}`}
              onChange={(e) => {
                const [key, direction] = e.target.value.split('-');
                setSortConfig({ key, direction });
              }}
              className={styles.sortSelect}
            >
              <option value="priority-asc">Priority (Low to High)</option>
              <option value="priority-desc">Priority (High to Low)</option>
              <option value="currentStock-asc">Current Stock (Low to High)</option>
              <option value="currentStock-desc">Current Stock (High to Low)</option>
              <option value="productName-asc">Product Name (A-Z)</option>
              <option value="productName-desc">Product Name (Z-A)</option>
            </select>
          </div>
        </div>
        
        <Table
          columns={columns}
          data={sortedSuggestions}
          isLoading={isLoading}
          emptyMessage="No restock suggestions available at this time."
        />
      </Card>
    </div>
  );
};

export default RestockSuggestions;