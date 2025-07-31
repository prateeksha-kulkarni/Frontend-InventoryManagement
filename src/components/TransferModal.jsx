import React, { useEffect, useState, useCallback } from 'react'
import { X, Package, MapPin, Hash, FileText } from 'lucide-react'
import axios from '../services/axiosConfig'
import authService from '../services/authService'
import { toast } from 'react-toastify'

const TransferModal = ({ isOpen, onClose,onRefreshHistory }) => {
  const user = authService.getCurrentUser()

  const [formData, setFormData] = useState({
    productId: '',
    sourceStoreId: '',
    destinationStoreId: '',
    quantity: '',
    notes: ''
  })

  const [products, setProducts] = useState([])
  const [stores, setStores] = useState([])
  const [inventory, setInventory] = useState([])
  const [availableStock, setAvailableStock] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [requestSent, setRequestSent] = useState(false)

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [productsRes, storesRes] = await Promise.all([
          axios.get('/api/products'),
          axios.get('/api/stores')
        ])
        setProducts(productsRes.data || [])
        setStores(storesRes.data || [])

        const matchedStore = storesRes.data.find(
          s => s.name && user?.location && s.name.trim().toLowerCase() === user.location.trim().toLowerCase()
        )
        if (matchedStore) {
          setFormData(prev => ({
            ...prev,
            sourceStoreId: matchedStore.storeId || matchedStore.id
          }))
        }
      } catch (err) {
        toast.error('Failed to load dropdown data.')
      }
    }

    if (isOpen) {
      fetchDropdowns()
    }
  }, [isOpen, user?.location])

  // Fetch inventory for source store
  useEffect(() => {
    const fetchInventory = async () => {
      if (!formData.sourceStoreId) return
      try {
        const res = await axios.get(`/api/inventory/store/${formData.sourceStoreId}`)
        setInventory(res.data || [])
      } catch (err) {
        setInventory([])
      }
    }
    fetchInventory()
  }, [formData.sourceStoreId])

  // Lookup available stock at destination store for selected product
  useEffect(() => {
    const fetchStock = async () => {
      if (!formData.destinationStoreId || !formData.productId) return
      try {
        const res = await axios.get(`/api/inventory/store/${formData.destinationStoreId}/product/${formData.productId}`)
        setAvailableStock(res.data?.quantity || 0)
      } catch (err) {
        setAvailableStock(0)
      }
    }
    fetchStock()
  }, [formData.destinationStoreId, formData.productId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }))

    if (name === 'productId') {
      const product = inventory.find(p => p.product?.productId === value)
      setSelectedProduct(product ? {
        name: product.product.name,
        sku: product.product.sku,
        currentStock: product.quantity
      } : null)
    }
  }

  const getStoreName = (id) => {
    return stores.find(s => s.storeId === id || s.id === id)?.name || id
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.productId) newErrors.productId = 'Please select a product.'
    if (!formData.sourceStoreId) newErrors.sourceStoreId = 'Please select a source store.'
    if (!formData.destinationStoreId) newErrors.destinationStoreId = 'Please select a destination store.'
    if (formData.sourceStoreId === formData.destinationStoreId) {
      newErrors.destinationStoreId = 'Source and destination cannot be the same.'
    }
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = 'Enter a valid quantity.'
    }

    const currentProduct = selectedProduct || inventory.find(p => p.product?.productId === formData.productId)
    if (currentProduct && parseInt(formData.quantity) > currentProduct.quantity) {
      newErrors.quantity = `Cannot transfer more than current stock (${currentProduct.quantity}).`
    }

    if (formData.quantity && availableStock !== null && parseInt(formData.quantity) > availableStock) {
      newErrors.quantity = `Cannot request more than available stock (${availableStock}) at ${getStoreName(formData.destinationStoreId)}.`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
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
      toast.success('Transfer request sent successfully!')
      onRefreshHistory?.() 
      resetForm()
      setRequestSent(true)
      setTimeout(() => setRequestSent(false), 3000)
      onClose()
    } catch (err) {
      toast.error('Failed to submit transfer request.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      productId: '',
      sourceStoreId: formData.sourceStoreId,
      destinationStoreId: '',
      quantity: '',
      notes: ''
    })
    setErrors({})
    setSelectedProduct(null)
    setAvailableStock(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-black bg-opacity-40" onClick={onClose}></div>
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">New Transfer Request</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <Package size={16} /> Select Product
              </label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                className="select-field"
                required
              >
                <option value="">-- Select a product --</option>
                {inventory.map((inv) => (
                  <option key={inv.product.productId} value={inv.product.productId}>
                    {inv.product.name}
                  </option>
                ))}
              </select>
              {errors.productId && <p className="text-red-500 text-sm">{errors.productId}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <MapPin size={16} /> Requesting From
              </label>
              <select
                name="destinationStoreId"
                value={formData.destinationStoreId}
                onChange={handleChange}
                className="select-field"
                required
              >
                <option value="">-- Select a store --</option>
                {stores
                  .filter((s) => s.storeId !== formData.sourceStoreId)
                  .map((s) => (
                    <option key={s.storeId} value={s.storeId}>
                      {s.name}
                    </option>
                  ))}
              </select>
              {errors.destinationStoreId && <p className="text-red-500 text-sm">{errors.destinationStoreId}</p>}
            </div>

            {selectedProduct && formData.destinationStoreId && (
              <div className="bg-gray-50 p-3 rounded-md border text-sm space-y-1">
                <div>
                  <strong>Product:</strong> {selectedProduct.name}
                </div>
                <div>
                  <strong>SKU:</strong> {selectedProduct.sku}
                </div>
                <div>
                  <strong>Available at {getStoreName(formData.destinationStoreId)}:</strong>{' '}
                  {availableStock ?? '...'}
                </div>
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <Hash size={16} /> Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="input-field"
                min="1"
                required
              />
              {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <FileText size={16} /> Notes (optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="input-field resize-none"
                rows="3"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                {isLoading ? 'Processing...' : 'Request Transfer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TransferModal
