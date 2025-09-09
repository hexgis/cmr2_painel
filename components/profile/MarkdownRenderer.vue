<template>
  <div
    ref="markdownContent"
    class="markdown-content"
  />
</template>

<script>
import DOMPurify from 'dompurify';

export default {
  name: 'MarkdownRenderer',

  props: {
    content: {
      type: String,
      required: true,
    },
  },

  mounted() {
    const config = {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'code',
        'pre', 'a', 'img', 'hr', 'div',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
      ],
      ALLOWED_ATTRS: {
        a: ['href', 'title'],
        img: ['src', 'alt', 'title', 'width', 'height'],
        code: ['class'],
        pre: ['class'],
        div: ['class'],
        th: ['style', 'align', 'colspan', 'rowspan'],
        td: ['style', 'align', 'colspan', 'rowspan'],
      },
      ALLOWED_URI_REGEXP: /^(?:(?:https?|ftp|data):|\/|#)/i,
      FORBID_SCRIPT: true,
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button'],
      FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'],
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_TRUSTED_TYPE: false,
    };
    this.$refs.markdownContent.innerHTML = DOMPurify.sanitize(this.content, config);
  },

};
</script>
<style scoped>
.markdown-content :deep(*) {
  margin-bottom: 12px;
  font-family: Noto Sans, Arial, sans-serif;
}

.markdown-content :deep(*:first-child) {
  margin-top: 0 !important;
}

.markdown-content :deep(a) {
  color: blue;
  text-decoration: underline;
}

.markdown-content :deep(a:hover) {
  color: darkblue;
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
}

.markdown-content :deep(h1) {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  line-height: 1.25;
  padding-bottom: .3em;
  font-size: 2em;
  border-bottom: 1px solid #d1d9e0b3;
}

.markdown-content :deep(h2) {
  font-weight: 600;
  padding-bottom: .3em;
  font-size: 1.5em;
  border-bottom: 1px solid #d1d9e0b3;
}

.markdown-content :deep(h3) {
  font-weight: 600;
  font-size: 1.25em;
}

.markdown-content :deep(h4) {
  font-weight: 600;
  font-size: 1.1em;
}

.markdown-content :deep(h5) {
  font-weight: 600;
  font-size: 1em;
}

.markdown-content :deep(h6) {
  font-weight: 600;
  font-size: .9em;
  color: #59636e;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #ccc;
  padding-left: 16px;
  color: #666;
  margin: 0;
}

.markdown-content :deep(table) {
  border-spacing: 0;
  border-collapse: collapse;
  display: block;
  width: max-content;
  max-width: 100%;
  overflow: auto;
  font-variant: tabular-nums;
}

.markdown-content :deep(thead) {
  display: table-header-group;
  vertical-align: middle;
  unicode-bidi: isolate;
  border-color: inherit;
}

.markdown-content :deep(thead tr) {
  background-color: #f7f7f7 !important;
}

.markdown-content :deep(tbody) {
  display: table-row-group;
  vertical-align: middle;
  unicode-bidi: isolate;
  border-color: inherit;
}

.markdown-content :deep(tr) {
  border-top: 1px solid #d1d9e0b3;

  display: table-row;
  vertical-align: inherit;
  unicode-bidi: isolate;
  border-color: inherit;
}

.markdown-content :deep(tr:nth-child(odd)) { background: #ffffff; }
.markdown-content :deep(tr:nth-child(even))  { background: #f7f7f7; }

.markdown-content :deep(th) {
  padding: 6px 13px;
  border: 1px solid #d1d9e0;
}

.markdown-content :deep(td) {
  padding: 6px 13px;
  border: 1px solid #d1d9e0;

  display: table-cell;
  vertical-align: inherit;
  unicode-bidi: isolate;
}
</style>
