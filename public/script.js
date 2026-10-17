/* =============================================
   SwiftLoad — Frontend JavaScript
   Platform detection, API calls, UI updates
   ============================================= */

'use strict';

// ── Platform Detection Config ──
const PLATFORMS = [
  { id: 'youtube',    pattern: /youtube\.com|youtu\.be/i,     icon: '▶', label: 'YouTube' },
  { id: 'tiktok',    pattern: /tiktok\.com/i,                icon: '♪', label: 'TikTok' },
  { id: 'facebook',  pattern: /facebook\.com|fb\.watch/i,    icon: 'f', label: 'Facebook' },
  { id: 'instagram', pattern: /instagram\.com/i,             icon: '📷', label: 'Instagram' },
  { id: 'twitter',   pattern: /twitter\.com|x\.com/i,        icon: '𝕏', label: 'Twitter / X' },
  { id: 'reddit',    pattern: /reddit\.com|redd\.it/i,       icon: '🤖', label: 'Reddit' },
  { id: 'vimeo',     pattern: /vimeo\.com/i,                 icon: '🎬', label: 'Vimeo' },
  { id: 'soundcloud',pattern: /soundcloud\.com/i,            icon: '☁', label: 'SoundCloud' },
  { id: 'twitch',    pattern: /twitch\.tv/i,                 icon: '🎮', label: 'Twitch' },
  { id: 'pinterest', pattern: /pinterest\.com/i,             icon: '📌', label: 'Pinterest' },
];

// ── DOM References ──
const urlInput        = document.getElementById('url-input');
const downloadBtn     = document.getElementById('download-btn');
const pasteBtn        = document.getElementById('paste-btn');
const resultArea      = document.getElementById('result-area');
const detectedPlatform= document.getElementById('detected-platform');
const platformIcon    = document.getElementById('platform-icon');
const platformName    = document.getElementById('platform-name');
const qualitySelect   = document.getElementById('quality-select');
const formatSelect    = document.getElementById('format-select');
const tiktokWatermark = document.getElementById('tiktok-watermark');
const platformBadges  = document.querySelectorAll('.platform-badge');

// ── Detect Platform from URL ──
function detectPlatform(url) {
  if (!url) return null;
  return PLATFORMS.find(p => p.pattern.test(url)) || null;
}

// ── Update Platform UI ──
function updatePlatformUI(platform) {
  // Reset all badges
  platformBadges.forEach(b => b.classList.remove('active'));

  if (platform) {
    platformIcon.textContent = platform.icon;
    platformName.textContent = `${platform.label} video detected`;
    detectedPlatform.classList.add('active');
    // Highlight badge
    const badge = document.querySelector(`.platform-badge[data-platform="${platform.id}"]`);
    if (badge) badge.classList.add('active');
  } else {
    platformIcon.textContent = '🔗';
    platformName.textContent = 'URL paste karein neeche';
    detectedPlatform.classList.remove('active');
  }
}

// ── URL Input Listener ──
let debounceTimer;
urlInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const platform = detectPlatform(urlInput.value.trim());
    updatePlatformUI(platform);
    // Show/hide TikTok watermark option
    const ttGroup = tiktokWatermark.closest('.toggle-group');
    if (ttGroup) {
      ttGroup.style.display = platform?.id === 'tiktok' ? 'flex' : 'none';
    }
  }, 300);
});

// ── Paste Button ──
pasteBtn.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    urlInput.value = text;
    urlInput.dispatchEvent(new Event('input'));
    pasteBtn.style.color = '#22c55e';
    setTimeout(() => { pasteBtn.style.color = ''; }, 1200);
  } catch {
    urlInput.focus();
    urlInput.select();
  }
});

// ── Show Loading UI ──
function showLoading(platformLabel) {
  resultArea.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">Processing ${platformLabel || 'video'} link...</p>
      <div class="loading-progress">
        <div class="loading-bar"></div>
      </div>
    </div>
  `;
}

// ── Show Error UI ──
function showError(message) {
  resultArea.innerHTML = `
    <div class="error-state">
      <span class="error-icon">⚠️</span>
      <p class="error-text">${escapeHtml(message)}</p>
    </div>
  `;
}

// ── Show Success UI (single video) ──
function showSuccess(data, platform) {
  const platformLabel = platform ? platform.label : 'Video';

  let linksHtml = '';

  if (data.url) {
    linksHtml = `
      <div class="download-links">
        <a href="${escapeHtml(data.url)}" 
           class="download-link-btn" 
           target="_blank" 
           rel="noopener noreferrer"
           id="main-download-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download ${platformLabel}
        </a>
        <button class="download-link-btn secondary" id="copy-link-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy Link
        </button>
      </div>
    `;
  }

  resultArea.innerHTML = `
    <div class="success-state">
      <div class="success-header">
        <div class="success-icon">✅</div>
        <div class="success-meta">
          <div class="success-title">${platformLabel} video ready!</div>
          <div class="success-subtitle">
            ${data.status === 'tunnel' ? 'Cloudflare CDN se stream ho raha hai' : 'Direct download link ready'}
          </div>
        </div>
      </div>
      ${linksHtml}
    </div>
  `;

  // Copy link button
  const copyBtn = document.getElementById('copy-link-btn');
  if (copyBtn && data.url) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(data.url);
        copyBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Copied!
        `;
        copyBtn.style.borderColor = '#22c55e';
        copyBtn.style.color = '#22c55e';
        setTimeout(() => {
          copyBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy Link
          `;
          copyBtn.style.borderColor = '';
          copyBtn.style.color = '';
        }, 2000);
      } catch {
        // fallback
      }
    });
  }
}

// ── Show Picker UI (multiple items, e.g. Instagram gallery) ──
function showPicker(data, platform) {
  const platformLabel = platform ? platform.label : 'Media';
  const items = data.picker || [];

  let audioHtml = '';
  if (data.audio) {
    audioHtml = `
      <a href="${escapeHtml(data.audio)}" class="download-link-btn secondary" target="_blank" rel="noopener noreferrer">
        🎵 Download Audio
      </a>
    `;
  }

  const gridHtml = items.map((item, i) => `
    <a href="${escapeHtml(item.url)}" 
       class="picker-item" 
       target="_blank" 
       rel="noopener noreferrer"
       id="picker-item-${i}">
      ${item.thumb ? `<img class="picker-thumb" src="${escapeHtml(item.thumb)}" alt="Media ${i+1}" loading="lazy" />` : ''}
      <div class="picker-label">
        ${item.type === 'video' ? '🎬' : '🖼'} Item ${i + 1}
      </div>
    </a>
  `).join('');

  resultArea.innerHTML = `
    <div class="success-state">
      <div class="success-header">
        <div class="success-icon">📁</div>
        <div class="success-meta">
          <div class="success-title">${items.length} items found</div>
          <div class="success-subtitle">${platformLabel} gallery — item chunein download karne ke liye</div>
        </div>
      </div>
      ${audioHtml ? `<div class="download-links">${audioHtml}</div>` : ''}
      <div class="picker-grid">${gridHtml}</div>
    </div>
  `;
}

// ── Utility: HTML escape ──
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Main Download Function ──
async function handleDownload() {
  const url = urlInput.value.trim();

  if (!url) {
    urlInput.focus();
    urlInput.style.borderColor = '#ef4444';
    urlInput.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.15)';
    setTimeout(() => {
      urlInput.style.borderColor = '';
      urlInput.style.boxShadow = '';
    }, 2000);
    return;
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    showError('Please enter a valid URL (https:// se shuru hona chahiye)');
    return;
  }

  const platform = detectPlatform(url);
  const quality  = qualitySelect.value;
  const format   = formatSelect.value;
  const ttWatermark = tiktokWatermark.checked;

  // Disable button during fetch
  downloadBtn.disabled = true;
  downloadBtn.querySelector('.btn-text').textContent = 'Processing...';

  showLoading(platform?.label);

  try {
    const res = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        quality,
        format,
        tiktokWatermark: ttWatermark,
      }),
    });

    const data = await res.json();

    if (!res.ok || data.status === 'error') {
      const msg = data.error || data.text || `Server error: ${res.status}`;
      showError(msg);
      return;
    }

    if (data.status === 'picker') {
      showPicker(data, platform);
    } else {
      showSuccess(data, platform);
    }

  } catch (err) {
    console.error('Download error:', err);
    showError('Network error. Dobara try karein ya kuch der baad aayein.');
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.querySelector('.btn-text').textContent = 'Download';
  }
}

// ── Event Listeners ──
downloadBtn.addEventListener('click', handleDownload);

urlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleDownload();
});

// ── Init: hide TikTok watermark toggle initially ──
(function init() {
  const ttGroup = tiktokWatermark?.closest('.toggle-group');
  if (ttGroup) ttGroup.style.display = 'none';

  // Scroll animations using IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.stat-card, .step-card, .feature-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
})();
