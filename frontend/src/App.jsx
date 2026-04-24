import { useMemo, useState } from "react";
import Sidebar from "./layouts/Sidebar";
import OverviewPage from "./pages/OverviewPage";
import SalesPage from "./pages/SalesPage";
import CampaignPage from "./pages/CampaignPage";
import CustomersPage from "./pages/CustomersPage";
import UploadPanel from "./components/UploadPanel";
import { useDashboardData } from "./hooks/useDashboardData";

export default function App() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [filters, setFilters] = useState({ startDate: "", endDate: "", channel: "" });
  const { loading, error, summary, trends, campaigns, insights } = useDashboardData(filters);

  const content = useMemo(() => {
    if (loading) return <p className="text-slate-500">Loading dashboard...</p>;
    if (error) return <p className="text-red-600">{error}</p>;
    if (activeTab === "Overview") return <OverviewPage summary={summary} />;
    if (activeTab === "Sales") return <SalesPage trends={trends} />;
    if (activeTab === "Campaigns") return <CampaignPage campaigns={campaigns} />;
    if (activeTab === "Customers") return <CustomersPage insights={insights} />;
    return <UploadPanel />;
  }, [loading, error, activeTab, summary, trends, campaigns, insights]);

  return (
    <div className="flex">
      <Sidebar activeTab={activeTab} onChange={setActiveTab} />
      <main className="flex-1 p-6 space-y-5">
        <header className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-end gap-3 flex-wrap">
          <div>
            <label className="text-xs text-slate-500">Start date</label>
            <input className="border rounded px-2 py-1 ml-2" type="date" onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-slate-500">End date</label>
            <input className="border rounded px-2 py-1 ml-2" type="date" onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-slate-500">Channel</label>
            <select className="border rounded px-2 py-1 ml-2" onChange={(e) => setFilters((f) => ({ ...f, channel: e.target.value }))}>
              <option value="">All</option>
              <option value="facebook">Facebook</option>
              <option value="google">Google</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
        </header>
        {content}
      </main>
    </div>
  );
}
