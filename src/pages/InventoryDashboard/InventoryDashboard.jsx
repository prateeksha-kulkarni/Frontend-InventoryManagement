// import React, { useState } from "react";
// import axios from "../../services/axiosConfig";

// export default function InventoryDashboard() {
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [reportData, setReportData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedStore, setSelectedStore] = useState("");

//   const fetchReport = async () => {
//     if (!startDate || !endDate) {
//       alert("Please select both start and end dates.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post("/inventory-analytics/turnover", {
//         startDate,
//         endDate,
//       });
//       setReportData(response.data);
//     } catch (error) {
//       console.error("Error fetching report:", error);
//       alert("Failed to fetch inventory report.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const storeOptions = [...new Set(reportData.map((item) => item.storeName))];

//   const filteredData = selectedStore
//     ? reportData.filter((item) => item.storeName === selectedStore)
//     : reportData;

//   return (
//     <div className="p-8 w-full max-w-screen ">
//       <h1 className="text-3xl font-bold text-gray-800 mb-6">
//         Inventory Analytics
//       </h1>

//       {/* Filters Row */}
//       <div className="flex flex-wrap items-end gap-4 mb-6">
//         <div className="flex flex-col">
//           <label className="text-sm text-gray-600 mb-1">Start Date</label>
//           <input
//             type="date"
//             className="border border-gray-300 text-black rounded px-3 py-2"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//           />
//         </div>
//         <div className="flex flex-col">
//           <label className="text-sm text-gray-600 mb-1">End Date</label>
//           <input
//             type="date"
//             className="border border-gray-300 text-black rounded px-3 py-2"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//           />
//         </div>
//         <div className="flex flex-col">
//           <label className="text-sm text-gray-600 mb-1">Store</label>
//           <select
//             className="border border-gray-300 text-black rounded px-3 py-2"
//             value={selectedStore}
//             onChange={(e) => setSelectedStore(e.target.value)}
//           >
//             <option value="">All Stores</option>
//             {storeOptions.map((store) => (
//               <option key={store} value={store}>
//                 {store}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div>
//           <button
//             onClick={fetchReport}
//             disabled={loading}
//             className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
//           >
//             {loading ? "Loading..." : "Generate Report"}
//           </button>
//         </div>
//       </div>

//       {/* Table */}
// {/* Two-Column Layout */}
// {filteredData.length > 0 ? (
//   <div className="mt-6 flex flex-col lg:flex-row gap-6">
//     {/* Left Side - Table */}
//     <div className="lg:w-1/2 w-full overflow-x-auto border border-gray-300 rounded-2xl shadow-md">
//       <table className="min-w-full table-auto text-sm my-2">
//         <thead className="bg-gray-100 text-gray-700">
//           <tr>
//             <th className="border px-4 py-2 text-left">Store Name</th>
//             <th className="border px-4 py-2 text-left">Product Name</th>
//             <th className="border px-4 py-2">Quantity</th>
//             <th className="border px-4 py-2">Min Threshold</th>
//             <th className="border px-4 py-2">Stock Status</th>
//             <th className="border px-4 py-2">Turnover Rate</th>
//             <th className="border px-4 py-2">Sales Turnover Rate</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredData.map((item, idx) => (
//             <tr key={idx} className="hover:bg-gray-50">
//               <td className="border px-4 py-2">{item.storeName}</td>
//               <td className="border px-4 py-2">{item.productName}</td>
//               <td className="border px-4 py-2 text-center">{item.quantity}</td>
//               <td className="border px-4 py-2 text-center">{item.minThreshold}</td>
//               <td className={`border px-4 py-2 text-center font-semibold ${getStatusClass(item.stockStatus)}`}>
//                 {item.stockStatus}
//               </td>
//               <td className="border px-4 py-2 text-center">
//                 {item.turnoverRate.toFixed(2)}
//               </td>
//               <td className="border px-4 py-2 text-center">
//                 {item.salesTurnoverRate?.toFixed(2)}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>

//     {/* Right Side - Graph Placeholders */}
//     <div className="lg:w-1/2 w-full flex flex-col gap-6">
//       {/* Top Graph Box */}
//       <div className="bg-white h-64 rounded-2xl shadow-md border border-dashed border-gray-400 flex items-center justify-center text-gray-500">
//         Top Graph Placeholder
//       </div>

//       {/* Bottom Graph Box */}
//       <div className="bg-white h-64 rounded-2xl shadow-md border border-dashed border-gray-400 flex items-center justify-center text-gray-500">
//         Bottom Graph Placeholder
//       </div>
//     </div>
//   </div>
// ) : (
//   !loading && (
//     <p className="text-gray-500 text-center mt-10 text-lg">
//       No report data available.
//     </p>
//   )
// )}

//     </div>
//   );
// }

// function getStatusClass(status) {
//   switch (status) {
//     case "Overstock":
//       return "text-orange-500";
//     case "Healthy":
//       return "text-green-600";
//     case "Stockout":
//       return "text-red-500";
//     default:
//       return "";
//   }
// }








// import React, { useState } from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
// import { Calendar, Store, TrendingUp, Package } from 'lucide-react';

// const InventoryAnalytics = () => {
//   const [formData, setFormData] = useState({
//     startDate: '',
//     endDate: '',
//     store: ''
//   });

//   const [reportGenerated, setReportGenerated] = useState(false);

//   // Sample inventory data
//   const inventoryData = [
//     { id: 1, product: 'Widget A', quantity: 150, threshold: 50, category: 'Electronics' },
//     { id: 2, product: 'Widget B', quantity: 25, threshold: 40, category: 'Home' },
//     { id: 3, product: 'Widget C', quantity: 200, threshold: 80, category: 'Electronics' },
//     { id: 4, product: 'Widget D', quantity: 45, threshold: 30, category: 'Sports' },
//     { id: 5, product: 'Widget E', quantity: 10, threshold: 35, category: 'Home' },
//     { id: 6, product: 'Widget F', quantity: 120, threshold: 60, category: 'Sports' },
//   ];

//   // Function to determine health status
//   const getHealthStatus = (quantity, threshold) => {
//     if (quantity > 2 * threshold) return 'Overstocked';
//     if (quantity < threshold) return 'Understocked';
//     return 'Healthy';
//   };

//   // Function to get health color
//   const getHealthColor = (status) => {
//     switch (status) {
//       case 'Overstocked': return '#ef4444';
//       case 'Understocked': return '#f59e0b';
//       case 'Healthy': return '#10b981';
//       default: return '#6b7280';
//     }
//   };

//   // Prepare data for quantity vs health chart
//   const healthChartData = inventoryData.map(item => ({
//     product: item.product,
//     quantity: item.quantity,
//     threshold: item.threshold,
//     status: getHealthStatus(item.quantity, item.threshold),
//     fill: getHealthColor(getHealthStatus(item.quantity, item.threshold))
//   }));

//   // Sample data for second chart (placeholder)
//   const categoryData = [
//     { name: 'Electronics', value: 2 },
//     { name: 'Home', value: 2 },
//     { name: 'Sports', value: 2 }
//   ];

//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

//   const handleInputChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleGenerateReport = () => {
//     setReportGenerated(true);
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
//           <Package className="mr-3" />
//           Inventory Analytics Dashboard
//         </h1>

//         {/* Form Section */}
//         <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//             <TrendingUp className="mr-2" />
//             Generate Report
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 <Calendar className="inline w-4 h-4 mr-1" />
//                 Start Date
//               </label>
//               <input
//                 type="date"
//                 name="startDate"
//                 value={formData.startDate}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 <Calendar className="inline w-4 h-4 mr-1" />
//                 End Date
//               </label>
//               <input
//                 type="date"
//                 name="endDate"
//                 value={formData.endDate}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 <Store className="inline w-4 h-4 mr-1" />
//                 Store
//               </label>
//               <select
//                 name="store"
//                 value={formData.store}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">Select Store</option>
//                 <option value="store1">Main Store</option>
//                 <option value="store2">Downtown Branch</option>
//                 <option value="store3">Mall Location</option>
//                 <option value="store4">Warehouse</option>
//               </select>
//             </div>
//             <div>
//               <button
//                 onClick={handleGenerateReport}
//                 className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
//               >
//                 Generate Report
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Main Content Layout */}
//         {reportGenerated && (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {/* Left Side - Inventory Table */}
//             <div className="bg-white rounded-2xl shadow-lg p-6">
//               <h3 className="text-xl font-semibold text-gray-800 mb-4">Inventory Status</h3>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm text-left">
//                   <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-lg">
//                     <tr>
//                       <th className="px-4 py-3">Product</th>
//                       <th className="px-4 py-3">Quantity</th>
//                       <th className="px-4 py-3">Threshold</th>
//                       <th className="px-4 py-3">Status</th>
//                       <th className="px-4 py-3">Category</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {inventoryData.map((item) => {
//                       const status = getHealthStatus(item.quantity, item.threshold);
//                       return (
//                         <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
//                           <td className="px-4 py-3 font-medium text-gray-900">{item.product}</td>
//                           <td className="px-4 py-3">{item.quantity}</td>
//                           <td className="px-4 py-3">{item.threshold}</td>
//                           <td className="px-4 py-3">
//                             <span
//                               className="px-2 py-1 text-xs font-semibold rounded-full text-white"
//                               style={{ backgroundColor: getHealthColor(status) }}
//                             >
//                               {status}
//                             </span>
//                           </td>
//                           <td className="px-4 py-3">{item.category}</td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Right Side - Charts */}
//             <div className="space-y-6">
//               {/* Upper Chart - Quantity vs Health Status */}
//               <div className="bg-white rounded-2xl shadow-lg p-6">
//                 <h3 className="text-xl font-semibold text-gray-800 mb-4">Quantity vs Health Status</h3>
//                 <ResponsiveContainer width="100%" height={250}>
//                   <BarChart data={healthChartData}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="product" angle={-45} textAnchor="end" height={80} />
//                     <YAxis />
//                     <Tooltip 
//                       formatter={(value, name) => [value, name]}
//                       labelFormatter={(label) => `Product: ${label}`}
//                     />
//                     <Legend />
//                     <Bar dataKey="quantity" name="Current Quantity" />
//                     <Bar dataKey="threshold" fill="#94a3b8" name="Threshold" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>

//               {/* Lower Chart - Category Distribution (Placeholder) */}
//               <div className="bg-white rounded-2xl shadow-lg p-6">
//                 <h3 className="text-xl font-semibold text-gray-800 mb-4">Category Distribution</h3>
//                 <ResponsiveContainer width="100%" height={250}>
//                   <PieChart>
//                     <Pie
//                       data={categoryData}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                       outerRadius={80}
//                       fill="#8884d8"
//                       dataKey="value"
//                     >
//                       {categoryData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default InventoryAnalytics;


import React, { useState } from 'react';
import axios from '../../services/axiosConfig';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Calendar, Store, TrendingUp, Package } from 'lucide-react';

const InventoryAnalytics = () => {
  const [formData, setFormData] = useState({ startDate: '', endDate: '', store: '' });
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

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
      setReportData(response.data);
      setReportGenerated(true);
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
                <option value="Store 1">Store 1</option>
                <option value="Store 2">Store 2</option>
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
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-2">Store</th>
                    <th className="px-4 py-2">Product</th>
                    <th className="px-4 py-2">Quantity</th>
                    <th className="px-4 py-2">Threshold</th>
                    <th className="px-4 py-2">Status</th>
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
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Category Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 h-64 flex items-center justify-center text-gray-400 border border-dashed">
                Quantity vs Turnover Graph Placeholder
              </div>
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


// Topmost Heading - text-3xl font-semibold
// Subheading - text-xl font-semibold
// body - text-sm font-medium
