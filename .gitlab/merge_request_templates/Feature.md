# 🚀 Merge Request: [SC-819] - Implementar busca e exibição de resultados no frontend  

## 📌 Descrição  
<!-- Descreva de forma objetiva o que foi feito neste MR. -->  
Implementação de um campo de busca para filtrar informações no frontend, consumindo a API de busca dentro do campo `Properties` de todas as `VectorGeometries` vinculadas ao vetor **"Spectra"**. Os resultados são exibidos de forma agrupada por `fileName`.  

## 🎯 Objetivo  
<!-- Explique o propósito principal dessa mudança. -->  
- [x] **Criar novo componente**  
  - Implementação do **componente de busca** com suporte a auto-sugestões.  
- [ ] **Ajustar layout e estilos**  
  - Refinar a UI do input de busca conforme design system.  
- [ ] **Corrigir bug na interface**  
  - Resolução de erro ao exibir resultados quando a busca não retorna dados.  
- [ ] **Melhorar performance**  
  - Implementação de debounce para evitar requisições excessivas à API.  
- [ ] **Integrar com API**  
  - Consumo da API de busca utilizando Axios/Fetch, garantindo exibição em tempo real.  

## 🔗 Tarefa no Jira  
[[SC-819] - Implementar busca e exibição de resultados no frontend](https://xskylab.atlassian.net/browse/SC-819)  

## 🛠️ Implementação  
<!-- Explique as mudanças técnicas feitas no código. -->  
- Criado **componente de input de busca** com feedback visual para carregamento.  
- Implementada **requisição à API** utilizando Axios com debounce para melhor performance.  
- Exibição dos resultados em **lista agrupada por `fileName`**, garantindo clareza na visualização.  
- Tratamento de erros e mensagens amigáveis para o usuário em caso de falhas na API.  

## 📸 Prints / 🎥 Vídeos  
<!-- Adicione imagens ou vídeos para ilustrar o funcionamento da feature/correção. -->  
![image](/uploads/87996cb427cadadf0e01181f34bc911a/image.png)  
