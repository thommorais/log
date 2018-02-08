Date.prototype.addDays = function(n) {
  const d = new Date(this.valueOf())
  d.setDate(d.getDate() + n)
  return d
}

const days = 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' ')

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
        p[p.length] = {
          id: i, s, e: ne, c, t, d, dur: Log.time.duration(s, ne), sCol, pCol
        }
        p[p.length] = {
          id: i, s: ns, e, c, t, d, dur: Log.time.duration(ns, e), sCol, pCol
        }
      } else {
        p[p.length] = {
          id: i++, s, e, c, t, d, dur: Log.time.duration(s, e), sCol, pCol
        }
      }
    })

    return p
  },

  /**
   * Get entries by date
   * @param {Object=} d - Date
   * @returns {Object[]} Entries
   */
  entriesByDate(d = new Date()) {
    if (!isObject(d) || d.getTime() > new Date().getTime()) return

    let ent = []

    const com = (a, b) => (
      a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate()
    )

    Log.log.map(e => {
      isUndefined(e.e) || com(Log.time.convert(e.s), d) && (ent[ent.length] = e)
    })

    return ent
  },

  entByDate(d = new Date()) {
    if (!isObject(d) || d.getTime() > new Date().getTime()) return

    let ent = []

    const com = (a, b) => (
      a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate()
    )

    Log.log.map(({s, e, id}) => {
      isUndefined(e) || com(Log.time.convert(s), d) && (ent[ent.length] = id)
    })

    return ent
  },

  /**
   * Get entries from a certain period
   * @param {Object} ps - Period start
   * @param {Object=} pe - Period end
   * @returns {Object[]} Entries
   */
  entriesByPeriod(ps, pe = new Date()) {
    if (!isObject(ps) || !isObject(pe) || ps.getTime() > pe.getTime()) return

    let ent = []

    const span = ((start, end) => {
      for (var dates = [], current = start; current <= end;) {
        dates[dates.length] = new Date(current)
        current = current.addDays(1)
      }
      return dates
    })(ps, pe)

    span.map(i => Log.data.entriesByDate(i).map(e => (ent[ent.length] = e)))

    return ent
  },

  /**
   * Get entries from the last n days
   * @param {number} n - Number of days
   * @returns {Object[]} Entries
   */
  recentEntries(n) {
    if (!isNumber(n) || n < 1) return
    return Log.data.entriesByPeriod(new Date().addDays(-n))
  },

  /**
   * Get entries of a specific day of the week
   * @param {number} d - A day of the week (0 - 6)
   * @returns {Object[]} Entries
   */
  entriesByDay(d, ent = Log.log) {
    if (!isNumber(d) || d < 0 || d > 6 || !isValidArray(ent)) return
    if (!isObject(ent[0])) return
    return ent.filter(({s, e}) =>
      !isUndefined(e) && Log.time.convert(s).getDay() === d
    )
  },

  /**
   * Get entries of a specific project
   * @param {string} p - Project
   * @param {Object[]=} a - Entries
   * @returns {Object[]} Entries
   */
  entriesByProject(p, a = Log.log) {
    if (!isString(p) || isEmpty(p) || !isValidArray(a) || !hasEntries(a)) return
    return a.filter(e => !isUndefined(e.e) && e.t === p)
  },

  /**
   * Get entries of a specific sector
   * @param {string} s - Sector
   * @param {Object[]=} a - Entries
   * @returns {Object[]} Entries
   */
  entriesBySector(s, a = Log.log) {
    if (!isString(s) || isEmpty(s) || !isValidArray(a) || !hasEntries(a)) return
    return a.filter(e => !isUndefined(e.e) && e.c === s)
  },

  /**
   * Sort entries by date
   * @param {Object[]=} ent - Entries
   * @param {Object=} end - End date
   */
  sortEntries(ent = Log.log, end = new Date()) {
    if (!isValidArray(ent) || !isObject(end) || !hasEntries(ent)) return

    let list = []
    let sorted = []

    Log.time.listDates(Log.time.convert(ent[0].s), end).map(e => {
      list[list.length] = Log.time.date(Log.time.toHex(
        new Date(e.getFullYear(), e.getMonth(), e.getDate(), 0, 0, 0)
      ))
      sorted[sorted.length] = []
    })

    ent.map(e => {
      const x = list.indexOf(Log.time.date(e.s))
      x > -1 && (sorted[x][sorted[x].length] = e)
    })

    return sorted
  },

  /**
   * Sort entries by day
   * @param {Object[]=} a - Entries
   * @returns {Object[]} Entries sorted by day
   */
  sortEntriesByDay(a = Log.log) {
    if (!isValidArray(a) || !hasEntries(a)) return
    let s = []
    for (let i = 0; i < 7; i++)
      s[s.length] = Log.data.entriesByDay(i, a)
    return s
  },

  sortEntByDay(a = Log.log) {
    if (!isValidArray(a) || !hasEntries(a)) return
    let s = []
    for (let i = 0; i < 7; i++)
      s[s.length] = Log.data.entByDay(i, a)
    return s
  },

  /**
   * Sort array of objects by values
   * @param {Object[]} ent - Entries
   * @param {string} mod - Sector or project
   * @param {string} hp - Hour or percentage
   * @returns {Object[]} Array of objects sorted by values
   */
  sortValues(ent, mod, hp) {
    if (!isValidArray(ent)) return

    const list = mod === 'sec' ? Log.data.listSec(ent) : Log.data.listPro(ent)
    let temp = []

    list.map(e =>
      temp[e] = hp === 'hours' ?
        (mod === 'sec' ? Log.data.sh(e, ent) : Log.data.ph(e, ent)) :
        (mod === 'sec' ? Log.data.sp(e, ent) : Log.data.pp(e, ent))
    )

    const sorted = Object.keys(temp).sort((a, b) => temp[a] - temp[b]).reverse()

    let sor = []

    for (let key in sorted) {
      let perc = 0

      perc = hp === 'hours' ?
      (mod === 'sec' ? Log.data.sh(sorted[key], ent) : Log.data.ph(sorted[key], ent)) :
      (mod === 'sec' ? Log.data.sp(sorted[key], ent) : Log.data.pp(sorted[key], ent))

      sor[sor.length] = [sorted[key], perc]
    }

    return sor
  },

  /**
   * List projects
   * @param {Object[]=} a - Entries
   * @returns {Object[]} List of projects
   */
  listPro(a = Log.log) {
    if (!isValidArray(a)) return
    let l = []
    a.map(({e, t}) => !isUndefined(e) && l.indexOf(t) === -1 && (l[l.length] = t))
    return l
  },

  /**
   * List sectors
   * @param {Object[]=} ent - Entries
   * @returns {Object[]} List of sectors
   */
  listSec(a = Log.log) {
    if (!isValidArray(a)) return
    let l = []
    a.map(({e, c}) => !isUndefined(e) && l.indexOf(c) === -1 && (l[l.length] = c))
    return l
  },

  /**
   * Get peak days
   * @param {Object[]=} a - Entries
   * @returns {Object[]} Peak days
   */
  peakDays(a = Log.log) {
    if (!isValidArray(a)) return
    let d = Array(7).fill(0)
    a.map(({s, e, dur}) =>
      !isUndefined(e) && (d[Log.time.convert(s).getDay()] += dur)
    )
    return d
  },

  /**
   * Get peak day
   * @param {Object[]=} p - Peak days
   * @returns {string} Peak day
   */
  peakDay(p = Log.cache.peakDays) {
    return !isNumArray(p) || isEmpty(p) ? '-' : days[p.indexOf(Math.max(...p))]
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
        const time = dur
        const remainder = time % 1
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
   * @param {Object[]=} a - Entries
   * @returns {Object[]} List of durations
   */
  listDurations(a = Log.log) {
    if (!isValidArray(a)) return
    let l = []
    a.map(({e, dur}) => !isUndefined(e) && (l[l.length] = dur))
    return l
  },

  /**
   * Get minimum value
   * @param {Object[]} v - Values
   * @returns {number} Minimum value
   */
  min(v) {
    return !isNumArray(v) || isUndefined(v) ?
    '-' : isEmpty(v) ? 0 : Math.min(...v)
  },

  /**
   * Get maximum value
   * @param {Object[]} v - Values
   * @returns {number} Maximum value
   */
  max(v) {
    return !isNumArray(v) || isUndefined(v) ?
    '-' : isEmpty(v) ? 0 : Math.max(...v)
  },

  /**
   * Calculate average
   * @param {Object[]} v - Values
   * @returns {number} Average
   */
  avg(v) {
    return !isNumArray(v) || isUndefined(v) ? '-'
    : isEmpty(v) ? 0 : Log.data.total(v) / v.length
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
   * @param {Object[]=} e - Sorted entries
   * @returns {number} Average logged hours
   */
  avgLh(e = Log.cache.sortEntries) {
    return isEmpty(e) ? 0 : e.reduce((s, c) => s + Log.data.lh(c),0) / e.length
  },

  /**
   * Calculate how much of a time period was logged
   * @param {Object[]=} a - Entries
   * @returns {number} Log percentage
   */
  lp(a = Log.log) {
    if (isEmpty(a)) return 0

    const e = Log.time.convert(a[0].s)
    const d = Log.time.convert(a.slice(-1)[0].s)
    const n = Math.ceil((
      new Date(d.getFullYear(), d.getMonth(), d.getDate()) -
      new Date(e.getFullYear(), e.getMonth(), e.getDate())
    ) / 864E5)

    return Log.data.lh(a) / (24 * (n + 1)) * 100
  },

  /**
   * Calculate sector hours
   * @param {string} s - Sector
   * @param {Object[]=} e - Entries
   * @returns {number} Sector hours
   */
  sh(s, e = Log.log) {
    return isEmpty(e) ? 0 : Log.data.lh(Log.data.entriesBySector(s, e))
  },

  /**
   * Calculate sector percentage
   * @param {string} s - Sector
   * @param {Object[]=} e - Entries
   * @returns {number} Sector percentage
   */
  sp(s, e = Log.log) {
    return isEmpty(e) ? 0 : Log.data.sh(s, e) / Log.data.lh(e) * 100
  },

  /**
   * Calculate project hours
   * @param {string} p - Project
   * @param {Object[]=} e - Entries
   * @returns {number} Project hours
   */
  ph(p, e = Log.log) {
    return isEmpty(e) ? 0 : Log.data.lh(Log.data.entriesByProject(p, e))
  },

  /**
   * Calculate project percentage
   * @param {string} p - Project
   * @param {Object[]=} e - Entries
   * @returns {number} Project percentage
   */
  pp(p, e = Log.log) {
    return isEmpty(e) ? 0 : Log.data.ph(p, e) / Log.data.lh(e) * 100
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
   * @param {Object[]=} a - Sorted entries
   * @returns {number} Streak
   */
  streak(a = Log.cache.sortEntries) {
    let s = 0
    if (isEmpty(a)) return s
    a.map(e => s = e.length === 0 ? 0 : s + 1)
    return s
  },

  /**
   * Get an array of focus stats
   * @param {string} m - Sector or project
   * @param {Object[]=} s - Sorted entries
   * @returns {Object[]} Array of focus stats
   */
  listFocus(m, s = Log.cache.sortEntries) {
    if (!isValidArray(s)) return
    let l = []
    if (m === 'sector')
      s.map(e => {
        l[l.length] = Log.data.secFocus(Log.data.listSec(e))
      })
    if (m === 'project')
      s.map(e => {
        l[l.length] = Log.data.proFocus(Log.data.listPro(e))
      })
    return l
  },

  /**
   * Calculate sector focus
   * @param {Object[]=} l - Sectors list
   * @returns {number} Sector focus
   */
  secFocus(l = Log.cache.sectors) {
    return l.length === 0 ? 0 : 1 / l.length
  },

  /**
   * Calculate project focus
   * @param {Object[]=} list - Projects list
   * @returns {number} Project focus
   */
  proFocus(l = Log.cache.projects) {
    return l.length === 0 ? 0 : 1 / l.length
  },

  forecast: {

    /**
     * Forecast sector focus
     * @returns {string} Sector focus
     */
    sf() {
      const ent = Log.cache.entriesByDay

      if (isEmpty(ent)) return '-'

      let a = 0
      let b = ''

      Log.data.listSec(ent).map(e => {
        const x = Log.data.sp(e, ent)
        x > a && (a = x, b = e)
      })

      return b
    },

    /**
     * Forecast peak time
     * @returns {string} Peak time
     */
    pt() {
      return Log.data.peakHour(
        Log.data.peakHours(Log.cache.entriesByDay)
      )
    },

    /**
     * Forecast log hours
     * @returns {number} Log hours
     */
    lh() {
      return Log.data.avg(
        Log.data.listDurations(Log.cache.entriesByDay)
      ) * 10
    },

    /**
     * Forecast session duration
     * @returns {number} Session duration
     */
    sd() {
      const e = Log.cache.entriesByDay
      if (isEmpty(e)) return 0
      return Log.data.avg(Log.data.listDurations(e))
    }
  },

  /**
   * Generate data for bar chart
   * @param {Object[]=} ent - Entries
   * @param {string=} mod - Sector or project
   * @returns {Object[]} Bar chart data
   */
  bar(ent = Log.log, mod = Log.config.ui.colourMode) {
    if (!isValidArray(ent) || isEmpty(ent)) return

    let data = []
    let lw = 0

    const add = ({s, e, sCol, pCol, dur}, i) => {
      const wh = (Log.time.parse(e) - Log.time.parse(s)) / 86400 * 100
      data[i][data[i].length] = {
        wh,
        col: mod === 'sector' ? sCol :
          mod === 'project' ? pCol :
          mod === 'none' && Log.config.ui.colour,
        pos: lw}
      lw += wh
    }

    Log.data.sortEntries(ent).map((a, b) => {
      data[b] = []
      isEmpty(a) || a.map(({e}, c) =>
        isUndefined(e) || (c === 0 && (lw = 0), add(a[c], b))
      )
    })

    return data
  },

  /**
   * Generate data for line visualisation
   * @param {Object[]=} ent - Entries
   * @param {string=} mod - Sector or project
   * @returns {Object[]} Line visualisation data
   */
  line(ent = Log.log, mod = Log.config.ui.colourMode) {
    if (!isValidArray(ent) || isEmpty(ent)) return

    let data = []
    let lp = 0

    const add = ({s, dur, sCol, pCol}, i) => {
      const wd = dur * 3600 / 86400 * 100
      const dp = Log.utils.calcDP(s)
      data[i][data[i].length] = {
        wd,
        mg: dp - lp,
        col: mod === 'sector' ? sCol :
          mod === 'project' ? pCol :
          mod === 'none' && Log.config.ui.colour
      }
      lp = wd + dp
    }

    Log.data.sortEntries(ent).map((a, b) => {
      data[b] = []
      isEmpty(a) || a.map(({e}, c) =>
        isUndefined(e) || (c === 0 && (lp = 0), add(a[c], b))
      )
    })

    return data
  }
}
