/**
 * Download Plugin for Nuxt.js
 * Provides global CSV download utilities accessible via this.$download
 * Documentação em: /docs/download.md
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
 * Downloads PDF data with jsPDF and autoTable.
 * @param {Array} data - Array of objects to include in PDF
 * @param {Array} headers - Array of header strings
 * @param {string} title - Title for the PDF document
 * @param {string} fileName - Name of the file (should end with .pdf)
 * @param {Object} options - Additional options for PDF generation
 */
async function downloadPDF(data, headers, title, fileName, options = {}) {
  if (process.server) {
    console.warn('downloadPDF can only be used on client-side');
    return;
  }

  if (!fileName.endsWith('.pdf')) {
    fileName += '.pdf';
  }

  try {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const defaultOptions = {
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      titleFontSize: 12,
      titleY: 20,
      tableStartY: 30,
      headStyles: {
        fillColor: '#D92B3F',
        textColor: [255, 255, 255],
      },
      ...options
    };

    const doc = new jsPDF({
      orientation: defaultOptions.orientation,
      unit: defaultOptions.unit,
      format: defaultOptions.format,
    });

    // Add title
    doc.setFontSize(defaultOptions.titleFontSize);
    doc.text(title, 15, defaultOptions.titleY);

    // Prepare table data
    const tableData = data.map(item =>
      headers.map(header => {
        if (typeof header === 'object') {
          return item[header.value] || '';
        }
        return item[header] || '';
      })
    );

    const tableHeaders = headers.map(header =>
      typeof header === 'object' ? header.text : header
    );

    // Generate table
    autoTable(doc, {
      startY: defaultOptions.tableStartY,
      head: [tableHeaders],
      body: tableData,
      headStyles: defaultOptions.headStyles,
    });

    doc.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

// Main download utilities object
const downloadUtils = {
  convertToCSV,
  convertArrayToCSV,
  downloadCSV,
  downloadPDF,
  escapeValue: escapeCSVValue,
};

// Plugin installation
export default ({ app }, inject) => {
  inject('download', downloadUtils);
  app.$download = downloadUtils;
};
