const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Papa = require('papaparse');
const XLSX = require('xlsx');
const { calculateAnalysis } = require('./analyzer');
const { buildInsights, buildRecommendations } = require('./insights');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const parseCSV = (buffer) => {
  const text = buffer.toString('utf8');
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  return parsed.data;
};

const parseXlsx = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(firstSheet, { raw: false, defval: '' });
};

const parseFile = (file) => {
  if (!file) return [];
  const name = file.originalname.toLowerCase();
  if (name.endsWith('.csv')) return parseCSV(file.buffer);
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) return parseXlsx(file.buffer);
  throw new Error(`Unsupported file format: ${file.originalname}`);
};

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/analyze', upload.fields([{ name: 'crmFile', maxCount: 1 }, { name: 'adsFile', maxCount: 1 }]), (req, res) => {
  try {
    const crmFile = req.files.crmFile?.[0];
    const adsFile = req.files.adsFile?.[0];

    if (!crmFile || !adsFile) {
      return res.status(400).json({ error: 'Both CRM and Facebook Ads files are required.' });
    }

    const crmRows = parseFile(crmFile);
    const adsRows = parseFile(adsFile);
    const analysis = calculateAnalysis(crmRows, adsRows);
    const insights = buildInsights(analysis);
    const recommendations = buildRecommendations(analysis);

    res.json({ analysis, insights, recommendations });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to analyze files.' });
  }
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`CRM Analyzer API listening on http://localhost:${PORT}`);
});
