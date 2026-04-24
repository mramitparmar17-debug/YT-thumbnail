const tabs = ["Overview", "Sales", "Campaigns", "Customers", "Upload"];

export default function Sidebar({ activeTab, onChange }) {
  return (
    <aside className="w-56 bg-slate-900 text-white min-h-screen p-4">
      <h1 className="text-lg font-semibold mb-6">Mini BI Desktop</h1>
      <nav className="space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`w-full text-left px-3 py-2 rounded-lg ${activeTab === tab ? "bg-indigo-600" : "hover:bg-slate-800"}`}
          >
            {tab}
          </button>
        ))}
      </nav>
    </aside>
  );
}
