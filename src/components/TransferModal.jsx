// Updated TransferModal.jsx combining old API logic with new design
import React, { useState, useEffect } from 'react'
import { X, Package, MapPin, Hash, FileText } from 'lucide-react'
import axios from "../services/axiosConfig"
import authService from "../services/authService"

const TransferModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    productId: '',
    sourceStoreId: '',
    destinationStoreId: '',
    quantity: '',
    notes: ''
  })

  const [products, setProducts] = useState([])
  const [stores, setStores] = useState([])
  const user = authService.getCurrentUser()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, storesRes] = await Promise.all([
          axios.get('/api/products'),
          axios.get('/api/stores')
        ])

        setProducts(productsRes.data || [])
        setStores(storesRes.data || [])

        // Set user's store as default source
        const sourceStore = storesRes.data.find(
          s => s.name && user?.location && s.name.trim().toLowerCase() === user.location.trim().toLowerCase()
        )

        if (sourceStore) {
          setFormData(prev => ({
            ...prev,
            sourceStoreId: sourceStore.storeId || sourceStore.id
          }))
        }
      } catch (error) {
        console.error("Failed to fetch dropdown data", error)
      }
    }

    if (isOpen) fetchData()
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        product: { productId: formData.productId },
        fromStore: { storeId: formData.sourceStoreId },
        toStore: { storeId: formData.destinationStoreId },
        quantity: formData.quantity,
        notes: formData.notes,
        status: 'REQUESTED',
        requestedBy: { username: user.username }
      }
      await axios.post('/api/transfers', payload)
      onClose()
    } catch (err) {
      console.error("Failed to submit transfer request", err)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">New Transfer Request</h3>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Package size={16} /> Select Product
              </label>
              <select name="productId" value={formData.productId} onChange={handleChange} className="select-field" required>
                <option value="">-- Select a product --</option>
                {products.map(p => (
                  <option key={p.productId || p.id} value={p.productId || p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} /> Requesting From
              </label>
              <select name="destinationStoreId" value={formData.destinationStoreId} onChange={handleChange} className="select-field" required>
                <option value="">-- Select a store --</option>
                {stores.filter(s => s.storeId !== formData.sourceStoreId).map(s => (
                  <option key={s.storeId || s.id} value={s.storeId || s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Hash size={16} /> Required Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Enter quantity"
                className="input-field"
                min="1"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText size={16} /> Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Enter any additional notes or instructions"
                rows="3"
                className="input-field resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1">
                Request Transfer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TransferModal
