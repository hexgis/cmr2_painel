import axios from 'axios'
// Date=2023-06-21
export const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${year}-${month}-${day}`
}

const normalizeObjectKeys = (obj) => {
    const normalizedObj = {}
    Object.keys(obj).forEach((key) => {
        const normalizedKey = key.toUpperCase().trim()
        normalizedObj[normalizedKey] = (normalizedObj[normalizedKey] || 0) + obj[key]
    })
    return normalizedObj
}

const processResponseData = (response) => {
    const datesSet = new Set()
    const dateCounts = {}
    const typeDeviceCounts = {}
    const browserCounts = {}
    const geocodedLocations = response.data.map((item) => ({
        city: item.location,
        lat: item.latitude,
        lng: item.longitude,
    }))

    response.data.forEach((item) => {
        if (item.last_date_login) {
            datesSet.add(item.last_date_login)
            dateCounts[item.last_date_login] = (dateCounts[item.last_date_login] || 0) + 1
        }

        if (item.type_device) {
            const normalizedDevice = item.type_device.toUpperCase().trim()
            typeDeviceCounts[normalizedDevice] = (typeDeviceCounts[normalizedDevice] || 0) + 1
        }

        if (item.browser) {
            const normalizedBrowser = item.browser.toUpperCase().trim()
            browserCounts[normalizedBrowser] = (browserCounts[normalizedBrowser] || 0) + 1
        }
    })

    const consolidatedBrowserCounts = {}
    const predefinedBrowsers = ['CHROME', 'FIREFOX', 'EDGE', 'SAFARI']
    let otherCount = 0

    Object.entries(browserCounts).forEach(([browser, count]) => {
        if (predefinedBrowsers.includes(browser)) {
            consolidatedBrowserCounts[browser] = count
        } else {
            otherCount += count
        }
    })

    if (otherCount > 0) {
        consolidatedBrowserCounts['OUTROS'] = otherCount
    }

    return {
        datesSet,
        dateCounts,
        typeDeviceCounts,
        consolidatedBrowserCounts,
        geocodedLocations,
    }
}

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
    totalViewPerYears: []
})

export const mutations = {
    setDataChart(state, data) {
        state.acessData = data
        state.location = data.location || []
    },
    setDates(state, dates) {
        state.dates = dates
    },
    setDateCounts(state, counts) {
        state.dateCounts = counts
    },
    setTypeDeviceCounts(state, counts) {
        state.typeDeviceCounts = normalizeObjectKeys(counts)
    },
    setBrowserCounts(state, counts) {
        state.browserCounts = normalizeObjectKeys(counts)
    },
    setLocation(state, locations) {
        state.location = locations
    },
    setTodayAndWeekAgoDates(state, dates) {
        state.todayDate = dates.today
        state.weekAgoDate = dates.weekAgo
    },
    setMonthlyCounts(state, data) {
      state.monthlyData.push(data)
  },
  setTotalViewYears(state, data) {
    state.totalViewPerYears.push(data)
  }
}

export const actions = {
    async dataChart({ commit, state, dispatch }, data) {
        await dispatch('captureDates')
        const [startDate, endDate, location, typeDevice, browser] = [
          data.startDate ? data.startDate : state.weekAgoDate || '',
          data.endDate || state.todayDate || '',
          data.location || '',
          data.typeDevice || '',
          data.browser || '',
        ]

        await dispatch('getTotalViewsPerYear', startDate, endDate)
        try {
            const response = await this.$api.$get(
                `dashboard/get-all/?startDate=${startDate}&endDate=${endDate}&location=${location}&type_device=${typeDevice}&browser=${browser}`
            )

            if (response) {
                commit('setDataChart', response)
                const processedData = processResponseData(response)

                commit('setLocation', processedData.geocodedLocations)
                commit(
                    'setDates',
                    Array.from(processedData.datesSet).sort((a, b) => {
                        const [dayA, monthA, yearA] = a.split('/').map(Number)
                        const [dayB, monthB, yearB] = b.split('/').map(Number)
                        return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB)
                    })
                )
                commit('setDateCounts', processedData.dateCounts)
                commit('setTypeDeviceCounts', processedData.typeDeviceCounts)
                commit('setBrowserCounts', processedData.consolidatedBrowserCounts)

                const totalDevices = Object.values(processedData.typeDeviceCounts).reduce(
                    (acc, count) => acc + count,
                    0
                )
                const percentageDeviceCounts = {}
                for (const [key, value] of Object.entries(processedData.typeDeviceCounts)) {
                    percentageDeviceCounts[key] = Math.round((value / totalDevices) * 100)
                }
                commit('setTypeDeviceCounts', percentageDeviceCounts)

                const totalBrowsers = Object.values(processedData.consolidatedBrowserCounts).reduce(
                    (acc, count) => acc + count,
                    0
                )
                const percentageBrowserCounts = {}
                for (const [key, value] of Object.entries(
                    processedData.consolidatedBrowserCounts
                )) {
                    percentageBrowserCounts[key] = Math.round((value / totalBrowsers) * 100)
                }
                commit('setBrowserCounts', percentageBrowserCounts)

                const monthlyData = []
                response.monthly_counts.forEach((item) => {
                    monthlyData.push(item)
                })
                commit('setMonthlyCounts', monthlyData)
            }
        } catch (error) {
            this.$store.commit('alert/addAlert', {
                message: this.$t('error'),
            })
            console.error('Failed to fetch data:', error)
        }
    },

    async getTotalViewsPerYear({ commit }, startDate, endDate) {
        try {
            const response = await this.$api.$get(
                `dashboard/get-year/?startDate=${startDate}&endDate=${endDate || ''}`
            )

            if (response) {
              commit('setTotalViewYears', response)
            }
        } catch (error) {
            this.$store.commit('alert/addAlert', {
                message: this.$i18n.t('default-error'),
            })
            console.error('Failed to fetch data:', error)
        }
    },

    captureDates({ commit }) {
        const today = new Date()
        const weekAgo = new Date(today)
        weekAgo.setDate(today.getDate() - 7)

        const dates = {
            today: formatDate(today),
            weekAgo: formatDate(weekAgo),
        }
        commit('setTodayAndWeekAgoDates', dates)
    },
}

export const getters = {
    getDataChart(state) {
        return state.acessData
    },
    getDates(state) {
        return state.dates
    },
    getDateCounts(state) {
        return state.dateCounts
    },
    getTypeDeviceCounts(state) {
        return state.typeDeviceCounts
    },
    getBrowserCounts(state) {
        return state.browserCounts
    },
    getLocations(state) {
        return state.location
    },
    getTodayDate(state) {
        return state.todayDate
    },
    getWeekAgoDate(state) {
        return state.weekAgoDate
    },
    getMonthlyCounts(state) {
      return state.monthlyData
    },
    getTotalViewsPerYear(state) {
      return state.totalViewPerYears
    }
}
