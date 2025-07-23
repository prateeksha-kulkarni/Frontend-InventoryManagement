import React, { useState } from 'react';
import axios from '../../services/axiosConfig';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Calendar, Store, TrendingUp, Package } from 'lucide-react';
import ReactHover, { Trigger, Hover } from 'react-hover';

const options = {
  followCursor: true,
  shiftX: 20,
  shiftY: 0,
};



const InventoryAnalytics = () => {
  const [formData, setFormData] = useState({ startDate: '', endDate: '', store: '' });
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [storeOptions, setStoreOptions] = useState([]);


  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerateReport = async () => {
    const { startDate, endDate } = formData;
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/inventory-analytics/turnover', { startDate, endDate });
      const data = response.data;

      setReportData(data);
      setReportGenerated(true);

      // Extract unique store names
      const uniqueStores = [...new Set(data.map(item => item.storeName))];
      setStoreOptions(uniqueStores);

    } catch (error) {
      console.error('Error fetching report:', error);
      alert('Failed to fetch inventory report.');
    } finally {
      setLoading(false);
    }
  };


  const getStatusClass = (status) => {
    switch (status) {
      case 'Overstock': return 'text-orange-500';
      case 'Healthy': return 'text-green-600';
      case 'Stockout': return 'text-red-500';
      default: return '';
    }
  };

  const filteredData = formData.store
    ? reportData.filter(item => item.storeName === formData.store)
    : reportData;

  // Dummy chart placeholder data
  const categoryDistribution = [
    { name: 'Electronics', value: 4 },
    { name: 'Home', value: 2 },
    { name: 'Sports', value: 2 },
  ];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-[95em] mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
          <Package className="mr-3" />
          Inventory Analytics Dashboard
        </h1>

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="mr-2" />
            Generate Report
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" /> Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" /> End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Store className="inline w-4 h-4 mr-1" /> Store
              </label>
              <select
                name="store"
                value={formData.store}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Stores</option>
                {storeOptions.map((store) => (
                  <option key={store} value={store}>
                    {store}
                  </option>
                ))}
              </select>

            </div>
            <div>
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                {loading ? 'Loading...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>

        {/* Report Display */}
        {reportGenerated && filteredData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Table */}
            <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Inventory Report</h3>
              <table className="w-full text-sm text-left overflow-hidden ">
                <thead className="bg-gray-100 text-gray-700 ">
                  <tr>
                    <th className="px-4 py-2">Store</th>
                    <th className="px-4 py-2">Product</th>
                    <th className="px-4 py-2">Quantity</th>
                    <th className="px-4 py-2">Threshold</th>
<th className="px-4 py-2 relative">
  Status
  <div className="inline-block relative ml-1">
    <span className="text-gray-400 font-bold cursor-pointer border border-gray-300 rounded-full px-2 py-0.5 text-xs peer">
      ?
    </span>
    <div
      className="absolute z-10 w-56 p-3 text-xs text-white bg-gray-700 rounded-lg shadow-lg opacity-0 transition-opacity duration-200 pointer-events-none peer-hover:opacity-100 top-8 left-0"
    >
      <p className="mb-1">
        <span className="font-semibold text-orange-300">Overstock</span>: Quantity &gt; 2 × Threshold
      </p>
      <p className="mb-1">
        <span className="font-semibold text-green-300">Healthy</span>: Quantity ≤ 2 × Threshold
      </p>
      <p>
        <span className="font-semibold text-red-300">Understock</span>: Quantity &lt; Threshold
      </p>
    </div>
  </div>
</th>


                    <th className="px-4 py-2">Turnover</th>
                    <th className="px-4 py-2">Sales Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{item.storeName}</td>
                      <td className="px-4 py-2">{item.productName}</td>
                      <td className="px-4 py-2">{item.quantity}</td>
                      <td className="px-4 py-2">{item.minThreshold}</td>
                      <td className={`px-4 py-2 font-semibold ${getStatusClass(item.stockStatus)}`}>
                        {item.stockStatus}
                      </td>
                      <td className="px-4 py-2">{item.turnoverRate.toFixed(2)}</td>
                      <td className="px-4 py-2">{item.salesTurnoverRate?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Charts */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Stock Levels vs Min Threshold</h3>
<ResponsiveContainer width="100%" height={300}>
  <BarChart
    data={filteredData.map((item, idx) => ({
      ...item,
      label: `${item.productName} @ ${item.storeName}`
    }))}
    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis
      dataKey="label"
      interval={0}
      tick={({ x, y, payload }) => {
        const [line1, line2] = payload.value.split(" @ ");
        return (
          <g transform={`translate(${x},${y + 10})`}>
            <text textAnchor="middle" fill="#666" fontSize={12}>
              <tspan x={0} dy="0em">{line1}</tspan>
              <tspan x={0} dy="1.2em">{line2}</tspan>
            </text>
          </g>
        );
      }}
    />
    <YAxis
  label={{
    value: 'Quantity',
    angle: -90,
    position: 'insideLeft',
    offset: 10,
    style: { textAnchor: 'middle', fill: '#555', fontSize: 14 }
  }}
/>


    {/* ✅ Custom Tooltip */}
    <Tooltip
      content={({ active, payload, label }) => {
        if (active && payload && payload.length) {
          const item = payload[0].payload;
          return (
            <div className="bg-white p-3 rounded shadow border text-sm text-gray-800">
              <p className="font-semibold">{label}</p>
              <p>Quantity: <span className="font-medium">{item.quantity}</span></p>
              <p>Min Threshold: <span className="font-medium">{item.minThreshold}</span></p>
              <p>Status: <span className={`font-semibold ${getStatusClass(item.stockStatus)}`}>{item.stockStatus}</span></p>
            </div>
          );
        }
        return null;
      }}
    />



    {/* ✅ Single bar: Quantity only, color-coded */}
    <Bar
      dataKey="quantity"
    >
      {
        filteredData.map((entry, index) => {
          let color = '#82ca9d'; // Healthy
          if (entry.stockStatus === 'Overstock') color = '#f97316'; // Orange
          else if (entry.stockStatus === 'Stockout') color = '#ef4444'; // Red
          return <Cell key={`cell-${index}`} fill={color} />;
        })
      }
    </Bar>
  </BarChart>
</ResponsiveContainer>


              </div>
              {/* <div className="bg-white rounded-2xl shadow-lg p-6 h-64 flex items-center justify-center text-gray-400 border border-dashed">
                Quantity vs Turnover Graph Placeholder
              </div> */}
            </div>
          </div>
        )}

        {reportGenerated && filteredData.length === 0 && !loading && (
          <p className="text-gray-500 text-center mt-10 text-lg">
            No report data available for the selected filters.
          </p>
        )}
      </div>
    </div>
  );
};

export default InventoryAnalytics;

