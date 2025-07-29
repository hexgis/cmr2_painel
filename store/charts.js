import axios from 'axios';
// Date=2023-06-21
export const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

const normalizeObjectKeys = (obj) => {
  const normalizedObj = {};
  Object.keys(obj).forEach((key) => {
    const normalizedKey = key.toUpperCase().trim();
    normalizedObj[normalizedKey] = (normalizedObj[normalizedKey] || 0) + obj[key];
  });
  return normalizedObj;
};

const processResponseData = (response) => {
  const datesSet = new Set();
  const dateCounts = {};
  const typeDeviceCounts = {};
  const browserCounts = {};
  const geocodedLocations = response.data.map((item) => ({
    city: item.location,
    lat: item.latitude,
    lng: item.longitude,
  }));

  response.data.forEach((item) => {
    if (item.last_date_login) {
      datesSet.add(item.last_date_login);
      dateCounts[item.last_date_login] = (dateCounts[item.last_date_login] || 0) + 1;
    }

    if (item.type_device) {
      const normalizedDevice = item.type_device.toUpperCase().trim();
      typeDeviceCounts[normalizedDevice] = (typeDeviceCounts[normalizedDevice] || 0) + 1;
    }

    if (item.browser) {
      const normalizedBrowser = item.browser.toUpperCase().trim();
      browserCounts[normalizedBrowser] = (browserCounts[normalizedBrowser] || 0) + 1;
    }
  });

  const consolidatedBrowserCounts = {};
  const predefinedBrowsers = ['CHROME', 'FIREFOX', 'EDGE', 'SAFARI'];
  let otherCount = 0;

  Object.entries(browserCounts).forEach(([browser, count]) => {
    if (predefinedBrowsers.includes(browser)) {
      consolidatedBrowserCounts[browser] = count;
    } else {
      otherCount += count;
    }
  });

  if (otherCount > 0) {
    consolidatedBrowserCounts.OUTROS = otherCount;
  }

  return {
    datesSet,
    dateCounts,
    typeDeviceCounts,
    consolidatedBrowserCounts,
    geocodedLocations,
  };
};

export const state = () => ({
  acessData: {},
  dates: [],
  dateCounts: {},
  typeDeviceCounts: {},
  browserCounts: {},
  monthlyData: [],
  location: [],
  todayDate: '',
  weekAgoDate: '',
  totalViewPerYears: [],
  institutionFilter: 'AGÊNCIAS',
});

export const mutations = {
  setDataChart(state, data) {
    state.acessData = data;
    state.location = data.location || [];
  },
  setDates(state, dates) {
    state.dates = dates;
  },
  setDateCounts(state, counts) {
    state.dateCounts = counts;
  },
  setTypeDeviceCounts(state, counts) {
    state.typeDeviceCounts = normalizeObjectKeys(counts);
  },
  setBrowserCounts(state, counts) {
    state.browserCounts = normalizeObjectKeys(counts);
  },
  setLocation(state, locations) {
    state.location = locations;
  },
  setTodayAndWeekAgoDates(state, dates) {
    state.todayDate = dates.today;
    state.weekAgoDate = dates.weekAgo;
  },
  setMonthlyCounts(state, data) {
    state.monthlyData = data;
  },
  setTotalViewYears(state, data) {
    state.totalViewPerYears = Array.isArray(data) ? data : [];
  },
  setInstitutionFilter(state, filter) {
    state.institutionFilter = filter;
  },
};

export const actions = {
  async dataChart({ commit, state, dispatch }, data) {
    await dispatch('captureDates');
    const [startDate, endDate, location, typeDevice, browser] = [
      data.startDate ? data.startDate : state.weekAgoDate || '',
      data.endDate || state.todayDate || '',
      data.location || '',
      data.typeDevice || '',
      data.browser || '',
    ];

    await dispatch('getTotalViewsPerYear', { startDate, endDate, institution: state.institutionFilter });

    try {
      const response = await this.$api.$get(
        `dashboard/get-all/?startDate=${startDate}&endDate=${endDate}&location=${location}&type_device=${typeDevice}&browser=${browser}&institution=${state.institutionFilter}`,
      );
      console.log('dados', response);

      if (response) {
        // Filtrar os dados brutos por instituição
        const filteredData = {
          ...response,
          data: response.data.filter((item) => {
            if (!item.user_email) return false;
            if (state.institutionFilter === 'FUNAI') {
              return item.user_email.toLowerCase().endsWith('@funai.gov.br');
            }
            return !item.user_email.toLowerCase().endsWith('@funai.gov.br');
          }),
        };

        // Recalcular monthly_counts com validação robusta
        const monthlyCounts = {};
        filteredData.data.forEach((item) => {
          if (item.last_date_login) {
            // Tentar parsear a data no formato DD/MM/YYYY
            const dateParts = item.last_date_login.split('/');
            let date;
            if (dateParts.length === 3) {
              const [day, month, year] = dateParts.map(Number);
              date = new Date(year, month - 1, day);
            } else {
              // Tentar formato alternativo (ex.: YYYY-MM-DD)
              date = new Date(item.last_date_login);
            }

            if (!isNaN(date.getTime())) {
              const month = date.getMonth() + 1;
              const year = date.getFullYear();
              const key = `${year}-${month}`;
              monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
            } else {
              console.warn('Invalid date format for last_date_login:', item.last_date_login);
            }
          }
        });

        const processedMonthlyCounts = Object.entries(monthlyCounts).map(([key, count]) => {
          const [year, month] = key.split('-').map(Number);
          return { year, month, count };
        }).filter((item) => !isNaN(item.month) && !isNaN(item.year));

        filteredData.monthly_counts = processedMonthlyCounts;

        commit('setDataChart', filteredData);
        const processedData = processResponseData(filteredData);

        commit('setLocation', processedData.geocodedLocations);
        commit(
          'setDates',
          Array.from(processedData.datesSet).sort((a, b) => {
            const [dayA, monthA, yearA] = a.split('/').map(Number);
            const [dayB, monthB, yearB] = b.split('/').map(Number);
            return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
          }),
        );
        commit('setDateCounts', processedData.dateCounts);
        commit('setTypeDeviceCounts', processedData.typeDeviceCounts);
        commit('setBrowserCounts', processedData.consolidatedBrowserCounts);

        const totalDevices = Object.values(processedData.typeDeviceCounts).reduce(
          (acc, count) => acc + count,
          0,
        );
        const percentageDeviceCounts = {};
        for (const [key, value] of Object.entries(processedData.typeDeviceCounts)) {
          percentageDeviceCounts[key] = totalDevices ? Math.round((value / totalDevices) * 100) : 0;
        }
        commit('setTypeDeviceCounts', percentageDeviceCounts);

        const totalBrowsers = Object.values(processedData.consolidatedBrowserCounts).reduce(
          (acc, count) => acc + count,
          0,
        );
        const percentageBrowserCounts = {};
        for (const [key, value] of Object.entries(
          processedData.consolidatedBrowserCounts,
        )) {
          percentageBrowserCounts[key] = totalBrowsers ? Math.round((value / totalBrowsers) * 100) : 0;
        }
        commit('setBrowserCounts', percentageBrowserCounts);

        commit('setMonthlyCounts', processedMonthlyCounts);
      }
    } catch (error) {
      this.$store.commit('alert/addAlert', {
        message: this.$t('error'),
      });
      console.error('Failed to fetch data:', error);
    }
  },

  async getTotalViewsPerYear({ commit, state }, { startDate, endDate, institution }) {
    try {
      const response = await this.$api.$get(
        `dashboard/get-year/?startDate=${startDate}&endDate=${endDate || ''}&institution=${institution || state.institutionFilter}`,
      );

      const data = Array.isArray(response) ? response : response && response.yearly_totals ? response.yearly_totals : [];
      commit('setTotalViewYears', data);
    } catch (error) {
      this.$store.commit('alert/addAlert', {
        message: this.$i18n.t('default-error'),
      });
      console.error('Failed to fetch total views per year:', error);
      commit('setTotalViewYears', []);
    }
  },

  captureDates({ commit }) {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    const dates = {
      today: formatDate(today),
      weekAgo: formatDate(weekAgo),
    };
    commit('setTodayAndWeekAgoDates', dates);
  },

  setInstitutionFilter({ commit }, filter) {
    commit('setInstitutionFilter', filter);
  },
};

export const getters = {
  getDataChart(state) {
    return state.acessData;
  },
  getDates(state) {
    return state.dates;
  },
  getDateCounts(state) {
    return state.dateCounts;
  },
  getTypeDeviceCounts(state) {
    return state.typeDeviceCounts;
  },
  getBrowserCounts(state) {
    return state.browserCounts;
  },
  getLocations(state) {
    return state.location;
  },
  getTodayDate(state) {
    return state.todayDate;
  },
  getWeekAgoDate(state) {
    return state.weekAgoDate;
  },
  getMonthlyCounts(state) {
    return state.monthlyData;
  },
  getTotalViewsPerYear(state) {
    return state.totalViewPerYears;
  },
  getInstitutionFilter(state) {
    return state.institutionFilter;
  },
};
