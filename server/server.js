/**
 * Express server bootstrap file.
 * - Loads environment variables
 * - Enables CORS + JSON parsing
 * - Serves static frontend files
 * - Mounts thumbnail generation API routes
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment values from .env file at startup.
dotenv.config();

const generateRouter = require('./routes/generate');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable cross-origin requests for frontend/backend integration flexibility.
app.use(cors());

// Parse JSON bodies for non-file API requests.
app.use(express.json({ limit: '10mb' }));

// Serve static assets for the frontend dashboard.
app.use(express.static(path.join(__dirname, '..', 'public')));

// Mount API routes under /api namespace.
app.use('/api', generateRouter);

// Basic health route for uptime checks.
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'YouTube Thumbnail Generator API running' });
});

// Start server.
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at http://localhost:${PORT}`);
});
