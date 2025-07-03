import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Table from '../../components/Table/Table';
import styles from './PurchaseOrder.module.css';

const PurchaseOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [poItems, setPOItems] = useState([]);
  const [poDetails, setPODetails] = useState({
    poNumber: `PO-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    expectedDelivery: '',
    notes: '',
    status: 'Draft'
  });

  // Table columns configuration
  const columns = [
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
      header: 'Supplier',
      accessor: 'supplier',
    },
    {
      header: 'Current Stock',
      accessor: 'currentStock',
    },
    {
      header: 'Order Quantity',
      accessor: 'orderQuantity',
      render: (row) => (
        <input
          type="number"
          min="1"
          value={row.orderQuantity}
          onChange={(e) => handleQuantityChange(row.id, parseInt(e.target.value))}
          className={styles.quantityInput}
        />
      )
    },
    {
      header: 'Unit Price',
      accessor: 'unitPrice',
      render: (row) => (
        <div className={styles.priceCell}>
          ${row.unitPrice.toFixed(2)}
        </div>
      )
    },
    {
      header: 'Total',
      render: (row) => (
        <div className={styles.totalCell}>
          ${(row.unitPrice * row.orderQuantity).toFixed(2)}
        </div>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <Button
          variant="outline"
          size="small"
          onClick={() => handleRemoveItem(row.id)}
        >
          Remove
        </Button>
      )
    }
  ];

  // Initialize PO items from location state or fetch from API
  useEffect(() => {
    const initializePOItems = async () => {
      setIsLoading(true);
      try {
        // If items were passed via location state, use them
        if (location.state?.items && location.state.items.length > 0) {
          // Add unit price and order quantity to each item
          const itemsWithPrice = location.state.items.map(item => ({
            ...item,
            orderQuantity: item.suggestedOrder || Math.max(item.threshold - item.currentStock, 5),
            unitPrice: getMockUnitPrice(item.category)
          }));
          setPOItems(itemsWithPrice);
        } else {
          // In a real app, you might fetch default items or show an empty PO
          console.log('No items provided for purchase order');
        }
      } catch (error) {
        console.error('Error initializing purchase order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializePOItems();
  }, [location.state]);

  // Get mock unit price based on category
  const getMockUnitPrice = (category) => {
    const prices = {
      'Electronics': () => 100 + Math.random() * 900,
      'Clothing': () => 20 + Math.random() * 80,
      'Food': () => 5 + Math.random() * 15,
      'Home Goods': () => 15 + Math.random() * 85,
      'Office Supplies': () => 5 + Math.random() * 45
    };

    return Math.round((prices[category] ? prices[category]() : 10 + Math.random() * 90) * 100) / 100;
  };

  // Handle quantity change
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setPOItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, orderQuantity: newQuantity } : item
    ));
  };

  // Handle remove item
  const handleRemoveItem = (itemId) => {
    setPOItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Handle input change for PO details
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPODetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle download PDF
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      // In a real app, this would call an API to generate a PDF
      // For this demo, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      alert('Purchase Order PDF has been generated and downloaded successfully!');
      
      // In a real app, you would trigger the download here
      // window.open('/api/po/download/' + poDetails.poNumber, '_blank');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Calculate totals
  const totalItems = poItems.length;
  const totalQuantity = poItems.reduce((sum, item) => sum + item.orderQuantity, 0);
  const subtotal = poItems.reduce((sum, item) => sum + (item.unitPrice * item.orderQuantity), 0);
  const tax = subtotal * 0.08; // Assuming 8% tax
  const total = subtotal + tax;

  return (
    <div className={styles.poContainer}>
      <div className={styles.poHeader}>
        <div>
          <h1>Purchase Order</h1>
          <p>Review and generate purchase order for selected items</p>
        </div>
        <div className={styles.headerActions}>
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            disabled={isGeneratingPDF}
          >
            Back
          </Button>
          <Button 
            variant="primary" 
            onClick={handleDownloadPDF}
            disabled={poItems.length === 0 || isGeneratingPDF}
          >
            {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
          </Button>
        </div>
      </div>

      <div className={styles.poDetailsSection}>
        <Card className={styles.poDetailsCard}>
          <div className={styles.poDetailsGrid}>
            <div className={styles.poDetailItem}>
              <label htmlFor="poNumber" className={styles.poDetailLabel}>PO Number</label>
              <input
                type="text"
                id="poNumber"
                name="poNumber"
                value={poDetails.poNumber}
                onChange={handleInputChange}
                className={styles.poDetailInput}
                readOnly
              />
            </div>
            
            <div className={styles.poDetailItem}>
              <label htmlFor="date" className={styles.poDetailLabel}>Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={poDetails.date}
                onChange={handleInputChange}
                className={styles.poDetailInput}
              />
            </div>
            
            <div className={styles.poDetailItem}>
              <label htmlFor="expectedDelivery" className={styles.poDetailLabel}>Expected Delivery</label>
              <input
                type="date"
                id="expectedDelivery"
                name="expectedDelivery"
                value={poDetails.expectedDelivery}
                onChange={handleInputChange}
                className={styles.poDetailInput}
              />
            </div>
            
            <div className={styles.poDetailItem}>
              <label htmlFor="status" className={styles.poDetailLabel}>Status</label>
              <select
                id="status"
                name="status"
                value={poDetails.status}
                onChange={handleInputChange}
                className={styles.poDetailInput}
              >
                <option value="Draft">Draft</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Sent">Sent</option>
              </select>
            </div>
          </div>
          
          <div className={styles.poNotesContainer}>
            <label htmlFor="notes" className={styles.poDetailLabel}>Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={poDetails.notes}
              onChange={handleInputChange}
              className={styles.poNotesInput}
              placeholder="Add any special instructions or notes for this purchase order"
              rows={3}
            />
          </div>
        </Card>
      </div>

      <Card className={styles.poItemsCard}>
        <h2 className={styles.sectionTitle}>Order Items</h2>
        
        {poItems.length === 0 && !isLoading ? (
          <div className={styles.emptyState}>
            <p>No items added to this purchase order.</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/restock-suggestions')}
            >
              Add Items from Suggestions
            </Button>
          </div>
        ) : (
          <Table
            columns={columns}
            data={poItems}
            isLoading={isLoading}
            emptyMessage="No items in this purchase order."
          />
        )}
      </Card>

      {poItems.length > 0 && (
        <Card className={styles.poSummaryCard}>
          <h2 className={styles.sectionTitle}>Order Summary</h2>
          
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Items:</span>
              <span className={styles.summaryValue}>{totalItems}</span>
            </div>
            
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Quantity:</span>
              <span className={styles.summaryValue}>{totalQuantity}</span>
            </div>
            
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Subtotal:</span>
              <span className={styles.summaryValue}>${subtotal.toFixed(2)}</span>
            </div>
            
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Tax (8%):</span>
              <span className={styles.summaryValue}>${tax.toFixed(2)}</span>
            </div>
            
            <div className={`${styles.summaryItem} ${styles.totalRow}`}>
              <span className={styles.summaryLabel}>Total:</span>
              <span className={styles.summaryValue}>${total.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PurchaseOrder;