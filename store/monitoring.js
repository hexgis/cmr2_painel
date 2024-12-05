export const state = () => ({
  features: null,
  showFeaturesMonitoring: false,
  visualizationStage: 'stage1',
  tableDialogMonitoring: false,
  analyticsMonitoringDialog: false,
  isLoadingCSVMonitoring: false,
  isLoadingStatistic: false,
  isLoadingGeoJson: false,
  isLoadingFeatures: false,
  isLoadingTableMonitoring: false,
  filterOptions: {
    regionalFilters: [],
    tiFilters: [],
  },
  filters: {
    startDate: null,
    endDate: null,
    grouping_by_year: 'monitoring_by_year',
    grouping_by_funai: 'monitoring_by_co_funai',
    grouping_by_co_funai_year: 'monitoring_by_co_funai_and_year',
    grouping_by_day: 'monitoring_by_day',
    grouping_by_co_funai_and_monthyear: 'monitoring_by_co_funai_and_monthyear',
    grouping_by_monthyear: 'monitoring_by_monthyear',
    csv: 'csv',
    json: 'json',
  },

  opacity: 100,
  heatMap: false,
  total: null,
  analyticsMonitoring: [],
  tableMonitoring: [],
  tableCSVMonitoring: [],
  analyticsMonitoringcsv: [],
  selectedStages: ['CR', 'DG', 'DR', 'FF'],
  stageItemActive: [],
});

export const getters = {
  getShowFeaturesMonitoring: (state) => {
    return state.showFeaturesMonitoring;
  },

  featuresLoaded(state) {
    return (
      state.features
      && state.features.features
      && state.features.features.length > 0
    );
  },
};

export const mutations = {
  setSelectedStages(state, value) {
    state.selectedStages.push(value);
  },

  removeSelectedStages(state, value) {
    const index = state.selectedStages.indexOf(value);
    if (index !== -1) {
      state.selectedStages.splice(index, 1);
    }
  },

  setFeatures(state, features) {
    state.features = features;
    state.isLoadingFeatures = false;
  },

  setStageItemActive(state, value){
    state.stageItemActive = value
  },

  setshowFeaturesMonitoring(state, showFeaturesMonitoring) {
    state.showFeaturesMonitoring = showFeaturesMonitoring;
  },

  setLoadingGeoJson(state, payload) {
    state.isLoadingGeoJson = payload;
  },

  clearFeatures(state) {
    state.features = null;
  },

  setTotal(state, total) {
    state.total = total;
  },

  setLoadingStatistic(state, payload) {
    state.isLoadingStatistic = payload;
  },

  setAnalytics(state, analyticsMonitoring) {
    state.analyticsMonitoring = analyticsMonitoring;
  },

  settableDialogMonitoring(state, tableDialogMonitoring) {
    state.tableDialogMonitoring = tableDialogMonitoring;
  },

  setanalyticsMonitoringDialog(state, analyticsMonitoringDialog) {
    state.analyticsMonitoringDialog = analyticsMonitoringDialog;
  },

  setLoadingFeatures(state, payload) {
    state.isLoadingFeatures = payload;
  },

  setLoadingTableMonitoring(state, payload) {
    state.isLoadingTableMonitoring = payload;
  },

  setFilterOptions(state, data) {
    state.filterOptions = data;
  },

  setOpacity(state, opacity) {
    state.opacity = opacity;
  },

  setDownloadTable(state, tableCSVMonitoring) {
    state.tableCSVMonitoring = tableCSVMonitoring;
  },

  setHeatMap(state, heatMap) {
    state.heatMap = heatMap;
  },

  setLoadingCSV(state, payload) {
    state.isLoadingCSVMonitoring = payload;
  },

  setTable(state, tableMonitoring) {
    state.tableMonitoring = tableMonitoring;
  },

  setFilters(state, filters) {
    state.filters = {
      ...state.filters,
      ...filters,
    };
  },
};

export const actions = {
  async updateFeatures({ state, commit }){
    let updatedFeatures =  { features: state.stageItemActive, ...state.features }
    commit('setFeatures', updatedFeatures);
    commit('setshowFeaturesMonitoring', true);
  },

  async getFeatures({ state, commit, rootGetters }) {
    commit('setLoadingGeoJson', true);
    commit('setLoadingStatistic', true);
    commit('setLoadingFeatures', true);
    commit('setLoadingTableMonitoring', true);
    commit('clearFeatures');

    const params = {
      start_date: state.filters.startDate,
      end_date: state.filters.endDate,
    };

    if (state.filters.ti && state.filters.ti.length) {
      const arrayTI = [];
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      params.co_funai = arrayTI.toString();
    }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    if (state.filters.cr && state.filters.cr.length) {
      const arrayCR = [];
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      params.co_cr = arrayCR.toString();
    }

    try {
      const response = await this.$api.$get('monitoring/consolidated/', {
        params,
      });

      if (!response.features || !response.features.length) {
        commit('setshowFeaturesMonitoring', false);
        commit(
          'alert/addAlert',
          { message: this.$i18n.t('no-result') },
          { root: true },
        );
      } else {
        let stageItemActive = []
        response.features.map((item)=>{
          state.selectedStages.map((stageActive) => {
            stageActive === item.properties.no_estagio ? stageItemActive.push(item) : ""
          })
        })
        commit('setFeatures', response);
        commit('setshowFeaturesMonitoring', true);
        commit('setStageItemActive', stageItemActive);
        const total = await this.$api.$get(
          'monitoring/consolidated/map-stats/',
          {
            params,
          },
        );
        if (total) commit('setTotal', total);
      }
    } catch (exception) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('monitoring'),
          }),
        },
        { root: true },
      );
    } finally {
      commit('setLoadingFeatures', false);
      commit('setLoadingGeoJson', false);
      commit('setLoadingStatistic', false);
      commit('setLoadingTableMonitoring', false);
    }
  },

  async getFilterOptions({ commit }) {
    const regional_coordinators = await this.$api.$get('funai/cr/');

    const data = {};

    if (regional_coordinators) {
      data.regionalFilters = regional_coordinators.sort(
        (a, b) => a.ds_cr > b.ds_cr,
      );
    }

    commit('setFilterOptions', data);
  },

  async getTiOptions({ commit, state }, cr) {
    const params = {
      co_cr: cr.toString(),
    };

    const tis = await this.$api.$get('funai/ti/', { params });

    if (tis) {
      commit('setFilterOptions', {
        ...state.filterOptions,
        tiFilters: tis.sort((a, b) => a.no_ti > b.no_ti),
      });
    }
  },

  async getDataTableMonitoring({ commit, state, rootGetters }) {
    commit('setLoadingTableMonitoring', true);

    const params = {
      start_date: state.filters.startDate,
      end_date: state.filters.endDate,
    };

    if (state.filters.ti && state.filters.ti.length) {
      const arrayTI = [];
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      params.co_funai = arrayTI.toString();
    }

    if (state.filters.cr && state.filters.cr.length) {
      const arrayCR = [];
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      params.co_cr = arrayCR.toString();
    }

    if (state.filters.priority && state.filters.priority.length) { params.priority = state.filters.priority.toString(); }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    try {
      const tableMonitoring = await this.$api.$get(
        'monitoring/consolidated/table/',
        {
          params,
        },
      );

      if (tableMonitoring) commit('setTable', tableMonitoring);
    } catch (error) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('monitoring'),
          }),
        },
        { root: true },
      );
    } finally {
      commit('setLoadingTableMonitoring', false);
    }
  },

  async getDataAnalyticsMonitoringByYear({ commit, state, rootGetters }) {
    commit('setLoadingStatistic', true);
    const params = {
      start_date: state.filters.startDate,
      end_date: state.filters.endDate,
      grouping: state.filters.grouping_by_year,
    };

    if (state.filters.ti && state.filters.ti.length) {
      const arrayTI = [];
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      params.co_funai = arrayTI.toString();
    }

    if (state.filters.cr && state.filters.cr.length) {
      const arrayCR = [];
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      params.co_cr = arrayCR.toString();
    }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    try {
      const analyticsMonitoring = await this.$api.$get(
        'monitoring/consolidated/table-stats/',
        {
          params,
        },
      );

      if (analyticsMonitoring) commit('setAnalytics', analyticsMonitoring);
    } catch (error) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('monitoring'),
          }),
        },
        { root: true },
      );
    } finally {
      commit('setLoadingStatistic', false);
    }
  },

  async getDataAnalyticsMonitoringByMonthYear({ commit, state, rootGetters }) {
    commit('setLoadingStatistic', true);
    const params = {
      start_date: state.filters.startDate,
      end_date: state.filters.endDate,
      grouping: state.filters.grouping_by_monthyear,
    };

    if (state.filters.ti && state.filters.ti.length) {
      const arrayTI = [];
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      params.co_funai = arrayTI.toString();
    }

    if (state.filters.cr && state.filters.cr.length) {
      const arrayCR = [];
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      params.co_cr = arrayCR.toString();
    }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    try {
      const analyticsMonitoring = await this.$api.$get(
        'monitoring/consolidated/table-stats/',
        {
          params,
        },
      );

      if (analyticsMonitoring) commit('setAnalytics', analyticsMonitoring);
    } catch (error) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('monitoring'),
          }),
        },
        { root: true },
      );
    } finally {
      commit('setLoadingStatistic', false);
    }
  },

  async getDataAnalyticsMonitoringByFunai({ commit, state, rootGetters }) {
    commit('setLoadingStatistic', true);
    const params = {
      start_date: state.filters.startDate,
      end_date: state.filters.endDate,
      grouping: state.filters.grouping_by_funai,
    };

    if (state.filters.ti && state.filters.ti.length) {
      const arrayTI = [];
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      params.co_funai = arrayTI.toString();
    }

    if (state.filters.cr && state.filters.cr.length) {
      const arrayCR = [];
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      params.co_cr = arrayCR.toString();
    }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    try {
      const analyticsMonitoring = await this.$api.$get(
        'monitoring/consolidated/table-stats/',
        {
          params,
        },
      );

      if (analyticsMonitoring) commit('setAnalytics', analyticsMonitoring);
    } catch (error) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('monitoring'),
          }),
        },
        { root: true },
      );
    } finally {
      commit('setLoadingStatistic', false);
    }
  },

  async getDataAnalyticsMonitoringByFunaiMonthYear({ commit, state, rootGetters }) {
    commit('setLoadingStatistic', true);
    const params = {
      start_date: state.filters.startDate,
      end_date: state.filters.endDate,
      grouping: state.filters.grouping_by_co_funai_and_monthyear,
    };

    if (state.filters.ti && state.filters.ti.length) {
      const arrayTI = [];
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      params.co_funai = arrayTI.toString();
    }

    if (state.filters.cr && state.filters.cr.length) {
      const arrayCR = [];
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      params.co_cr = arrayCR.toString();
    }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    try {
      const analyticsMonitoring = await this.$api.$get(
        'monitoring/consolidated/table-stats/',
        {
          params,
        },
      );

      if (analyticsMonitoring) commit('setAnalytics', analyticsMonitoring);
    } catch (error) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('monitoring'),
          }),
        },
        { root: true },
      );
    } finally {
      commit('setLoadingStatistic', false);
    }
  },

  async getDataAnalyticsMonitoringByFunaiYear({ commit, state, rootGetters }) {
    commit('setLoadingStatistic', true);

    const params = {
      start_date: state.filters.startDate,
      end_date: state.filters.endDate,
      grouping: state.filters.grouping_by_co_funai_year
      ,
    };

    if (state.filters.ti && state.filters.ti.length) {
      const arrayTI = [];
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      params.co_funai = arrayTI.toString();
    }

    if (state.filters.cr && state.filters.cr.length) {
      const arrayCR = [];
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      params.co_cr = arrayCR.toString();
    }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    try {
      const analyticsMonitoring = await this.$api.$get(
        'monitoring/consolidated/table-stats/',
        {
          params,
        },
      );

      if (analyticsMonitoring) commit('setAnalytics', analyticsMonitoring);
    } catch (error) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('monitoring'),
          }),
        },
        { root: true },
      );
    } finally {
      commit('setLoadingStatistic', false);
    }
  },

  async getDataAnalyticsMonitoringByDay({ commit, state, rootGetters }) {
    commit('setLoadingStatistic', true);
    const params = {
      start_date: state.filters.startDate,
      end_date: state.filters.endDate,
      grouping: state.filters.grouping_by_day,
    };

    if (state.filters.ti && state.filters.ti.length) {
      const arrayTI = [];
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      params.co_funai = arrayTI.toString();
    }

    if (state.filters.cr && state.filters.cr.length) {
      const arrayCR = [];
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      params.co_cr = arrayCR.toString();
    }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    try {
      const analyticsMonitoring = await this.$api.$get(
        'monitoring/consolidated/table-stats/',
        {
          params,
        },
      );

      if (analyticsMonitoring) commit('setAnalytics', analyticsMonitoring);
    } catch (error) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('monitoring'),
          }),
        },
        { root: true },
      );
    } finally {
      commit('setLoadingStatistic', false);
    }
  },

  async downloadTableMonitoringAnalyticsByDay({ commit, state, rootGetters }) {
    commit('setLoadingCSV', true);
    const params = {
      start_date: state.filters.startDate,
      end_date: state.filters.endDate,
      grouping: state.filters.grouping_by_day,
      format: state.filters.csv,
    };

    if (state.filters.ti && state.filters.ti.length) {
      const arrayTI = [];
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      params.co_funai = arrayTI.toString();
    }

    if (state.filters.cr && state.filters.cr.length) {
      const arrayCR = [];
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      params.co_cr = arrayCR.toString();
    }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    const analyticsMonitoringcsv = await this.$api.$get(
      'monitoring/consolidated/table-stats/',
      {
        params,
      },
    );

    function saveData(data, fileName, type) {
      let elementBtn; let blob; let
        url;

      elementBtn = document.createElement('a');
      elementBtn.style = 'display: none';
      document.body.appendChild(elementBtn);

      if (type !== 'text/csv') {
        data = JSON.stringify(data);
      }

      blob = new Blob([data], { type });
      url = window.URL.createObjectURL(blob);

      elementBtn.href = url;
      elementBtn.download = fileName;
      elementBtn.click();
      window.URL.revokeObjectURL(url);
    }

    try {
      saveData(
        analyticsMonitoringcsv,
        'poligono_monitoramento_estatisticas_by_day.csv',
        'text/csv',
      );
    } finally {
      commit('setLoadingCSV', false);
    }
  },

  async downloadTableMonitoringAnalyticsByMonthYear({ commit, state, rootGetters }) {
    commit('setLoadingCSV', true);
    const params = {
      start_date: state.filters.startDate,
      end_date: state.filters.endDate,
      grouping: state.filters.grouping_by_monthyear,
      format: state.filters.csv,
    };

    if (state.filters.ti && state.filters.ti.length) {
      const arrayTI = [];
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      params.co_funai = arrayTI.toString();
    }

    if (state.filters.cr && state.filters.cr.length) {
      const arrayCR = [];
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      params.co_cr = arrayCR.toString();
    }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    const analyticsMonitoringcsv = await this.$api.$get(
      'monitoring/consolidated/table-stats/',
      {
        params,
      },
    );

    function saveData(data, fileName, type) {
      let elementBtn; let blob; let
        url;

      elementBtn = document.createElement('a');
      elementBtn.style = 'display: none';
      document.body.appendChild(elementBtn);

      if (type !== 'text/csv') {
        data = JSON.stringify(data);
      }

      blob = new Blob([data], { type });
      url = window.URL.createObjectURL(blob);

      elementBtn.href = url;
      elementBtn.download = fileName;
      elementBtn.click();
      window.URL.revokeObjectURL(url);
    }

    try {
      saveData(
        analyticsMonitoringcsv,
        'poligono_monitoramento_estatisticas_by_monthyear.csv',
        'text/csv',
      );
    } finally {
      commit('setLoadingCSV', false);
    }
  },

  async downloadTableMonitoringAnalyticsByFunai({ commit, state, rootGetters }) {
    commit('setLoadingCSV', true);
    const params = {
      start_date: state.filters.startDate,
      end_date: state.filters.endDate,
      grouping: state.filters.grouping_by_funai,
      format: state.filters.csv,
    };

    if (state.filters.ti && state.filters.ti.length) {
      const arrayTI = [];
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      params.co_funai = arrayTI.toString();
    }

    if (state.filters.cr && state.filters.cr.length) {
      const arrayCR = [];
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      params.co_cr = arrayCR.toString();
    }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    const analyticsMonitoringcsv = await this.$api.$get(
      'monitoring/consolidated/table-stats/',
      {
        params,
      },
    );

    function saveData(data, fileName, type) {
      let elementBtn; let blob; let
        url;

      elementBtn = document.createElement('a');
      elementBtn.style = 'display: none';
      document.body.appendChild(elementBtn);

      if (type !== 'text/csv') {
        data = JSON.stringify(data);
      }

      blob = new Blob([data], { type });
      url = window.URL.createObjectURL(blob);

      elementBtn.href = url;
      elementBtn.download = fileName;
      elementBtn.click();
      window.URL.revokeObjectURL(url);
    }

    try {
      saveData(
        analyticsMonitoringcsv,
        'poligono_monitoramento_estatisticas_by_funai.csv',
        'text/csv',
      );
    } finally {
      commit('setLoadingCSV', false);
    }
  },

  async downloadTableMonitoringAnalyticsByFunaiMonthYear({ commit, state, rootGetters }) {
    commit('setLoadingCSV', true);
    const params = {
      start_date: state.filters.startDate,
      end_date: state.filters.endDate,
      grouping: state.filters.grouping_by_co_funai_and_monthyear,
      format: state.filters.csv,
    };

    if (state.filters.ti && state.filters.ti.length) {
      const arrayTI = [];
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      params.co_funai = arrayTI.toString();
    }

    if (state.filters.cr && state.filters.cr.length) {
      const arrayCR = [];
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      params.co_cr = arrayCR.toString();
    }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    const analyticsMonitoringcsv = await this.$api.$get(
      'monitoring/consolidated/table-stats/',
      {
        params,
      },
    );

    function saveData(data, fileName, type) {
      let elementBtn; let blob; let
        url;

      elementBtn = document.createElement('a');
      elementBtn.style = 'display: none';
      document.body.appendChild(elementBtn);

      if (type !== 'text/csv') {
        data = JSON.stringify(data);
      }

      blob = new Blob([data], { type });
      url = window.URL.createObjectURL(blob);

      elementBtn.href = url;
      elementBtn.download = fileName;
      elementBtn.click();
      window.URL.revokeObjectURL(url);
    }

    try {
      saveData(
        analyticsMonitoringcsv,
        'poligono_monitoramento_estatisticas_by_co_funai_and_monthyear.csv',
        'text/csv',
      );
    } finally {
      commit('setLoadingCSV', false);
    }
  },

  async downloadTableMonitoringAnalyticsByFunaiYear({ commit, state, rootGetters }) {
    commit('setLoadingCSV', true);
    const params = {
      start_date: state.filters.startDate,
      end_date: state.filters.endDate,
      grouping: state.filters.grouping_by_co_funai_year,
      format: state.filters.csv,
    };

    if (state.filters.ti && state.filters.ti.length) {
      const arrayTI = [];
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      params.co_funai = arrayTI.toString();
    }

    if (state.filters.cr && state.filters.cr.length) {
      const arrayCR = [];
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      params.co_cr = arrayCR.toString();
    }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    const analyticsMonitoringcsv = await this.$api.$get(
      'monitoring/consolidated/table-stats/',
      {
        params,
      },
    );

    function saveData(data, fileName, type) {
      let elementBtn; let blob; let
        url;

      elementBtn = document.createElement('a');
      elementBtn.style = 'display: none';
      document.body.appendChild(elementBtn);

      if (type !== 'text/csv') {
        data = JSON.stringify(data);
      }

      blob = new Blob([data], { type });
      url = window.URL.createObjectURL(blob);

      elementBtn.href = url;
      elementBtn.download = fileName;
      elementBtn.click();
      window.URL.revokeObjectURL(url);
    }

    try {
      saveData(
        analyticsMonitoringcsv,
        'poligono_monitoramento_estatisticas_by_co_funai_year.csv',
        'text/csv',
      );
    } finally {
      commit('setLoadingCSV', false);
    }
  },

  async downloadTableMonitoringAnalyticsByYear({ commit, state, rootGetters }) {
    commit('setLoadingCSV', true);
    const params = {
      start_date: state.filters.startDate,
      end_date: state.filters.endDate,
      grouping: state.filters.grouping_by_year,
      format: state.filters.csv,
    };

    if (state.filters.ti && state.filters.ti.length) {
      const arrayTI = [];
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      params.co_funai = arrayTI.toString();
    }

    if (state.filters.cr && state.filters.cr.length) {
      const arrayCR = [];
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      params.co_cr = arrayCR.toString();
    }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    const analyticsMonitoringcsv = await this.$api.$get(
      'monitoring/consolidated/table-stats/',
      {
        params,
      },
    );

    function saveData(data, fileName, type) {
      let elementBtn; let blob; let
        url;

      elementBtn = document.createElement('a');
      elementBtn.style = 'display: none';
      document.body.appendChild(elementBtn);

      if (type !== 'text/csv') {
        data = JSON.stringify(data);
      }

      blob = new Blob([data], { type });
      url = window.URL.createObjectURL(blob);

      elementBtn.href = url;
      elementBtn.download = fileName;
      elementBtn.click();
      window.URL.revokeObjectURL(url);
    }

    try {
      saveData(
        analyticsMonitoringcsv,
        'poligono_monitoramento_estatisticas_by_year.csv',
        'text/csv',
      );
      console.log(analyticsMonitoringcsv);
    } finally {
      commit('setLoadingCSV', false);
    }
  },

  selectedStages(){
    let features = this.features;
    features.forEach((item) => {
      if (item.properties.no_estagio) {
        switch (value) {
          case 'CR':
            this.featureNoEstagio.cr.push(item);
            commit('setSelectedStages', item);
            break;
          case 'DG':
            this.featureNoEstagio.dg.push(item);
            commit('setSelectedStages', item);
            break;
          case 'FF':
            this.featureNoEstagio.ff.push(item);
            commit('setSelectedStages', item);
            break;
          case 'DR':
            this.featureNoEstagio.dr.push(item);
            commit('setSelectedStages', item);
            break;
        }
      }
  })},

  async downloadTableMonitoring({ commit, state, rootGetters }) {
    commit('setLoadingCSV', true);

    const params = {
      start_date: state.filters.startDate,
      end_date: state.filters.endDate,
      format: state.filters.csv,
    };

    if (state.filters.ti && state.filters.ti.length) {
      const arrayTI = [];
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      params.co_funai = arrayTI.toString();
    }

    if (state.filters.cr && state.filters.cr.length) {
      const arrayCR = [];
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      params.co_cr = arrayCR.toString();
    }

    if (state.filters.priority && state.filters.priority.length) { params.priority = state.filters.priority.toString(); }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    const tableCSVMonitoring = await this.$api.get(
      'monitoring/consolidated/table/',
      {
        params,
      },
    );

    function saveData(data, fileName, type) {
      let elementBtn; let blob; let
        url;

      elementBtn = document.createElement('a');
      elementBtn.style = 'display: none';
      document.body.appendChild(elementBtn);

      if (type !== 'text/csv') {
        data = JSON.stringify(data);
      }

      blob = new Blob([data], { type });
      url = window.URL.createObjectURL(blob);

      elementBtn.href = url;
      elementBtn.download = fileName;
      elementBtn.click();
      window.URL.revokeObjectURL(url);
    }

    try {
      saveData(
        tableCSVMonitoring,
        'poligono_monitoramento.csv',
        'text/csv',
      );
    } finally {
      commit('setLoadingCSV', false);
    }
  },

  async downloadGeoJsonMonitoring({ commit, state, rootGetters }) {
    commit('setLoadingGeoJson', true);

    const params = {
      start_date: state.filters.startDate,
      end_date: state.filters.endDate,
      format: state.filters.json,
    };

    if (state.filters.ti && state.filters.ti.length) {
      const arrayTI = [];
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      params.co_funai = arrayTI.toString();
    }

    if (state.filters.cr && state.filters.cr.length) {
      const arrayCR = [];
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      params.co_cr = arrayCR.toString();
    }

    if (state.filters.priority && state.filters.priority.length) { params.priority = state.filters.priority.toString(); }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    const GeoJson = await this.$api.get('monitoring/consolidated/', {
      params,
    });

    function saveData(data, fileName, type) {
      let elementBtn; let blob; let
        url;

      elementBtn = document.createElement('a');
      elementBtn.style = 'display: none';
      document.body.appendChild(elementBtn);

      if (type !== 'text/csv') {
        data = JSON.stringify(data);
      }

      blob = new Blob([data], { type });
      url = window.URL.createObjectURL(blob);

      elementBtn.href = url;
      elementBtn.download = fileName;
      elementBtn.click();
      window.URL.revokeObjectURL(url);
    }

    try {
      saveData(
        GeoJson.data,
        'poligono_monitoramento.json',
        'application/json',
      );
    } finally {
      commit('setLoadingGeoJson', false);
    }
  },
};


