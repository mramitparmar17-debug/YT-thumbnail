# Install & Run Guide (Starter Layout)

This repository currently includes:
- `app-desktop/` → React + Vite + Electron starter
- `backend-laravel/` → Laravel bootstrap skeleton (you will generate full Laravel files inside it)

---

## 1) Prerequisites

Install these first:
- Node.js 20+ and npm
- PHP 8.3+
- Composer 2+
- MySQL 8+
- Git

Verify versions:
```bash
node -v
npm -v
php -v
composer -V
mysql --version
```

---

## 2) Backend Setup (Laravel API)

From repository root:
```bash
cd backend-laravel
composer create-project laravel/laravel . "^12.0"
cp .env.example .env
```

Edit `.env` database values:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=paypal_recon
DB_USERNAME=root
DB_PASSWORD=your_password
```

Then run:
```bash
php artisan key:generate
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8000
```

API will run at:
- `http://127.0.0.1:8000`

---

## 3) Frontend Setup (Browser Mode)

Open a **new terminal** from repository root:
```bash
cd app-desktop
cp .env.example .env
npm install
npm run dev
```

Web app will run at:
- `http://localhost:5173`

---

## 4) Electron Desktop Mode

From `app-desktop/`:
```bash
npm run electron:dev
```

This starts Vite + Electron together.

---

## 5) Optional Background Workers (Recommended)

In another terminal:
```bash
cd backend-laravel
php artisan queue:work --queue=imports,reconciliation,reports,exports
```

Optional scheduler loop:
```bash
php artisan schedule:work
```

---

## 6) Quick Health Checks

Backend health route (after wiring route file in Laravel routes):
```bash
curl http://127.0.0.1:8000/api/v1/health
```

Expected response:
```json
{"ok":true,"service":"paypal-recon-api"}
```

---

## 7) Common Issues

- **`composer: command not found`** → install Composer.
- **DB connection error** → verify `.env` DB credentials and that MySQL is running.
- **Port 8000 in use** → run Laravel on another port: `php artisan serve --port=8001` and update `VITE_API_BASE_URL`.
- **Port 5173 in use** → Vite may auto-switch; check terminal output and open shown URL.
- **Electron blank window** → ensure Vite dev server is running before Electron starts.

---

## 8) Minimum Run Order (TL;DR)

Terminal 1:
```bash
cd backend-laravel
php artisan serve --host=127.0.0.1 --port=8000
```

Terminal 2:
```bash
cd app-desktop
npm run dev
```

Terminal 3 (optional desktop shell):
```bash
cd app-desktop
npm run electron:dev
```
