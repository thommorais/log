/**
 * Log
 * A log and time-tracking system
 *
 * Data functions
 *
 * @author Josh Avanier
 * @version 0.1.1
 * @license MIT
 */

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

      let es = Log.time.parse(e.s),
          ee = Log.time.parse(e.e),
          date = Log.time.date(es),
          end = Log.time.date(ee)

      if (date !== end && e.e !== "undefined") {
        let a = Log.time.convert(es),
            ne = (+(new Date(a.getFullYear(), a.getMonth(), a.getDate(), 23, 59)).getTime() / 1E3).toString(16)

        p.push({ s: e.s, e: ne, c: e.c, t: e.t, d: e.d })

        let ea = Log.time.convert(ee),
            ns = (+(new Date(ea.getFullYear(), ea.getMonth(), ea.getDate(), 0, 0)).getTime() / 1E3).toString(16)

        p.push({ s: ns, e: e.e, c: e.c, t: e.t, d: e.d })

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

    if (d == undefined) return Log.log
    else {
      for (let i = 0, l = Log.log.length; i < l; i++) {
        if (Log.log[i].e == "undefined") continue

        let a = Log.time.convert(Log.time.parse(Log.log[i].s))

        a.getFullYear() == d.getFullYear() &&
        a.getMonth() == d.getMonth() &&
        a.getDate() == d.getDate() &&
        e.push(Log.log[i])
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

    function getDates(startDate, stopDate) {
      let dateArray = [],
          currentDate = startDate

      while (currentDate <= stopDate) {
        dateArray.push(new Date(currentDate))
        currentDate = currentDate.addDays(1)
      }

      return dateArray
    }

    let span = getDates(ps, pe),
        ent = []

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

    let today = new Date(),
        past = today.subtractDays(n)

    return Log.data.getEntriesByPeriod(past)
  },

  /**
   * Get entries of a specific day of the week
   * @param {number} d - A day of the week (0 - 6)
   * @returns {Object[]} Log entries
   */

  getEntriesByDay(d) {
    let e = [],

    g = e => Log.time.convert(Log.time.parse(e.s)).getDay()

    for (let i = 0, l = Log.log.length; i < l; i++)
      Log.log[i].e != "undefined" && g(Log.log[i]) == d && e.push(Log.log[i])

    return e
  },

  /**
   * Get entries of a specific project
   * @param {string} p - A project
   * @returns {Object[]} Log entries
   */

  getEntriesByProject(p) {
    let e = []

    for (let i = 0, l = Log.log.length; i < l; i++)
      Log.log[i].e != "undefined" && Log.log[i].t == p && e.push(Log.log[i])

    return e
  },

  /**
   * Get entries of a specific sector
   * @param {string} s - A sector
   * @returns {Object[]} Log entries
   */

  getEntriesBySector(s) {
    let e = []

    for (let i = 0, l = Log.log.length; i < l; i++)
      Log.log[i].e != "undefined" && Log.log[i].c == s && e.push(Log.log[i])

    return e
  },

  /**
   * List projects
   * @param {Object[]=} a - Log entries
   * @returns {Object[]} A list of projects
   */

  listProjects(a = Log.log) {
    let p = []

    for (let i = 0, l = a.length; i < l; i++) {
      let e = a[i], t = e.t
      e.e != "undefined" && p.indexOf(t) == -1 && p.push(t)
    }

    return p
  },

  /**
   * List sectors
   * @param {Object[]=} ent - Log entries
   * @returns {Object[]} A list of sectors
   */

  listSectors(ent = Log.log) {
    let s = []

    for (let i = 0, l = ent.length; i < l; i++) {
      let e = ent[i], t = e.c
      e.e != "undefined" && s.indexOf(t) == -1 && s.push(t)
    }

    return s
  },

  /**
   * Get peak days
   * @param {Object[]=} a - Log entries
   * @returns {Object[]} Peak days
   */

  peakDays(a = Log.log) {
    let d = new Array(7).fill(0),
    count = e => d[(Log.time.convert(Log.time.parse(e.s))).getDay()]++

    for (let i = 0, l = a.length; i < l; i++)
      a[i].e != "undefined" && count(a[i])

    return d
  },

  /**
   * Get peak hours
   * @param {Object[]=} a - Log entries
   * @returns {Object[]} Peak hours
   */

  peakHours(a = Log.log) {
    let h = new Array(24).fill(0),
    count = e => h[(Log.time.convert(Log.time.parse(e.s))).getHours()]++

    for (let i = 0, l = a.length; i < l; i++)
      a[i].e != "undefined" && count(a[i])

    return h
  },

  /**
   * Calculate shortest log session
   * @param {Object[]=} a - Log entries
   * @returns {number} Shortest log session
   */

  lsmin(a = Log.log) {
    if (a.length == 0) return 0

    let m,

    check = e => {
      let n = Log.time.duration(Log.time.parse(e.s), Log.time.parse(e.e))
      if (n < m || m == undefined) m = n
    }

    for (let i = 0, l = a.length; i < l; i++) check(a[i])

    return m
  },

  /**
   * Calculate longest log session
   * @param {Object[]=} ent - Log entries
   * @returns {number} Longest log session
   */

  lsmax(ent = Log.log) {
    if (ent.length == 0) return 0

    let m,

    check = e => {
      let n = Number(Log.time.duration(Log.time.parse(e.s), Log.time.parse(e.e)))
      if (n > m || m == undefined) m = n
    }

    for (let i = 0, l = ent.length; i < l; i++) check(ent[i])

    return m
  },

  /**
   * Calculate average session duration (ASD)
   * @param {Object[]=} ent - Log entries
   * @returns {number} Average session duration
   */

  asd(ent = Log.log) {
    if (ent.length == 0) return 0

    let avg = 0, c = 0,

    count = e => {
      avg += Number(Log.time.duration(Log.time.parse(e.s), Log.time.parse(e.e)))
      c++
    }

    for (let i = 0, l = ent.length; i < l; i++)
      ent[i].e != "undefined" && count(ent[i])

    return avg / c
  },

  /**
   * Calculate the total number of logged hours
   * @param {Object[]=} ent - Log entries
   * @returns {number} Total logged hours
   */

  lh(ent = Log.log) {
    if (ent.length == 0) return 0

    let h = 0,

    count = e => {
      h += Number(Log.time.duration(Log.time.parse(e.s), Log.time.parse(e.e)))
    }

    for (let i = 0, l = ent.length; i < l; i++)
      ent[i].e != "undefined" && count(ent[i])

    return h
  },

  /**
   * Calculate how much of a time period was logged
   * @param {Object[]=} ent - Log entries
   * @returns {number} Log percentage
   */

  lp(ent = Log.log) {
    if (ent.length == 0) return 0

    let e = Log.time.convert(Log.time.parse(ent[0].s)),
        d = Log.time.convert(Log.time.parse(ent[ent.length - 1].s)),
        h = Number(Log.data.lh(ent)),
        n = Math.ceil((
          new Date(d.getFullYear(), d.getMonth(), d.getDate()) -
          new Date(e.getFullYear(), e.getMonth(), e.getDate())
        ) / 8.64e7)

    return h / (24 * (n + 1)) * 100
  },

  /**
   * Calculate sector hours
   * @param {Object[]=} ent - Log entries
   * @param {string}    sec - Sector
   * @returns {number} Sector hours
   */

  sh(ent = Log.log, sec) {
    let h = 0,

    count = e => {
      h += Number(Log.time.duration(Log.time.parse(e.s), Log.time.parse(e.e)))
    }

    for (let i = 0, l = ent.length; i < l; i++)
      ent[i].e != "undefined" && ent[i].c == sec && count(ent[i])

    return h
  },

  /**
   * Calculate sector percentage
   * @param {Object[]=} ent - Log entries
   * @param {string}    sec - Sector
   * @returns {number} Sector percentage
   */

  sp(ent = Log.log, sec) {
    return Log.data.sh(ent, sec) / Log.data.lh(ent) * 100
  },

  /**
   * Calculate project hours
   * @param {Object[]=} ent - Log entries
   * @param {string}    pro - Project
   * @returns {number} Project hours
   */

  ph(ent, pro) {
    let h = 0,

    duration = e => Number(Log.time.duration(Log.time.parse(e.s), Log.time.parse(e.e)))

    for (let i = 0, l = ent.length; i < l; i++)
      ent[i].e != "undefined" && ent[i].t == pro && (h += duration(ent[i]))

    return h
  },

  /**
   * Calculate project percentage
   * @param {Object[]=} ent - Log entries
   * @param {string}    pro - Project
   * @returns {number} Project percentage
   */

  pp(ent = Log.log, pro) {
    return Log.data.ph(ent, pro) / Log.data.lh(ent) * 100
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

  forecast() {
    let ent = Log.data.getEntriesByDay(new Date().getDay())

    // Sector Focus

    let s = Log.data.listSectors(ent), sf = 0, sfs = ""

    for (let i = 0, l = s.length; i < l; i++) {
      let x = Log.data.sp(ent, s[i])
      x > sf && (sf = x, sfs = s[i])
    }

    // Peak Time

    let eph = Log.data.peakHours(ent), mph = 0, mpht = 0

    for (let i = 0, l = eph.length; i < l; i++)
      eph[i] > mph && (mph = eph[i], mpht = i)

    // Project Focus

    let p = Log.data.listProjects(ent), pf = 0, pfp = ""

    for (let i = 0, l = p.length; i < l; i++) {
      let x = Log.data.pp(ent, p[i])
      x > pf && (pf = x, pfp = p[i])
    }

    return {
      sf: sfs,
      pf: pfp,
      pt: `${mpht}:00`,
      sd: Log.data.asd(ent)
    }
  }
}
