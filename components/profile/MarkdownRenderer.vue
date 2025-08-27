<template>
  <v-app>
    <v-main>
      <div class="markdown-content">
        <div
          v-for="(component, index) in components"
          :key="index"
        >
          <!-- Renderizar headers -->
          <h1 v-if="component.type === 'header' && component.content.level === 1">
            {{ component.content.title }}
          </h1>
          <h2 v-if="component.type === 'header' && component.content.level === 2">
            {{ component.content.title }}
          </h2>
          <h3 v-if="component.type === 'header' && component.content.level === 3">
            {{ component.content.title }}
          </h3>
          <h4 v-if="component.type === 'header' && component.content.level === 4">
            {{ component.content.title }}
          </h4>
          <h5 v-if="component.type === 'header' && component.content.level === 5">
            {{ component.content.title }}
          </h5>
          <h6 v-if="component.type === 'header' && component.content.level === 6">
            {{ component.content.title }}
          </h6>

          <!-- Renderizar parágrafos -->
          <p v-if="component.type === 'paragraph'">
            <template v-if="component.content.formatted_text">
              <span
                v-for="(text, textIndex) in component.content.formatted_text"
                :key="textIndex"
              >
                <strong v-if="text.type === 'bold'">{{ text.text }}</strong>
                <em v-else-if="text.type === 'italic'">{{ text.text }}</em>
                <del v-else-if="text.type === 'strikethrough'">{{ text.text }}</del>
                <code v-else-if="text.type === 'code'">{{ text.text }}</code>
                <span v-else>{{ text.text }}</span>
              </span>
            </template>
            <template v-else>
              {{ component.content.text }}
            </template>
          </p>

          <!-- Renderizar listas -->
          <ul v-if="component.type === 'list' && !component.content.ordered">
            <li
              v-for="(item, itemIndex) in component.content.items"
              :key="itemIndex"
            >
              {{ item }}
            </li>
          </ul>
          <ol v-if="component.type === 'list' && component.content.ordered">
            <li
              v-for="(item, itemIndex) in component.content.items"
              :key="itemIndex"
            >
              {{ item }}
            </li>
          </ol>

          <!-- Renderizar tabelas -->
          <table v-if="component.type === 'table'">
            <thead>
              <tr>
                <th
                  v-for="(header, headerIndex) in component.content.headers"
                  :key="headerIndex"
                >
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, rowIndex) in component.content.rows"
                :key="rowIndex"
              >
                <td
                  v-for="(cell, cellIndex) in row"
                  :key="cellIndex"
                >
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Renderizar imagens (não YouTube) -->
          <v-img
            v-if="component.type === 'image' && !isYoutubeUrl(component.content.src)"
            :src="component.content.src"
            :alt="component.content.alt"
            :title="component.content.title"
            contain
            class="my-4"
          />

          <!-- Renderizar vídeos do YouTube -->
          <div
            v-if="component.type === 'image' && isYoutubeUrl(component.content.src)"
            class="video-container my-4"
          >
            <iframe
              width="100%"
              height="400"
              :src="getYoutubeEmbedUrl(component.content.src)"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
          </div>

          <!-- Renderizar GIFs -->
          <v-img
            v-if="component.type === 'gif'"
            :src="component.content.src"
            :alt="component.content.alt"
            :title="component.content.title"
            contain
            class="my-4"
          />

          <!-- Renderizar vídeos locais -->
          <video
            v-if="component.type === 'video'"
            :poster="component.content.poster"
            :controls="component.content.controls"
            :width="component.content.width"
            :height="component.content.height"
            class="my-4"
          >
            <source
              v-for="(source, sourceIndex) in component.content.sources"
              :key="sourceIndex"
              :src="source.src"
              :type="source.type"
            >
            Seu navegador não suporta a tag de vídeo.
          </video>

          <!-- Renderizar botões (links) -->
          <v-btn
            v-if="component.type === 'button'"
            :href="component.content.url"
            :color="getButtonColor(component.content.style)"
            target="_blank"
            class="my-2"
          >
            {{ component.content.text }}
          </v-btn>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'MarkdownRenderer',
  props: {
    components: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    isYoutubeUrl(url) {
      return url && (url.includes('youtube.com') || url.includes('youtu.be'));
    },
    getYoutubeEmbedUrl(url) {
      if (!url) return '';

      // Para URLs do formato: https://www.youtube.com/watch?v=abc123
      if (url.includes('youtube.com/watch')) {
        const videoId = url.split('v=')[1];
        const ampersandPosition = videoId.indexOf('&');
        if (ampersandPosition !== -1) {
          return `https://www.youtube.com/embed/${videoId.substring(0, ampersandPosition)}`;
        }
        return `https://www.youtube.com/embed/${videoId}`;
      }

      // Para URLs do formato: https://youtu.be/abc123
      if (url.includes('youtu.be/')) {
        const videoId = url.split('/').pop();
        return `https://www.youtube.com/embed/${videoId}`;
      }

      return url;
    },
    getButtonColor(style) {
      return style === 'primary' ? 'primary' : 'secondary';
    },
  },
};
</script>

<style scoped>
.markdown-content {
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1, h2, h3, h4, h5, h6 {
  margin: 1em 0 0.5em 0;
  font-weight: bold;
  color: #1976d2;
}

h1 { font-size: 1.8em; border-bottom: 2px solid #eee; padding-bottom: 0.3em; }
h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.2em; }
h3 { font-size: 1.3em; }
h4 { font-size: 1.2em; }
h5 { font-size: 1.1em; }
h6 { font-size: 1.0em; color: #777; }

p {
  margin: 0.5em 0;
  line-height: 1.6;
}

ul, ol {
  margin: 0.5em 0;
  padding-left: 2em;
}

li {
  margin: 0.25em 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  font-size: 0.9em;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

th, td {
  padding: 0.75em;
  border: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: #f5f5f5;
  font-weight: bold;
  color: #333;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

.video-container {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* Proporção 16:9 */
  margin: 1em 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

strong {
  font-weight: bold;
  color: #000;
}

em {
  font-style: italic;
}

del {
  text-decoration: line-through;
  color: #999;
}

code {
  background-color: #f5f5f5;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
  color: #d63384;
}

pre {
  background-color: #f5f5f5;
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1em 0;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
}

pre code {
  background: none;
  padding: 0;
  color: #333;
}
</style>
