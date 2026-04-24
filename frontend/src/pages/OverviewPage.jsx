import KPICard from "../components/KPICard";

export default function OverviewPage({ summary }) {
  const rows = [
    ["Total Revenue", `$${(summary.totalRevenue || 0).toLocaleString()}`, "Gross sales across sources"],
    ["Orders", (summary.totalOrders || 0).toLocaleString(), "All recorded transactions"],
    ["AOV", `$${(summary.aov || 0).toFixed(2)}`, "Average order value"],
    ["ROAS", (summary.roas || 0).toFixed(2), "Revenue / Ad spend"],
    ["CPL", `$${(summary.cpl || 0).toFixed(2)}`, "Cost per lead"],
    ["CAC", `$${(summary.cac || 0).toFixed(2)}`, "Cost to acquire customer"],
    ["Repeat %", `${(summary.repeatRatio || 0).toFixed(1)}%`, "Customer loyalty signal"],
    ["Lead → Sale", `${(summary.funnel?.leadToSalePct || 0).toFixed(1)}%`, "Funnel conversion"],
  ];

  return <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">{rows.map(([t, v, h]) => <KPICard key={t} title={t} value={v} hint={h} />)}</div>;
}
