// eslint-disable-next-line func-names
export default function ({ $axios, store }, inject) {
  const token = store.getters['auth/getToken']
    ? store.getters['auth/getToken']
    : null;
  const api = $axios.create({
    headers: token ? {
      common: {
        Authorization: `Bearer ${token}`,
      },
    } : {},
    baseURL: process.env.API_URL,
  });
  const apiSkynet = $axios.create({
    headers: {
      common: {
        Authorization: process.env.SKYNET_API_TOKEN,
      },
    },
    baseURL: process.env.SKYNET_API_URL,
    timeout: 900000,
  });

  const apiES = $axios.create({
    headers: {
      common: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    },
    baseURL: process.env.ELASTICSEARCH_URL,
    timeout: 900000,
  });

  inject('api', api);
  inject('apiSkynet', apiSkynet);
  inject('apiES', apiES);

  api.interceptors.response.use(
    (response) => response,
    // eslint-disable-next-line consistent-return
    async (error) => {
      const originalRequest = error.config;
      if (
        originalRequest
                && error.response
                && error.response.status === 401
                && !originalRequest.url.startsWith('auth/')
                // eslint-disable-next-line no-underscore-dangle
                && !originalRequest._retry
      ) {
        // eslint-disable-next-line no-underscore-dangle
        originalRequest._retry = true;
        const promise = await store.dispatch('auth/refreshToken');

        if (promise && promise.access) {
          originalRequest.headers.Authorization = `Bearer ${promise.access}`;
          return api.request(originalRequest);
        }
      } else {
        return Promise.reject(error);
      }
    },
  );
}
