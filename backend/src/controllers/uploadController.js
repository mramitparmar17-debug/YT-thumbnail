import { analyticsStore } from "../data/store.js";
import { parseWorkbook } from "../services/parserService.js";
import { normalizeRows, unifiedSchema } from "../services/normalizationService.js";

export function uploadExcel(req, res) {
  if (!req.file) return res.status(400).json({ message: "Excel file is required" });

  const rawRows = parseWorkbook(req.file.buffer);
  const normalizedRows = normalizeRows(rawRows, req.file.originalname).filter((x) => x.date);

  analyticsStore.records.push(...normalizedRows);
  analyticsStore.uploads.push({
    file: req.file.originalname,
    size: req.file.size,
    rows: normalizedRows.length,
    uploadedAt: new Date().toISOString()
  });

  res.json({
    message: "Upload processed",
    file: req.file.originalname,
    ingestedRows: normalizedRows.length,
    unifiedSchema,
    uploads: analyticsStore.uploads
  });
}
