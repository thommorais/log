Log = window.Log || {}
Log.data = {

  /**
   * Parse log data
   * @param {Object=} a - Log data
   */

  parse(a = Log.log) {
    let p = []

    for (let i = 0, l = a.length; i < l; i++) {
      let e = a[i]
      let es = Log.time.parse(e.s)
      let ee = Log.time.parse(e.e)
      let date = Log.time.date(es)
      let end = Log.time.date(ee)

      if (date !== end && e.e !== 'undefined') {
        let a = Log.time.convert(es)
        let ea = Log.time.convert(ee)

        p.push({
          s: e.s,
          e: Log.time.toHex(new Date(a.getFullYear(), a.getMonth(), a.getDate(), 23, 59, 59)),
          c: e.c,
          t: e.t,
          d: e.d
        })

        p.push({
          s: Log.time.toHex(new Date(ea.getFullYear(), ea.getMonth(), ea.getDate(), 0, 0, 0)),
          e: e.e,
          c: e.c,
          t: e.t,
          d: e.d
        })

      } else {
        p.push(e)
      }
    }

    return p
  },

  /**
   * Get entries
   * @param {Object} d - A date
   * @returns {Object[]} Log entries
   */

  getEntries(d) {
    let e = []

    if (d === undefined) {
      return Log.log
    } else {
      for (let i = 0, l = Log.log.length; i < l; i++) {
        if (Log.log[i].e === 'undefined') continue

        let a = Log.time.convert(Log.time.parse(Log.log[i].s))

        a.getFullYear() === d.getFullYear()
        && a.getMonth() === d.getMonth()
        && a.getDate() === d.getDate()
        && e.push(Log.log[i])
      }

      return e
    }
  },

  /**
   * Get entries from a certain period
   * @param {Object} ps - Period start
   * @param {Object} pe - Period end
   * @returns {Object[]} - Log entries
   */

  getEntriesByPeriod(ps, pe = new Date()) {
    Date.prototype.addDays = function(days) {
      let date = new Date(this.valueOf())
      date.setDate(date.getDate() + days)
      return date
    }

    let getDates = (startDate, stopDate) => {
      let dateArray = []
      let currentDate = startDate

      while (currentDate <= stopDate) {
        dateArray.push(new Date(currentDate))
        currentDate = currentDate.addDays(1)
      }

      return dateArray
    }

    let span = getDates(ps, pe)
    let ent = []

    for (let i = 0, l = span.length; i < l; i++) {
      let a = Log.data.getEntries(span[i])
      for (let o = 0, ol = a.length; o < ol; o++) ent.push(a[o])
    }

    return ent
  },

  /**
   * Get entries from the last n days
   * @param {number} n - The number of days
   * @returns {Object[]} Log entries
   */

  getRecentEntries(n) {
    Date.prototype.subtractDays = function(days) {
      let date = new Date(this.valueOf())
      date.setDate(date.getDate() - days)
      return date
    }

    return Log.data.getEntriesByPeriod((new Date()).subtractDays(n))
  },

  /**
   * Get entries of a specific day of the week
   * @param {number} d - A day of the week (0 - 6)
   * @returns {Object[]} Log entries
   */

  getEntriesByDay(d) {
    let e = []
    let g = ({s}) => Log.time.convert(Log.time.parse(s)).getDay()

    for (let i = 0, l = Log.log.length; i < l; i++) {
      Log.log[i].e !== 'undefined' && g(Log.log[i]) == d && e.push(Log.log[i])
    }

    return e
  },

  /**
   * Get entries of a specific project
   * @param {string} p - A project
   * @param {Object[]} ent - Entries
   * @returns {Object[]} Log entries
   */

  getEntriesByProject(p, ent = Log.log) {
    let e = []

    for (let i = 0, l = ent.length; i < l; i++) {
      ent[i].e !== 'undefined'
      && ent[i].t === p
      && e.push(ent[i])
    }

    return e
  },

  /**
   * Get entries of a specific sector
   * @param {string} s - A sector
   * @param {Object[]} ent - Entries
   * @returns {Object[]} Log entries
   */

  getEntriesBySector(s, ent = Log.log) {
    let e = []

    for (let i = 0, l = ent.length; i < l; i++) {
      ent[i].e !== 'undefined'
      && ent[i].c === s
      && e.push(ent[i])
    }

    return e
  },

  /**
   * List projects
   * @param {Object[]=} a - Log entries
   * @returns {Object[]} A list of projects
   */

  listProjects(a = Log.log) {
    let p = []

    let check = ({e, t}) => {
      e !== 'undefined'
      && p.indexOf(t) === -1
      && p.push(t)
    }

    for (let i = 0, l = a.length; i < l; i++) {
      check(a[i])
    }

    return p
  },

  /**
   * List sectors
   * @param {Object[]=} ent - Log entries
   * @returns {Object[]} A list of sectors
   */

  listSectors(ent = Log.log) {
    let l = []

    let check = ({e, c}) => {
      e !== 'undefined'
      && l.indexOf(c) === -1
      && l.push(c)
    }

    for (let i = 0, l = ent.length; i < l; i++) {
      check(ent[i])
    }

    return l
  },

  /**
   * Get peak days
   * @param {Object[]=} a - Log entries
   * @returns {Object[]} Peak days
   */

  peakDays(a = Log.log) {
    let d = new Array(7).fill(0)
    let count = ({s}) => d[(Log.time.convert(Log.time.parse(s))).getDay()]++

    for (let i = 0, l = a.length; i < l; i++) {
      a[i].e !== 'undefined' && count(a[i])
    }

    return d
  },

  /**
   * Get peak day
   * @param {Object[]=} a - Entries
   * @returns {string} Peak day
   */

  peakDay(a = Log.log) {
    let eph = Log.data.peakDays(a)
    let mph = 0
    let mpht = 0

    for (let i = 0, l = eph.length; i < l; i++) {
      eph[i] > mph && (mph = eph[i], mpht = i)
    }

    console.log(mpht)

    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][mpht]
  },

  /**
   * Get peak hours
   * @param {Object[]=} a - Log entries
   * @returns {Object[]} Peak hours
   */

  peakHours(a = Log.log) {
    let h = new Array(24).fill(0)
    let count = ({s}) => h[(Log.time.convert(Log.time.parse(s))).getHours()]++

    for (let i = 0, l = a.length; i < l; i++) {
      a[i].e !== 'undefined' && count(a[i])
    }

    return h
  },

  /**
   * Get peak hour
   * @param {Object[]=} a - Entries
   * @returns {string} Peak hour
   */

  peakHour(a = Log.log) {
    let eph = Log.data.peakHours(a)
    let mph = 0
    let mpht = 0

    for (let i = 0, l = eph.length; i < l; i++) {
      eph[i] > mph && (mph = eph[i], mpht = i)
    }

    return `${mpht}:00`
  },

  /**
   * Calculate shortest log session
   * @param {Object[]=} a - Log entries
   * @returns {number} Shortest log session
   */

  lsmin(a = Log.log) {
    if (a.length === 0) return 0

    let m

    let check = ({s, e}) => {
      let n = Log.time.duration(Log.time.parse(s), Log.time.parse(e))
      if (n < m || m == undefined) m = n
    }

    for (let i = 0, l = a.length; i < l; i++) {
      check(a[i])
    }

    return m
  },

  /**
   * Calculate longest log session
   * @param {Object[]=} ent - Log entries
   * @returns {number} Longest log session
   */

  lsmax(ent = Log.log) {
    if (ent.length === 0) return 0

    let m = 0

    let c = ({s, e}) => {
      let n = Number(Log.time.duration(Log.time.parse(s), Log.time.parse(e)))
      if (n > m) m = n
    }

    for (let i = 0, l = ent.length; i < l; i++) {
      c(ent[i])
    }

    return m
  },

  /**
   * Calculate average session duration (ASD)
   * @param {Object[]=} ent - Log entries
   * @returns {number} Average session duration
   */

  asd(ent = Log.log) {
    if (ent.length === 0) return 0

    let avg = 0
    let c = 0

    let count = ({s, e}) => {
      avg += Number(Log.time.duration(Log.time.parse(s), Log.time.parse(e)))
      c++
    }

    for (let i = 0, l = ent.length; i < l; i++) {
      ent[i].e !== 'undefined' && count(ent[i])
    }

    return avg / c
  },

  /**
   * Calculate the total number of logged hours
   * @param {Object[]=} ent - Log entries
   * @returns {number} Total logged hours
   */

  lh(ent = Log.log) {
    if (ent.length === 0) return 0

    let h = 0

    let count = ({s, e}) => {
      h += Number(Log.time.duration(Log.time.parse(s), Log.time.parse(e)))
    }

    for (let i = 0, l = ent.length; i < l; i++) {
      ent[i].e !== 'undefined' && count(ent[i])
    }

    return h
  },

  /**
   * Calculate how much of a time period was logged
   * @param {Object[]=} ent - Log entries
   * @returns {number} Log percentage
   */

  lp(ent = Log.log) {
    if (ent.length === 0) return 0

    let e = Log.time.convert(Log.time.parse(ent[0].s))
    let d = Log.time.convert(Log.time.parse(ent[ent.length - 1].s))
    let h = Number(Log.data.lh(ent))
    let n = Math.ceil((
          new Date(d.getFullYear(), d.getMonth(), d.getDate()) -
          new Date(e.getFullYear(), e.getMonth(), e.getDate())
        ) / 8.64e7)

    return h / (24 * (n + 1)) * 100
  },

  /**
   * Calculate sector hours
   * @param {Object[]=} ent - Log entries
   * @param {string} sec - Sector
   * @returns {number} Sector hours
   */

  sh(sec, ent = Log.log) {
    let h = 0

    let count = ({s, e}) => {
      h += Number(Log.time.duration(Log.time.parse(s), Log.time.parse(e)))
    }

    for (let i = 0, l = ent.length; i < l; i++) {
      ent[i].e !== 'undefined'
      && ent[i].c === sec
      && count(ent[i])
    }

    return h
  },

  /**
   * Calculate sector percentage
   * @param {Object[]=} ent - Log entries
   * @param {string} sec - Sector
   * @returns {number} Sector percentage
   */

  sp(sec, ent = Log.log) {
    return Log.data.sh(sec, ent) / Log.data.lh(ent) * 100
  },

  /**
   * Calculate project hours
   * @param {Object[]=} ent - Log entries
   * @param {string} pro - Project
   * @returns {number} Project hours
   */

  ph(pro, ent = Log.log) {
    let h = 0

    let d = ({s, e}) => Number(Log.time.duration(Log.time.parse(s), Log.time.parse(e)))

    for (let i = 0, l = ent.length; i < l; i++) {
      ent[i].e !== 'undefined' && ent[i].t == pro && (h += d(ent[i]))
    }

    return h
  },

  /**
   * Calculate project percentage
   * @param {Object[]=} ent - Log entries
   * @param {string} pro - Project
   * @returns {number} Project percentage
   */

  pp(pro, ent = Log.log) {
    return Log.data.ph(pro, ent) / Log.data.lh(ent) * 100
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
   * Predict the future
   * @returns {Object} Forecasts
   */

  forecast: {

    /**
     * Forecast sector focus
     */

    sf() {
      let ent = Log.data.getEntriesByDay(new Date().getDay())
      let s = Log.data.listSectors(ent)
      let sf = 0
      let sfs = ''

      for (let i = 0, l = s.length; i < l; i++) {
        let x = Log.data.sp(s[i], ent)
        x > sf && (sf = x, sfs = s[i])
      }

      return sfs
    },

    /**
     * Forecast project focus
     */

    pf() {
      let ent = Log.data.getEntriesByDay(new Date().getDay())
      let p = Log.data.listProjects(ent)
      let pf = 0
      let pfp = ''

      for (let i = 0, l = p.length; i < l; i++) {
        let x = Log.data.pp(p[i], ent)
        x > pf && (pf = x, pfp = p[i])
      }

      return pfp
    },

    /**
     * Forecast peak times
     */

    pt() {
      let ent = Log.data.getEntriesByDay(new Date().getDay())
      let eph = Log.data.peakHours(ent)
      let mph = 0
      let mpht = 0

      for (let i = 0, l = eph.length; i < l; i++) {
        eph[i] > mph && (mph = eph[i], mpht = i)
      }

      return `${mpht}:00`
    },

    /**
     * Forecast session duration
     */

    sd() {
      return Log.data.asd(Log.data.getEntriesByDay(new Date().getDay()))
    }
  }
}
