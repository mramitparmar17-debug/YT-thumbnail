import { Router } from "express";
import {
  getDashboardSummary,
  getSalesTrends,
  getCampaignPerformance,
  getCustomerInsights,
  exportExcel,
  exportPdf
} from "../controllers/dashboardController.js";

const router = Router();

router.get("/dashboard-summary", getDashboardSummary);
router.get("/sales-trends", getSalesTrends);
router.get("/campaign-performance", getCampaignPerformance);
router.get("/customer-insights", getCustomerInsights);
router.get("/export/excel", exportExcel);
router.get("/export/pdf", exportPdf);

export default router;
