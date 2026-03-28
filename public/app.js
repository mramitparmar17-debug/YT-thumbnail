/**
 * Frontend logic:
 * - Handle reference image preview
 * - Submit generation request
 * - Render output preview and provide download actions
 */
const form = document.getElementById('thumbnailForm');
const referenceImageInput = document.getElementById('referenceImage');
const referencePreview = document.getElementById('referencePreview');
const referencePlaceholder = document.getElementById('referencePlaceholder');
const outputPreview = document.getElementById('outputPreview');
const outputPlaceholder = document.getElementById('outputPlaceholder');
const loading = document.getElementById('loading');
const errorBox = document.getElementById('errorBox');
const downloadPngBtn = document.getElementById('downloadPng');
const downloadJpgBtn = document.getElementById('downloadJpg');
const brightnessInput = document.getElementById('brightness');
const contrastInput = document.getElementById('contrast');
const brightnessValue = document.getElementById('brightnessValue');
const contrastValue = document.getElementById('contrastValue');

let generatedImageDataUrl = null;

/** Update UI number labels for sliders */
function syncSliderValues() {
  brightnessValue.textContent = brightnessInput.value;
  contrastValue.textContent = contrastInput.value;
}

brightnessInput.addEventListener('input', syncSliderValues);
contrastInput.addEventListener('input', syncSliderValues);

/** Show upload preview as soon as user selects a file. */
referenceImageInput.addEventListener('change', () => {
  const file = referenceImageInput.files?.[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  referencePreview.src = url;
  referencePreview.classList.remove('d-none');
  referencePlaceholder.classList.add('d-none');
});

/** Utility for error display. */
function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove('d-none');
}

function clearError() {
  errorBox.textContent = '';
  errorBox.classList.add('d-none');
}

/** Utility to download a data URL as a file. */
function triggerDownload(dataUrl, filename) {
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

/** Convert generated image to JPG if user requests JPG download. */
async function convertDataUrlToJpeg(dataUrl, quality = 0.95) {
  const image = new Image();
  image.src = dataUrl;

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);

  return canvas.toDataURL('image/jpeg', quality);
}

/** Submit form and request generated thumbnail from backend. */
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError();

  const file = referenceImageInput.files?.[0];
  if (!file) {
    showError('Please upload a reference image first.');
    return;
  }

  const prompt = document.getElementById('prompt').value.trim();
  if (!prompt) {
    showError('Please enter a creative prompt.');
    return;
  }

  const formData = new FormData();
  formData.append('referenceImage', file);
  formData.append('prompt', prompt);
  formData.append('stylePreset', document.getElementById('stylePreset').value);
  formData.append('textOverlay', document.getElementById('textOverlay').checked ? 'true' : 'false');
  formData.append('brightness', brightnessInput.value);
  formData.append('contrast', contrastInput.value);

  loading.classList.remove('d-none');
  loading.classList.add('d-flex');

  try {
    const response = await fetch('/api/generate-thumbnail', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to generate thumbnail.');
    }

    generatedImageDataUrl = result.imageDataUrl;
    outputPreview.src = generatedImageDataUrl;
    outputPreview.classList.remove('d-none');
    outputPlaceholder.classList.add('d-none');

    downloadPngBtn.classList.remove('d-none');
    downloadJpgBtn.classList.remove('d-none');
  } catch (error) {
    showError(error.message || 'An unexpected error occurred.');
  } finally {
    loading.classList.remove('d-flex');
    loading.classList.add('d-none');
  }
});

/** Download as PNG */
downloadPngBtn.addEventListener('click', () => {
  if (!generatedImageDataUrl) return;
  triggerDownload(generatedImageDataUrl, 'youtube-thumbnail-4k.png');
});

/** Download as JPG */
downloadJpgBtn.addEventListener('click', async () => {
  if (!generatedImageDataUrl) return;
  try {
    const jpgDataUrl = await convertDataUrlToJpeg(generatedImageDataUrl);
    triggerDownload(jpgDataUrl, 'youtube-thumbnail-4k.jpg');
  } catch (_error) {
    showError('Unable to convert generated image to JPG. Please download PNG instead.');
  }
});

// Initialize slider labels on first paint.
syncSliderValues();
