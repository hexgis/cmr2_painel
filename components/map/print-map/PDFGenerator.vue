<template>
  <div style="display: none;">
    <!-- Componente invisível que apenas encapsula a lógica -->
  </div>
</template>

<script>
import html2canvas from 'html2canvas';

export default {
  name: 'PDFGenerator',
  
  methods: {
    async generatePDF(component) {
      try {
        this.component = component;
        
        // Capturar o mapa principal e o minimapa separadamente
        const [mapCanvas, miniMapCanvas] = await Promise.all([
          this.captureMapAsImage('.map-wrapper'),
          this.captureMapAsImage('.mini-map-overlay')
        ]);

        const mapImage = mapCanvas.toDataURL('image/png');
        const miniMapImage = miniMapCanvas.toDataURL('image/png');

        // Capturar as legendas e conteúdo
        const legendContent = await this.captureLegendContent();

        // Preparar conteúdo para múltiplas páginas
        const printContent = this.generatePrintContent(mapImage, miniMapImage, legendContent);

        // Criar nova janela para impressão
        this.openPrintWindow(printContent);

        return true;

      } catch (error) {
        console.error('Erro no PDFGenerator:', error);
        throw error;
      }
    },

    async captureMapAsImage(selector) {
      return new Promise((resolve) => {
        this.$nextTick(() => {
          const element = document.querySelector(selector);
          if (element) {
            html2canvas(element, {
              useCORS: true,
              allowTaint: true,
              scale: 2,
              backgroundColor: '#ffffff',
              logging: false
            }).then(resolve).catch(() => {
              resolve(this.createFallbackCanvas(selector));
            });
          } else {
            resolve(this.createFallbackCanvas(selector));
          }
        });
      });
    },

    createFallbackCanvas(selector) {
      const canvas = document.createElement('canvas');
      const isMainMap = selector === '.map-wrapper';
      canvas.width = isMainMap ? 800 : 200;
      canvas.height = isMainMap ? 500 : 150;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.fillText(
        isMainMap ? 'Mapa não disponível' : 'MiniMapa não disponível', 
        canvas.width/2, 
        canvas.height/2
      );
      return canvas;
    },

    async captureLegendContent() {
      return new Promise((resolve) => {
        this.$nextTick(() => {
          const content = {
            carSummary: this.generateCarSummaryHTML(),
            supportLayers: this.generateSupportLayersHTML(),
            legends: this.generateAllLegendsHTML(),
            // REMOVIDO: additionalInfo duplicado - mantemos apenas periodInfo
            periodInfo: this.generatePeriodInfoHTML(),
            footerInfo: this.generateFooterInfoHTML()
          };
          resolve(content);
        });
      });
    },

    generatePrintContent(mapImage, miniMapImage, legendContent) {
      let content = '';

      // Página 1 - Mapa e informações principais
      content += this.generatePage1(mapImage, miniMapImage, legendContent);

      // Página 2 - Tabela CAR (se houver dados)
      if (this.component.carData && this.component.carData.length > 0) {
        content += this.generateCarTablePage();
      }

      // Página 3 - Legendas e informações finais
      content += this.generateLegendPage(legendContent);

      return content;
    },

   generatePage1(mapImage, miniMapImage, legendContent) {
      return `
        <div class="print-page page-1">
          <!-- Cabeçalho com logos e título -->
          <div class="page-header">
            <!-- Logos lado a lado no centro -->
            <div class="logos-container">
              <img src="${this.component.logo_funai}" alt="FUNAI" class="logo-funai" />
              <img src="${this.component.logo_cmr}" alt="CMR" class="logo-cmr" />
            </div>
            <!-- Título abaixo das logos -->
            <div class="header-title">
              <h1>${this.component.mapTitle}</h1>
              ${this.component.print_title ? `<p>${this.component.print_title}</p>` : ''}
            </div>
          </div>

          <div class="map-section">
            <div class="main-map-container">
              <img src="${mapImage}" alt="Mapa Principal" class="map-image" />
              <div class="mini-map-overlay-print">
                <img src="${miniMapImage}" alt="Mini Mapa" class="mini-map-image" />
              </div>
            </div>
          </div>

          ${legendContent.carSummary}

          <div class="legends-section-page1">
            ${legendContent.legends}
          </div>

         
        </div>
      `;
    },

    generateCarTablePage() {
      const tableRows = this.component.carData.map((item, index) => `
        <tr>
          <td class="text-center">
            <span class="color-badge" style="background-color: ${this.component.getCarColor(index)}; color: white; display: inline-block; width: 20px; height: 20px; border-radius: 50%; text-align: center; line-height: 20px; font-size: 10px; font-weight: bold;">${index + 1}</span>
          </td>
          <td>${item.properties?.co_imovel || '-'}</td>
          <td>${this.component.getTerraIndigenaName(item)}</td>
          <td>${this.component.getMunicipioName(item)}</td>
          <td>${item.properties?.sg_uf || '-'}</td>
          <td>${item.properties?.no_etnia || '-'}</td>
          <td class="text-right">${this.component.formatNumber(item.properties?.nu_area_ha)}</td>
          <td>${item.properties?.tp_situacao || '-'}</td>
          <td>${item.properties?.ds_condicao_imovel || '-'}</td>
        </tr>
      `).join('');

      return `
        <div class="print-page page-2">
          <div class="page-header">
            <h2>Cadastro Ambiental Rural - Detalhamento</h2>
            <p>Total de CARs: ${this.component.carData.length}</p>
          </div>

          <div class="table-container">
            <table class="car-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Código de origem</th>
                  <th>Nome da Terra Indígena</th>
                  <th>Município</th>
                  <th>UF</th>
                  <th>Etnia</th>
                  <th>Área (ha)</th>
                  <th>Situação</th>
                  <th>Condição do Imóvel</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>

          
        </div>
      `;
    },

    generateLegendPage(legendContent) {
      return `
        <div class="print-page page-3">
          <div class="page-header">
            <h2>Informações Complementares</h2>
          </div>

          <div class="support-layers-section">
            ${legendContent.supportLayers}
          </div>

          ${legendContent.periodInfo}

          <!-- REMOVIDO: additional-info-section duplicado -->

          <div class="final-info">
            ${legendContent.footerInfo}
          </div>

         
        </div>
      `;
    },

    generateCarSummaryHTML() {
      if (!this.component.carData || this.component.carData.length === 0) return '';

      const carItems = this.component.carData.slice(0, 1000).map((item, index) => `
        <div class="car-summary-item">
          <span class="color-badge" style="background-color: ${this.component.getCarColor(index)}; color: white; display: inline-block; width: 20px; height: 20px; border-radius: 50%; text-align: center; line-height: 20px; font-size: 10px; font-weight: bold; margin-right: 8px;">${index + 1}</span>
          <span class="car-name">${this.component.getTerraIndigenaName(item)}</span>
        </div>
      `).join('');

      const remainingCount = this.component.carData.length - 1000;
      const remainingText = remainingCount > 0 ?
        `<div class="car-remaining">+ ${remainingCount} outros CARs listados na próxima página</div>` : '';

      return `
        <div class="car-summary-section">
          <h3>Cadastro Ambiental Rural (CAR) - Resumo</h3>
          <div class="car-summary-grid">
            ${carItems}
          </div>
          ${remainingText}
        </div>
      `;
    },

    generateSupportLayersHTML() {
      if (!this.component.shouldShowCartographicSection) return '';

      // ADICIONAR O TEXTO DO SISTEMA GEODÉSICO AQUI TAMBÉM
      const geodeticInfoHTML = `
        <div class="geodetic-info">
          <p>
            ${this.component.$t('geodetic-system-info-part1')}
            <strong>${this.component.$t('geodetic-system-info-strong')}</strong>
            ${this.component.$t('geodetic-system-info-part2')}
          </p>
        </div>
      `;

      let layersHTML = '';

      this.component.layerCategories.forEach(category => {
        Object.values(category.layers).forEach(layer => {
          if (layer && layer.visible) {
            layersHTML += `
              <div class="layer-info">
                <p>
                  <strong>${layer.name || '-'}.</strong>
                  Fonte: ${layer.fonte || '-'}, Data de atualização:
                  ${this.component.handleData(layer.dt_atualizacao)}.
                </p>
              </div>
            `;
          }
        });
      });

      return `
        <div class="support-layers">
          <h3>Informações Cartográficas</h3>
          ${geodeticInfoHTML}
          ${layersHTML ? `
            <div class="bases-cartograficas">
              <h4>Bases Cartográficas</h4>
              ${layersHTML}
            </div>
          ` : ''}
        </div>
      `;
    },

    generateAllLegendsHTML() {
      let legendsHTML = '';

      // Monitoramento
      if (this.component.showFeaturesMonitoring && this.component.hasActiveMonitoringStages) {
        legendsHTML += this.generateLegendSectionHTML('Monitoramento Diário', this.component.monitoringItems);
      }

      // Alertas
      if (this.component.showFeaturesAlerts && this.component.hasActiveAlertsStages) {
        legendsHTML += this.generateLegendSectionHTML('Alerta Urgente', this.component.alertsItems);
      }

      // Support Layers
      if (this.component.showFeaturesSupportLayers && this.component.hasVisibleSupportLayers) {
        legendsHTML += this.generateSupportLayersLegendHTML();
      }

      // Uso do Solo
      if (this.component.showFeaturesLandUse) {
        legendsHTML += this.generateLegendSectionHTML('Uso e Ocupação do Solo', this.component.landUseItems);
      }

      // Prodes
      if (this.component.showFeaturesProdes) {
        legendsHTML += this.generateLegendSectionHTML('INPE - Prodes', this.component.prodesItems);
      }

      // Deter
      if (this.component.showFeaturesDeter) {
        legendsHTML += this.generateLegendSectionHTML('INPE - Deter', this.component.deterItems);
      }

      // Focos de Calor
      if (this.component.showFeaturesAquaMM || this.component.showFeaturesAquaMT) {
        legendsHTML += this.generateLegendSectionHTML('INPE - Focos de Calor', this.component.filteredHeatFocusItems);
      }

      return legendsHTML;
    },

    generateSupportLayersLegendHTML() {
      const supportLayerItems = [];
      
      if (this.component.supportLayers) {
        Object.values(this.component.supportLayers).forEach(layer => {
          if (layer && layer.visible && layer.name) {
            supportLayerItems.push({
              label: layer.name,
              color: layer.cor || '#CCCCCC',
              border: '1px solid #666'
            });
          }
        });
      }
      
      if (this.component.supportLayerUser) {
        Object.values(this.component.supportLayerUser).forEach(layer => {
          if (layer && layer.visible && layer.name) {
            supportLayerItems.push({
              label: layer.name,
              color: layer.cor || '#CCCCCC', 
              border: '1px solid #666'
            });
          }
        });
      }
      
      if (supportLayerItems.length === 0) return '';
      
      return this.generateLegendSectionHTML('Sobreposição de Camadas', supportLayerItems);
    },

    generateLegendSectionHTML(title, items) {
      if (!items || items.length === 0) return '';

      const itemsHTML = items.map(item => `
        <div class="legend-item">
          <span class="legend-color" style="background-color: ${item.color}; border: ${item.border || '1px solid #ccc'}; width: 15px; height: 15px; display: inline-block; margin-right: 8px;"></span>
          <span class="legend-label">${item.label}</span>
        </div>
      `).join('');

      return `
        <div class="legend-section">
          <h4>${title}</h4>
          <div class="legend-items">
            ${itemsHTML}
          </div>
        </div>
      `;
    },

    // REMOVIDO: generateAdditionalInfoHTML() - estava duplicando o conteúdo

    // MÉTODO COMPLETADO E CORRIGIDO
    generateCartographicInfoHTML() {
      if (!this.component.shouldShowCartographicSection) return '';

      let layersHTML = '';

      // ADICIONAR AQUI O TEXTO DO SISTEMA GEODÉSICO
      const geodeticInfoHTML = `
        <div class="geodetic-info">
          <p>
            ${this.component.$t('geodetic-system-info-part1')}
            <strong>${this.component.$t('geodetic-system-info-strong')}</strong>
            ${this.component.$t('geodetic-system-info-part2')}
          </p>
        </div>
      `;

      this.component.layerCategories.forEach(category => {
        Object.values(category.layers).forEach(layer => {
          if (layer && layer.visible) {
            layersHTML += `
              <div class="layer-info">
                <p>
                  <strong>${layer.name || '-'}.</strong>
                  Fonte: ${layer.fonte || '-'}, Data de atualização:
                  ${this.component.handleData(layer.dt_atualizacao)}.
                </p>
              </div>
            `;
          }
        });
      });

      return `
        <div class="cartographic-section">
          <h3>Informações Cartográficas</h3>
          ${geodeticInfoHTML}
          ${layersHTML ? `
            <div class="bases-cartograficas">
              <h4>Bases Cartográficas</h4>
              ${layersHTML}
            </div>
          ` : ''}
        </div>
      `;
    },

    generatePeriodInfoHTML() {
      if (!this.component.activePrintFeatures || this.component.activePrintFeatures.length === 0) return '';

      const featuresHTML = this.component.activePrintFeatures.map(feature => `
        <div class="period-info-item">
          <p>
            <strong>${this.component.$t(feature.label)}</strong>
            ${feature.type === 'date-range' ?
              `${this.component.handleData(feature.startDate)} ${this.component.$t('and')} ${this.component.handleData(feature.endDate)}` :
            feature.type === 'years-list' && feature.years.length > 0 ?
              feature.years.join(', ') :
            feature.type === 'single-year' ?
              feature.yearHandler() : ''}
          </p>
        </div>
      `).join('');

      return `
        <div class="period-info-section">
          <h3>Períodos dos Dados</h3>
          ${featuresHTML}
        </div>
      `;
    },

    generateFooterInfoHTML() {
      return `
        <div class="footer-info-section">
          <div class="footer-item">
            <p>${this.component.print_info} ${this.component.$t('text-address0')}</p>
            <p>${this.component.print_info} ${this.component.$t('text-address')} ${this.component.todayDate()}</p>
          </div>
          <div class="footer-item">
            <p>${this.component.$t('author-label')}</p>
            <p>${this.component.$t('text-info')}</p>
            <p>${this.component.$t('text-format')} ${this.component.leafSize.type}.</p>
          </div>
        </div>
      `;
    },

    openPrintWindow(printContent) {
      const printWindow = window.open('', '_blank');
      const printDocument = printWindow.document;

      printDocument.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${this.component.mapTitle}</title>
            <meta charset="utf-8">
            <style>
              ${this.getPrintStyles()}
            </style>
          </head>
          <body onload="window.print(); setTimeout(() => window.close(), 500);">
            ${printContent}
          </body>
        </html>
      `);

      printDocument.close();
    },

 getPrintStyles() {
  return `
    @page {
      size: landscape;
      margin: 1cm;
    }

    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      color: #000;
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .print-page {
      page-break-after: always;
      padding: 20px;
      min-height: 95vh;
      display: flex;
      flex-direction: column;
    }

    /* NOVOS ESTILOS PARA O CABEÇALHO COM LOGOS CENTRALIZADAS */
    .page-header {
      margin-bottom: 20px;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
      text-align: center;
    }

    .logos-container {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 40px;
      margin-bottom: 15px;
    }

    .logo-funai {
      max-width: 120px;
      max-height: 60px;
      object-fit: contain;
    }

    .logo-cmr {
      max-width: 180px;
      max-height: 60px;
      object-fit: contain;
    }

    .header-title {
      text-align: center;
    }

    .header-title h1 {
      margin: 0 0 5px 0;
      font-size: 24px;
      color: #333;
      text-transform: uppercase;
      font-weight: 700;
    }

    .header-title p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    /* Resto dos estilos existentes... */
    .map-section {
      flex: 1;
      margin: 15px 0;
      position: relative;
    }

    .main-map-container {
      position: relative;
      display: inline-block;
    }

    .map-image {
      max-width: 100%;
      max-height: 500px;
      border: 1px solid #ccc;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .mini-map-overlay-print {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 180px;
      height: 130px;
      border: 2px solid #ccc;
      border-radius: 4px;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }

    .mini-map-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .car-summary-section {
      margin: 15px 0;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .car-summary-section h3 {
      margin: 0 0 10px 0;
      font-size: 16px;
      color: #333;
    }

    .car-summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 10px;
    }

    .car-summary-item {
      display: flex;
      align-items: center;
      font-size: 11px;
      padding: 4px;
    }

    .car-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .car-remaining {
      font-size: 11px;
      font-style: italic;
      color: #666;
      text-align: center;
    }

    .legends-section-page1 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 15px 0;
    }

    .legend-section {
      break-inside: avoid;
    }

    .legend-section h4 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #333;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }

    .legend-items {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      font-size: 11px;
    }

    .legend-label {
      line-height: 1.2;
    }

    .table-container {
      flex: 1;
      overflow: hidden;
    }

    .car-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
      margin-bottom: 15px;
    }

    .car-table th,
    .car-table td {
      border: 1px solid #ccc;
      padding: 4px 6px;
      text-align: left;
    }

    .car-table th {
      background-color: #f5f5f5;
      font-weight: bold;
    }

    .car-table .text-center {
      text-align: center;
    }

    .car-table .text-right {
      text-align: right;
    }

    .support-layers-section {
      margin: 15px 0;
      padding: 0;
    }

    .support-layers h3 {
      margin: 0 0 10px 0;
      font-size: 16px;
      color: #333;
    }

    .layer-info {
      margin-bottom: 8px;
      font-size: 11px;
    }

    .period-info-section {
      margin: 15px 0;
      padding: 0;
    }

    .period-info-section h3 {
      margin: 0 0 10px 0;
      font-size: 16px;
      color: #333;
    }

    .period-info-item {
      margin-bottom: 8px;
      font-size: 11px;
    }

    .footer-info-section {
      margin-top: 20px;
      padding: 15px;
      border-top: 2px solid #ddd;
    }

    .footer-item {
      margin-bottom: 15px;
      font-size: 11px;
      color: #666;
    }

    .final-info {
      margin-top: auto;
      padding: 15px;
      border-top: 1px solid #ddd;
      font-size: 11px;
      color: #666;
    }

    .page-footer {
      margin-top: auto;
      padding-top: 15px;
      border-top: 1px solid #ddd;
      font-size: 10px;
      color: #666;
    }

    .page-number {
      text-align: center;
      font-weight: bold;
    }

    @media print {
      .print-page {
        padding: 0;
        min-height: 100vh;
      }

      body {
        margin: 0;
        padding: 0;
      }
    }
  `;
}
  }
}
</script>