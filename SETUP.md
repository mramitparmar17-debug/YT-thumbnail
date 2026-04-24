# Setup Guide

## 1) Prerequisites
- Node.js 20+
- npm 10+

## 2) Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
cd ../electron && npm install
```

## 3) Run in development (3 terminals)

Terminal A (backend):
```bash
cd backend
npm run dev
```

Terminal B (frontend):
```bash
cd frontend
npm run dev
```

Terminal C (electron):
```bash
cd electron
npm run dev
```

## 4) Production build

```bash
cd frontend && npm run build
cd ../electron && npm run build
```

## 5) Usage Flow
1. Open desktop app.
2. Drag-and-drop Excel files in Upload page.
3. Backend auto-detects report type (sales/campaign/crm).
4. Data is merged into one normalized store.
5. Navigate tabs for Overview, Sales, Campaign, Customers.
6. Apply filters (date/channel).
7. Export PDF or Excel summary.

## 6) API Endpoints
- `POST /api/upload`
- `GET /api/dashboard-summary`
- `GET /api/sales-trends?grain=daily|monthly&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- `GET /api/campaign-performance?channel=facebook|google|whatsapp`
- `GET /api/customer-insights`
- `GET /api/export/excel`
- `GET /api/export/pdf`
