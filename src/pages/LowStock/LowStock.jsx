
import React, { useEffect, useState } from 'react';
import { AlertTriangle, Package, TrendingDown, RefreshCw } from 'lucide-react';
import axios from '../../services/axiosConfig';
import authService from '../../services/authService';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '../../components/Card/Card'; // adjust path if needed



const LowStock = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const navigate = useNavigate();
const location = useLocation();

const handleRefresh = () => {
  navigate('/reload', { replace: true }); // go to dummy route
  setTimeout(() => navigate(location.pathname), 0); // go back to current route
};
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const user = authService.getCurrentUser();
      const storeId = user?.storeId;
      const response = await axios.get(`/api/inventory/store/${storeId}`);
      setInventoryData(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLowStockItems = inventoryData.filter(item => item.status === 'LOW_STOCK');

  const getStockLevel = (current, min) => {
    const percentage = (current / min) * 100;
    if (percentage <= 20) return { level: 'critical', color: 'bg-red-500', textColor: 'text-red-600' };
    return { level: 'low', color: 'bg-orange-500', textColor: 'text-orange-600'};
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen mx-auto max-w-[95em]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Low Stock Alert</h1>
            </div>
            <p className="text-gray-600 text-lg">
              Products requiring immediate attention due to low inventory levels
            </p>
          </div>
        <button
  onClick={handleRefresh}
  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
>
  <RefreshCw className="w-4 h-4" />
  Refresh
</button>
           {/* <button
  onClick={() => window.location.reload()}
  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
>
  <RefreshCw className="w-4 h-4" />
  Refresh
</button> */}

       
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
       <div className="relative group bg-white p-6 rounded-xl shadow-sm border border-gray-200">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-600">Critical Stock</p>
      <p className="text-2xl font-bold text-red-600">
        {
          filteredLowStockItems.filter(item => (item.quantity / item.minThreshold) * 100 <= 20).length
        }
      </p>
    </div>
    <div className="p-3 bg-red-100 rounded-lg">
      <AlertTriangle className="w-6 h-6 text-red-600" />
    </div>
  </div>
  <div className="absolute z-10 bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-yellow-50 text-gray-700 text-sm rounded-md px-4 py-2 shadow-lg border border-yellow-200 w-64 text-center">
    <span className="font-semibold text-red-600">Critical:</span> Stock ≤ 20% of minimum threshold
  </div>
</div>

        
        <div className="relative group bg-white p-6 rounded-xl shadow-sm border border-gray-200">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-600">Low Stock</p>
      <p className="text-2xl font-bold text-orange-600">
        {filteredLowStockItems.length}
      </p>
    </div>
    <div className="p-3 bg-orange-100 rounded-lg">
      <TrendingDown className="w-6 h-6 text-orange-600" />
    </div>
  </div>
  {/* Tooltip */}
  <div className="absolute z-10 bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-yellow-50 text-gray-700 text-sm rounded-md px-4 py-2 shadow-lg border border-yellow-200 w-64 text-center">
    <span className="font-semibold text-orange-600">Low:</span> Stock above 20% of minimum threshold
  </div>
</div>


        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-blue-600">{inventoryData.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
     

      {/* Product List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Products Requiring Attention</h2>
        </div>

        {filteredLowStockItems.length === 0 ? (
          <div className="p-12 text-center">
            <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Package className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Stock Levels Good!</h3>
            <p className="text-gray-600">No products are currently below their minimum threshold.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredLowStockItems.map((product) => {
              const stockInfo = getStockLevel(product.quantity, product.minThreshold);
              return (
                <div key={product.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        <Package className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{product.product?.name || 'Unnamed'}</h3>
                        <p className="text-gray-600">{product.product?.category || 'Unknown Category'}</p>
                        <p className="text-sm text-gray-500">Status: {product.status.replace('_', ' ')}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${stockInfo.textColor} bg-opacity-20 ${stockInfo.color}`}
                        >
                          {stockInfo.level.toUpperCase()}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          Current: <span className="font-semibold">{product.quantity}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Min Required: <span className="font-semibold">{product.minThreshold}</span>
                        </p>
                      </div>

                      <div className="w-32">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Stock Level</span>
                          <span>
                            {Math.round((product.quantity / product.minThreshold) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${stockInfo.color}`}
                            style={{ width: `${Math.min((product.quantity / product.minThreshold) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LowStock;
