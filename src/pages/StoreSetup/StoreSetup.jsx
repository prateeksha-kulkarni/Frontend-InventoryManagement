// import React, { useState, useEffect } from 'react';
// import Card from '../../components/Card/Card';
// import Button from '../../components/Button/Button';
// import Input from '../../components/Input/Input';
// import Table from '../../components/Table/Table';
// import styles from './StoreSetup.module.css';
// import axios from '../../services/axiosConfig';

// const StoreSetup = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     address: ''
//   });

//   const [stores, setStores] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isTableLoading, setIsTableLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');

//   // Table columns configuration (removed 'id', changed 'address' to 'location')
//   const columns = [
//     { header: 'Store Name', accessor: 'name' },
//     { header: 'Address', accessor: 'location' }
//   ];

//   // Fetch stores on component mount
//   useEffect(() => {
//     fetchStores();
//   }, []);

//   const fetchStores = async () => {
//     setIsTableLoading(true);
//     try {
//       const response = await axios.get('/api/stores');
//       setStores(response.data);
//     } catch (error) {
//       console.error('Error fetching stores:', error);
//     } finally {
//       setIsTableLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');
//     setSuccessMessage('');

//     try {
//       // Map 'address' to 'location' for backend
//       const payload = {
//         name: formData.name,
//         location: formData.address
//       };

//       const response = await axios.post('/api/stores', payload);

//       setSuccessMessage(`Store "${formData.name}" has been successfully added.`);

//       // Reset form after success
//       setFormData({ name: '', address: '' });

//       // Refresh store list
//       fetchStores();
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to add store. Please try again.');
//       console.error(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//       <div className={styles.storeSetupContainer}>
//         <div className={styles.storeSetupHeader}>
//           <h1>Store Setup</h1>
//           <p>Add and manage store locations</p>
//         </div>

//         <Card className={styles.formCard}>
//           <h2 className={styles.sectionTitle}>Add New Store</h2>

//           {error && <div className={styles.errorMessage}>{error}</div>}
//           {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

//           <form onSubmit={handleSubmit} className={styles.storeForm}>
//             <Input
//                 label="Store Name"
//                 type="text"
//                 id="name"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 required
//                 placeholder="Enter store name"
//             />

//             <Input
//                 label="Address"
//                 type="text"
//                 id="address"
//                 name="address"
//                 value={formData.address}
//                 onChange={handleChange}
//                 required
//                 placeholder="Enter store address"
//             />

//             <div className={styles.formActions}>
//               <Button
//                   type="submit"
//                   variant="primary"
//                   disabled={isLoading}
//               >
//                 {isLoading ? 'Adding...' : 'Add Store'}
//               </Button>
//             </div>
//           </form>
//         </Card>

//         <Card className={styles.storesCard}>
//           <h2 className={styles.sectionTitle}>Existing Stores</h2>
//           <Table
//               columns={columns}
//               data={stores}
//               isLoading={isTableLoading}
//               emptyMessage="No stores found."
//           />
//         </Card>
//       </div>
//   );
// };

// export default StoreSetup;

import React, { useState } from 'react';
import { Store, MapPin, Plus, Edit2, Trash2 } from 'lucide-react';

const StoreSetup = () => {
  const [stores, setStores] = useState([
    { id: 1, name: 'Store 1', address: 'Downtown' },
    { id: 2, name: 'Store 2', address: 'Uptown' }
  ]);
  const [formData, setFormData] = useState({ name: '', address: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.address) {
      setStores([...stores, { 
        id: Date.now(), 
        name: formData.name, 
        address: formData.address 
      }]);
      setFormData({ name: '', address: '' });
    }
  };

  const handleDelete = (id) => {
    setStores(stores.filter(store => store.id !== id));
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3 flex items-center gap-3">
            <Store className="text-blue-600" size={40} />
            Store Setup
          </h1>
          <p className="text-gray-600 text-lg">Add and manage store locations with ease</p>
        </div>

        {/* Add New Store Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl">
              <Plus className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Add New Store</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Store Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter store name"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-700 placeholder-gray-400"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Enter store address"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-700 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Plus size={20} />
                ADD STORE
              </button>
            </div>
          </form>
        </div>

        {/* Existing Stores Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg">
                <Store className="text-white" size={20} />
              </div>
              Existing Stores
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Store Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stores.map((store, index) => (
                  <tr key={store.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Store className="text-blue-600" size={16} />
                        </div>
                        <span className="text-gray-900 font-medium">{store.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={16} className="text-gray-400" />
                        {store.address}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150">
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(store.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {stores.length === 0 && (
            <div className="text-center py-12">
              <Store className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 text-lg">No stores added yet</p>
              <p className="text-gray-400">Add your first store using the form above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreSetup;