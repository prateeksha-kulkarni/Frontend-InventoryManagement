import React, { useState } from "react";
import axios from "../../services/axiosConfig";

export default function InventoryDashboard() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState("");

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/inventory-analytics/turnover", {
        startDate,
        endDate,
      });
      setReportData(response.data);
    } catch (error) {
      console.error("Error fetching report:", error);
      alert("Failed to fetch inventory report.");
    } finally {
      setLoading(false);
    }
  };

  const storeOptions = [...new Set(reportData.map((item) => item.storeName))];

  const filteredData = selectedStore
    ? reportData.filter((item) => item.storeName === selectedStore)
    : reportData;

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Inventory Analytics
      </h1>

      {/* Filters Row */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Start Date</label>
          <input
            type="date"
            className="border border-gray-300 text-black rounded px-3 py-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">End Date</label>
          <input
            type="date"
            className="border border-gray-300 text-black rounded px-3 py-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Store</label>
          <select
            className="border border-gray-300 text-black rounded px-3 py-2"
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
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
            onClick={fetchReport}
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Loading..." : "Generate Report"}
          </button>
        </div>
      </div>

      {/* Table */}
      {filteredData.length > 0 ? (
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full table-auto border border-gray-300 text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="border px-4 py-2 text-left">Store Name</th>
                <th className="border px-4 py-2 text-left">Product Name</th>
                <th className="border px-4 py-2">Quantity</th>
                <th className="border px-4 py-2">Min Threshold</th>
                <th className="border px-4 py-2">Stock Status</th>
                <th className="border px-4 py-2">Turnover Rate</th>
                <th className="border px-4 py-2">Sales Turnover Rate</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{item.storeName}</td>
                  <td className="border px-4 py-2">{item.productName}</td>
                  <td className="border px-4 py-2 text-center">{item.quantity}</td>
                  <td className="border px-4 py-2 text-center">{item.minThreshold}</td>
                  <td
                    className={`border px-4 py-2 text-center font-semibold ${getStatusClass(
                      item.stockStatus
                    )}`}
                  >
                    {item.stockStatus}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {item.turnoverRate.toFixed(2)}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {item.salesTurnoverRate?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      ) : (
        !loading && (
          <p className="text-gray-500 text-center mt-10 text-lg">
            No report data available.
          </p>
        )
      )}
    </div>
  );
}

function getStatusClass(status) {
  switch (status) {
    case "Overstock":
      return "text-orange-500";
    case "Healthy":
      return "text-green-600";
    case "Stockout":
      return "text-red-500";
    default:
      return "";
  }
}
