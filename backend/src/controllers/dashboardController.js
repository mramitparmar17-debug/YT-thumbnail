import { analyticsStore } from "../data/store.js";
import {
  filterByQuery,
  dashboardSummary,
  salesTrends,
  campaignPerformance,
  customerInsights
} from "../services/metricsService.js";
import { buildExcelSummary, buildPdfSummary } from "../services/exportService.js";

function getFiltered(req) {
  return filterByQuery(analyticsStore.records, req.query);
}

export function getDashboardSummary(req, res) {
  const data = getFiltered(req);
  res.json({ summary: dashboardSummary(data), records: data.length, uploads: analyticsStore.uploads });
}

export function getSalesTrends(req, res) {
  const data = getFiltered(req);
  res.json({ trends: salesTrends(data, req.query.grain || "daily") });
}

export function getCampaignPerformance(req, res) {
  const data = getFiltered(req);
  const campaigns = campaignPerformance(data);
  res.json({ campaigns, channels: [...new Set(campaigns.map((x) => x.channel))] });
}

export function getCustomerInsights(req, res) {
  const data = getFiltered(req);
  res.json({ insights: customerInsights(data) });
}

export async function exportExcel(req, res) {
  const summary = dashboardSummary(getFiltered(req));
  const buffer = await buildExcelSummary(summary);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=dashboard-summary.xlsx");
  res.send(Buffer.from(buffer));
}

export async function exportPdf(req, res) {
  const summary = dashboardSummary(getFiltered(req));
  const buffer = await buildPdfSummary(summary);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=dashboard-summary.pdf");
  res.send(buffer);
}
