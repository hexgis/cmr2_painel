// Error types and messages for RasterCompare component
export const ERROR_TYPES = {
  MAP_INIT: 'MAP_INIT',
  LAYER_CREATION: 'LAYER_CREATION',
  LEAFLET_MISSING: 'LEAFLET_MISSING',
  SIDE_BY_SIDE_CONTROL: 'SIDE_BY_SIDE_CONTROL',
  LAYER_VISIBILITY: 'LAYER_VISIBILITY',
  MAP_CLEANUP: 'MAP_CLEANUP',
};

export const ERROR_MESSAGES = {
  [ERROR_TYPES.MAP_INIT]: {
    title: 'Erro de Inicialização',
    message: 'Falha ao inicializar o mapa de comparação.',
    severity: 'error',
  },
  [ERROR_TYPES.LAYER_CREATION]: {
    title: 'Erro na Camada',
    message: 'Não foi possível carregar uma das camadas. Verifique se a camada está disponível.',
    severity: 'warning',
  },
  [ERROR_TYPES.LEAFLET_MISSING]: {
    title: 'Biblioteca Não Encontrada',
    message: 'Leaflet não está disponível. Recarregue a página.',
    severity: 'error',
  },
  [ERROR_TYPES.SIDE_BY_SIDE_CONTROL]: {
    title: 'Controle de Comparação',
    message: 'Falha ao inicializar o controle de comparação lado a lado.',
    severity: 'warning',
  },
  [ERROR_TYPES.LAYER_VISIBILITY]: {
    title: 'Visibilidade da Camada',
    message: 'Problema ao ajustar a visibilidade da camada.',
    severity: 'info',
  },
  [ERROR_TYPES.MAP_CLEANUP]: {
    title: 'Limpeza do Mapa',
    message: 'Erro durante a limpeza do mapa.',
    severity: 'info',
  },
};

export const logError = (errorType, error, context = {}) => {
  const errorInfo = ERROR_MESSAGES[errorType] || {
    title: 'Erro Desconhecido',
    message: 'Ocorreu um erro inesperado.',
    severity: 'error',
  };

  console.error(`[RasterCompare] ${errorInfo.title}:`, {
    message: errorInfo.message,
    originalError: error,
    context,
    timestamp: new Date().toISOString(),
  });

  return errorInfo;
};
