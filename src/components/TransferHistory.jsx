import React, { useEffect, useState } from 'react'
import { Search, Filter, ChevronLeft, ChevronRight, History } from 'lucide-react'
import axios from "../services/axiosConfig"
import authService from "../services/authService"

const TransferHistory = ({ onCountsChange }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [transfers, setTransfers] = useState([])
  const [page, setPage] = useState(1)
  const rowsPerPage = 10
  const user = authService.getCurrentUser()

  useEffect(() => {
    const fetchTransferHistory = async () => {
      try {
        const res = await axios.get(`/api/transfers/history/${user?.storeId || user?.id}`)
        setTransfers(res.data || [])
      } catch (err) {
        console.error('Failed to fetch transfer history:', err)
        setTransfers([])
      }
    }
    if (user?.storeId || user?.id) fetchTransferHistory()
  }, [user])

  useEffect(() => {
    if (typeof onCountsChange === 'function') {
      const completedToday = transfers.filter(tr =>
        tr.status === 'COMPLETED' &&
        new Date(tr.timestamp).toDateString() === new Date().toDateString()
      ).length

      onCountsChange({
        total: transfers.length,
        completedToday
      })
    }
  }, [transfers, onCountsChange])

  const filteredTransfers = transfers.filter(tr => {
    const matchesStatus = statusFilter === 'all' || tr.status?.toLowerCase() === statusFilter
    const search = searchTerm.toLowerCase()
    const product = tr.product?.name?.toLowerCase() || ''
    const from = tr.fromStore?.name?.toLowerCase() || ''
    const to = tr.toStore?.name?.toLowerCase() || ''
    return matchesStatus && (product.includes(search) || from.includes(search) || to.includes(search))
  })

  const paginated = filteredTransfers.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const getStatusBadge = (status) => {
    const statusStyles = {
      requested: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status.toLowerCase()] || 'bg-gray-200 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
      </span>
    )
  }

  return (
    <div className="card">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Transfer History</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search product or store..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="requested">Requested</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From Store</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved By</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginated.map((transfer) => (
              <tr key={transfer.transferId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{transfer.product?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{transfer.fromStore?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{transfer.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(transfer.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{transfer.requestedBy?.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{transfer.approvedBy?.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{new Date(transfer.timestamp).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{(page - 1) * rowsPerPage + 1}</span>
            {' '}to{' '}
            <span className="font-medium">{Math.min(page * rowsPerPage, filteredTransfers.length)}</span>
            {' '}of{' '}
            <span className="font-medium">{filteredTransfers.length}</span> results
          </p>
          <div className="flex gap-2">
            <button className="btn-secondary flex items-center gap-1 text-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={16} /> Prev
            </button>
            <button className="btn-secondary flex items-center gap-1 text-sm" onClick={() => setPage(p => Math.min(Math.ceil(filteredTransfers.length / rowsPerPage), p + 1))} disabled={page * rowsPerPage >= filteredTransfers.length}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransferHistory
