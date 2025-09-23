/**
 * CSV Plugin for Nuxt.js
 * Provides global CSV utilities accessible via this.$csv
 */

/**
 * Escapes a value for use in a CSV file.
 * Handles quotes, commas, newlines, and null/undefined values.
 * @param {any} value - The value to escape
 * @returns {string} - The escaped value
 */
function escapeCSVValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // Check if the value contains quotes, commas, or newlines
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('\r')) {
    // Escape double quotes by doubling them and wrap the entire value in quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Converts an array of objects to a CSV string.
 * @param {Array} data - Array of objects to convert
 * @param {Array|null} customHeaders - Custom header list (optional)
 * @param {string} delimiter - Column separator (default: ',')
 * @returns {string} - CSV content as string
 */
function convertToCSV(data, customHeaders = null, delimiter = ',') {
  if (!data || !Array.isArray(data) || data.length === 0) return '';

  const headers = customHeaders || Object.keys(data[0]);
  const csvHeaders = headers.map((header) => escapeCSVValue(header)).join(delimiter);

  const csvRows = data.map((obj) => headers.map((key) => {
    const value = obj[key];
    return escapeCSVValue(value);
  }).join(delimiter));

  return `${csvHeaders}\n${csvRows.join('\n')}`;
}

/**
 * Converts an array of arrays to a CSV string.
 * @param {Array} data - Array of arrays (rows) to convert
 * @param {Array} headers - Array of header strings
 * @param {string} delimiter - Column separator (default: ',')
 * @returns {string} - CSV content as string
 */
function convertArrayToCSV(data, headers, delimiter = ',') {
  if (!data || !Array.isArray(data)) return '';
  if (!headers || !Array.isArray(headers)) return '';

  const csvHeaders = headers.map((header) => escapeCSVValue(header)).join(delimiter);
  const csvRows = data.map((row) => row.map((value) => escapeCSVValue(value)).join(delimiter));

  return `${csvHeaders}\n${csvRows.join('\n')}`;
}

/**
 * Downloads CSV data as a file with proper UTF-8 encoding and BOM.
 * @param {string} csvContent - CSV content to download
 * @param {string} fileName - Name of the file (should end with .csv)
 */
function downloadCSV(csvContent, fileName) {
  // Only run in client-side environment
  if (process.server) {
    console.warn('downloadCSV can only be used on client-side');
    return;
  }

  if (!fileName.endsWith('.csv')) {
    fileName += '.csv';
  }

  // Add UTF-8 BOM for proper Excel compatibility
  const BOM = '\uFEFF';
  const csvData = BOM + csvContent;

  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // Clean up resources
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Downloads data directly as CSV with automatic conversion
 * @param {Array} data - Array of objects or arrays to convert
 * @param {string} fileName - Name of the file
 * @param {Object} options - Options for conversion
 */
function downloadDataAsCSV(data, fileName, options = {}) {
  const {
    headers = null,
    delimiter = ',',
    isArrayOfArrays = false
  } = options;

  let csvContent;

  if (isArrayOfArrays) {
    csvContent = convertArrayToCSV(data, headers, delimiter);
  } else {
    csvContent = convertToCSV(data, headers, delimiter);
  }

  if (!csvContent) {
    console.warn('No data to export or data is empty');
    return;
  }

  downloadCSV(csvContent, fileName);
}

// CSV utility object
const csvUtils = {
  escapeValue: escapeCSVValue,
  convertToCSV,
  convertArrayToCSV,
  downloadCSV,
  downloadDataAsCSV,

  // Convenience methods
  download: downloadDataAsCSV,
  fromObjects: convertToCSV,
  fromArrays: convertArrayToCSV,
};

// Plugin installation
export default ({ app }, inject) => {
  // Inject $csv into Vue instances (this.$csv)
  inject('csv', csvUtils);

  // Make it available in Nuxt context (context.$csv)
  app.$csv = csvUtils;
};
