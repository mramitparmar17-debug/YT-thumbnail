# CRM Analyzer Desktop (Electron + React + Node.js)

Windows-focused desktop CRM Analyzer that ingests CRM and Facebook Ads reports, calculates performance metrics, and exports executive reports.

## Features
- Upload CRM Excel/CSV file
- Upload Facebook Ads report
- Analyze:
  - Channel-wise revenue
  - Campaign performance
  - Customer segmentation (new vs repeat)
  - Monthly revenue trends
- Green modern dashboard UI with cards and charts (bar/line/pie)
- Auto-calculated ROAS and KPI cards
- AI-style insights and campaign optimization recommendations
- Exports:
  - PDF report
  - Excel summary
- Sidebar navigation + drag and drop upload experience

## Tech Stack
- React + Vite renderer
- Electron desktop shell
- Node.js + Express backend API

## Run locally
```bash
npm install
npm run dev
```

Services started:
- Renderer: `http://localhost:5173`
- Backend: `http://localhost:3030`
- Electron window waits for both and then launches.

## Data expectations
The analyzer supports common column aliases in uploaded CSV/XLSX files. Useful fields include:
- CRM: `revenue`/`amount`/`sales`, `campaign`, `channel`, `date`, `customer_type`, `order_count`
- Ads: `campaign`, `spend`/`amount_spent`, `clicks`, `impressions`
