# Plugin de Download - Exemplos de Uso

O plugin de download oferece funções utilitárias para exportar dados em CSV e PDF de forma padronizada em toda a aplicação.

## Instalação

O plugin já está configurado no projeto e pode ser acessado via `this.$download` em qualquer componente Vue.

## Funções Disponíveis

### 1. `convertToCSV(data, customHeaders, delimiter)`

Converte um array de objetos para string CSV.

```javascript
// Exemplo básico
const data = [
    { nome: 'João', idade: 30 },
    { nome: 'Maria', idade: 25 },
]

const csvContent = this.$download.convertToCSV(data)
// Resultado: "nome,idade\nJoão,30\nMaria,25"

// Com headers customizados
const csvContent = this.$download.convertToCSV(data, ['Nome', 'Idade'])
// Resultado: "Nome,Idade\nJoão,30\nMaria,25"
```

### 2. `convertArrayToCSV(data, headers, delimiter)`

Converte um array de arrays para string CSV.

```javascript
const headers = ['Nome', 'Idade']
const data = [
    ['João', 30],
    ['Maria', 25],
]

const csvContent = this.$download.convertArrayToCSV(data, headers)
```

### 3. `downloadCSV(csvContent, fileName)`

Faz o download de um arquivo CSV.

```javascript
const csvContent = this.$download.convertToCSV(data)
this.$download.downloadCSV(csvContent, 'usuarios.csv')
```

### 4. `downloadPDF(data, headers, title, fileName, options)`

Gera e faz download de um arquivo PDF usando jsPDF.

```javascript
const data = [
    { name: 'João', age: 30 },
    { name: 'Maria', age: 25 },
]

const headers = [
    { text: 'Nome', value: 'name' },
    { text: 'Idade', value: 'age' },
]

await this.$download.downloadPDF(data, headers, 'Lista de Usuários', 'usuarios.pdf')
```

## Exemplo Completo - Página de Instituições

```javascript
methods: {
  // Exportar CSV
  generateCSV() {
    const data = this.filteredByColumns.map((institution) => ({
      Nome: institution.name,
      Tipo: institution.institution_type || '',
    }));

    const csvContent = this.$download.convertToCSV(data);
    this.$download.downloadCSV(csvContent, 'instituicoes.csv');
  },

  // Exportar PDF
  async generatePDF() {
    try {
      const headers = [
        { text: 'Nome', value: 'name' },
        { text: 'Tipo', value: 'institution_type' },
      ];

      const data = this.filteredByColumns.map((institution) => ({
        name: institution.name,
        institution_type: institution.institution_type || '',
      }));

      await this.$download.downloadPDF(
        data,
        headers,
        'Lista de Instituições',
        'lista_de_instituicoes.pdf',
      );
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      // Tratar erro...
    }
  }
}
```

## Opções para PDF

O método `downloadPDF` aceita um objeto `options` como último parâmetro:

```javascript
const options = {
    orientation: 'portrait', // ou 'landscape'
    format: 'a4', // ou 'letter', 'a3', etc.
    titleFontSize: 16,
    titleY: 25,
    tableStartY: 35,
    headStyles: {
        fillColor: '#2196F3', // Cor de fundo do cabeçalho
        textColor: [255, 255, 255], // Cor do texto
    },
}

await this.$download.downloadPDF(data, headers, title, fileName, options)
```

## Vantagens do Plugin

✅ **Reutilização**: Use as mesmas funções em toda a aplicação
✅ **Padronização**: Formatação consistente dos arquivos
✅ **UTF-8 + BOM**: Suporte completo a caracteres especiais
✅ **Escape**: Tratamento automático de vírgulas, aspas e quebras de linha
✅ **Error Handling**: Tratamento de erros integrado
✅ **Flexibilidade**: Múltiplas opções de configuração

## Migração de Código Existente

### Antes (código manual):

```javascript
generateCSV() {
  const headers = ['Nome', 'Tipo'];
  const rows = this.data.map(item => [item.name, item.type]);
  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'data.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}
```

### Depois (usando plugin):

```javascript
generateCSV() {
  const data = this.data.map(item => ({ Nome: item.name, Tipo: item.type }));
  const csvContent = this.$download.convertToCSV(data);
  this.$download.downloadCSV(csvContent, 'data.csv');
}
```

## Suporte a TypeScript

Se estiver usando TypeScript, adicione as tipagens:

```typescript
declare module '@nuxt/types' {
    interface Context {
        $download: {
            convertToCSV: (data: any[], customHeaders?: string[], delimiter?: string) => string
            convertArrayToCSV: (data: any[][], headers: string[], delimiter?: string) => string
            downloadCSV: (csvContent: string, fileName: string) => void
            downloadPDF: (
                data: any[],
                headers: any[],
                title: string,
                fileName: string,
                options?: any
            ) => Promise<void>
            escapeValue: (value: any) => string
        }
    }
}
```
