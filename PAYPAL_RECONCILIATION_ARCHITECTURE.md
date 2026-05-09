# PayPal Reconciliation Desktop Application — Enterprise Architecture

## 0) Important Input Note
The referenced files were not present in the repository at build-time:
- `PAYPAL VIDEO LOGIC.xlsx`
- `LOGIC PAYPAL MARCH-26.xlsx`
- `12 MARCH 2026 Daily_Currency_2025-26.xlsx`
- `PayPal_Reconciliation_March2026.xlsx`

The logic below is production-ready and designed to ingest those files once provided.

---

## 1) Recommended Architecture Choice
**Primary recommendation:** **Option 1 (Laravel 12 API + Electron + React)** for enterprise-grade reconciliation.

Why:
- Strong queue/scheduler ecosystem for 100k+ rows and long-running reconciliation jobs.
- Better clean architecture boundaries (Service, Repository, Job, Policy, Resource).
- Native API-first governance and secure token auth (Sanctum).

**Secondary option:** WordPress plugin mode when the business is deeply WooCommerce-centered and needs admin-side integration.

---

## 2) High-Level System Architecture

```text
[Electron Desktop Shell]
  ├── [React UI + Zustand/RTK + shadcn/ui + Tailwind]
  ├── [IPC Layer]
  ├── [Local Cache: IndexedDB/SQLite + encrypted keychain]
  └── [Sync Agent / Background Worker]
            |
            v
        [REST API]
            |
  +----------------------------+
  | Laravel 12 Backend         |
  | - Auth (Sanctum)           |
  | - Import Pipeline          |
  | - Reconciliation Engine    |
  | - Report Generator         |
  | - Queue Workers + Scheduler|
  +----------------------------+
            |
            v
         [MySQL 8]
            |
            +--> [Object Storage: imported files + exports]
```

---

## 3) Folder Structures

### 3.1 Electron + React Desktop
```text
app-desktop/
  electron/
    main.ts
    preload.ts
    ipc/
      files.ipc.ts
      secure-store.ipc.ts
      sync.ipc.ts
  src/
    app/
      router.tsx
      providers.tsx
    pages/
      Dashboard/
      ImportCenter/
      Reconciliation/
      Reports/
      Analytics/
      Settings/
      AuditLogs/
    components/
      ui/
      charts/
      tables/
      workflow/
    modules/
      import/
      reconciliation/
      reports/
      settlements/
    store/
      auth.store.ts
      import.store.ts
      reconciliation.store.ts
      reports.store.ts
    services/
      api.client.ts
      api.endpoints.ts
      ipc.client.ts
    utils/
      currency.ts
      dates.ts
      tolerance.ts
      status.ts
```

### 3.2 Laravel Backend
```text
backend-laravel/
  app/
    Http/
      Controllers/Api/V1/
      Requests/
      Resources/
    Models/
    Repositories/
    Services/
      Import/
      Reconciliation/
      Currency/
      Reports/
    Jobs/
    Policies/
    Enums/
    DTO/
  database/
    migrations/
    seeders/
    factories/
  routes/
    api_v1.php
  config/
  tests/
    Feature/
    Unit/
```

### 3.3 WordPress Plugin (Alternative)
```text
wp-paypal-recon/
  wp-paypal-recon.php
  includes/
    class-loader.php
    class-activator.php
    class-deactivator.php
    api/
      class-rest-auth.php
      class-rest-import.php
      class-rest-reconciliation.php
      class-rest-reports.php
    services/
      class-import-service.php
      class-reconciliation-service.php
      class-report-service.php
    db/
      class-schema.php
      class-repository.php
    cron/
      class-scheduler.php
  admin/
    pages/
    assets/
```

---

## 4) Database Schema + ERD (Logical)

```text
branches (1) ----< users
branches (1) ----< transactions
branches (1) ----< paypal_entries
branches (1) ----< settlements
branches (1) ----< refunds
branches (1) ----< withdrawals
branches (1) ----< imported_files
branches (1) ----< reconciliation_logs

transactions (1) ----< refunds
transactions (1) ----< settlements
transactions (1) ----< reconciliation_logs
paypal_entries (1) ----< reconciliation_logs
currency_rates (1) ----< reconciliation_logs
imported_files (1) ----< import_rows (optional staging table)
```

### Core tables (minimal columns)
- **transactions**: id, branch_id, order_id, txn_id, customer_email, customer_name, currency, gross, fee, net, txn_at_utc, source, raw_payload
- **paypal_entries**: id, branch_id, paypal_txn_id, event_type, order_ref, payer_email, gross_usd, fee_usd, net_usd, paypal_time_utc, raw_payload
- **currency_rates**: id, rate_date, pair, rate_source, usd_inr_rate
- **refunds**: id, branch_id, order_id, txn_id, refund_txn_id, refund_amount, refund_currency, refund_at_utc, status
- **withdrawals**: id, branch_id, withdrawal_id, amount, currency, requested_at_utc, settled_at_utc, status
- **settlements**: id, branch_id, settlement_ref, txn_id, amount_inr, fee_inr, settled_at_utc, bank_ref
- **reconciliation_logs**: id, branch_id, run_id, txn_id, paypal_entry_id, rule_code, status, variance_json, score, priority, reviewed_by
- **imported_files**: id, branch_id, file_name, file_hash, file_type, row_count, imported_by, imported_at, validation_report_json

---

## 5) Reconciliation Workflow (Engine)

1. **Import & Stage** (CSV/XLSX) → normalize columns.
2. **Canonical Mapping** into domain DTOs.
3. **Deduplicate** using composite fingerprint:
   - `sha256(branch + source + txn_id + amount + date)`.
4. **Rule-based Matching** (weighted score):
   - txn_id exact = +50
   - order_id exact = +20
   - email exact = +10
   - date within ±2 days = +10
   - amount within tolerance = +10
5. **Status Decision** by score + rule flags.
6. **Variance Calculation** (fee, FX, settlement, refund).
7. **Persist Reconciliation Logs** + issue queue.
8. **Generate reports & analytics snapshots**.

### Matching statuses
- Fully Matched
- Partially Matched
- Missing in Software
- Missing in PayPal
- Refund Pending
- Settlement Pending
- Currency Difference
- Manual Review Required

---

## 6) Currency Validation Logic (USD→INR)

Formula set:
- `expected_inr = round(usd_net * fx_rate, 2)`
- `settlement_diff = actual_inr - expected_inr`
- `fee_diff = expected_fee_inr - actual_fee_inr`

Rules:
- FX mismatch if `abs(paypal_fx - sheet_fx) > 0.05`
- INR mismatch if `abs(settlement_diff) > tolerance_inr`
- Fee mismatch if `% fee deviation > configured threshold`

Outputs:
- currency variance report
- branch-wise FX gain/loss
- unresolved FX anomalies

---

## 7) Laravel API Endpoints (V1)

- `POST /auth/login`
- `POST /auth/logout`
- `GET /me`
- `POST /imports` (multipart)
- `GET /imports`
- `GET /imports/{id}/preview`
- `POST /reconciliation/runs`
- `GET /reconciliation/runs/{runId}`
- `GET /reconciliation/issues`
- `PATCH /reconciliation/issues/{id}`
- `GET /reports/daily`
- `GET /reports/monthly`
- `GET /reports/currency-variance`
- `POST /exports/pdf`
- `POST /exports/excel`
- `POST /exports/csv`

---

## 8) Queue + Scheduler Design

Queues:
- `imports`
- `reconciliation`
- `reports`
- `exports`

Jobs:
- `ParseImportFileJob`
- `NormalizeImportRowsJob`
- `RunReconciliationJob`
- `ComputeAnalyticsSnapshotJob`
- `GeneratePdfReportJob`
- `GenerateExcelReportJob`

Scheduler:
- Hourly: stale reconciliation issue checks
- Daily 01:00: branch reconciliation batch
- Daily 02:00: KPI snapshot materialization

---

## 9) Electron Integration Flow

- **preload.ts** exposes safe API only (`contextBridge`).
- IPC channels:
  - `file:pick`, `file:read-chunks`, `secure:set`, `secure:get`, `sync:enqueue`
- Access token kept in OS keychain (not plain localStorage).
- Offline mode:
  - cache imports and reconciliation snapshots locally
  - background sync when internet returns

---

## 10) React UI Wireframe (Information Architecture)

- **Sidebar**: Dashboard, Import Center, Reconciliation, Reports, Analytics, Settings, Audit Logs
- **Top bar**: Branch selector, date range, run reconciliation, profile/actions
- **Dashboard**: KPI cards + charts + open issues panel
- **Import Center**: drag-drop, schema map, preview, import log timeline
- **Reconciliation**: master table + issue detail drawer + manual override actions
- **Reports**: templates + scheduled exports + download center

---

## 11) Performance Strategy (100k+ rows)

- Stream parse large files.
- Chunk import (`2k` rows per batch).
- Use staging tables + bulk insert.
- Add composite indexes:
  - `(branch_id, txn_id)`
  - `(branch_id, order_id)`
  - `(branch_id, txn_at_utc)`
  - `(run_id, status, priority)`
- Materialized KPI snapshots.
- Virtualized tables in React.
- Web workers for client-side heavy transforms.

---

## 12) Security Strategy

- Sanctum token auth + token rotation.
- RBAC: admin, finance_manager, auditor, operator.
- Strict file validation (mime + signature + max size + schema checks).
- Encrypt sensitive fields at rest.
- Full audit log for imports, overrides, exports, login events.
- CSP + XSS-safe rendering + server-side validation on all endpoints.

---

## 13) Error Handling Strategy

- Unified error envelope:
```json
{
  "code": "RECON_RULE_FAILED",
  "message": "Settlement variance above threshold",
  "details": {"txn_id": "...", "variance": 142.80},
  "trace_id": "uuid"
}
```
- Retry policies for transient failures.
- Dead-letter queue for unrecoverable jobs.
- User-facing error toasts + action suggestions.

---

## 14) Reports/Export Design

### PDF
- Branded header
- KPI block
- reconciliation summary by status
- variance/mismatch sections
- sign-off footer

### Excel (multi-sheet)
- `Summary`
- `Reconciled`
- `Mismatches`
- `Refunds`
- `Settlements`
- `CurrencyVariance`

CSV
- Raw detailed export with normalized columns and status fields.

---

## 15) Suggested Packages

### React/Electron
- `electron`, `electron-builder`, `vite`, `zustand` or `@reduxjs/toolkit`
- `react-hook-form`, `zod`, `@tanstack/react-table`, `react-virtual`
- `recharts` / `chart.js`

### Laravel
- `laravel/sanctum`
- `maatwebsite/excel`
- `phpoffice/phpspreadsheet`
- `barryvdh/laravel-dompdf` or `knplabs/knp-snappy`
- `spatie/laravel-permission`
- `spatie/laravel-activitylog`

### WordPress
- WP REST API + custom tables (`dbDelta`)
- Action Scheduler for heavy/background work

---

## 16) Development Roadmap (Phased)

1. **Phase 1: Foundation** (Auth, Branches, Imports)
2. **Phase 2: Reconciliation Core** (match engine + statuses + issue queue)
3. **Phase 3: Currency/Fee/Settlement variance**
4. **Phase 4: Reports + Exports + Analytics dashboards**
5. **Phase 5: Offline sync + hardening + audit compliance**
6. **Phase 6: UAT with March 2026 reference files + production release**

---

## 17) Production-Ready Snippets

### Laravel rule evaluator (simplified)
```php
$score = 0;
if ($pp->paypal_txn_id === $txn->txn_id) $score += 50;
if ($pp->order_ref === $txn->order_id) $score += 20;
if (strcasecmp($pp->payer_email, $txn->customer_email) === 0) $score += 10;
if (abs($pp->gross_usd - $txn->gross) <= 0.50) $score += 10;
if ($pp->paypal_time_utc->diffInDays($txn->txn_at_utc) <= 2) $score += 10;

$status = match (true) {
    $score >= 90 => 'FULLY_MATCHED',
    $score >= 70 => 'PARTIALLY_MATCHED',
    default => 'MANUAL_REVIEW_REQUIRED',
};
```

### React status badge map
```ts
export const statusColor: Record<string, string> = {
  FULLY_MATCHED: 'bg-emerald-600',
  PARTIALLY_MATCHED: 'bg-amber-500',
  MISSING_IN_SOFTWARE: 'bg-red-600',
  MISSING_IN_PAYPAL: 'bg-rose-600',
  REFUND_PENDING: 'bg-orange-500',
  SETTLEMENT_PENDING: 'bg-blue-500',
  CURRENCY_DIFFERENCE: 'bg-fuchsia-600',
  MANUAL_REVIEW_REQUIRED: 'bg-slate-600',
};
```

---

## 18) Next Action Required from You
Upload/provide the 4 Excel reference files so the reconciliation rules can be calibrated to your actual sheet names, column headers, fee structures, and March-2026 transaction edge cases.

---

## 19) How to Run in Browser (Web Mode)

Even though the primary target is **Electron Desktop**, you can run the same React frontend in a browser for development, UAT, and demos.

### 19.1 Prerequisites
- Node.js 20+
- npm or pnpm
- PHP 8.3+
- Composer
- MySQL 8+

### 19.2 Start Laravel API (Backend)
```bash
cd backend-laravel
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

Optional queue workers for reconciliation jobs:
```bash
php artisan queue:work --queue=imports,reconciliation,reports,exports
```

Optional scheduler loop (local dev):
```bash
php artisan schedule:work
```

### 19.3 Start React UI in Browser
```bash
cd app-desktop
npm install
npm run dev
```

Open:
- `http://localhost:5173` (Vite default)

### 19.4 Environment Variables (Frontend)
Create `app-desktop/.env`:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_APP_MODE=web
```

### 19.5 Environment Variables (Laravel)
Use these key values in `backend-laravel/.env`:
```env
APP_URL=http://127.0.0.1:8000
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
SESSION_DOMAIN=localhost
```

### 19.6 CORS + Sanctum Setup (Important)
In `config/cors.php` allow local frontend origins, and ensure API + Sanctum middleware are enabled for SPA auth.

Expected auth flow in browser mode:
1. `GET /sanctum/csrf-cookie`
2. `POST /auth/login`
3. Authenticated API calls with session/cookies.

### 19.7 Browser Mode vs Electron Mode
- **Browser mode**: uses HTTP API only.
- **Electron mode**: can use IPC for local file/system features plus API sync.

Recommended approach:
- Develop UI and reconciliation screens in browser mode first.
- Validate desktop-only features (secure storage, filesystem, background sync) in Electron mode.

### 19.8 Build for Browser Production
```bash
cd app-desktop
npm run build
npm run preview
```

Deploy `dist/` to Nginx/Apache/CDN and point it to Laravel API domain.

### 19.9 Common Local Issues
- 419 CSRF error → Sanctum/CORS misconfiguration.
- CORS blocked → missing origin in `config/cors.php`.
- Queue-backed reconciliation not running → start `php artisan queue:work`.
- Slow imports with large files → enable queue workers and chunked imports.
