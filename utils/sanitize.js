import DOMPurify from 'dompurify';

// Função para decodificar entidades HTML
function decodeHtmlEntities(text) {
  if (!text) return '';
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&amp;lt;': '<',
    '&amp;gt;': '>',
    '&amp;quot;': '"',
    '&amp;#039;': "'",
  };
  return text.replace(/&amp;lt;|&amp;gt;|&amp;quot;|&amp;#039;|&[a-zA-Z0-9#]+;/g, (match) => entities[match] || match);
}

export function sanitizeText(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

export function sanitizeUrl(url, isImage = false) {
  if (!url) {
    console.warn('URL vazia detectada');
    return '#';
  }
  const trimmedUrl = url.trim();
  if (!trimmedUrl.match(/^(https?:\/\/|mailto:|\/|\.\/|\.\.\/)/i)) {
    console.warn('URL inválida, protocolo não permitido:', trimmedUrl);
    return '#';
  }
  try {
    const parsedUrl = new URL(trimmedUrl.match(/^(mailto:|\/|\.\/|\.\.\/)/i) ? trimmedUrl : `https://${trimmedUrl.replace(/^https?:\/\//, '')}`);
    const allowedDomains = isImage
      ? ['youtube.com', 'youtu.be', 'google.com', 'imgur.com', 'unsplash.com', 'cloudinary.com', 'vuejs.org', 'giphy.com']
      : ['youtube.com', 'youtu.be', 'google.com'];
    if (isImage && trimmedUrl.startsWith('/')) {
      console.log('URL relativa de imagem detectada:', trimmedUrl);
      return trimmedUrl;
    }
    if (!allowedDomains.some((domain) => parsedUrl.hostname.includes(domain))) {
      console.warn('Domínio não permitido para', isImage ? 'imagem' : 'link', ':', parsedUrl.hostname);
      return '#';
    }
    const cleanUrl = trimmedUrl.replace(/[ \t\n\r]*[;]?(on\w+=\S+)/gi, '');
    console.log('URL sanitizada:', cleanUrl);
    return cleanUrl;
  } catch (error) {
    console.warn('Erro ao sanitizar URL:', trimmedUrl, error);
    return '#';
  }
}

export function sanitizeHtml(html) {
  if (!html) return '';
  // Decodificar entidades HTML antes do pré-processamento
  const decodedHtml = decodeHtmlEntities(html);
  console.log('HTML decodificado:', decodedHtml);
  // Pré-processar trechos de código inline (`...`) e <code>...</code> escapados
  const preProcessedHtml = decodedHtml
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/&amp;lt;code&amp;gt;([^&]+)&amp;lt;\/code&amp;gt;/g, '<code>$1</code>');
  console.log('HTML pré-processado:', preProcessedHtml);
  const config = {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'div', 'span',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'iframe',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'alt', 'src', 'class', 'title',
      'width', 'height', 'frameborder', 'allow', 'allowfullscreen',
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
    FORBID_TAGS: ['script', 'style'],
    FORBID_CONTENTS: ['script', 'style'],
    SANITIZE_DOM: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    ADD_TAGS: ['code', 'pre'],
    HOOKS: {
      beforeSanitizeElements: (node) => {
        console.log('Elemento antes da sanitização:', node.outerHTML || node.nodeName);
        if (node.tagName === 'CODE' || node.tagName === 'PRE') {
          node.setAttribute('data-preserve', 'true');
        }
        return node;
      },
      afterSanitizeElements: (node) => {
        if (node.nodeType === Node.ELEMENT_NODE && !node.parentNode) {
          console.warn('DOMPurify removeu elemento:', node.outerHTML || node.nodeName);
        }
        return node;
      },
    },
  };
  const sanitized = DOMPurify.sanitize(preProcessedHtml, config);
  console.log('HTML após sanitização:', sanitized);
  return sanitized;
}
