# Install and Run Guide (Step-by-Step)

This guide explains exactly how to install and run the starter files in this repository.

## Project Modules
- `app-desktop/` → React + Vite + Electron client starter
- `backend-laravel/` → Laravel API starter skeleton

---

## 1) Prerequisites

Install before running:
- **Node.js 20+**
- **npm 10+**
- **PHP 8.3+**
- **Composer 2+**
- **MySQL 8+**
- **Git**

Check versions:
```bash
node -v
npm -v
php -v
composer -V
mysql --version
```

---

## 2) Clone and Enter Project

```bash
git clone <your-repo-url>
cd YT-thumbnail
```

---

## 3) Backend Setup (Laravel 12)

### 3.1 Create real Laravel app files inside `backend-laravel/`
```bash
cd backend-laravel
composer create-project laravel/laravel . "^12.0"
```

### 3.2 Configure environment
```bash
cp .env.example .env
```

Update DB credentials in `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=paypal_recon
DB_USERNAME=root
DB_PASSWORD=your_password

APP_URL=http://127.0.0.1:8000
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
SESSION_DOMAIN=localhost
```

### 3.3 Initialize Laravel
```bash
php artisan key:generate
php artisan migrate
```

### 3.4 Wire API v1 route file
If not already wired by your app, add this in `routes/api.php`:
```php
require __DIR__.'/api_v1.php';
```

### 3.5 Start backend server
```bash
php artisan serve --host=127.0.0.1 --port=8000
```

Backend URL:
- `http://127.0.0.1:8000`

---

## 4) Frontend Setup (Browser)

Open a **new terminal** in repo root:
```bash
cd app-desktop
cp .env.example .env
npm install
npm run dev
```

Frontend URL:
- `http://localhost:5173`

---

## 5) Electron Desktop Setup

From `app-desktop/`:
```bash
npm run electron:dev
```

This runs Vite + Electron together.

---

## 6) Optional Workers and Scheduler

In separate terminal:
```bash
cd backend-laravel
php artisan queue:work --queue=imports,reconciliation,reports,exports
```

Scheduler loop:
```bash
php artisan schedule:work
```

---

## 7) Verify It Works

### 7.1 API Health
```bash
curl http://127.0.0.1:8000/api/v1/health
```
Expected:
```json
{"ok":true,"service":"paypal-recon-api"}
```

### 7.2 Frontend
Open browser:
- `http://localhost:5173`

### 7.3 Electron
Electron window should open and load the same app.

---

## 8) One-Glance Run Order (TL;DR)

**Terminal 1 (API):**
```bash
cd backend-laravel
php artisan serve --host=127.0.0.1 --port=8000
```

**Terminal 2 (Web UI):**
```bash
cd app-desktop
npm run dev
```

**Terminal 3 (Desktop shell, optional):**
```bash
cd app-desktop
npm run electron:dev
```

---

## 9) Troubleshooting

- `composer: command not found` → Install Composer and reopen shell.
- `SQLSTATE[HY000] [1045] Access denied` → Fix DB user/password and grant permissions.
- `Connection refused` to MySQL → Start MySQL service.
- `Address already in use: 8000` → run Laravel on another port (`--port=8001`) and update `VITE_API_BASE_URL`.
- Vite port conflict → use displayed alternative port.
- Electron blank screen → ensure Vite is running first.
- 404 on `/api/v1/health` → ensure `require __DIR__.'/api_v1.php';` exists in `routes/api.php`.
