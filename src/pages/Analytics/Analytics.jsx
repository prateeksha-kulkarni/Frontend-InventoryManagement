import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';
import Card from '../../components/Card/Card';
import styles from './Analytics.module.css';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
);

const Analytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [stockData, setStockData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);

  // Fetch analytics data (mock implementation)
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock data based on selected time range
        generateMockData(timeRange);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  // Generate mock data for charts
  const generateMockData = (range) => {
    // Stock Status Data (Pie Chart)
    const stockStatusData = {
      labels: ['In Stock', 'Low Stock', 'Out of Stock', 'Overstock'],
      datasets: [
        {
          data: [65, 15, 5, 15],
          backgroundColor: [
            'rgba(46, 204, 113, 0.7)',
            'rgba(243, 156, 18, 0.7)',
            'rgba(231, 76, 60, 0.7)',
            'rgba(52, 152, 219, 0.7)',
          ],
          borderColor: [
            'rgba(46, 204, 113, 1)',
            'rgba(243, 156, 18, 1)',
            'rgba(231, 76, 60, 1)',
            'rgba(52, 152, 219, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
    setStockData(stockStatusData);

    // Sales Trend Data (Line Chart)
    let labels = [];
    let salesValues = [];
    let stockoutValues = [];

    if (range === 'week') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      salesValues = [12, 19, 15, 17, 22, 24, 20];
      stockoutValues = [1, 0, 2, 1, 0, 0, 1];
    } else if (range === 'month') {
      labels = Array.from({ length: 30 }, (_, i) => i + 1);
      salesValues = Array.from({ length: 30 }, () => Math.floor(Math.random() * 30) + 10);
      stockoutValues = Array.from({ length: 30 }, () => Math.floor(Math.random() * 3));
    } else if (range === 'quarter') {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      salesValues = [320, 350, 400, 450, 420, 500, 480, 460, 520, 540, 580, 600];
      stockoutValues = [5, 7, 3, 4, 2, 1, 3, 5, 2, 1, 0, 2];
    }

    const salesTrendData = {
      labels,
      datasets: [
        {
          label: 'Sales',
          data: salesValues,
          borderColor: 'rgba(52, 152, 219, 1)',
          backgroundColor: 'rgba(52, 152, 219, 0.2)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Stockouts',
          data: stockoutValues,
          borderColor: 'rgba(231, 76, 60, 1)',
          backgroundColor: 'rgba(231, 76, 60, 0.2)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
    setSalesData(salesTrendData);

    // Category Distribution Data (Bar Chart)
    const categoryDistributionData = {
      labels: ['Electronics', 'Clothing', 'Food', 'Home Goods', 'Office Supplies'],
      datasets: [
        {
          label: 'Items in Stock',
          data: [42, 78, 35, 29, 45],
          backgroundColor: 'rgba(52, 152, 219, 0.7)',
        },
        {
          label: 'Items Sold',
          data: [28, 52, 41, 19, 22],
          backgroundColor: 'rgba(46, 204, 113, 0.7)',
        },
      ],
    };
    setCategoryData(categoryDistributionData);
  };

  // Chart options
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Inventory Status Distribution',
        font: {
          size: 16,
        },
      },
    },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sales and Stockouts Trend',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Category Distribution',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Handle time range change
  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.analyticsHeader}>
        <div>
          <h1>Analytics Dashboard</h1>
          <p>Inventory and sales performance metrics</p>
        </div>
        <div className={styles.timeRangeSelector}>
          <label htmlFor="timeRange" className={styles.timeRangeLabel}>Time Range:</label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={handleTimeRangeChange}
            className={styles.timeRangeSelect}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
          </select>
        </div>
      </div>

      <div className={styles.metricsCards}>
        <Card className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <span className={styles.salesIcon}>$</span>
          </div>
          <div className={styles.metricContent}>
            <h3>$24,500</h3>
            <p>Total Sales</p>
            <span className={styles.metricTrend}>+12% from last period</span>
          </div>
        </Card>
        
        <Card className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <span className={styles.itemsIcon}>∑</span>
          </div>
          <div className={styles.metricContent}>
            <h3>1,250</h3>
            <p>Items Sold</p>
            <span className={styles.metricTrend}>+8% from last period</span>
          </div>
        </Card>
        
        <Card className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <span className={styles.stockoutIcon}>!</span>
          </div>
          <div className={styles.metricContent}>
            <h3>5</h3>
            <p>Stockouts</p>
            <span className={styles.metricTrendNegative}>+2 from last period</span>
          </div>
        </Card>
        
        <Card className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <span className={styles.turnoverIcon}>↻</span>
          </div>
          <div className={styles.metricContent}>
            <h3>4.2</h3>
            <p>Inventory Turnover</p>
            <span className={styles.metricTrend}>+0.3 from last period</span>
          </div>
        </Card>
      </div>

      <div className={styles.chartsContainer}>
        <div className={styles.chartRow}>
          <Card className={styles.chartCard}>
            {isLoading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading chart data...</p>
              </div>
            ) : (
              stockData && <Pie data={stockData} options={pieOptions} />
            )}
          </Card>
          
          <Card className={styles.chartCard}>
            {isLoading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading chart data...</p>
              </div>
            ) : (
              categoryData && <Bar data={categoryData} options={barOptions} />
            )}
          </Card>
        </div>
        
        <Card className={`${styles.chartCard} ${styles.fullWidthChart}`}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading chart data...</p>
            </div>
          ) : (
            salesData && <Line data={salesData} options={lineOptions} />
          )}
        </Card>
      </div>

      <div className={styles.insightsSection}>
        <Card className={styles.insightsCard}>
          <h2 className={styles.sectionTitle}>Key Insights</h2>
          <ul className={styles.insightsList}>
            <li className={styles.insightItem}>
              <span className={styles.insightBadge}>Trend</span>
              <p>Sales have increased by 12% compared to the previous period, with Electronics showing the strongest growth.</p>
            </li>
            <li className={styles.insightItem}>
              <span className={`${styles.insightBadge} ${styles.warningBadge}`}>Alert</span>
              <p>5 products are currently out of stock, with 3 of them being in the Electronics category.</p>
            </li>
            <li className={styles.insightItem}>
              <span className={`${styles.insightBadge} ${styles.successBadge}`}>Opportunity</span>
              <p>Clothing items have the highest inventory turnover rate. Consider increasing stock levels.</p>
            </li>
            <li className={styles.insightItem}>
              <span className={`${styles.insightBadge} ${styles.infoBadge}`}>Info</span>
              <p>15% of inventory is classified as overstock. Consider running promotions to reduce excess inventory.</p>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;