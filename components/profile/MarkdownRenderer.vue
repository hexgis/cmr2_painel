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
                <a
                  v-else-if="text.type === 'link'"
                  :href="text.url"
                  target="_blank"
                >{{ text.text }}</a>
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

          <!-- Renderizar imagens -->
          <v-img
            v-if="component.type === 'image'"
            :src="component.content.src"
            :alt="component.content.alt"
            :title="component.content.title"
            contain
            class="my-4"
          />

          <!-- Renderizar GIFs -->
          <v-img
            v-if="component.type === 'gif'"
            :src="component.content.src"
            :alt="component.content.alt"
            :title="component.content.title"
            contain
            class="my-4"
          />

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

          <!-- Renderizar blocos de código -->
          <pre v-if="component.type === 'code_block'">
            <code :class="'language-' + component.content.language">
              {{ component.content.code }}
            </code>
          </pre>

          <!-- Renderizar citações -->
          <blockquote
            v-if="component.type === 'quote'"
            class="quote-block"
          >
            <p>{{ component.content.text }}</p>
            <cite v-if="component.content.author">— {{ component.content.author }}</cite>
          </blockquote>
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

h1 { font-size: 1.8em; }
h2 { font-size: 1.5em; }
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

.quote-block {
  border-left: 4px solid #1976d2;
  padding-left: 1em;
  margin: 1em 0;
  font-style: italic;
  color: #555;
}

.quote-block cite {
  display: block;
  margin-top: 0.5em;
  font-size: 0.9em;
  color: #777;
  font-style: normal;
}
</style>
