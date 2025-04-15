/**
 * Converte um array de objetos em uma string CSV.
 * @param {Array} data - Array de objetos para converter.
 * @param {Array|null} customHeaders - Lista de headers personalizada.
 * @param {string} delimiter - Separador de colunas (padrão: ';').
 * @returns {string} - Conteúdo CSV em formato de string.
 */
export function convertToCSV(data, customHeaders = null, delimiter = ';') {
  if (!data || !Array.isArray(data) || data.length === 0) return '';

  const headers = customHeaders || Object.keys(data[0]);
  const headerLine = headers.join(delimiter);

  const rows = data.map((obj) => headers.map((key) => {
    const value = obj[key] || '';
    const escapedValue = String(value).replace(/"/g, '""');
    return `"${escapedValue}"`;
  }).join(delimiter));

  return [headerLine, ...rows].join('\n');
}

/**
 * Salva dados em um arquivo CSV e inicia o download.
 * @param {string} data - Conteúdo CSV a ser salvo.
 * @param {string} fileName - Nome do arquivo.
 */
export function saveData(data, fileName) {
  const blob = new Blob([`\uFEFF${data}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 100);
}
