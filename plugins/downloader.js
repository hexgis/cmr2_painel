/**
 * Complete Download Plugin for Nuxt.js
 * Provides file downloads and CSV/PDF export utilities
 * Accessible via this.$downloader
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
 * Sanitizes filename by removing invalid characters and extra spaces.
 * @param {string} filename - The filename to sanitize
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

  for (const pattern of patterns) {
    const match = contentDisposition.match(pattern);
    if (match && match[1]) {
      try {
        return sanitizeFilename(decodeURIComponent(match[1].trim()));
      } catch (error) {
        return sanitizeFilename(match[1].trim());
      }
    }
  }

  return fallback;
}

/**
 * Creates and triggers a Blob download.
 * @param {Blob} blob - Blob object for download
 * @param {string} filename - Filename for download
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
 * Converts data to a CSV string. Supports both arrays of objects and arrays of arrays.
 * @param {Array} data - Array of objects or array of arrays to convert
 * @param {Array|null} customHeaders - Custom header list (required for array of arrays, optional for objects)
 * @param {string} delimiter - Column separator (default: ',')
 * @returns {string} - CSV content as string
 */
function convertToCSV(data, customHeaders = null, delimiter = ',') {
  if (!data || !Array.isArray(data) || data.length === 0) return '';

  // Check if data is array of arrays or array of objects
  const isArrayOfArrays = Array.isArray(data[0]);

  if (isArrayOfArrays) {
    // Handle array of arrays
    if (!customHeaders || !Array.isArray(customHeaders)) {
      throw new Error('Headers are required when converting array of arrays to CSV');
    }

    const csvHeaders = customHeaders.map((header) => escapeCSVValue(header)).join(delimiter);
    const csvRows = data.map((row) => row.map((value) => escapeCSVValue(value)).join(delimiter));

    return `${csvHeaders}\n${csvRows.join('\n')}`;
  }
  // Handle array of objects
  const headers = customHeaders || Object.keys(data[0]);
  const csvHeaders = headers.map((header) => escapeCSVValue(header)).join(delimiter);

  const csvRows = data.map((obj) => headers.map((key) => {
    const value = obj[key];
    return escapeCSVValue(value);
  }).join(delimiter));

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
  triggerDownload(blob, fileName);
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

  // Validate data
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error('No data provided for PDF generation');
  }

  if (!headers || !Array.isArray(headers) || headers.length === 0) {
    throw new Error('No headers provided for PDF generation');
  }

  try {
    // Dynamic imports for PDF dependencies
    const jsPDFModule = await Promise.resolve(require('jspdf'));
    const autoTableModule = await Promise.resolve(require('jspdf-autotable'));

    const jsPDF = jsPDFModule.default || jsPDFModule;
    const autoTable = autoTableModule.default || autoTableModule;

    const defaultOptions = {
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      titleFontSize: 14,
      titleY: 20,
      tableStartY: 35,
      headStyles: {
        fillColor: '#D92B3F',
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
      },
      margin: { top: 40 },
      ...options,
    };

    const doc = new jsPDF({
      orientation: defaultOptions.orientation,
      unit: defaultOptions.unit,
      format: defaultOptions.format,
    });

    // Add title
    doc.setFontSize(defaultOptions.titleFontSize);
    doc.setFont(undefined, 'bold');
    doc.text(title, 15, defaultOptions.titleY);

    // Add generation timestamp
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    const timestamp = new Date().toLocaleString('pt-BR');
    doc.text(`Gerado em: ${timestamp}`, 15, defaultOptions.titleY + 8);

    // Prepare table data
    const tableData = data.map((item) => headers.map((header) => {
      if (typeof header === 'object') {
        return String(item[header.value] || '');
      }
      return String(item[header] || '');
    }));

    const tableHeaders = headers.map((header) => (typeof header === 'object' ? header.text : header));

    // Generate table
    autoTable(doc, {
      startY: defaultOptions.tableStartY,
      head: [tableHeaders],
      body: tableData,
      headStyles: defaultOptions.headStyles,
      bodyStyles: defaultOptions.bodyStyles,
      margin: defaultOptions.margin,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
      },
      columnStyles: {
        // Auto-adjust column widths
      },
    });

    // Add footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width - 25,
        doc.internal.pageSize.height - 10,
      );
    }

    doc.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}

/**
 * Generates a filename with timestamp and sanitizes it.
 * @param {string} baseName - Base name for the file
 * @param {string} extension - File extension (csv, pdf, etc.)
 * @param {Object} options - Additional options
 * @returns {string} - Sanitized filename with timestamp
 */
function generateFileName(baseName, extension, options = {}) {
  const {
    includeTimestamp = true,
    dateFormat = 'iso', // 'iso' or 'br'
    separator = '_',
  } = options;

  // Sanitize base name
  const sanitizedBaseName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  if (!includeTimestamp) {
    return `${sanitizedBaseName}.${extension}`;
  }

  // Generate timestamp (always date only)
  const now = new Date();
  let timestamp;

  if (dateFormat === 'br') {
    timestamp = now.toLocaleDateString('pt-BR').replace(/\//g, '-');
  } else {
    timestamp = now.toISOString().slice(0, 10); // YYYY-MM-DD
  }

  return `${sanitizedBaseName}${separator}${timestamp}.${extension}`;
}

/**
 * Validates data before export operations.
 * @param {Array} data - Data to validate
 * @param {Array} headers - Headers to validate
 * @param {string} type - Type of export ('csv' or 'pdf')
 * @returns {Object} - Validation result with success flag and message
 */
function validateExportData(data, headers, type = 'csv') {
  if (!data || !Array.isArray(data)) {
    return {
      success: false,
      message: 'Dados inválidos: deve ser um array.',
    };
  }

  if (data.length === 0) {
    return {
      success: false,
      message: 'Nenhum dado encontrado para exportar.',
    };
  }

  if (!headers || !Array.isArray(headers) || headers.length === 0) {
    return {
      success: false,
      message: 'Cabeçalhos são obrigatórios.',
    };
  }

  // Additional validations for PDF
  if (type === 'pdf' && data.length > 10000) {
    return {
      success: false,
      message: 'Muitos dados para PDF. Considere usar CSV ou filtrar os dados.',
    };
  }

  return {
    success: true,
    message: `${data.length} registros prontos para exportação.`,
  };
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
   * Converts data to a CSV string. Supports both arrays of objects and arrays of arrays.
   * @param {Array} data - Array of objects or array of arrays to convert
   * @param {Array|null} customHeaders - Custom header list
   * @param {string} delimiter - Column separator (default: ',')
   * @returns {string} - CSV content as string
   */
  convertToCSV(data, customHeaders = null, delimiter = ',') {
    return convertToCSV(data, customHeaders, delimiter);
  }

  /**
   * Downloads CSV data as a file with proper UTF-8 encoding and BOM.
   * @param {string} csvContent - CSV content to download
   * @param {string} fileName - Name of the file (should end with .csv)
   */
  downloadCSV(csvContent, fileName) {
    downloadCSV(csvContent, fileName);
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
      if (this.toast) this.toast.error('Download URL not provided.');
      return { success: false, error: new Error('Download URL not provided') };
    }

    const { showLoading, showSuccess, requestConfig } = options;

    try {
      if (showLoading && this.toast) this.toast.info('Preparing download...');

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

      if (showSuccess && this.toast) this.toast.success('File downloaded successfully!');
      return { success: true, filename: finalFilename };
    } catch (error) {
      console.error('Error downloading file:', error);

      const status = error.response && error.response.status;
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
   * @param {Blob|ArrayBuffer|string} data - Data for download
   * @param {string} filename - Filename
   * @param {string} [mimeType='application/octet-stream'] - File MIME type
   * @param {Object} [options={}] - Additional options
   * @returns {Promise<{success: boolean, filename?: string, error?: Error}>}
   */
  async blob(data, filename, mimeType = 'application/octet-stream', options = {}) {
    const { showLoading, showSuccess } = options;

    try {
      if (showLoading && this.toast) this.toast.info('Preparing download...');

      const blob = new Blob([data], { type: mimeType });
      triggerDownload(blob, filename);

      if (showSuccess && this.toast) this.toast.success('File downloaded successfully!');
      return { success: true, filename: sanitizeFilename(filename) };
    } catch (error) {
      console.error('Error downloading blob:', error);
      if (this.toast) this.toast.error('Error downloading file.');
      return { success: false, error };
    }
  }

  /**
   * Complete CSV generation and download in one function.
   * @param {Array} data - Array of objects or array of arrays to convert
   * @param {Array} headers - Array of header strings
   * @param {string} baseName - Base name for the file (without extension)
   * @param {Object} options - Additional options
   * @returns {Promise} - Promise that resolves when download completes
   */
  async csv(data, headers, baseName, options = {}) {
    if (process.server) {
      return;
    }

    const {
      delimiter = ',',
      dateFormat = 'iso',
      includeTimestamp = true,
      customFilename = null,
    } = options;

    try {
      // Validate data
      const validation = validateExportData(data, headers, 'csv');
      if (!validation.success) {
        throw new Error(validation.message);
      }

      // Convert data to CSV
      const csvContent = convertToCSV(data, headers, delimiter);

      // Generate filename
      const filename = customFilename || generateFileName(baseName, 'csv', {
        includeTimestamp,
        dateFormat,
      });

      // Download file
      downloadCSV(csvContent, filename);

      return {
        success: true,
        filename,
        recordCount: data.length,
      };
    } catch (error) {
      console.error('Error generating CSV:', error);
      throw error;
    }
  }

  /**
   * Complete PDF generation and download in one function.
   * @param {Array} data - Array of objects to include in PDF
   * @param {Array} headers - Array of header strings
   * @param {string} title - Title for the PDF document
   * @param {string} baseName - Base name for the file (without extension)
   * @param {Object} options - Additional options for PDF generation
   * @returns {Promise} - Promise that resolves when download completes
   */
  async pdf(data, headers, title, baseName, options = {}) {
    if (process.server) {
      console.warn('pdf can only be used on client-side');
      return;
    }

    const {
      dateFormat = 'iso',
      includeTimestamp = true,
      customFilename = null,
      ...pdfOptions
    } = options;

    try {
      // Validate data
      const validation = validateExportData(data, headers, 'pdf');
      if (!validation.success) {
        throw new Error(validation.message);
      }

      // Generate filename
      const filename = customFilename || generateFileName(baseName, 'pdf', {
        includeTimestamp,
        dateFormat,
      });

      // Download PDF
      await downloadPDF(data, headers, title, filename, pdfOptions);

      return {
        success: true,
        filename,
        recordCount: data.length,
      };
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  /**
   * Generates a URL by replacing {key} placeholders with values.
   * @param {string} baseUrl - Base URL
   * @param {string} endpoint - API endpoint
   * @param {Object} [params={}] - Parameters for replacement
   * @returns {string} - Built URL
   */
  static buildUrl(baseUrl, endpoint, params = {}) {
    return Object.entries(params).reduce(
      (url, [key, value]) => url.replace(`{${key}}`, encodeURIComponent(value)),
      `${baseUrl}${endpoint}`,
    );
  }
}

export default (context, inject) => {
  const downloader = new Downloader(context.$api, context.$toast);
  inject('downloader', downloader);
};
