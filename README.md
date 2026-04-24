# Desktop Analytics App (Electron + React + Node/Express)

A production-oriented starter for a **desktop marketing/sales analytics tool** that ingests multiple Excel reports, normalizes inconsistent columns, calculates KPIs (ROAS, CPL, CAC, funnel conversion), and renders business-friendly dashboards.

## Monorepo Structure

- `backend/` — Express API for ingestion, normalization, KPI engine, export
- `frontend/` — React + Tailwind + Recharts dashboard UI
- `electron/` — Electron shell loading frontend + backend locally

See `SETUP.md` for full setup and run instructions.
