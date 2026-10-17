/**
 * SwiftLoad — Cloudflare Pages Function
 * Path: /api/download
 * 
 * Handles video download requests by calling the
 * Cobalt.tools API (free, open-source video downloader).
 * 
 * Cobalt supports: YouTube, TikTok, Facebook, Instagram,
 * Twitter/X, Reddit, Vimeo, SoundCloud, Twitch, Pinterest, and more.
 */

// ── CORS Headers ──
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── Cobalt API endpoint ──
// Using the public Cobalt API. You can also self-host cobalt:
// https://github.com/imputnet/cobalt
const COBALT_API = 'https://api.cobalt.tools/';

// ── Quality mapping ──
const QUALITY_MAP = {
  max:  'max',
  2160: '2160',
  1440: '1440',
  1080: '1080',
  720:  '720',
  480:  '480',
  360:  '360',
};

// ── Format mapping ──
const FORMAT_MAP = {
  video: 'mp4',
  audio: 'mp3',
  mute:  'mp4',
};

/**
 * Main handler for POST /api/download
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const { url, quality = '1080', format = 'video', tiktokWatermark = false } = body;

  // Validate URL
  if (!url || typeof url !== 'string') {
    return errorResponse('URL is required', 400);
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url.trim());
  } catch {
    return errorResponse('Invalid URL provided', 400);
  }

  // Only allow http/https
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return errorResponse('Only HTTP/HTTPS URLs are allowed', 400);
  }

  // Build Cobalt API request body
  const cobaltPayload = {
    url: parsedUrl.href,
    videoQuality: QUALITY_MAP[quality] || '1080',
    audioFormat: 'mp3',
    audioBitrate: '320',
    downloadMode: format === 'audio' ? 'audio' : (format === 'mute' ? 'mute' : 'auto'),
    tiktokFullAudio: false,
    tiktokH265: false,
    youtubeVideoCodec: 'h264',
    youtubeHLS: false,
    youtubeDubBrowserLang: false,
  };

  // TikTok watermark option
  if (tiktokWatermark) {
    cobaltPayload.disableTiktokWatermark = false;
  } else {
    cobaltPayload.disableTiktokWatermark = true;
  }

  try {
    const cobaltRes = await fetch(COBALT_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SwiftLoad/1.0 (Cloudflare Pages)',
      },
      body: JSON.stringify(cobaltPayload),
      // Cloudflare timeout
      signal: AbortSignal.timeout(25000),
    });

    if (!cobaltRes.ok) {
      const errText = await cobaltRes.text().catch(() => 'Unknown error');
      console.error('Cobalt API error:', cobaltRes.status, errText);
      return errorResponse(
        `Video process karne mein masla hua (${cobaltRes.status}). Dobara try karein.`,
        502
      );
    }

    const data = await cobaltRes.json();

    // Handle different Cobalt response statuses
    switch (data.status) {
      case 'tunnel':
      case 'redirect':
        // Single video/audio download
        return jsonResponse({
          status: data.status,
          url: data.url,
          filename: data.filename || null,
        });

      case 'picker':
        // Multiple items (e.g. Instagram gallery, Pinterest board)
        return jsonResponse({
          status: 'picker',
          pickerType: data.pickerType || 'various',
          picker: (data.picker || []).map(item => ({
            type: item.type,
            url: item.url,
            thumb: item.thumb || null,
          })),
          audio: data.audio || null,
        });

      case 'error':
        return errorResponse(
          translateCobaltError(data.error?.code) || 
          data.error?.message || 
          'Video download karna mumkin na ho saka.',
          422
        );

      default:
        return errorResponse('Unexpected response from video API', 502);
    }

  } catch (err) {
    if (err.name === 'TimeoutError') {
      return errorResponse('Request timeout. Dobara try karein.', 504);
    }
    console.error('Fetch error:', err);
    return errorResponse('Network error. Server se connection fail hua.', 500);
  }
}

/**
 * Handle OPTIONS preflight
 */
export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// ── Helper: JSON success response ──
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

// ── Helper: Error response ──
function errorResponse(message, status = 400) {
  return new Response(JSON.stringify({ status: 'error', error: message }), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
    },
  });
}

// ── Translate Cobalt error codes to Urdu/English ──
function translateCobaltError(code) {
  const messages = {
    'error.api.unreachable':           'Service abhi available nahin. Baad mein try karein.',
    'error.api.fetch.fail':            'Video fetch karna fail ho gaya.',
    'error.api.url.invalid':           'Yeh URL valid nahin hai.',
    'error.api.fetch.rate':            'Bohat zyada requests. Thodi der baad try karein.',
    'error.api.content.too_long':      'Video bohat lambi hai.',
    'error.api.fetch.short':           'URL se video nahin mili.',
    'error.api.fetch.empty':           'Koi content nahin mila is URL par.',
    'error.api.youtube.decipher':      'YouTube video process karna fail hua.',
    'error.api.youtube.login':         'Yeh YouTube video login ke bina download nahin ho sakti.',
    'error.api.content.private':       'Yeh video private hai, download nahin ho sakti.',
    'error.api.content.age':           'Age-restricted content download nahin ho sakta.',
    'error.api.content.live':          'Live streams download nahin hoti.',
    'error.api.content.unavailable':   'Yeh content available nahin hai.',
    'error.api.content.region':        'Yeh content aapke region mein available nahin.',
  };
  return messages[code] || null;
}
