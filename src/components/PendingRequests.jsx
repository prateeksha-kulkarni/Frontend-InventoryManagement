import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Clock, MapPin, Package, Plus } from 'lucide-react'
import axios from '../services/axiosConfig'
import authService from '../services/authService'
import { toast } from 'react-toastify'
import { formatDistanceToNow } from 'date-fns'

const ConfirmDialog = ({ open, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, loading }) => {
  if (!open) return null

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget && !loading) onCancel?.()
  }

  // Close on Esc
  React.useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape' && !loading) onCancel?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, loading, onCancel])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={handleBackdrop}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-700">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-900 disabled:opacity-50"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

const PendingRequests = ({ onCountChange, onNewRequestClick, onRefreshHistory }) => {
  const rawUser = authService.getCurrentUser()
  const user = useMemo(() => rawUser, [rawUser?.username])

  const [pendingRequests, setPendingRequests] = useState([])
  const [isConfirming, setIsConfirming] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null) // 'accept' | 'reject' | null
  const [targetId, setTargetId] = useState(null)
  const [busy, setBusy] = useState(false)

  const fetchPendingTransfers = useCallback(async (storeId) => {
    try {
      const res = await axios.get(`/api/transfers/to/${storeId}/dto?status=REQUESTED`)
      setPendingRequests(res.data || [])
    } catch (err) {
      console.error('Failed to fetch pending transfers:', err)
      setPendingRequests([])
    }
  }, [])

  useEffect(() => {
    if (user?.storeId || user?.id) {
      fetchPendingTransfers(user.storeId || user.id)
    }
  }, [user?.storeId, user?.id, fetchPendingTransfers])

  useEffect(() => {
    onCountChange?.(pendingRequests.length)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingRequests])

  const openConfirm = (action, transferId) => {
    setConfirmAction(action) // 'accept' or 'reject'
    setTargetId(transferId)
    setIsConfirming(true)
  }

  const closeConfirm = () => {
    if (busy) return
    setIsConfirming(false)
    setConfirmAction(null)
    setTargetId(null)
  }

  const performAccept = async (transferId) => {
    const res = await axios.get(`/api/transfers/${transferId}`)
    const transfer = res.data

    const payload = {
      ...transfer,
      status: 'COMPLETED',
      fromStore: { storeId: transfer.fromStore?.storeId || transfer.fromStore?.id },
      toStore: { storeId: transfer.toStore?.storeId || transfer.toStore?.id },
      product: { productId: transfer.product?.productId || transfer.product?.id },
      requestedBy: { username: transfer.requestedBy?.username },
      approvedBy: { username: user?.username },
    }

    await axios.put(`/api/transfers/${transferId}`, payload)
  }

  const performReject = async (transferId) => {
    await axios.put(`/api/transfers/${transferId}/reject`)
  }

  const onConfirm = async () => {
    if (!targetId || !confirmAction) return
    setBusy(true)
    try {
      if (confirmAction === 'accept') {
        await performAccept(targetId)
        toast.success('Transfer approved and inventory updated')
      } else {
        await performReject(targetId)
        toast.success('Transfer rejected successfully')
      }
      onRefreshHistory?.()
      await fetchPendingTransfers(user?.storeId || user?.id)
      closeConfirm()
    } catch (err) {
      console.error(`Failed to ${confirmAction} transfer:`, err)
      toast.error(`Failed to ${confirmAction} transfer`)
      setBusy(false) // keep dialog open so user can retry or cancel
    }
  }

  return (
    <div className="card">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-600" />
          <h2 className="text-xl font-semibold text-gray-900">Pending Requests</h2>
          <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {pendingRequests.length}
          </span>
        </div>
        <button
          onClick={onNewRequestClick}
          className="btn-primary flex items-center gap-2 text-sm shadow-sm"
        >
          <Plus size={16} />
          New Request
        </button>
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
                    <span>
                      {request.timestamp
                        ? formatDistanceToNow(new Date(request.timestamp), { addSuffix: true })
                        : 'just now'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    className="btn-success text-sm disabled:opacity-50"
                    disabled={busy}
                    onClick={() => openConfirm('accept', request.transferId)}
                  >
                    Accept
                  </button>
                  <button
                    className="btn-danger text-sm disabled:opacity-50"
                    disabled={busy}
                    onClick={() => openConfirm('reject', request.transferId)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={isConfirming}
        title={confirmAction === 'accept' ? 'Confirm Approval' : 'Confirm Rejection'}
        message={
          confirmAction === 'accept'
            ? 'Are you sure you want to approve this transfer?'
            : 'Are you sure you want to reject this transfer?'
        }
        confirmText={confirmAction === 'accept' ? 'Approve' : 'Reject'}
        cancelText="Cancel"
        loading={busy}
        onConfirm={onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  )
}

export default PendingRequests
