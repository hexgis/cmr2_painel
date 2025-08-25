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
import { sanitizeText, sanitizeUrl, sanitizeHtml } from '@/utils/sanitize';

const MarkdownInline = {
  props: ['text'],
  render(h) {
    const tokens = this.parseInline(this.text);
    return h('span', this.renderTokens(h, tokens));
  },
  methods: {
    parseInline(text) {
      if (!text) return [{ type: 'text', content: sanitizeText(text) }];

      const tokens = [];
      let currentText = text;

      const patterns = [
        { regex: /\*\*\*(.*?)\*\*\*/g, type: 'strong-em' },
        { regex: /\*\*(.*?)\*\*/g, type: 'strong' },
        { regex: /\*(.*?)\*/g, type: 'em' },
        { regex: /~~(.*?)~~/g, type: 'del' },
        { regex: /`(.*?)`/g, type: 'code' },
        { regex: /<code>(.*?)<\/code>/g, type: 'code' },
        { regex: /&amp;lt;code&amp;gt;(.*?)&amp;lt;\/code&amp;gt;/g, type: 'code' }, // Suporte a <code> escapado
        { regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: 'link' },
      ];

      const processPattern = (pattern, content) => {
        const matches = [];
        let match;

        while ((match = pattern.regex.exec(content)) !== null) {
          matches.push({
            index: match.index,
            endIndex: pattern.regex.lastIndex,
            type: pattern.type,
            content: pattern.type === 'code' ? match[1] : sanitizeText(match[1] || match[2]),
            href: pattern.type === 'link' ? sanitizeUrl(match[2]) : null,
          });
        }

        return matches;
      };

      while (currentText.length > 0) {
        let earliestMatch = null;
        let patternIndex = -1;

        for (let index = 0; index < patterns.length; index++) {
          const pattern = patterns[index];
          // Clone the regex to avoid mutating the original
          const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
          const match = regex.exec(currentText);
          if (match && (!earliestMatch || match.index < earliestMatch.index)) {
            earliestMatch = match;
            patternIndex = index;
          }
        }

        if (!earliestMatch) {
          tokens.push({ type: 'text', content: sanitizeText(currentText) });
          break;
        }

        if (earliestMatch.index > 0) {
          tokens.push({
            type: 'text',
            content: sanitizeText(currentText.substring(0, earliestMatch.index)),
          });
        }

        const pattern = patterns[patternIndex];
        const content = pattern.type === 'link' ? earliestMatch[1] : earliestMatch[1] || earliestMatch[2];

        tokens.push({
          type: pattern.type,
          content,
          href: pattern.type === 'link' ? sanitizeUrl(earliestMatch[2]) : null,
        });

        currentText = currentText.substring(earliestMatch.index + earliestMatch[0].length);
      }

      return tokens;
    },
    renderTokens(h, tokens) {
      return tokens.map((token) => {
        switch (token.type) {
          case 'text':
            return token.content;
          case 'strong':
            return h('strong', this.renderTokens(h, this.parseInline(token.content)));
          case 'em':
            return h('em', this.renderTokens(h, this.parseInline(token.content)));
          case 'strong-em':
            return h('strong', [h('em', this.renderTokens(h, this.parseInline(token.content)))]);
          case 'del':
            return h('del', this.renderTokens(h, this.parseInline(token.content)));
          case 'code':
            return h('code', token.content);
          case 'link':
            return h('a', {
              attrs: {
                href: sanitizeUrl(token.href),
                target: '_blank',
                rel: 'noopener noreferrer',
              },
              on: {
                click: (event) => {
                  event.preventDefault();
                  if (token.href !== '#') {
                    window.open(token.href, '_blank', 'noopener,noreferrer');
                  }
                },
              },
            }, this.renderTokens(h, this.parseInline(token.content)));
          default:
            return token.content || '';
        }
      });
    },
  },
};

const MarkdownParagraph = {
  props: ['node'],
  render(h) {
    return h('p', [h(MarkdownInline, { props: { text: sanitizeText(this.node.text) } })]);
  },
};

const MarkdownHeading = {
  props: ['node'],
  render(h) {
    return h(`h${this.node.depth}`, [h(MarkdownInline, { props: { text: sanitizeText(this.node.text) } })]);
  },
};

const MarkdownText = {
  props: ['node'],
  render(h) {
    return h('span', [h(MarkdownInline, { props: { text: sanitizeText(this.node.text) } })]);
  },
};

const MarkdownLink = {
  props: ['node'],
  render(h) {
    return h('a', {
      attrs: {
        href: sanitizeUrl(this.node.href),
        target: '_blank',
        rel: 'noopener noreferrer',
        title: sanitizeText(this.node.title || ''),
      },
      on: {
        click: (event) => {
          event.preventDefault();
          if (this.node.href !== '#') {
            window.open(this.node.href, '_blank', 'noopener,noreferrer');
          }
        },
      },
    }, sanitizeText(this.node.text));
  },
};

const MarkdownImage = {
  props: ['node'],
  render(h) {
    const youtubeId = this.extractYoutubeId(this.node.href);

    if (youtubeId) {
      return h('div', { class: 'video-embed' }, [
        h('div', { class: 'video-wrapper' }, [
          h('iframe', {
            attrs: {
              width: '100%',
              height: '315',
              src: `https://www.youtube.com/embed/${youtubeId}`,
              frameborder: '0',
              allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
              allowfullscreen: true,
            },
          }),
        ]),
        this.node.text ? h('p', { class: 'video-title' }, `🎥 ${sanitizeText(this.node.text)}`) : null,
      ]);
    }

    if (this.isValidImageUrl(this.node.href)) {
      const sanitizedUrl = sanitizeUrl(this.node.href, true);
      if (sanitizedUrl === '#') {
        console.warn('URL de imagem inválida:', this.node.href, 'Texto:', this.node.text);
        return h('p', { class: 'image-error' }, `Imagem inválida: ${sanitizeText(this.node.text || 'Sem descrição')} (URL: ${sanitizeText(this.node.href)})`);
      }
      return h('img', {
        attrs: {
          src: sanitizedUrl,
          alt: sanitizeText(this.node.text || ''),
          class: 'markdown-image',
          loading: 'lazy',
        },
        on: {
          error: (event) => {
            console.warn('Erro ao carregar imagem:', sanitizedUrl);
            event.target.replaceWith(h('p', { class: 'image-error' }, `Erro ao carregar imagem: ${sanitizeText(this.node.text || 'Sem descrição')}`));
          },
        },
      });
    }

    console.warn('URL de imagem não suportada:', this.node.href, 'Texto:', this.node.text);
    return h('p', { class: 'image-error' }, `Imagem inválida: ${sanitizeText(this.node.text || 'Sem descrição')} (URL: ${sanitizeText(this.node.href)})`);
  },
  methods: {
    extractYoutubeId(url) {
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/,
        /youtube\.com\/embed\/([^?]+)/,
        /youtube\.com\/v\/([^?]+)/,
      ];
      const found = patterns.find((pattern) => url.match(pattern));
      if (found) {
        const match = url.match(found);
        const youtubeId = match[1];
        if (!youtubeId.match(/^[a-zA-Z0-9_-]+$/)) {
          console.warn('ID do YouTube inválido:', youtubeId);
          return null;
        }
        return sanitizeText(youtubeId);
      }
      return null;
    },
    isValidImageUrl(url) {
      if (!url) return false;
      return url.match(/^(https?:\/\/|\/|\.\/|\.\.\/)/i) && !url.match(/^(javascript:|data:)/i);
    },
  },
};

const MarkdownTaskList = {
  props: ['node'],
  render(h) {
    return h('ul', { class: 'task-list' }, this.node.items.map((item) => h('li', { class: 'task-list-item' }, [
      h('input', {
        attrs: {
          type: 'checkbox',
          checked: item.checked,
          disabled: true,
        },
      }),
      h(MarkdownInline, { props: { text: sanitizeText(item.text) } }),
    ])));
  },
};

const MarkdownUnorderedList = {
  props: ['node'],
  render(h) {
    return h('ul', { class: 'markdown-list' }, this.node.items.map((item) => h('li', [h(MarkdownInline, { props: { text: sanitizeText(item.text) } })])));
  },
};

const MarkdownOrderedList = {
  props: ['node'],
  render(h) {
    return h('ol', { class: 'markdown-list' }, this.node.items.map((item) => h('li', [h(MarkdownInline, { props: { text: sanitizeText(item.text) } })])));
  },
};

const MarkdownTable = {
  props: ['node'],
  render(h) {
    return h('table', { class: 'markdown-table' }, [
      h('thead', [
        h('tr', this.node.headers.map((header, index) => h('th', {
          style: { textAlign: this.node.alignments[index] || 'left' },
        }, [h(MarkdownInline, { props: { text: sanitizeText(header) } })]))),
      ]),
      h('tbody', this.node.rows.map((row) => h('tr', row.map((cell, index) => h('td', {
        style: { textAlign: this.node.alignments[index] || 'left' },
      }, [h(MarkdownInline, { props: { text: sanitizeText(cell) } })]))))),
    ]);
  },
};

const MarkdownCodeBlock = {
  props: ['node'],
  render(h) {
    return h('pre', { class: `language-${this.node.language || 'text'}` }, [
      h('code', this.node.text),
    ]);
  },
};

export default {
  name: 'MarkdownRenderer',

  components: {
    MarkdownParagraph,
    MarkdownHeading,
    MarkdownText,
    MarkdownLink,
    MarkdownImage,
    MarkdownTaskList,
    MarkdownUnorderedList,
    MarkdownOrderedList,
    MarkdownTable,
    MarkdownCodeBlock,
    MarkdownInline,
  },

  props: {
    content: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      parsedContent: [],
    };
  },

  watch: {
    content: {
      immediate: true,
      handler(newContent) {
        this.parseMarkdown(newContent);
      },
    },
  },

  methods: {
    parseMarkdown(content) {
      if (!content) {
        this.parsedContent = [];
        return;
      }
      try {
        const sanitizedContent = sanitizeHtml(content);
        this.parsedContent = this.processContent(sanitizedContent);
      } catch (error) {
        console.error('Erro ao parsear Markdown:', error);
        this.parsedContent = [{ type: 'text', text: sanitizeText(content) }];
      }
    },
    processContent(content) {
      const lines = content.split('\n');
      const nodes = [];
      let i = 0;

      while (i < lines.length) {
        const line = lines[i].trim();

        if (!line) {
          i++;
          continue;
        }

        // Heading
        const headingMatch = line.match(/^(#+)\s+(.+)$/);
        if (headingMatch) {
          const depth = headingMatch[1].length;
          const text = sanitizeText(headingMatch[2]);
          nodes.push({ type: 'heading', depth, text });
          i++;
          continue;
        }

        // Imagem
        const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (imageMatch) {
          const text = sanitizeText(imageMatch[1] || '');
          const href = imageMatch[2].trim();
          nodes.push({ type: 'image', text, href });
          i++;
          continue;
        }

        // Link
        const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          const text = sanitizeText(linkMatch[1]);
          const href = sanitizeUrl(linkMatch[2]);
          nodes.push({ type: 'link', text, href });
          i++;
          continue;
        }

        // Lista de tarefas
        if (line.match(/^- \[[ x]\]/)) {
          const items = [];
          while (i < lines.length && lines[i].trim().match(/^- \[[ x]\]/)) {
            const taskMatch = lines[i].trim().match(/^- \[([ x])\]\s*(.+)$/);
            if (taskMatch) {
              items.push({
                checked: taskMatch[1] === 'x',
                text: sanitizeText(taskMatch[2]),
              });
            }
            i++;
          }
          nodes.push({ type: 'task-list', items });
          continue;
        }

        // Lista não ordenada
        if (line.match(/^- /)) {
          const items = [];
          while (i < lines.length && lines[i].trim().match(/^- /)) {
            const itemMatch = lines[i].trim().match(/^- (.+)$/);
            if (itemMatch) {
              items.push({ text: sanitizeText(itemMatch[1]) });
            }
            i++;
          }
          nodes.push({ type: 'list', subtype: 'unordered', items });
          continue;
        }

        // Lista ordenada
        if (line.match(/^\d+\. /)) {
          const items = [];
          while (i < lines.length && lines[i].trim().match(/^\d+\. /)) {
            const itemMatch = lines[i].trim().match(/^\d+\. (.+)$/);
            if (itemMatch) {
              items.push({ text: sanitizeText(itemMatch[1]) });
            }
            i++;
          }
          nodes.push({ type: 'list', subtype: 'ordered', items });
          continue;
        }

        // Bloco de código
        if (line.match(/^```/)) {
          const languageMatch = line.match(/^```(\w+)?/);
          const language = languageMatch[1] || 'text';
          const codeLines = [];
          i++;
          while (i < lines.length && !lines[i].trim().match(/^```/)) {
            codeLines.push(lines[i]);
            i++;
          }
          i++;
          nodes.push({ type: 'code-block', language, text: codeLines.join('\n') });
          continue;
        }

        // Tabela
        if (line.includes('|') && line.trim().startsWith('|')) {
          const tableLines = [];
          let currentLine = i;

          while (currentLine < lines.length
                 && lines[currentLine].includes('|')
                 && lines[currentLine].trim().startsWith('|')) {
            tableLines.push(lines[currentLine].trim());
            currentLine++;
          }

          if (tableLines.length >= 2) {
            const separator = tableLines[1];
            if (!separator.match(/^\|[-:|\s]+$/)) {
              console.warn('Tabela inválida, linha de separação ausente:', tableLines);
              i = currentLine;
              continue;
            }

            const headers = tableLines[0]
              .split('|')
              .map((cell) => sanitizeText(cell.trim()))
              .filter((cell) => cell !== '');

            const alignments = tableLines[1]
              .split('|')
              .map((align) => {
                const cell = align.trim();
                if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
                if (cell.endsWith(':')) return 'right';
                if (cell.startsWith(':')) return 'left';
                return 'left';
              })
              .filter((_, index) => index > 0 && index < headers.length + 1);

            const rows = [];
            for (let j = 2; j < tableLines.length; j++) {
              const rowCells = tableLines[j]
                .split('|')
                .map((cell) => sanitizeText(cell.trim()))
                .filter((cell, index) => cell !== '' && index > 0 && index <= headers.length);

              if (rowCells.length === headers.length) {
                rows.push(rowCells);
              }
            }

            if (headers.length > 0 && rows.length > 0) {
              nodes.push({
                type: 'table',
                headers,
                alignments: alignments.length === headers.length ? alignments : Array(headers.length).fill('left'),
                rows,
              });
            }

            i = currentLine;
            continue;
          }
        }

        // Texto normal (parágrafo)
        nodes.push({ type: 'paragraph', text: sanitizeText(line) });
        i++;
      }

      return nodes;
    },
    renderNode(node) {
      switch (node.type) {
        case 'paragraph': return 'MarkdownParagraph';
        case 'heading': return 'MarkdownHeading';
        case 'link': return 'MarkdownLink';
        case 'image': return 'MarkdownImage';
        case 'text': return 'MarkdownText';
        case 'task-list': return 'MarkdownTaskList';
        case 'list':
          return node.subtype === 'ordered' ? 'MarkdownOrderedList' : 'MarkdownUnorderedList';
        case 'table': return 'MarkdownTable';
        case 'code-block': return 'MarkdownCodeBlock';
        default: return 'MarkdownText';
      }
    },
  },
};
</script>

<style scoped>
.markdown-content {
  line-height: 1.6;
  font-size: 16px;
  color: #333;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin: 1em 0 0.5em 0;
  font-weight: bold;
  color: #1976d2;
}

.markdown-content p {
  margin: 0.5em 0;
  display: block;
}

.markdown-content .image-error {
  color: #d32f2f;
  font-style: italic;
  margin: 0.5em 0;
}

.markdown-content img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 0.5em 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.markdown-content a {
  color: #1976d2;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
}

.markdown-content a:hover {
  text-decoration: underline;
  color: #1565c0;
}

.markdown-content code {
  background-color: #f5f5f5;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  white-space: pre-wrap;
}

.markdown-content pre {
  background-color: #f5f5f5;
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  white-space: pre;
}

.video-embed {
  margin: 1.5em 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.video-wrapper {
  position: relative;
  padding-bottom: 56.25%;
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
  display: block !important;
}

.video-title {
  margin: 0.8em 0 0 0;
  padding: 0 1em;
  font-style: italic;
  color: #666;
  text-align: center;
  font-size: 0.9em;
}

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

.task-list {
  list-style: none;
  padding: 0;
  margin: 1em 0;
}

.task-list-item {
  display: flex;
  align-items: center;
  margin: 0.5em 0;
}

.task-list-item input[type="checkbox"] {
  margin-right: 0.8em;
}

.markdown-list {
  margin: 1em 0;
  padding-left: 2em;
}

.markdown-list li {
  margin: 0.5em 0;
}

.markdown-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: table !important;
}

.markdown-table th,
.markdown-table td {
  border: 1px solid #e9ecef;
  padding: 0.8em 1em;
}

.markdown-table th {
  background-color: #f8f9fa;
  font-weight: bold;
  border-bottom: 2px solid #dee2e6;
}

.markdown-table tr:nth-child(even) {
  background-color: #f8f9fa;
}

.markdown-table tr:hover {
  background-color: #e9ecef;
}
</style>
