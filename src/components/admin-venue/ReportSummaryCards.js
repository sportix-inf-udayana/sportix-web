export default function ReportSummaryCards({ summary }) {
  // Fallback aman jika summary undefined
  const data = summary || { revenue: 0, successful: 0, pending: 0, totalTransactions: 0 };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Revenue Card */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
        <span className="text-sm font-medium text-gray-500 mb-1">Total Revenue</span>
        <span className="text-2xl font-bold text-gray-900">
          Rp {data.revenue.toLocaleString('id-ID')}
        </span>
      </div>

      {/* Successful Transactions */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
        <span className="text-sm font-medium text-gray-500 mb-1">Successful Bookings</span>
        <span className="text-2xl font-bold text-green-600">
          {data.successful}
        </span>
      </div>

      {/* Pending Transactions */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
        <span className="text-sm font-medium text-gray-500 mb-1">Pending Bookings</span>
        <span className="text-2xl font-bold text-yellow-600">
          {data.pending}
        </span>
      </div>

      {/* Total Transactions */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
        <span className="text-sm font-medium text-gray-500 mb-1">Total Transactions</span>
        <span className="text-2xl font-bold text-gray-900">
          {data.totalTransactions}
        </span>
      </div>
    </div>
  );
}