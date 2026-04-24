import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function ChannelBarChart({ data }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 h-80">
      <h3 className="font-semibold mb-3">Channel ROAS</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="channel" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="roas" fill="#0ea5e9" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
