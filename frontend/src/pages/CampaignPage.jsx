import ChannelBarChart from "../components/ChannelBarChart";

export default function CampaignPage({ campaigns }) {
  const byChannel = Object.values(
    campaigns.reduce((acc, c) => {
      const row = acc[c.channel] || { channel: c.channel, roas: 0, revenue: 0, spend: 0, count: 0 };
      row.roas += c.roas;
      row.revenue += c.revenue;
      row.spend += c.spend;
      row.count += 1;
      acc[c.channel] = row;
      return acc;
    }, {})
  ).map((x) => ({ ...x, roas: x.count ? x.roas / x.count : 0 }));

  return (
    <div className="grid gap-4">
      <ChannelBarChart data={byChannel} />
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 overflow-auto">
        <h3 className="font-semibold mb-3">Campaign Performance Table</h3>
        <table className="min-w-full text-sm">
          <thead><tr className="text-left border-b"><th>Channel</th><th>Campaign</th><th>Spend</th><th>Revenue</th><th>ROAS</th><th>CPL</th></tr></thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={`${c.channel}-${c.campaign}`} className="border-b">
                <td>{c.channel}</td><td>{c.campaign}</td><td>${c.spend.toFixed(2)}</td><td>${c.revenue.toFixed(2)}</td><td>{c.roas.toFixed(2)}</td><td>${c.cpl.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
