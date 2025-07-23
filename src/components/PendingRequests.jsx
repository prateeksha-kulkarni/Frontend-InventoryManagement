import React, { useEffect, useState, useCallback } from 'react'
import { Clock, MapPin, Package } from 'lucide-react'
import axios from '../services/axiosConfig'
import authService from '../services/authService'
import { toast } from 'react-toastify'
import { formatDistanceToNow } from 'date-fns'

const PendingRequests = ({ onCountChange }) => {
  const [pendingRequests, setPendingRequests] = useState([])
  const user = authService.getCurrentUser()

  const fetchPendingTransfers = useCallback(async (storeId) => {
    try {
      const res = await axios.get(`/api/transfers/to/${storeId}/dto?status=REQUESTED`)
      setPendingRequests(res.data)
    } catch (err) {
      console.error("Failed to fetch pending transfers:", err)
      setPendingRequests([])
    }
  }, [])

  useEffect(() => {
    if (user?.storeId || user?.id) {
      fetchPendingTransfers(user.storeId || user.id)
    }
  }, [user, fetchPendingTransfers])

  useEffect(() => {
    if (typeof onCountChange === 'function') {
      onCountChange(pendingRequests.length)
    }
  }, [pendingRequests, onCountChange])

  const handleAccept = async (transferId) => {
    try {
      const res = await axios.get(`/api/transfers/${transferId}`)
      const transfer = res.data
      transfer.status = 'COMPLETED'

      const payload = {
        ...transfer,
        fromStore: { storeId: transfer.fromStore?.storeId || transfer.fromStore?.id },
        toStore: { storeId: transfer.toStore?.storeId || transfer.toStore?.id },
        product: { productId: transfer.product?.productId || transfer.product?.id },
        requestedBy: { username: transfer.requestedBy?.username },
        approvedBy: { username: user.username }
      }

      await axios.put(`/api/transfers/${transferId}`, payload)
      toast.success('Transfer approved and inventory updated')
      fetchPendingTransfers(user.storeId || user.id)
    } catch (err) {
      toast.error('Failed to accept transfer')
    }
  }

  const handleReject = async (transferId) => {
    try {
      await axios.put(`/api/transfers/${transferId}/reject`)
      toast.success('Transfer rejected successfully')
      fetchPendingTransfers(user.storeId || user.id)
    } catch (err) {
      toast.error('Failed to reject transfer')
    }
  }

  return (
    <div className="card">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-600" />
          <h2 className="text-xl font-semibold text-gray-900">Pending Requests</h2>
          <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {pendingRequests.length}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {pendingRequests.length === 0 ? (
          <p className="text-sm text-gray-600">No pending requests found.</p>
        ) : (
          pendingRequests.map((request) => (
            <div key={request.transferId} className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-400">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold text-gray-900">{request.product?.name}</span>
                    <span className="text-gray-500">×{request.quantity}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      From {request.fromStore?.name}
                    </div>
                    <span>Requested by {request.requestedBy?.name || request.requestedBy?.username}</span>
                    <span>{formatDistanceToNow(new Date(request.timestamp), { addSuffix: true })}</span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button className="btn-success text-sm" onClick={() => handleAccept(request.transferId)}>
                    Accept
                  </button>
                  <button className="btn-danger text-sm" onClick={() => handleReject(request.transferId)}>
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default PendingRequests
