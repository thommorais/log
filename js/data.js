Log = window.Log || {}
Log.data = {

  /**
   * Parse log data
   * @param {Object[]=} ent - Entries
   */
  parse(ent = Log.log) {
    let p = []

    for (let i = 0, l = ent.length; i < l; i++) {
      let es = Log.time.parse(ent[i].s)
      let ee = Log.time.parse(ent[i].e)

      if (Log.time.date(es) !== Log.time.date(ee) && ent[i].e !== 'undefined') {
        let a = Log.time.convert(es)
        let b = Log.time.convert(ee)

        p.push({
          s: ent[i].s,
          e: Log.time.toHex(new Date(a.getFullYear(), a.getMonth(), a.getDate(), 23, 59, 59)),
          c: ent[i].c,
          t: ent[i].t,
          d: ent[i].d
        })

        p.push({
          s: Log.time.toHex(new Date(b.getFullYear(), b.getMonth(), b.getDate(), 0, 0, 0)),
          e: ent[i].e,
          c: ent[i].c,
          t: ent[i].t,
          d: ent[i].d
        })
      } else {
        p.push(ent[i])
      }
    }

    return p
  },

  /**
   * Get entries by date
   * @param {Object} d - Date
   * @returns {Object[]} Entries
   */
  getEntriesByDate(d) {
    let ent = []

    for (let i = 0, l = Log.log.length; i < l; i++) {
      if (Log.log[i].e === 'undefined') continue

      let a = Log.time.convert(Log.time.parse(Log.log[i].s))

      a.getFullYear() === d.getFullYear()
      && a.getMonth() === d.getMonth()
      && a.getDate() === d.getDate()
      && ent.push(Log.log[i])
    }

    return ent
  },

  /**
   * Get entries from a certain period
   * @param {Object} ps - Period start
   * @param {Object=} pe - Period end
   * @returns {Object[]} Entries
   */
  getEntriesByPeriod(ps, pe = new Date()) {
    Date.prototype.addDays = function(days) {
      let date = new Date(this.valueOf())
      date.setDate(date.getDate() + days)
      return date
    }

    let ent = []

    let span = ((start, stop) => {
      let dates = []
      let current = start

      while (current <= stop) {
        dates.push(new Date(current))
        current = current.addDays(1)
      }

      return dates
    })(ps, pe)

    for (let i = 0, l = span.length; i < l; i++) {
      let a = Log.data.getEntriesByDate(span[i])
      for (let o = 0, ol = a.length; o < ol; o++) {
        ent.push(a[o])
      }
    }

    return ent
  },

  /**
   * Get entries from the last n days
   * @param {number} n - The number of days
   * @returns {Object[]} Entries
   */
  getRecentEntries(n) {
    Date.prototype.subtractDays = function(days) {
      let date = new Date(this.valueOf())
      date.setDate(date.getDate() - days)
      return date
    }

    return Log.data.getEntriesByPeriod(new Date().subtractDays(n))
  },

  /**
   * Get entries of a specific day of the week
   * @param {number} d - A day of the week (0 - 6)
   * @returns {Object[]} Entries
   */
  getEntriesByDay(d) {
    let entries = []

    for (let i = 0, l = Log.log.length; i < l; i++) {
      if (Log.log[i].e !== 'undefined' && Log.time.convert(Log.time.parse(Log.log[i].s)).getDay() === d) {
        entries.push(Log.log[i])
      }
    }

    return entries
  },

  /**
   * Get entries of a specific project
   * @param {string} pro - Project
   * @param {Object[]=} ent - Entries
   * @returns {Object[]} Entries
   */
  getEntriesByProject(pro, ent = Log.log) {
    let entries = []

    for (let i = 0, l = ent.length; i < l; i++) {
      if (ent[i].e !== 'undefined' && ent[i].t === pro) {
        entries.push(ent[i])
      }
    }

    return entries
  },

  /**
   * Get entries of a specific sector
   * @param {string} sec - Sector
   * @param {Object[]=} ent - Entries
   * @returns {Object[]} Entries
   */
  getEntriesBySector(sec, ent = Log.log) {
    let entries = []

    for (let i = 0, l = ent.length; i < l; i++) {
      if (ent[i].e !== 'undefined' && ent[i].c === sec) {
        entries.push(ent[i])
      }
    }

    return entries
  },

  /**
   * Sort entries by date
   * @param {Object[]=} ent - Entries
   * @param {Object=} end - End date
   */
  sortEntries(ent = Log.log, end = new Date()) {
    let days = Log.time.listDates(
      Log.time.convert(Log.time.parse(ent[0].s)),
      end
    )
    let list = []
    let slots = []

    for (let i = 0, l = days.length; i < l; i++) {
      list.push(
        Log.time.date(Log.time.parse(Log.time.toHex(
          new Date(days[i].getFullYear(), days[i].getMonth(), days[i].getDate(), 0, 0, 0)
        )))
      )

      slots.push([])
    }

    for (let i = 0, l = ent.length; i < l; i++) {
      let index = list.indexOf(Log.time.date(Log.time.parse(ent[i].s)))
      if (index > -1) slots[index].push(ent[i])
    }

    return slots
  },

  /**
   * Sort entries by day
   * @returns {Object[]} Entries sorted by day
   */
  sortEntriesByDay() {
    let ent = []

    for (let i = 0; i < 7; i++) {
      ent.push(Log.data.getEntriesByDay(i))
    }

    return ent
  },

  /**
   * List projects
   * @param {Object[]=} ent - Entries
   * @returns {Object[]} List of projects
   */
  listProjects(ent = Log.log) {
    let list = []

    for (let i = 0, l = ent.length; i < l; i++) {
      if (ent[i].e !== 'undefined' && list.indexOf(ent[i].t) === -1) {
        list.push(ent[i].t)
      }
    }

    return list
  },

  /**
   * List sectors
   * @param {Object[]=} ent - Entries
   * @returns {Object[]} List of sectors
   */
  listSectors(ent = Log.log) {
    let list = []

    for (let i = 0, l = ent.length; i < l; i++) {
      if (ent[i].e !== 'undefined' && list.indexOf(ent[i].c) === -1) {
        list.push(ent[i].c)
      }
    }

    return list
  },

  /**
   * Get peak days
   * @param {Object[]=} ent - Entries
   * @returns {Object[]} Peak days
   */
  peakDays(ent = Log.log) {
    let days = Array(7).fill(0)

    for (let i = 0, l = ent.length; i < l; i++) {
      if (ent[i].e === 'undefined') continue

      let es = Log.time.parse(ent[i].s)
      let index = (Log.time.convert(es)).getDay()

      days[index] += Log.time.duration(es, Log.time.parse(ent[i].e))
    }

    return days
  },

  /**
   * Get peak day
   * @param {Object[]=} pk - Peak days
   * @returns {string} Peak day
   */
  peakDay(pk = Log.data.peakDays(Log.log)) {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][pk.indexOf(Math.max(...pk))]
  },

  /**
   * Get peak hours
   * @param {Object[]=} ent - Entries
   * @returns {Object[]} Peak hours
   */
  peakHours(ent = Log.log) {
    let hours = Array(24).fill(0)

    for (let i = 0, l = ent.length; i < l; i++) {
      if (ent[i].e === 'undefined') continue

      let es = Log.time.parse(ent[i].s)
      let index = (Log.time.convert(es)).getHours()

      let time = Log.time.duration(es, Log.time.parse(ent[i].e))

      if (time > 1) {
        let remainder = time - Math.floor(time)
        hours[index] += remainder
        time -= remainder
        index++

        while (time > 0) {
          time -= 1
          hours[index] += time
          index++
          if (index > 23) break
        }
      } else {
        hours[index] += time
      }
    }

    return hours
  },

  /**
   * Get peak hour
   * @param {Object[]=} pk - Peak hours
   * @returns {string} Peak hour
   */
  peakHour(pk = Log.data.peakHours(Log.log)) {
    return `${pk.indexOf(Math.max(...pk))}:00`
  },

  /**
   * List durations
   * @param {Object[]=} ent - Entries
   * @returns {Object[]} List of durations
   */
  listDurations(ent = Log.log) {
    let list = []

    for (let i = 0, l = ent.length; i < l; i++) {
      if (ent[i].e === 'undefined') continue

      list.push(
        Log.time.duration(
          Log.time.parse(ent[i].s),
          Log.time.parse(ent[i].e)
        )
      )
    }

    return list
  },

  /**
   * Calculate shortest log session
   * @param {Object[]=} ent - Log entries
   * @returns {number} Shortest log session
   */
  lsmin(ent = Log.log) {
    return ent.length === 0 ? 0 : Math.min(...Log.data.listDurations(ent))
  },

  /**
   * Calculate longest log session
   * @param {Object[]=} ent - Entries
   * @returns {number} Longest log session
   */
  lsmax(ent = Log.log) {
    return ent.length === 0 ? 0 : Math.max(...Log.data.listDurations(ent))
  },

  /**
   * Calculate average session duration (ASD)
   * @param {Object[]=} ent - Entries
   * @returns {number} Average session duration
   */
  asd(ent = Log.log) {
    if (ent.length === 0) return 0

    let c = 0

    let avg = Log.data.listDurations(ent).reduce(
      (total, num) => {
        c++
        return total + num
      }, 0
    )

    return avg / c
  },

  /**
   * Calculate the total number of logged hours
   * @param {Object[]=} ent - Entries
   * @returns {number} Total logged hours
   */
  lh(ent = Log.log) {
    return ent.length === 0 ? 0 : Log.data.listDurations(ent).reduce(
      (total, num) => total + num, 0
    )
  },

  /**
   * Calculate average logged hours
   * @param {Object[]=} ent - Entries
   * @returns {number} Average logged hours
   */
  avgLh(ent = Log.log) {
    if (ent.length === 0) return 0

    let list = Log.data.sortEntries(ent)
    let h = 0

    for (let i = 0, l = list.length; i < l; i++) {
      h += Log.data.lh(list[i])
    }

    return h / list.length
  },

  /**
   * Calculate how much of a time period was logged
   * @param {Object[]=} ent - Entries
   * @returns {number} Log percentage
   */
  lp(ent = Log.log) {
    if (ent.length === 0) return 0

    let e = Log.time.convert(Log.time.parse(ent[0].s))
    let d = Log.time.convert(Log.time.parse(ent.slice(-1)[0].s))

    let h = Log.data.lh(ent)
    let n = Math.ceil((
              new Date(d.getFullYear(), d.getMonth(), d.getDate()) -
              new Date(e.getFullYear(), e.getMonth(), e.getDate())
            ) / 8.64e7)

    return h / (24 * (n + 1)) * 100
  },

  /**
   * Calculate sector hours
   * @param {Object[]=} ent - Entries
   * @param {string} sec - Sector
   * @returns {number} Sector hours
   */
  sh(sec, ent = Log.log) {
    return ent.length === 0 ? 0 : Log.data.lh(Log.data.getEntriesBySector(sec, ent))
  },

  /**
   * Calculate sector percentage
   * @param {Object[]=} ent - Entries
   * @param {string} sec - Sector
   * @returns {number} Sector percentage
   */
  sp(sec, ent = Log.log) {
    return Log.data.sh(sec, ent) / Log.data.lh(ent) * 100
  },

  /**
   * Calculate project hours
   * @param {Object[]=} ent - Entries
   * @param {string} pro - Project
   * @returns {number} Project hours
   */
  ph(pro, ent = Log.log) {
    return ent.length === 0 ? 0 : Log.data.lh(Log.data.getEntriesByProject(pro, ent))
  },

  /**
   * Calculate project percentage
   * @param {Object[]=} ent - Entries
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
   * Calculate streak
   * @param {Object[]=} a - Entries
   * @returns {number} Streak
   */
  streak(a = Log.log) {
    let ent = Log.data.sortEntries(a)
    let streak = 0

    for (let i = 0, l = ent.length; i < l; i++) {
      streak = ent[i].length === 0 ? 0 : streak + 1
    }

    return streak
  },

  /**
   * Get an array of focus stats
   * @param {string} mode - Sector or project
   * @param {Object[]=} ent - Entries
   * @returns {Object[]} Array of focus stats
   */
  listFocus(mode, ent = Log.log) {
    let days = Log.data.sortEntries(ent)
    let list = []

    if (mode === 'sector') {
      for (let i = 0, l = days.length; i < l; i++) {
        let f = Log.data.sectorFocus(Log.data.listSectors(days[i]))
        if (f !== 0) list.push(f)
      }
    } else if (mode === 'project') {
      for (let i = 0, l = days.length; i < l; i++) {
        let f = Log.data.sectorFocus(Log.data.listProjects(days[i]))
        if (f !== 0) list.push(f)
      }
    }

    return list
  },

  /**
   * Calculate sector focus
   * @param {Object[]=} list - List of sectors
   */
  sectorFocus(list = Log.data.listSectors(Log.log)) {
    return list.length === 0 ? 0 : 1 / list.length
  },

  /**
   * Calculate project focus
   * @param {Object[]=} list - List of projects
   */
  projectFocus(list = Log.data.listProjects(Log.log)) {
    return list.length === 0 ? 0 : 1 / list.length
  },

  /**
   * Calculate minimum focus
   * @param {string} mode - Sector or project
   * @param {Object[]=} ent - Entries
   */
  minFocus(mode, ent = Log.log) {
    return ent.length === 0 ? 0 : Math.min(...Log.data.listFocus(mode, ent))
  },

  /**
   * Calculate maximum focus
   * @param {string} mode - Sector or project
   * @param {Object[]=} ent - Entries
   */
  maxFocus(mode, ent = Log.log) {
    return ent.length === 0 ? 0 : Math.max(...Log.data.listFocus(mode, ent))
  },

  /**
   * Calculate average focus
   * @param {Object[]=} ent - Entries
   */
  focusAvg(ent = Log.log) {
    let avg = Log.data.listSectors(ent).reduce(
      (total, num) => {
        return total + Log.data.sh(num, ent) * (Log.data.sp(num, ent) / 100)
      }, 0)

    return avg / Log.data.lh(ent)
  },

  forecast: {

    /**
     * Forecast sector focus
     * @param {Object=} d - Date
     * @returns {string} Sector focus
     */
    sf(d = new Date()) {
      let ent = Log.data.getEntriesByDay(d.getDay())
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
     * @param {Object=} d - Date
     * @returns {string} Project focus
     */
    pf(d = new Date()) {
      let ent = Log.data.getEntriesByDay(d.getDay())
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
     * Forecast peak time
     * @param {Object=} d - Date
     * @returns {string} Peak time
     */
    pt(d = new Date()) {
      let eph = Log.data.peakHours(Log.data.getEntriesByDay(d.getDay()))
      return `${eph.indexOf(Math.max(...eph))}:00`
    },

    /**
     * Forecast session duration
     * @returns {number} Session duration
     */
    sd() {
      return Log.data.asd(Log.data.getEntriesByDay(new Date().getDay()))
    }
  }
}
