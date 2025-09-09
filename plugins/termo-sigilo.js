/**
 * Plugin para termo de sigilo - apenas interceptors de erro
 */
export default function ({ $axios, store, redirect, route }) {
  $axios.onError(error => {
    if (error.response && error.response.status === 403) {
      const message = error.response.data?.message || ''
      if (message.includes('termo') || message.includes('sigilo')) {
        console.warn('Acesso negado: termo de sigilo não aceito')
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  })
}
