# YouTube Thumbnail Generator (4K)

A full-stack Node.js + Bootstrap application that generates 16:9 YouTube thumbnail images using Google Gemini image generation.

## Features
- Upload a reference image and preview it
- Enter prompt instructions
- Preset styles: MrBeast / Podcast / Tech Review
- Text overlay toggle
- Brightness / contrast controls (UI hints)
- Generates 16:9 target at 3840x2160 guidance
- Preview generated image
- Download as PNG or JPG

## Tech Stack
- Backend: Node.js + Express
- Frontend: HTML, CSS, Bootstrap 5
- Upload handling: Multer
- API integration: Google Gemini REST API

## Project Structure
```
/server
  server.js
  /routes
    generate.js
/public
  index.html
  styles.css
  app.js
```

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key in `.env`.
3. Start server:
   ```bash
   npm run dev
   ```
4. Open:
   `http://localhost:3000`

## API
### `POST /api/generate-thumbnail`
Multipart form-data fields:
- `referenceImage` (file)
- `prompt` (string)
- `stylePreset` (string)
- `textOverlay` (`true|false`)
- `brightness` (number string)
- `contrast` (number string)

Returns JSON with `imageDataUrl`, `mimeType`, and metadata.
