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
    /filename=['"]([^'";]+)['"]/i,     // Com aspas
    /filename=([^;'"\s]+)/i,           // Sem aspas
  ];

  for (const pattern of patterns) {
    const match = contentDisposition.match(pattern);
    if (match?.[1]) {
      try {
        return sanitizeFilename(decodeURIComponent(match[1].trim()));
      } catch {
        return sanitizeFilename(match[1].trim());
      }
    }
  }

  return fallback;
}

/**
 * Creates and triggers a Blob download.
 * @param {Blob} blob
 * @param {string} filename
 */
function triggerDownload(blob, filename) {
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
 * Main class for download management.
 */
class Downloader {
  constructor(api, toast) {
    this.api = api;
    this.toast = toast;
  }

  /**
   * Downloads a file via HTTP request.
   * @param {string} url - File URL for download
   * @param {string} [filename='download'] - Filename
   * @param {Object} [options={}] - Additional options
   * @returns {Promise<{success: boolean, filename?: string, error?: Error}>}
   */
  async file(url, filename = 'download', options = {}) {
    if (!url) {
      this.toast?.error('Download URL not provided.');
      return { success: false, error: new Error('Download URL not provided') };
    }

    const { showLoading, showSuccess, requestConfig } = options;

    try {
      if (showLoading) this.toast?.info('Preparing download...');

      const response = await this.api({
        method: 'GET',
        url,
        responseType: 'blob',
        ...requestConfig,
      });

      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const contentDisposition = response.headers['content-disposition'];
      const finalFilename = extractFilenameFromHeader(contentDisposition, filename);

      const blob = new Blob([response.data], { type: contentType });
      triggerDownload(blob, finalFilename);

      if (showSuccess) this.toast?.success('File downloaded successfully!');
      return { success: true, filename: finalFilename };

    } catch (error) {
      console.error('Error downloading file:', error);

      const status = error.response?.status;
      if (this.toast) {
        if (status === 401) this.toast.error('Unauthorized. Please login again.');
        else if (status === 404) this.toast.error('File not found.');
        else this.toast.error('Error downloading file.');
      }

      return { success: false, error };
    }
  }

  /**
   * Downloads data directly as a blob (or string/ArrayBuffer).
   * @param {Blob|ArrayBuffer|string} data
   * @param {string} filename
   * @param {string} [mimeType='application/octet-stream']
   * @param {Object} [options={}]
   * @returns {Promise<{success: boolean, filename?: string, error?: Error}>}
   */
  async blob(data, filename, mimeType = 'application/octet-stream', options = {}) {
    const { showLoading, showSuccess } = options;

    try {
      if (showLoading) this.toast?.info('Preparing download...');

      const blob = new Blob([data], { type: mimeType });
      triggerDownload(blob, filename);

      if (showSuccess) this.toast?.success('File downloaded successfully!');
      return { success: true, filename: sanitizeFilename(filename) };

    } catch (error) {
      console.error('Error downloading blob:', error);
      this.toast?.error('Error downloading file.');
      return { success: false, error };
    }
  }

  /**
   * Generates a URL by replacing {key} placeholders with values.
   * @param {string} baseUrl
   * @param {string} endpoint
   * @param {Object} [params={}] - Parameters for replacement
   * @returns {string} - Built URL
   */
  static buildUrl(baseUrl, endpoint, params = {}) {
    return Object.entries(params).reduce(
      (url, [key, value]) => url.replace(`{${key}}`, encodeURIComponent(value)),
      `${baseUrl}${endpoint}`
    );
  }
}

export default (context, inject) => {
  const downloader = new Downloader(context.$api, context.$toast);
  inject('downloader', downloader);
};
