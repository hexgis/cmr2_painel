/**
 * Utility for download files with authentication
 * Centralizes download logic to avoid code duplication
 */
import { extractFilenameFromHeader } from './fileUtils';

export default class FileDownloader {
  constructor(api, toast) {
    this.api = api;
    this.toast = toast;
  }

  /**
   * Download file via authenticated API
   * @param {string|number} attachmentId - ID of the attachment
   * @param {string} attachmentType - Type of the attachment ('question' or 'answer')
   * @param {string} fallbackFilename - Filename to use as fallback
   * @param {Object} options - Additional options
   * @returns {Promise<{success: boolean, error?: Error}>}
   */
  async downloadAttachment(attachmentId, attachmentType, fallbackFilename, options = {}) {
    if (!attachmentId) {
      if (this.toast) this.toast.error('ID do anexo não fornecido');
      return { success: false, error: new Error('ID do anexo não fornecido') };
    }

    const downloadUrl = `/adm-panel/tickets/download/${attachmentId}/${attachmentType}/`;

    try {
      if (options.showLoading && this.toast) {
        this.toast.info('Preparando download...');
      }

      const response = await this.api({
        method: 'GET',
        url: downloadUrl,
        responseType: 'blob',
      });

      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const contentDisposition = response.headers['content-disposition'];

      const filename = extractFilenameFromHeader(
        contentDisposition,
        fallbackFilename || `attachment_${attachmentId}`,
      );

      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      if (options.showSuccess && this.toast) {
        this.toast.success('Arquivo baixado com sucesso');
      }

      return { success: true, filename };
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);

      if (this.toast) {
        if (error.response && error.response.status === 401) {
          this.toast.error('Não autorizado. Faça login novamente.');
        } else if (error.response && error.response.status === 404) {
          this.toast.error('Arquivo não encontrado');
        } else {
          this.toast.error('Erro ao baixar arquivo');
        }
      }

      return { success: false, error };
    }
  }

  /**
   * Helper for download of question attachment
   */
  async downloadQuestionAttachment(file, options = {}) {
    const filename = file.file_name || file.name_file || `attachment_${file.id}`;
    return this.downloadAttachment(file.id, 'question', filename, options);
  }

  /**
   * Helper for download of answer attachment
   */
  async downloadAnswerAttachment(attachment, options = {}) {
    const filename = attachment.name_file || attachment.file_name || `attachment_${attachment.id}`;
    return this.downloadAttachment(attachment.id, 'answer', filename, options);
  }
}
