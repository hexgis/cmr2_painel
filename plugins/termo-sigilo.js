/**
 * Plugin para termo de sigilo - apenas interceptors de erro
 */
export default function ({ $axios, store, redirect, route }) {
  // Interceptor para verificar termo de sigilo em requisições autenticadas
  $axios.onError(error => {
    // Se receber erro 403 relacionado ao termo de sigilo
    if (error.response && error.response.status === 403) {
      const message = error.response.data?.message || ''
      if (message.includes('termo') || message.includes('sigilo')) {
        // Apenas registra o erro, não faz redirect automático
        console.warn('Acesso negado: termo de sigilo não aceito')
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  })
}
