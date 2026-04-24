export default function CustomersPage({ insights }) {
  return (
    <div className="grid gap-4">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <p className="font-semibold">New vs Repeat Customers</p>
        <p className="text-sm text-slate-600 mt-2">New: {insights.newCustomers || 0} | Repeat: {insights.repeatCustomers || 0} | Repeat Ratio: {(insights.repeatRatio || 0).toFixed(1)}%</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <p className="font-semibold mb-2">Top Customers</p>
        <ul className="space-y-2 text-sm">
          {(insights.topCustomers || []).map((c) => (
            <li key={c.customerId} className="flex justify-between border-b pb-1">
              <span>{c.customerId}</span>
              <span>${c.revenue.toFixed(2)} ({c.orders} orders)</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
