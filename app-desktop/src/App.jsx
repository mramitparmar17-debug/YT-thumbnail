import { useMemo, useState } from 'react'

const pages = ['Dashboard', 'Import Center', 'Reconciliation', 'Reports', 'Analytics', 'Settings', 'Audit Logs']

const kpis = [
  { label: 'Total Transactions', value: '12,845' },
  { label: 'Total Revenue', value: '$248,920' },
  { label: 'Total Refunds', value: '$12,410' },
  { label: 'Net Settlements', value: '₹1,96,42,200' },
  { label: 'Currency Gain/Loss', value: '₹+28,420' },
  { label: 'Reconciliation Accuracy', value: '97.8%' }
]

function Card({ label, value }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 13, color: '#6b7280' }}>{label}</div>
      <div style={{ marginTop: 8, fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  )
}

function TableMock() {
  const rows = useMemo(
    () => [
      ['ORD-10231', 'PP-TRX-0011', 'USD', '190.00', '6.23', 'FULLY_MATCHED'],
      ['ORD-10232', 'PP-TRX-0012', 'USD', '120.00', '4.12', 'CURRENCY_DIFFERENCE'],
      ['ORD-10233', 'PP-TRX-0013', 'USD', '87.00', '2.95', 'REFUND_PENDING']
    ],
    []
  )

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f9fafb' }}>
          <tr>
            {['Order ID', 'Transaction ID', 'Currency', 'Gross', 'Fees', 'Status'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: 12, fontSize: 12, color: '#6b7280' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
              {r.map((c, j) => (
                <td key={j} style={{ padding: 12, fontSize: 14 }}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function App() {
  const [active, setActive] = useState('Dashboard')

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '100vh', background: '#f3f4f6', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <aside style={{ background: '#111827', color: '#fff', padding: 18 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>PayPal Recon</h2>
        <p style={{ color: '#9ca3af', fontSize: 13 }}>Enterprise Starter UI</p>
        <nav style={{ marginTop: 20, display: 'grid', gap: 8 }}>
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => setActive(p)}
              style={{
                textAlign: 'left',
                border: 'none',
                borderRadius: 8,
                padding: '10px 12px',
                background: active === p ? '#2563eb' : 'transparent',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              {p}
            </button>
          ))}
        </nav>
      </aside>

      <main style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
          <h1 style={{ margin: 0 }}>{active}</h1>
          <button style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 14px' }}>Run Reconciliation</button>
        </div>

        {active === 'Dashboard' ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginBottom: 16 }}>
              {kpis.map((k) => <Card key={k.label} {...k} />)}
            </div>
            <TableMock />
          </>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <h3 style={{ marginTop: 0 }}>{active}</h3>
            <p>This module is scaffolded and ready for feature implementation.</p>
          </div>
        )}
      </main>
    </div>
  )
}
