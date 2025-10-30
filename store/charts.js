export const state = () => ({
  acessData: {},
  dates: [],
  dateCounts: {},
  typeDeviceCounts: {},
  browserCounts: {},
  institutionCrCounts: [],
  monthlyData: [],
  location: [],
  todayDate: '',
  weekAgoDate: '',
  totalViewPerYears: [],
  institutionFilter: 'AGÊNCIAS',
});

/**
 * Formats a date object to YYYY-MM-DD string format
 * Date=2023-06-21
 * @param {Date} date - The date object to format
 * @returns {string} The formatted date string
 */
export const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

/**
 * Normalizes object keys to uppercase and consolidates duplicate keys
 * @param {Object} obj - Object with keys to normalize
 * @returns {Object} Object with normalized and consolidated keys
 */
const normalizeObjectKeys = (obj) => {
  const normalizedObj = {};
  Object.keys(obj).forEach((key) => {
    const normalizedKey = key.toUpperCase().trim();
    normalizedObj[normalizedKey] = (normalizedObj[normalizedKey] || 0) + obj[key];
  });
  return normalizedObj;
};

/**
 * Processes API response data to extract and organize metrics
 * @param {Object} response - API response containing user access data
 * @returns {Object} Processed data with dates, device types, browsers, and locations
 */
const processResponseData = (response) => {
  const datesSet = new Set();
  const dateCounts = {};
  const typeDeviceCounts = {};
  const browserCounts = {};
  const institutionCrCounts = {};
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

    if (item.institution_acronym) {
      const normalizedInstitution = item.institution_acronym.toUpperCase().trim();
      institutionCrCounts[normalizedInstitution] = (
        institutionCrCounts[normalizedInstitution] || 0) + 1;
    }
  });

  const consolidatedBrowserCounts = {};
  const predefinedBrowsers = ['CHROME', 'FIREFOX', 'EDGE', 'SAFARI'];
  let otherBrowserCount = 0;

  Object.entries(browserCounts).forEach(([browser, count]) => {
    if (predefinedBrowsers.includes(browser)) {
      consolidatedBrowserCounts[browser] = count;
    } else {
      otherBrowserCount += count;
    }
  });

  if (otherBrowserCount > 0) {
    consolidatedBrowserCounts.OUTROS = otherBrowserCount;
  }

  return {
    datesSet,
    dateCounts,
    typeDeviceCounts,
    consolidatedBrowserCounts,
    consolidatedInstitutionCrCounts: institutionCrCounts,
    geocodedLocations,
  };
};

/**
 * Calculates percentage values for count objects
 * @param {Object} counts - Object with count values
 * @returns {Object} Object with percentage values
 */
const calculatePercentages = (counts) => {
  const total = Object.values(counts).reduce((acc, count) => acc + count, 0);
  const percentageCounts = {};

  for (const [key, value] of Object.entries(counts)) {
    percentageCounts[key] = total ? Math.round((value / total) * 100) : 0;
  }

  return percentageCounts;
};

/**
 * Processes monthly counts from filtered data
 * @param {Array} data - Filtered data array
 * @returns {Array} Processed monthly counts
 */
const processMonthlyCounts = (data) => {
  const monthlyCounts = {};

  data.forEach((item) => {
    if (item.last_date_login) {
      const dateParts = item.last_date_login.split('/');
      let date;

      if (dateParts.length === 3) {
        const [day, month, year] = dateParts.map(Number);
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(item.last_date_login);
      }

      if (!isNaN(date.getTime())) {
        const monthNum = date.getMonth() + 1;
        const yearNum = date.getFullYear();
        const key = `${yearNum}-${monthNum}`;
        monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
      }
    }
  });

  return Object.entries(monthlyCounts).map(([key, count]) => {
    const [year, month] = key.split('-').map(Number);
    return { year, month, count };
  }).filter((item) => !isNaN(item.month) && !isNaN(item.year));
};

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
  setInstitutionCrCounts(state, counts) {
    state.institutionCrCounts = counts;
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
  /**
   * Fetches and processes dashboard chart data with filters
   * @param {Object} context - Vuex action context
   * @param {Object} data - Filter parameters including dates, location, device type, and browser
   */
  async dataChart({ commit, state, dispatch }, data) {
    await dispatch('captureDates');

    const [startDate, endDate, location, typeDevice, browser, institutionCr] = [
      data.startDate ? data.startDate : state.weekAgoDate || '',
      data.endDate || state.todayDate || '',
      data.location || '',
      data.typeDevice || '',
      data.browser || '',
      data.institutionCr || '',
    ];

    await dispatch('getTotalViewsPerYear', {
      startDate,
      endDate,
      institution: state.institutionFilter,
    });

    try {
      let institutionCrArray = [];
      if (institutionCr) {
        if (typeof institutionCr === 'string' && institutionCr.includes(',')) {
          institutionCrArray = institutionCr.split(',').map(cr => cr.trim().toUpperCase());
        } else if (Array.isArray(institutionCr)) {
          institutionCrArray = institutionCr.map(cr => cr.trim().toUpperCase());
        } else {
          institutionCrArray = [institutionCr.trim().toUpperCase()];
        }
      }

      const response = await this.$api.$get(
        `dashboard/?date_after=${startDate}&date_before=${endDate}&location=${location}&type_device=${typeDevice}&browser=${browser}&institution=${institutionCr}`,
      );

      if (response) {
        const filteredData = {
          ...response,
          data: response.data.filter((item) => {
            if (state.institutionFilter === 'FUNAI') {
              return item.is_internal;
            }
            return true;
          }),
        };

        const processedMonthlyCounts = processMonthlyCounts(filteredData.data);
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
        commit('setInstitutionCrCounts', processedData.consolidatedInstitutionCrCounts);
        commit('setMonthlyCounts', processedMonthlyCounts);
      }
    } catch (error) {
      this.$store.commit('alert/addAlert', {
        message: this.$t('error'),
      });
    }
  },

  async getTotalViewsPerYear({ commit, state }, { startDate, endDate, institution }) {
    try {
      const response = await this.$api.$get(
        `dashboard/?date_after=${startDate}&date_before=${endDate || ''}`,
      );

      const data = Array.isArray(response) ? response :
        response && response.monthly_counts ? response.monthly_counts : [];
      commit('setTotalViewYears', data);
    } catch (error) {
      this.$store.commit('alert/addAlert', {
        message: this.$i18n.t('default-error'),
      });
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
  getDataChart: (state) => state.acessData,
  getDates: (state) => state.dates,
  getDateCounts: (state) => state.dateCounts,
  getTypeDeviceCounts: (state) => state.typeDeviceCounts,
  getBrowserCounts: (state) => state.browserCounts,
  getInstitutionCrCounts: (state) => state.institutionCrCounts,
  getLocations: (state) => state.location,
  getTodayDate: (state) => state.todayDate,
  getWeekAgoDate: (state) => state.weekAgoDate,
  getMonthlyCounts: (state) => state.monthlyData,
  getTotalViewsPerYear: (state) => state.totalViewPerYears,
  getInstitutionFilter: (state) => state.institutionFilter,
};
