/**
 * Utilities for manipulating file names
 * Used in downloads, exports CSV, PDF, etc.
 */

/**
 * Extracts the file extension from a filename
 * @param {string} filename
 * @returns {string} - The extension with a dot (e.g., '.pdf')
 */
export function getFileExtension(filename) {
  if (!filename) return '';
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(lastDot) : '';
}

/**
 * Sanitizes file name by removing invalid characters
 * @param {string} filename
 * @param {Object} options - Sanitization options
 * @returns {string} - Sanitized name
 */
export function sanitizeFilename(filename, options = {}) {
  if (!filename) return options.fallback || 'download';

  const {
    maxLength = 255,
    replacement = '_',
    preserveCase = true,
    removeSpaces = false,
  } = options;

  // Remove invalid characters for file names on Windows/Linux
  const invalidChars = /[<>:"/\\|?*]/g;
  const controlChars = /[\x00-\x1F\x7F]/g; // eslint-disable-line no-control-regex

  let sanitized = filename
    .replace(invalidChars, replacement) // Basic invalid characters
    .replace(controlChars, replacement) // Control characters
    .replace(/\s+/g, removeSpaces ? replacement : ' ') // Multiple spaces
    .trim();

  // Case transformation
  if (!preserveCase) {
    sanitized = sanitized.toLowerCase();
  }

  // Truncate if necessary
  if (sanitized.length > maxLength) {
    const ext = getFileExtension(sanitized);
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.')) || sanitized;
    const availableLength = maxLength - ext.length;

    if (availableLength > 0) {
      sanitized = nameWithoutExt.substring(0, availableLength) + ext;
    } else {
      sanitized = sanitized.substring(0, maxLength);
    }
  }

  return sanitized;
}

/**
 * Removes the file extension from a filename
 * @param {string} filename
 * @returns {string} - Name without extension
 */
export function removeFileExtension(filename) {
  if (!filename) return '';
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(0, lastDot) : filename;
}

/**
 * Generate a unique filename by adding a timestamp or counter
 * @param {string} baseFilename
 * @param {Object} options
 * @returns {string} - Unique filename
 */
export function generateUniqueFilename(baseFilename, options = {}) {
  const {
    useTimestamp = true,
    useCounter = false,
    counter = 1,
    format = 'YYYY-MM-DD_HH-mm-ss',
  } = options;

  const sanitized = sanitizeFilename(baseFilename);
  const ext = getFileExtension(sanitized);
  const nameWithoutExt = removeFileExtension(sanitized);

  if (useTimestamp) {
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/:/g, '-')
      .replace(/\./g, '-')
      .substring(0, 19); // YYYY-MM-DDTHH-mm-ss

    return `${nameWithoutExt}_${timestamp}${ext}`;
  }

  if (useCounter) {
    return `${nameWithoutExt}_${counter}${ext}`;
  }

  return sanitized;
}

/**
 * Validates if the filename is safe
 * @param {string} filename
 * @returns {boolean} - True if valid
 */
export function isValidFilename(filename) {
  if (!filename || typeof filename !== 'string') return false;

  // Check for invalid characters
  const invalidChars = /[<>:"\/\\|?*\x00-\x1F\x7F]/;
  if (invalidChars.test(filename)) return false;

  // Check for reserved names in Windows
  const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
  if (reservedNames.test(filename)) return false;

  // Check length
  if (filename.length > 255) return false;

  return true;
}

/**
 * Creates a filename for export with prefix and date
 * @param {string} type - Export type ('csv', 'pdf', 'excel')
 * @param {string} description - File description
 * @param {Object} options - Additional options
 * @returns {string} - Formatted export filename
 */
export function createExportFilename(type, description, options = {}) {
  const {
    prefix = 'export',
    includeDate = true,
    includeTime = false,
    customSuffix = '',
  } = options;

  const ext = type.startsWith('.') ? type : `.${type}`;
  const sanitizedDesc = sanitizeFilename(description, { removeSpaces: true });

  let filename = prefix;

  if (sanitizedDesc) {
    filename += `_${sanitizedDesc}`;
  }

  if (includeDate) {
    const now = new Date();
    const dateStr = now.toISOString().substring(0, 10); // YYYY-MM-DD
    filename += `_${dateStr}`;

    if (includeTime) {
      const timeStr = now.toTimeString().substring(0, 5).replace(':', '-'); // HH-mm
      filename += `_${timeStr}`;
    }
  }

  if (customSuffix) {
    filename += `_${sanitizeFilename(customSuffix, { removeSpaces: true })}`;
  }

  return sanitizeFilename(filename + ext);
}

/**
 * Extracts the filename from the Content-Disposition header
 * @param {string} contentDisposition - Header Content-Disposition
 * @param {string} fallback - Fallback filename
 * @returns {string} - Extracted filename
 */
export function extractFilenameFromHeader(contentDisposition, fallback) {
  if (!contentDisposition) return fallback;

  try {
    // Patterns for different filename formats
    const patterns = [
      /filename\*=(?:UTF-8'')?([^;]+)/i, // RFC 6266 com encoding
      /filename=['"]([^'";]+)['"];?/i, // Com aspas
      /filename=([^;'"\s]+);?/i, // Sem aspas
    ];

    const tryPattern = (pattern) => {
      const match = contentDisposition.match(pattern);
      if (match && match[1]) {
        const decoded = decodeURIComponent(match[1].trim());
        const sanitized = sanitizeFilename(decoded);

        console.log('📁 Filename extraído do header:', {
          original: match[1],
          decoded,
          sanitized,
        });

        return sanitized;
      }
      return null;
    };

    return patterns.reduce((result, pattern) => result || tryPattern(pattern), null) || fallback;
  } catch (error) {
    console.warn('Erro ao extrair filename do Content-Disposition:', error);
    return fallback;
  }
}

export default {
  sanitizeFilename,
  getFileExtension,
  removeFileExtension,
  generateUniqueFilename,
  isValidFilename,
  createExportFilename,
  extractFilenameFromHeader,
};
