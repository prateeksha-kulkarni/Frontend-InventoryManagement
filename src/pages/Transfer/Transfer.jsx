import React, { useState, useCallback } from 'react'
import { Plus, ArrowUpDown, Clock, CheckCircle } from 'lucide-react'
import TransferModal from '../../components/TransferModal'
import PendingRequests from '../../components/PendingRequests'
import TransferHistory from '../../components/TransferHistory'

function Transfer() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [completedTodayCount, setCompletedTodayCount] = useState(0)
  const [totalTransfers, setTotalTransfers] = useState(0)

  const handlePendingCount = useCallback((count) => {
    setPendingCount(count)
  }, [])

  const handleTransferCounts = useCallback(({ total, completedToday }) => {
    setTotalTransfers(total)
    setCompletedTodayCount(completedToday)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inter-Store Transfer</h1>
              <p className="mt-1 text-lg text-gray-600">Transfer products between store locations</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary flex items-center gap-2 shadow-lg"
            >
              <Plus size={20} />
              New Request
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Pending Requests" value={pendingCount} color="orange" icon={Clock} />
          <StatCard title="Completed Today" value={completedTodayCount} color="green" icon={CheckCircle} />
          <StatCard title="Total Transfers" value={totalTransfers} color="blue" icon={ArrowUpDown} />
        </div>

        <PendingRequests onCountChange={handlePendingCount} />
        <TransferHistory onCountsChange={handleTransferCounts} />
      </div>

      <TransferModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}

const StatCard = ({ title, value, color, icon: Icon }) => (
  <div className="card p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
      </div>
      <div className={`p-3 bg-${color}-100 rounded-full`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
  </div>
)

export default Transfer

