Date.prototype.subtractDays = function(days) {
  const date = new Date(this.valueOf())
  date.setDate(date.getDate() - days)
  return date
}

Date.prototype.addDays = function(days) {
  const date = new Date(this.valueOf())
  date.setDate(date.getDate() + days)
  return date
}

Log = window.Log || {}
Log.data = {

  /**
   * Parse log data
   * @param {Object[]=} ent - Entries
   */
  parse(ent = Log.log) {
    if (!isValidArray(ent) || !isObject(ent[0])) return

    let p = []

    ent.map(({s, e, c, t, d}, i) => {
      const sCol = user.palette[c] || user.config.ui.colour
      const pCol = user.projectPalette[t] || user.config.ui.colour

      if (Log.time.date(s) !== Log.time.date(e) && !isUndefined(e)) {
        const a = Log.time.convert(s)
        const b = Log.time.convert(e)
        const ne = Log.time.toHex(
          new Date(a.getFullYear(), a.getMonth(), a.getDate(), 23, 59, 59)
        )
        const ns = Log.time.toHex(
          new Date(b.getFullYear(), b.getMonth(), b.getDate(), 0, 0, 0)
        )

        p.push({
          id: i + 1, s, e: ne, c, t, d,
          dur: Log.time.duration(s, ne), sCol, pCol
        })
        p.push({
          id: i + 1, s: ns, e, c, t, d,
          dur: Log.time.duration(ns, e), sCol, pCol
        })
      } else {
        p.push({
          id: i + 1, s, e, c, t, d,
          dur: Log.time.duration(s, e), sCol, pCol
        })
      }
    })

    return p
  },

  /**
   * Get entries by date
   * @param {Object=} d - Date
   * @returns {Object[]} Entries
   */
  getEntriesByDate(d = new Date()) {
    if (!isObject(d) || d.getTime() > new Date().getTime()) return

    let ent = []

    Log.log.map(e => {
      if (!isUndefined(e.e)) {
        const a = Log.time.convert(e.s)

        a.getFullYear() === d.getFullYear()
        && a.getMonth() === d.getMonth()
        && a.getDate() === d.getDate()
        && ent.push(e)
      }
    })

    return ent
  },

  /**
   * Get entries from a certain period
   * @param {Object} ps - Period start
   * @param {Object=} pe - Period end
   * @returns {Object[]} Entries
   */
  getEntriesByPeriod(ps, pe = new Date()) {
    if (!isObject(ps) || !isObject(pe) || ps.getTime() > pe.getTime()) return

    let ent = []

    const span = ((start, end) => {
      let dates = []
      let current = start

      while (current <= end) {
        dates.push(new Date(current))
        current = current.addDays(1)
      }

      return dates
    })(ps, pe)

    span.map(i => Log.data.getEntriesByDate(i).map(e => ent.push(e)))

    return ent
  },

  /**
   * Get entries from the last n days
   * @param {number} n - Number of days
   * @returns {Object[]} Entries
   */
  getRecentEntries(n) {
    if (!isNumber(n) || n < 1) return
    return Log.data.getEntriesByPeriod(new Date().subtractDays(n))
  },

  /**
   * Get entries of a specific day of the week
   * @param {number} d - A day of the week (0 - 6)
   * @returns {Object[]} Entries
   */
  getEntriesByDay(d, ent = Log.log) {
    if (!isNumber(d) || d < 0 || d > 6 || !isValidArray(ent)) return
    if (!isObject(ent[0])) return
    return ent.filter(({s, e}) =>
      !isUndefined(e) && Log.time.convert(s).getDay() === d
    )
  },

  /**
   * Get entries of a specific project
   * @param {string} pro - Project
   * @param {Object[]=} ent - Entries
   * @returns {Object[]} Entries
   */
  getEntriesByProject(pro, ent = Log.log) {
    if (!isString(pro) || isEmpty(pro) ||
    !isValidArray(ent) || !hasEntries(ent)) return
    return ent.filter(e => !isUndefined(e.e) && e.t === pro)
  },

  /**
   * Get entries of a specific sector
   * @param {string} sec - Sector
   * @param {Object[]=} ent - Entries
   * @returns {Object[]} Entries
   */
  getEntriesBySector(sec, ent = Log.log) {
    if (!isString(sec) || isEmpty(sec) ||
    !isValidArray(ent) || !hasEntries(ent)) return
    return ent.filter(e => !isUndefined(e.e) && e.c === sec)
  },

  /**
   * Sort entries by date
   * @param {Object[]=} ent - Entries
   * @param {Object=} end - End date
   */
  sortEntries(ent = Log.log, end = new Date()) {
    if (!isValidArray(ent) || !isObject(end) || !hasEntries(ent)) return

    const days = Log.time.listDates(Log.time.convert(ent[0].s), end)

    let list = []
    let slots = []

    days.map(e => {
      list.push(
        Log.time.date(Log.time.toHex(
          new Date(e.getFullYear(), e.getMonth(), e.getDate(), 0, 0, 0)
        ))
      )
      slots.push([])
    })

    ent.map(e => {
      const index = list.indexOf(Log.time.date(e.s))
      index > -1 && slots[index].push(e)
    })

    return slots
  },

  /**
   * Sort entries by day
   * @returns {Object[]} Entries sorted by day
   */
  sortEntriesByDay(ent = Log.log) {
    if (!isValidArray(ent) || !hasEntries(ent)) return
    let sort = []
    for (let i = 0; i < 7; i++) sort.push(Log.data.getEntriesByDay(i, ent))
    return sort
  },

  /**
   * Sort array of objects by values
   * @param {Object[]} ent - Entries
   * @param {string} mode - Sector or project
   * @param {string} hp - Hour or percentage
   * @returns {Object[]} Array of objects sorted by values
   */
  sortValues(ent, mode, hp) {
    if (!isValidArray(ent)) return

    const list = mode === 'sec' ? Log.data.listSectors(ent) : Log.data.listProjects(ent)
    let temp = []

    list.map(e => {
      temp[e] = hp === 'hours' ?
      (mode === 'sec' ? Log.data.sh(e, ent) : Log.data.ph(e, ent)) :
      (mode === 'sec' ? Log.data.sp(e, ent) : Log.data.pp(e, ent))
    })

    const sorted = Object.keys(temp).sort((a, b) => temp[a] - temp[b]).reverse()

    let sor = []

    for (let key in sorted) {
      let perc = 0

      perc = hp === 'hours' ?
      (mode === 'sec' ? Log.data.sh(sorted[key], ent) : Log.data.ph(sorted[key], ent)) :
      (mode === 'sec' ? Log.data.sp(sorted[key], ent) : Log.data.pp(sorted[key], ent))

      sor.push([sorted[key], perc])
    }

    return sor
  },

  /**
   * List projects
   * @param {Object[]=} ent - Entries
   * @returns {Object[]} List of projects
   */
  listProjects(ent = Log.log) {
    if (!isValidArray(ent)) return
    let l = []
    ent.map(({e, t}) => !isUndefined(e) && l.indexOf(t) === -1 && l.push(t))
    return l
  },

  /**
   * List sectors
   * @param {Object[]=} ent - Entries
   * @returns {Object[]} List of sectors
   */
  listSectors(ent = Log.log) {
    if (!isValidArray(ent)) return
    let l = []
    ent.map(({e, c}) => !isUndefined(e) && l.indexOf(c) === -1 && l.push(c))
    return l
  },

  /**
   * Get peak days
   * @param {Object[]=} ent - Entries
   * @returns {Object[]} Peak days
   */
  peakDays(ent = Log.log) {
    if (!isValidArray(ent)) return

    let days = Array(7).fill(0)

    ent.map(({s, e, dur}) =>
      !isUndefined(e) && (days[Log.time.convert(s).getDay()] += dur)
    )

    return days
  },

  /**
   * Get peak day
   * @param {Object[]=} pk - Peak days
   * @returns {string} Peak day
   */
  peakDay(pk = Log.cache.peakDays) {
    return !isNumArray(pk) || isEmpty(pk) ? '-' : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][pk.indexOf(Math.max(...pk))]
  },

  /**
   * Get peak hours
   * @param {Object[]=} ent - Entries
   * @returns {Object[]} Peak hours
   */
  peakHours(ent = Log.log) {
    if (!isValidArray(ent)) return

    let hours = Array(25).fill(0)

    ent.map(({s, e, dur}) => {
      if (!isUndefined(e)) {
        let index = Log.time.convert(s).getHours()
        const time = Number(dur.toFixed(2))
        const remainder = Number((time % 1).toFixed(2))
        let block = time - remainder

        hours[index] += block - (block - 1)
        index++

        while(block > 1) {
          block--
          hours[index++] += block - (block - 1)
          if (index > 24) break
        }

        hours[index++] += remainder
      }
    })

    return hours
  },

  /**
   * Get peak hour
   * @param {Object[]=} h - Peak hours
   * @returns {string} Peak hour
   */
  peakHour(h = Log.cache.peakHours) {
    return !isNumArray(h) || isEmpty(h) ? '-' : `${h.indexOf(Math.max(...h))}:00`
  },

  /**
   * List durations
   * @param {Object[]=} ent - Entries
   * @returns {Object[]} List of durations
   */
  listDurations(ent = Log.log) {
    if (!isValidArray(ent)) return
    let list = []
    ent.map(({e, dur}) => !isUndefined(e) && list.push(dur))
    return list
  },

  /**
   * Get minimum value
   * @param {Object[]} v - Values
   * @returns {number} Minimum value
   */
  min(v) {
    if (!isNumArray(v) || v === undefined) return '-'
    return isEmpty(v) ? 0 : Math.min(...v)
  },

  /**
   * Get maximum value
   * @param {Object[]} v - Values
   * @returns {number} Maximum value
   */
  max(v) {
    if (!isNumArray(v) || v === undefined) return '-'
    return isEmpty(v) ? 0 : Math.max(...v)
  },

  /**
   * Calculate average
   * @param {Object[]} v - Values
   * @returns {number} Average
   */
  avg(v) {
    if (!isNumArray(v) || isUndefined(v)) return '-'
    return isEmpty(v) ? 0 : Log.data.total(v) / v.length
  },

  total(v) {
    return isEmpty(v) || isUndefined(v) ? 0 : v.reduce((t, n) => t + n, 0)
  },

  /**
   * Calculate the total number of logged hours
   * @param {Object[]=} e - Entries
   * @returns {number} Total logged hours
   */
  lh(e = Log.log) {
    return isEmpty(e) ? 0 : Log.data.total(Log.data.listDurations(e))
  },

  /**
   * Calculate average logged hours
   * @param {Object[]=} ent - Sorted entries
   * @returns {number} Average logged hours
   */
  avgLh(ent = Log.cache.sortEntries) {
    if (isEmpty(ent)) return 0
    let h = ent.reduce((sum, current) => sum + Log.data.lh(current), 0)
    return h / ent.length
  },

  /**
   * Calculate how much of a time period was logged
   * @param {Object[]=} ent - Entries
   * @returns {number} Log percentage
   */
  lp(ent = Log.log) {
    if (isEmpty(ent)) return 0

    const e = Log.time.convert(ent[0].s)
    const d = Log.time.convert(ent.slice(-1)[0].s)
    const n = Math.ceil((
              new Date(d.getFullYear(), d.getMonth(), d.getDate()) -
              new Date(e.getFullYear(), e.getMonth(), e.getDate())
            ) / 8.64e7)

    return Log.data.lh(ent) / (24 * (n + 1)) * 100
  },

  /**
   * Calculate sector hours
   * @param {Object[]=} ent - Entries
   * @param {string} sec - Sector
   * @returns {number} Sector hours
   */
  sh(sec, ent = Log.log) {
    return isEmpty(ent) ? 0 : Log.data.lh(Log.data.getEntriesBySector(sec, ent))
  },

  /**
   * Calculate sector percentage
   * @param {Object[]=} ent - Entries
   * @param {string} sec - Sector
   * @returns {number} Sector percentage
   */
  sp(sec, ent = Log.log) {
    return isEmpty(ent) ? 0 : Log.data.sh(sec, ent) / Log.data.lh(ent) * 100
  },

  /**
   * Calculate project hours
   * @param {Object[]=} ent - Entries
   * @param {string} pro - Project
   * @returns {number} Project hours
   */
  ph(pro, ent = Log.log) {
    return isEmpty(ent) ? 0 : Log.data.lh(Log.data.getEntriesByProject(pro, ent))
  },

  /**
   * Calculate project percentage
   * @param {Object[]=} ent - Entries
   * @param {string} pro - Project
   * @returns {number} Project percentage
   */
  pp(pro, ent = Log.log) {
    return isEmpty(ent) ? 0 : Log.data.ph(pro, ent) / Log.data.lh(ent) * 100
  },

  /**
   * Calculate trend
   * @param {number} a
   * @param {number} b
   * @returns {number} Trend
   */
  trend(a, b) {
    return (a - b) / b * 100
  },

  /**
   * Calculate streak
   * @param {Object[]=} ent - Sorted entries
   * @returns {number} Streak
   */
  streak(ent = Log.cache.sortEntries) {
    if (isEmpty(ent)) return 0
    let streak = 0
    ent.map(e => {streak = e.length === 0 ? 0 : streak + 1})
    return streak
  },

  /**
   * Get an array of focus stats
   * @param {string} mode - Sector or project
   * @param {Object[]=} ent - Sorted entries
   * @returns {Object[]} Array of focus stats
   */
  listFocus(mode, ent = Log.cache.sortEntries) {
    if (!isValidArray(ent)) return

    if (mode === 'sector') {
      return ent.filter(e => {
        Log.data.sectorFocus(Log.data.listSectors(e)) !== 0
      })
    } else if (mode === 'project') {
      return ent.filter(e => {
        Log.data.projectFocus(Log.data.listProjects(e)) !== 0
      })
    } else return
  },

  /**
   * Calculate sector focus
   * @param {Object[]=} list - Sectors list
   */
  sectorFocus(list = Log.cache.sectors) {
    return list.length === 0 ? 0 : 1 / list.length
  },

  /**
   * Calculate project focus
   * @param {Object[]=} list - Projects list
   */
  projectFocus(list = Log.cache.projects) {
    return list.length === 0 ? 0 : 1 / list.length
  },

  /**
   * Calculate minimum focus
   * @param {string} mode - Sector or project
   * @param {Object[]=} ent - Sorted entries
   */
  minFocus(mode, ent = Log.cache.sortEntries) {
    return isEmpty(ent) ? 0 : Math.min(...Log.data.listFocus(mode, ent))
  },

  /**
   * Calculate maximum focus
   * @param {string} mode - Sector or project
   * @param {Object[]=} ent - Sorted entries
   */
  maxFocus(mode, ent = Log.cache.sortEntries) {
    return isEmpty(ent) ? 0 : Math.max(...Log.data.listFocus(mode, ent))
  },

  /**
   * Calculate average focus
   * @param {Object[]=} ent - Entries
   */
  focusAvg(ent = Log.log) {
    if (!isValidArray(ent)) return

    const avg = Log.data.listSectors(ent).reduce((total, num) => {
      return total + Log.data.sh(num, ent) * (Log.data.sp(num, ent) / 100)
    }, 0)

    return avg / Log.data.lh(ent)
  },

  forecast: {

    /**
     * Forecast sector focus
     * @returns {string} Sector focus
     */
    sf() {
      const ent = Log.data.getEntriesByDay(new Date().getDay())

      if (isEmpty(ent)) return '-'

      const s = Log.data.listSectors(ent)
      let sf = 0
      let sfs = ''

      s.map(e => {
        const x = Log.data.sp(e, ent)
        x > sf && (sf = x, sfs = e)
      })

      return sfs
    },

    /**
     * Forecast project focus
     * @returns {string} Project focus
     */
    pf() {
      const ent = Log.data.getEntriesByDay(new Date().getDay())

      if (isEmpty(ent)) return '-'

      const p = Log.data.listProjects(ent)
      let pf = 0
      let pfp = ''

      p.map(e => {
        const x = Log.data.pp(e, ent)
        x > pf && (pf = x, pfp = e)
      })

      return pfp
    },

    /**
     * Forecast peak time
     * @returns {string} Peak time
     */
    pt() {
      return Log.data.peakHour(Log.data.peakHours(Log.data.getEntriesByDay(new Date().getDay())))
    },

    /**
     * Forecast log hours
     * @returns {number} Log hours
     */
    lh() {
      return Log.data.avg(Log.data.listDurations(Log.data.getEntriesByDay(new Date().getDay()))) * 10
    },

    /**
     * Forecast session duration
     * @returns {number} Session duration
     */
    sd() {
      const ent = Log.data.getEntriesByDay(new Date().getDay())
      if (isEmpty(ent)) return 0
      return Log.data.avg(Log.data.listDurations(ent))
    }
  },

  /**
   * Generate data for bar chart
   * @param {Object[]=} ent - Entries
   * @param {string=} mode - Sector or project
   * @returns {Object[]} Bar chart data
   */
  bar(ent = Log.log, mode = Log.config.ui.colourMode) {
    if (!isValidArray(ent) || isEmpty(ent)) return

    let data = []
    let lw = 0

    const addEntry = ({s, e, sCol, pCol, dur}, i) => {
      const wh = (Log.time.parse(e) - Log.time.parse(s)) / 86400 * 100
      const col = mode === 'sector' ? sCol :
      mode === 'project' ? pCol :
      mode === 'none' && Log.config.ui.colour

      data[i].push({wh, col, pos: lw})

      lw += wh
    }

    Log.data.sortEntries(ent).map((e, i) => {
      data.push([])
      if (!isEmpty(e)) {
        e.map((o, m) => {
          if (!isUndefined(o.e)) {
            m === 0 && (lw = 0)
            addEntry(e[m], i)
          }
        })
      }
    })

    return data
  },

  /**
   * Generate data for line visualisation
   * @param {Object[]=} ent - Entries
   * @param {string=} mode - Sector or project
   * @returns {Object[]} Line visualisation data
   */
  line(ent = Log.log, mode = Log.config.ui.colourMode) {
    if (!isValidArray(ent) || isEmpty(ent)) return

    let data = []
    let lp = 0

    const addEntry = ({s, e, c, t, dur, sCol, pCol}, i) => {
      const wd = dur * 3600 / 86400 * 100
      const dp = Log.utils.calcDP(s)
      const col = mode === 'sector' ? sCol :
                  mode === 'project' ? pCol :
                  mode === 'none' && Log.config.ui.colour

      data[i].push({wd, mg: dp - lp, col})

      lp = wd + dp
    }

    const sort = Log.data.sortEntries(ent)

    Log.data.sortEntries(ent).map((e, i) => {
      data.push([])
      if (!isEmpty(e)) {
        e.map((o, m) => {
          if (!isUndefined(o.e)) {
            m === 0 && (lp = 0)
            addEntry(e[m], i)
          }
        })
      }
    })

    return data
  }
}
