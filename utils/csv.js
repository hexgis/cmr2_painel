/**
 * Escapes a value for use in a CSV file.
 * Handles quotes, commas, newlines, and null/undefined values.
 * @param {any} value - The value to escape
 * @returns {string} - The escaped value
 */
export function escapeCSVValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('\r')) {
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
export function convertToCSV(data, customHeaders = null, delimiter = ',') {
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
export function convertArrayToCSV(data, headers, delimiter = ',') {
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
export function downloadCSV(csvContent, fileName) {
  if (!fileName.endsWith('.csv')) {
    fileName += '.csv';
  }

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

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}
