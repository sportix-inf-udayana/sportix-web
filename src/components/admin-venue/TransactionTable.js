export default function TransactionTable({ transactions = [] }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        Belum ada data transaksi untuk venue ini.
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Completed</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">Pending</span>;
      case 'cancelled':
      case 'failed':
        return <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">Failed</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">{status}</span>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 text-sm uppercase tracking-wider">
            <th className="p-4 font-semibold">Booking ID</th>
            <th className="p-4 font-semibold">Date</th>
            <th className="p-4 font-semibold">Amount</th>
            <th className="p-4 font-semibold">Status</th>
            <th className="p-4 font-semibold">Created At</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-sm">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
              <td className="p-4 font-mono text-gray-500">
                {tx.id.split('-')[0]}... 
              </td>
              <td className="p-4 text-gray-900 font-medium">
                {new Date(tx.booking_date).toLocaleDateString('id-ID', {
                  weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                })}
              </td>
              <td className="p-4 font-bold text-gray-900">
                Rp {tx.total_price?.toLocaleString('id-ID')}
              </td>
              <td className="p-4">
                {getStatusBadge(tx.status)}
              </td>
              <td className="p-4 text-gray-500">
                {new Date(tx.created_at).toLocaleTimeString('id-ID', {
                  hour: '2-digit', minute: '2-digit'
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}