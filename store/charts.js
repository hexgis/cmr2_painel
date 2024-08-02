export const state = () => ({
    acessData: {},
    dates: [],
    dateCounts: {},
    typeDeviceCounts: {},
    browserCounts: {},
})
const normalizeKey = (key) => key.toUpperCase().trim()

const normalizeObjectKeys = (obj) => {
    const normalizedObj = {}
    Object.keys(obj).forEach((key) => {
        const normalizedKey = normalizeKey(key)
        if (normalizedObj[normalizedKey]) {
            normalizedObj[normalizedKey] += obj[key]
        } else {
            normalizedObj[normalizedKey] = obj[key]
        }
    })
    return normalizedObj
}

export const mutations = {
    setDataChart(state, data) {
        state.acessData = data
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
}

export const actions = {
    async dataChart({ commit }, data) {
        const [startDate, endDate, location, typeDevice, browser] = [
            data.startDate || '',
            data.endDate || '',
            data.location || '',
            data.typeDevice || '',
            data.browser || '',
        ]

        try {
            const response = await this.$api.$get(
                `dashboard/get-all/?startDate=${startDate}&endDate=${endDate}&location=${location}&type_device=${typeDevice}&browser=${browser}`
            )
            console.log(response)
            if (response) {
                commit('setDataChart', response)
            }

            const datesSet = new Set()
            const dateCounts = {}
            const typeDeviceCounts = {}
            const browserCounts = {}

            response.data.forEach((item) => {
                if (item.last_date_login) {
                    datesSet.add(item.last_date_login)
                    if (dateCounts[item.last_date_login]) {
                        dateCounts[item.last_date_login]++
                    } else {
                        dateCounts[item.last_date_login] = 1
                    }
                }

                if (item.type_device) {
                    const normalizedDevice = normalizeKey(item.type_device)
                    if (typeDeviceCounts[normalizedDevice]) {
                        typeDeviceCounts[normalizedDevice]++
                    } else {
                        typeDeviceCounts[normalizedDevice] = 1
                    }
                }

                if (item.browser) {
                    const normalizedBrowser = normalizeKey(item.browser)
                    if (browserCounts[normalizedBrowser]) {
                        browserCounts[normalizedBrowser]++
                    } else {
                        browserCounts[normalizedBrowser] = 1
                    }
                }
            })

            const sortedDates = Array.from(datesSet).sort((a, b) => {
                const [dayA, monthA, yearA] = a.split('/').map(Number)
                const [dayB, monthB, yearB] = b.split('/').map(Number)
                return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB)
            })

            commit('setDates', sortedDates)
            commit('setDateCounts', dateCounts)
            commit('setTypeDeviceCounts', typeDeviceCounts);
            commit('setBrowserCounts', browserCounts);

            const totalDevices = Object.values(typeDeviceCounts).reduce((acc, count) => acc + count, 0);
            const percentageDeviceCounts = {};
            for (const [key, value] of Object.entries(typeDeviceCounts)) {
                percentageDeviceCounts[key] = (value / totalDevices * 100).toFixed(2);
            }
            commit('setTypeDeviceCounts', percentageDeviceCounts);

            const totalBrowsers = Object.values(browserCounts).reduce((acc, count) => acc + count, 0);
            const percentageBrowserCounts = {};
            for (const [key, value] of Object.entries(browserCounts)) {
                percentageBrowserCounts[key] = (value / totalBrowsers * 100).toFixed(2);
            }
            commit('setBrowserCounts', percentageBrowserCounts);


            commit('setTypeDeviceCounts', typeDeviceCounts)
            commit('setBrowserCounts', browserCounts)
        } catch (error) {
            this.$store.commit('alert/addAlert', {
                message: this.$t('detail-api-error'),
            })
            console.error('Failed to fetch data:', error)
        }
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
}
