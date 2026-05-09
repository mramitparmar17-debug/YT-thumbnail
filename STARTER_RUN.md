# Ready-to-run starter layout

## Run Web UI
```bash
cd app-desktop
npm install
npm run dev
```

## Run Electron shell
```bash
cd app-desktop
npm install
npm run electron:dev
```

## Backend bootstrap
```bash
cd backend-laravel
composer create-project laravel/laravel . "^12.0"
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8000
```
