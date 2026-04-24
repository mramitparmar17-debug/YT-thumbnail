import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#1a7f37', '#2fa84f', '#9bd8a8', '#146428', '#66bb6a'];

export default function ChartsPanel({ analysis }) {
  if (!analysis) {
    return <div className="empty-card">Upload files to generate dashboard charts.</div>;
  }

  const { channelRevenue, monthlyRevenue, customerSegmentation } = analysis;

  return (
    <div className="charts-grid">
      <section className="card chart-card">
        <h3>Channel-wise Revenue</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={channelRevenue}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#1a7f37" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="card chart-card">
        <h3>Monthly Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={monthlyRevenue}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#2fa84f" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="card chart-card">
        <h3>Customer Segmentation</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={customerSegmentation} dataKey="value" nameKey="name" outerRadius={90}>
              {customerSegmentation.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
