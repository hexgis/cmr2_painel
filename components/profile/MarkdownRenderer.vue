<template>
  <div class="markdown-content">
    <component
      :is="renderNode(node)"
      v-for="(node, index) in parsedContent"
      :key="index"
      :node="node"
    />
  </div>
</template>

<script>
import { marked } from 'marked';

// Componentes para cada tipo de elemento
const MarkdownParagraph = {
  props: ['node'],
  render(h) {
    return h('p', { domProps: { innerHTML: this.node.text } });
  }
};

const MarkdownHeading = {
  props: ['node'],
  render(h) {
    return h(`h${this.node.depth}`, { domProps: { innerHTML: this.node.text } });
  }
};

const MarkdownText = {
  props: ['node'],
  render(h) {
    return h('span', { domProps: { innerHTML: this.node.text } });
  }
};

const MarkdownLink = {
  props: ['node'],
  render(h) {
    return h('a', {
      attrs: {
        href: this.node.href,
        target: '_blank',
        rel: 'noopener noreferrer',
        title: this.node.title || ''
      }
    }, this.node.text);
  }
};

const MarkdownImage = {
  props: ['node'],
  render(h) {
    const youtubeMatch = this.extractYoutubeId(this.node.href);

    if (youtubeMatch) {
      return h('div', { class: 'video-embed' }, [
        h('div', { class: 'video-wrapper' }, [
          h('iframe', {
            attrs: {
              width: '100%',
              height: '315',
              src: `https://www.youtube.com/embed/${youtubeMatch}`,
              frameborder: '0',
              allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
              allowfullscreen: true
            }
          })
        ]),
        this.node.text ? h('p', { class: 'video-title' }, `🎥 ${this.node.text}`) : null
      ]);
    }

    if (this.isValidImageUrl(this.node.href)) {
      return h('img', {
        attrs: {
          src: this.node.href,
          alt: this.node.text || '',
          class: 'markdown-image',
          loading: 'lazy'
        }
      });
    }

    return h('div', { class: 'link-fallback' }, [
      h('span', { class: 'fallback-icon' }, '🔗'),
      h('div', { class: 'link-content' }, [
        h('strong', this.node.text || 'Link'),
        h('a', {
          attrs: {
            href: this.node.href,
            target: '_blank',
            rel: 'noopener noreferrer'
          },
          class: 'link-url'
        }, this.truncateUrl(this.node.href))
      ])
    ]);
  },
  methods: {
    extractYoutubeId(url) {
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/,
        /youtube\.com\/embed\/([^?]+)/,
        /youtube\.com\/v\/([^?]+)/
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) return match[1];
      }
      return null;
    },

    isValidImageUrl(url) {
      if (!url) return false;
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
      return imageExtensions.some(ext => url.toLowerCase().includes(ext));
    },

    truncateUrl(url, maxLength = 50) {
      return url.length <= maxLength ? url : url.substring(0, maxLength) + '...';
    }
  }
};

export default {
  name: 'MarkdownRenderer',

  components: {
    MarkdownParagraph,
    MarkdownHeading,
    MarkdownText,
    MarkdownLink,
    MarkdownImage
  },

  props: {
    content: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      parsedContent: []
    };
  },

  watch: {
    content: {
      immediate: true,
      handler(newContent) {
        this.parseMarkdown(newContent);
      }
    }
  },

  methods: {
    parseMarkdown(content) {
      if (!content) {
        this.parsedContent = [];
        return;
      }

      try {
        // Processar manualmente o markdown
        this.parsedContent = this.processContent(content);
      } catch (error) {
        console.error('Erro ao parsear Markdown:', error);
        this.parsedContent = [{ type: 'text', text: content }];
      }
    },

    processContent(content) {
      const lines = content.split('\n');
      const nodes = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (!line) continue;

        // Verificar se é heading
        const headingMatch = line.match(/^(#+)\s+(.+)$/);
        if (headingMatch) {
          const depth = headingMatch[1].length;
          const text = this.processInline(headingMatch[2]);
          nodes.push({ type: 'heading', depth, text });
          continue;
        }

        // Verificar se é imagem
        const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (imageMatch) {
          const text = imageMatch[1] || '';
          const href = imageMatch[2];
          nodes.push({ type: 'image', text, href });
          continue;
        }

        // Verificar se é link
        const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          const text = linkMatch[1];
          const href = linkMatch[2];
          nodes.push({ type: 'link', text, href });
          continue;
        }

        // Texto normal (parágrafo)
        nodes.push({ type: 'paragraph', text: this.processInline(line) });
      }

      return nodes;
    },

    processInline(text) {
      if (!text) return '';

      // Processar links inline dentro do texto
      let processedText = text
        // Processar links [texto](url)
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, href) => {
          return `<a href="${this.escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${this.escapeHtml(linkText)}</a>`;
        })
        // Processar imagens ![alt](src)
        .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, (match, altText, src) => {
          return `<img src="${this.escapeHtml(src)}" alt="${this.escapeHtml(altText)}" class="markdown-image">`;
        })
        // Processar formatação básica
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');

      return processedText;
    },

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    renderNode(node) {
      switch (node.type) {
        case 'paragraph': return 'MarkdownParagraph';
        case 'heading': return 'MarkdownHeading';
        case 'link': return 'MarkdownLink';
        case 'image': return 'MarkdownImage';
        case 'text': return 'MarkdownText';
        default: return 'MarkdownText';
      }
    }
  }
};
</script>

<style scoped>
.markdown-content {
  line-height: 1.6;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin: 1em 0 0.5em 0;
  font-weight: bold;
}

.markdown-content p {
  margin: 0.5em 0;
}

.markdown-content img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 0.5em 0;
}

.markdown-content a {
  color: #1976d2;
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

.markdown-content code {
  background-color: #f5f5f5;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* Estilos para vídeos do YouTube */
.video-embed {
  margin: 1.5em 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.video-wrapper {
  position: relative;
  padding-bottom: 56.25%; /* Aspect ratio 16:9 */
  height: 0;
  overflow: hidden;
}

.video-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.video-title {
  margin: 0.8em 0 0 0;
  padding: 0 1em;
  font-style: italic;
  color: #666;
  text-align: center;
  font-size: 0.9em;
}

/* Estilos para fallback de links */
.link-fallback {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1em;
  margin: 1em 0;
}

.fallback-icon {
  font-size: 1.5em;
  margin-right: 0.8em;
}

.link-content {
  flex: 1;
  min-width: 0;
}

.link-content strong {
  display: block;
  margin-bottom: 0.3em;
  color: #495057;
}

.link-url {
  display: block;
  color: #6c757d;
  font-size: 0.9em;
  word-break: break-all;
  text-decoration: none;
}

.link-url:hover {
  color: #0056b3;
  text-decoration: underline;
}
</style>
