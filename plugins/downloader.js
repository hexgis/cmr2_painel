/**
 * Download Utility Plugin
 */

/**
 * Sanitizes filename by removing invalid characters and extra spaces.
 * @param {string} filename
 * @returns {string} - Sanitized filename
 */
function sanitizeFilename(filename) {
  if (!filename) return 'download';

  const invalidChars = /[<>:"/\\|?*]/g;
  const controlChars = /[\x00-\x1F\x7F]/g; // eslint-disable-line no-control-regex

  return filename
    .replace(invalidChars, '_')
    .replace(controlChars, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 255);
}

/**
 * Extracts filename from Content-Disposition header.
 * @param {string} contentDisposition - Content-Disposition header
 * @param {string} fallback - Fallback filename
 * @returns {string} - Extracted filename
 */
function extractFilenameFromHeader(contentDisposition, fallback = 'download') {
  if (!contentDisposition) return fallback;

  const patterns = [
    /filename\*=(?:UTF-8'')?([^;]+)/i, // RFC 6266 (UTF-8)
    /filename=['"]([^'";]+)['"]/i, // Com aspas
    /filename=([^;'"\s]+)/i, // Sem aspas
  ];

  Object.values(patterns).forEach((pattern) => {
    const match = contentDisposition.match(pattern);
    if (match && match[1]) {
      try {
        return sanitizeFilename(decodeURIComponent(match[1].trim()));
      } catch (_) {
        return sanitizeFilename(match[1].trim());
      }
    }
    return fallback;
  });

  return fallback;
}

/**
 * Creates and triggers a Blob download.
 * @param {Blob} blob
 * @param {string} filename
 */
function trigger(blob, filename) {
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = sanitizeFilename(filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}

/**
 * Downloads a file from a Blob.
 * @param {*} blob - Blob data
 * @param {*} contentDisposition - Content-Disposition header
 * @param {*} filename - Fallback filename
 */
function file(blob, contentDisposition = '', filename = 'download') {
  const finalFilename = extractFilenameFromHeader(contentDisposition, filename);
  trigger(blob, finalFilename);
}

export default (_, inject) => {
  inject('downloader', { file });
};
