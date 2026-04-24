import { useEffect, useState } from "react";
import { api } from "../services/api";

export function useDashboardData(filters) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({});
  const [trends, setTrends] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [insights, setInsights] = useState({ topCustomers: [] });

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const query = new URLSearchParams(filters).toString();
        const [s, t, c, i] = await Promise.all([
          api.get(`/dashboard-summary?${query}`),
          api.get(`/sales-trends?grain=monthly&${query}`),
          api.get(`/campaign-performance?${query}`),
          api.get(`/customer-insights?${query}`)
        ]);

        setSummary(s.data.summary || {});
        setTrends(t.data.trends || []);
        setCampaigns(c.data.campaigns || []);
        setInsights(i.data.insights || { topCustomers: [] });
      } catch (e) {
        setError(e.message || "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [filters]);

  return { loading, error, summary, trends, campaigns, insights };
}
