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
      ALLOWED_ATTR: {
        a: ['href', 'title'],
        img: ['src', 'alt', 'title', 'width', 'height'],
        code: ['class'],
        pre: ['class'],
        div: ['class'],
        th: ['style'],
        td: ['style'],
      },
      ALLOWED_URI_REGEXP: /^(?:(?:https?):\/\/|mailto:)/i,
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
/* Adds style to all elements inside .markdown-content */
.markdown-content :deep(*) {
  margin-bottom: 12px;
}
.markdown-content :deep(a) {
  color: blue;
  text-decoration: underline;
}

.markdown-content :deep(a:hover) {
  color: darkblue;
}
</style>
