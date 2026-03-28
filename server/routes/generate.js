/**
 * Thumbnail generation route.
 * Accepts:
 * - referenceImage (file)
 * - prompt (text)
 * - stylePreset (text)
 * - textOverlay (boolean string)
 * - brightness / contrast (UI numeric controls)
 *
 * Uses Gemini image generation model and returns a generated image as base64 data URL.
 */
const express = require('express');
const multer = require('multer');

const router = express.Router();

// Use in-memory storage for speed and to avoid disk I/O.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  }
});

/**
 * Build a high-quality prompt instruction block with user options.
 */
function buildPrompt({ prompt, stylePreset, textOverlay, brightness, contrast }) {
  const styleInstruction = stylePreset && stylePreset !== 'None'
    ? `Style direction: ${stylePreset}.`
    : '';

  const overlayInstruction = textOverlay === 'true'
    ? 'Include bold, legible YouTube thumbnail text overlay with strong hierarchy.'
    : 'Do not include text overlay in the generated image.';

  return [
    'Generate a cinematic YouTube thumbnail image.',
    'Target output: exact 16:9 composition at 3840x2160 (4K UHD).',
    'Optimize for high click-through-rate visual storytelling, strong contrast, and subject clarity.',
    styleInstruction,
    overlayInstruction,
    `Brightness preference (UI hint): ${brightness || '0'}.`,
    `Contrast preference (UI hint): ${contrast || '0'}.`,
    `User creative direction: ${prompt}`
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * Extract first image from Gemini response payload.
 */
function extractImageFromResponse(data) {
  const candidates = data?.candidates || [];
  for (const candidate of candidates) {
    const parts = candidate?.content?.parts || [];
    for (const part of parts) {
      if (part?.inlineData?.data && part?.inlineData?.mimeType) {
        return {
          base64: part.inlineData.data,
          mimeType: part.inlineData.mimeType
        };
      }
      // Some APIs may respond with snake_case variants.
      if (part?.inline_data?.data && part?.inline_data?.mime_type) {
        return {
          base64: part.inline_data.data,
          mimeType: part.inline_data.mime_type
        };
      }
    }
  }
  return null;
}

/**
 * POST /generate-thumbnail
 * Multipart form data:
 * - referenceImage: image file
 * - prompt: text instructions
 */
router.post('/generate-thumbnail', upload.single('referenceImage'), async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-3-pro-image';

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on server.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Reference image is required.' });
    }

    const userPrompt = req.body.prompt?.trim();
    if (!userPrompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    // Convert uploaded file to base64 for Gemini request.
    const referenceBase64 = req.file.buffer.toString('base64');

    const composedPrompt = buildPrompt({
      prompt: userPrompt,
      stylePreset: req.body.stylePreset,
      textOverlay: req.body.textOverlay,
      brightness: req.body.brightness,
      contrast: req.body.contrast
    });

    const payload = {
      model,
      prompt: composedPrompt,
      image: referenceBase64,
      aspect_ratio: '16:9',
      resolution: '3840x2160'
    };

    // Gemini generateContent endpoint request.
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const geminiRequestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: composedPrompt },
            {
              inline_data: {
                mime_type: req.file.mimetype,
                data: referenceBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT']
      }
    };

    const geminiResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(geminiRequestBody)
    });

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      return res.status(geminiResponse.status).json({
        error: data?.error?.message || 'Gemini API request failed.',
        details: data
      });
    }

    const generatedImage = extractImageFromResponse(data);
    if (!generatedImage) {
      return res.status(502).json({
        error: 'Gemini returned no image output.',
        details: data
      });
    }

    return res.json({
      success: true,
      requestPayload: payload,
      imageBase64: generatedImage.base64,
      mimeType: generatedImage.mimeType,
      imageDataUrl: `data:${generatedImage.mimeType};base64,${generatedImage.base64}`
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Unexpected server error while generating thumbnail.',
      details: error.message
    });
  }
});

module.exports = router;
