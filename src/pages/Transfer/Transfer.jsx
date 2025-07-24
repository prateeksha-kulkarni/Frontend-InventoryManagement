import React, { useState, useCallback, useRef } from 'react'
import { ArrowUpDown, Clock, CheckCircle } from 'lucide-react'
import TransferModal from '../../components/TransferModal'
import PendingRequests from '../../components/PendingRequests'
import TransferHistory from '../../components/TransferHistory'

function Transfer() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [completedTodayCount, setCompletedTodayCount] = useState(0)
  const [totalTransfers, setTotalTransfers] = useState(0)
  const transferHistoryRef = useRef()

  const handlePendingCount = useCallback((count) => {
    setPendingCount(count)
  }, [])

  const handleTransferCounts = useCallback(({ total, completedToday }) => {
    setTotalTransfers(total)
    setCompletedTodayCount(completedToday)
  }, [])

  const refreshHistory = () => {
    transferHistoryRef.current?.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Inter-Store Transfer</h1>
          <p className="text-lg text-gray-600">Transfer products between store locations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Pending Requests" value={pendingCount} color="orange" icon={Clock} />
          <StatCard title="Completed Today" value={completedTodayCount} color="green" icon={CheckCircle} />
          <StatCard title="Total Transfers" value={totalTransfers} color="blue" icon={ArrowUpDown} />
        </div>

        <PendingRequests
          onCountChange={handlePendingCount}
          onNewRequestClick={() => setIsModalOpen(true)}
          onRefreshHistory={refreshHistory}
        />

        <TransferHistory
          ref={transferHistoryRef}
          onCountsChange={handleTransferCounts}
        />
      </div>

      <TransferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefreshHistory={refreshHistory}
      />
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
