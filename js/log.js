/**
 * Log
 * A log and time-tracking system
 *
 * @author Josh Avanier
 * @version 1.0.0
 * @license MIT
 */

'use strict';

const SHELL = require('shelljs')

var Log = {

  log: [],
  config: {},
  palette: {},
  projectPalette: {},
  clock: {},

  /**
   * Get log status; true means a session is in progress
   * @returns {boolean} Log status
   */
  status() {
    if (Log.log.length === 0) return
    return Log.log[Log.log.length - 1].e === 'undefined' ? true : false
  },

  /**
   * Display a session timer
   * @param {boolean} status - Log status
   * @param {string=} con - Container
   */
  timer(status, con = 'timer') {
    if (status) {
      let l = Log.time.convert(
          Log.time.parse(Log.log[Log.log.length - 1].s)
        ).getTime()

      Log.clock = setInterval(() => {
        let s = Math.floor((new Date().getTime() - l) / 1E3)
        let m = Math.floor(s / 60)
        let h = Math.floor(m / 60)

        h %= 24
        m %= 60
        s %= 60

        document.getElementById(con).innerHTML = `${`0${h}`.substr(-2)}:${`0${m}`.substr(-2)}:${`0${s}`.substr(-2)}`
      }, 1E3)
    } else return
  },

  /**
   * Display a log table
   * @param {Object[]=} ent - The log entries
   * @param {number=} num - The number of entries to show
   * @param {string=} con - The container
   */
  display(ent = user.log, num = 50, con = 'logTable') {
    let count = user.log.length

    /**
     * Take the last n items of an array
     * @param {Object[]} a - The array
     * @param {number=} n - Number of items
     * @returns {Object[]} An array with the last n items
     */
    let takeRight = (a, n = 1) => {
      const l = a == null ? 0 : a.length
      let slice = (a, s, e) => {
        let l = a == null ? 0 : a.length
        if (!l) return []
        s = s == null ? 0 : s
        e = e === undefined ? l : e
        if (s < 0) s = -s > l ? 0 : (l + s)
        e = e > l ? l : e
        if (e < 0) e += l
        l = s > e ? 0 : ((e - s) >>> 0)
        s >>>= 0
        let i = -1
        const r = new Array(l)
        while (++i < l) r[i] = a[i + s]
        return r
      }
      if (!l) return []
      n = l - n
      return slice(a, n < 0 ? 0 : n, l)
    }

    /**
     * Create cells and store data
     * @param {Object} e - Entry
     * @param {number} i - The array position
     */
    let addRow = (e, i) => {
      let rw = document.getElementById(con).insertRow(i)
      let c1 = rw.insertCell(0)
      let c2 = rw.insertCell(1)
      let c3 = rw.insertCell(2)
      let c4 = rw.insertCell(3)
      let c5 = rw.insertCell(4)
      let c6 = rw.insertCell(5)
      let c7 = rw.insertCell(6)
      let c8 = rw.insertCell(7)
      let es = Log.time.parse(e.s)
      let ee = Log.time.parse(e.e)

      let cs = Log.time.convert(es)

      ee = e.e === 'undefined' ? '-' : ee

      c1.innerHTML = count--
      c2.innerHTML = Log.time.displayDate(cs)
      c3.innerHTML = Log.time.stamp(cs)
      c4.innerHTML = e.e === 'undefined' ? '-' : Log.time.stamp(Log.time.convert(ee))
      c5.innerHTML = e.e === 'undefined' ? '-' : Log.time.duration(es, ee).toFixed(2)
      c6.innerHTML = e.c
      c7.innerHTML = e.t
      c8.innerHTML = e.d
    }

    let entries = takeRight(ent, num).reverse()

    for (let i = 0, l = entries.length; i < l; i++) {
      addRow(entries[i], i)
    }
  },

  detail: {

    /**
     * View sector details
     * @param {string} sec - Sector
     */
    sector(sec = Log.data.listSectors()[0]) {
      Log.detail.clear.sector()

      let mn = Log.data.getRecentEntries(Log.config.ui.view - 1)
      let ent = Log.data.getEntriesBySector(sec, mn)

      Log.ui.write('sectorTitle', sec)
      Log.ui.write('sectorLastUpdate', Log.time.timeago(Log.time.parse(ent[ent.length - 1].e) * 1E3))

      Log.vis.bar('sectorChart', ent, 'project')

      let peakHours = Log.data.peakHours(ent)
      let peakDays = Log.data.peakDays(ent)

      Log.ui.write('secLHH', Log.data.lh(ent).toFixed(2))
      Log.ui.write('secLSNH', Log.data.lsmin(ent).toFixed(2))
      Log.ui.write('secLSXH', Log.data.lsmax(ent).toFixed(2))
      Log.ui.write('secASD', Log.data.asd(ent).toFixed(2))
      Log.ui.write('secLPH', Log.data.lp(ent).toFixed(2))
      Log.ui.write('secPHH', Log.data.peakHour(peakHours))
      Log.ui.write('secPDH', Log.data.peakDay(peakDays))
      Log.ui.write('secStreak', Log.data.streak(ent))

      Log.vis.peakH(ent, 'secPeakTimes')
      Log.vis.peakD(ent, 'secPeakDays')

      Log.vis.focusChart('project', ent, 'secFocusChart')

      Log.vis.focusBar('project', ent, 'projectDetailFocus')
      Log.vis.legend('project', ent, 'projectLegend')
    },

    /**
     * View project details
     * @param {string} pro - Project
     */
    project(pro = Log.data.listProjects()[0]) {
      Log.detail.clear.project()

      let mn = Log.data.getRecentEntries(Log.config.ui.view - 1)
      let ent = Log.data.getEntriesByProject(pro, mn)

      Log.ui.write('projectTitle', pro)

      Log.ui.write('projectLastUpdate', Log.time.timeago(Log.time.parse(ent[ent.length - 1].e) * 1E3))

      Log.vis.bar('projectChart', ent, 'sector')

      let peakHours = Log.data.peakHours(ent)
      let peakDays = Log.data.peakDays(ent)

      Log.ui.write('proLHH', Log.data.lh(ent).toFixed(2))
      Log.ui.write('proLSNH', Log.data.lsmin(ent).toFixed(2))
      Log.ui.write('proLSXH', Log.data.lsmax(ent).toFixed(2))
      Log.ui.write('proASD', Log.data.asd(ent).toFixed(2))
      Log.ui.write('proLPH', Log.data.lp(ent).toFixed(2))
      Log.ui.write('proPHH', Log.data.peakHour(peakHours))
      Log.ui.write('proPDH', Log.data.peakDay(peakDays))
      Log.ui.write('proStreak', Log.data.streak(ent))

      Log.vis.peakH(ent, 'proPeakTimes')
      Log.vis.peakD(ent, 'proPeakDays')

      Log.vis.focusChart('sector', ent, 'proFocusChart')

      Log.vis.focusBar('sector', ent, 'sectorDetailFocus')
      Log.vis.legend('sector', ent, 'sectorLegend')
    },

    clear: {

      /**
       * Clear sector details
       */
      sector() {
        let el = 'sectorTitle sectorChart secPeakTimes secPeakDays projectDetailFocus projectLegend secFocusChart'.split(' ')

        for (let i = 0, l = el.length; i < l; i++) {
          Log.ui.empty(el[i])
        }
      },

      /**
       * Clear project details
       */
      project() {
        let el = 'projectTitle projectLastUpdate projectChart sectorDetailFocus sectorLegend proPeakTimes proPeakDays proFocusChart'.split(' ')

        for (let i = 0, l = el.length; i < l; i++) {
          Log.ui.empty(el[i])
        }
      }
    }
  },

  utils: {

    /**
     * Get the max value in an array
     * @param {Object[]} a - An array
     * @returns {number} Max value
     */
    getMax(a) {
      return a.reduce(function(x, y) {
        return Math.max(x, y)
      })
    },

    /**
     * Calculate width
     */
    calcWidth(a, b) {
      return (a - b) / 86400 * 100
    },

    /**
     * Calculate DP
     */
    calcDP(a) {
      let s = Log.time.convert(a)
      let y = s.getFullYear()
      let m = s.getMonth()
      let d = s.getDate()

      return (new Date(y, m, d, s.getHours(), s.getMinutes(), s.getSeconds()).getTime() / 1E3 - (new Date(y, m, d).getTime() / 1E3)) / 86400 * 100
    },

    /**
     * Calculate margin
     */
    calcMargin(a, lw, lp) {
      return a - (lw + lp)
    }
  },

  /**
   * Open a tab
   */
  tab(s, g, t, v = false) {
    let x = document.getElementsByClassName(g)
    let b = document.getElementsByClassName(t)

    for (let i = 0, l = x.length; i < l; i++) {
      x[i].style.display = 'none'
    }

    for (let i = 0, l = b.length; i < l; i++) {
      b[i].className = v ? `db mb3 ${t} on bg-cl o5 mr3` : `pv1 ${t} on bg-cl o5 mr3`
    }

    document.getElementById(s).style.display = 'block'
    document.getElementById(`b-${s}`).className = v ? `db mb3 ${t} on bg-cl of mr3` : `pv1 ${t} on bg-cl of mr3`
  },

  /**
   * Refresh
   */
  refresh() {
    Log.reset()
    Log.init()
  },

  res: {

    /**
     * Reset timer
     */
    timer() {
      clearInterval(Log.clock)
      Log.ui.write('timer', '00:00:00')
    },

    /**
     * Reset forecasts
     */
    forecast() {
      Log.ui.write('fsf', '&mdash;')
      Log.ui.write('fpf', '&mdash;')
      Log.ui.write('fpt', '00:00')
      Log.ui.write('fsd', '0.00 h')
    }
  },

  reset() {
    Log.res.timer()
    Log.res.forecast()

    let el = 'phc pdc dayChart weekChart peakTimesHistory sectorBars projectBars sectorsList projectsList vis logbook focusChart sectorFocusBar sectorLegendSummary'.split(' ')

    for (let i = 0, l = el.length; i < l; i++) {
      Log.ui.empty(el[i])
    }
  },

  init(log) {
    if (localStorage.hasOwnProperty('logHistory')) {
      Log.console.history = JSON.parse(localStorage.getItem('logHistory'))
    } else {
      Log.console.history = []
      localStorage.setItem('logHistory', JSON.stringify(Log.console.history))
    }

    let cmd = document.getElementById('cmd')
    let con = document.getElementById('console')
    let cmdIndex = 1

    cmd.addEventListener('submit', function() {
      if (con.value !== '') {
        Log.console.history.push(con.value)

        if (Log.console.history.length >= 100) {
          Log.console.history.shift()
        }

        localStorage.setItem('logHistory', JSON.stringify(Log.console.history))

        Log.console.parse(con.value)
      }
      con.value = ''
      cmd.style.display = 'none'
      cmdIndex = 1
    })

    document.addEventListener('keydown', function(e) {
      if (e.which >= 65 && e.which <= 90) {
        cmd.style.display = 'block'
        con.focus()
      } else if (e.key === 'Escape') {
        con.value = ''
        cmd.style.display = 'none'
        cmdIndex = 1
      }

      if (e.which === 38) {
        cmd.style.display = 'block'
        con.focus()
        cmdIndex++

        if (cmdIndex > Log.console.history.length) cmdIndex = Log.console.history.length

        con.value = Log.console.history[Log.console.history.length - cmdIndex]
      } else if (e.which === 40) {
        cmd.style.display = 'block'
        con.focus()
        cmdIndex--

        if (cmdIndex < 1) cmdIndex = 1
        con.value = Log.console.history[Log.console.history.length - cmdIndex]
      }
    })

    try {
      JSON.parse(localStorage.getItem('user'))

      if (localStorage.hasOwnProperty('user')) {
        user = JSON.parse(localStorage.getItem('user'))
      } else {
        user.log = Log.data.parse(log)
        localStorage.setItem('user', JSON.stringify(user))
      }
    } catch(e) {
      // localStorage.clear()
      return
    }

    Log.log = Log.data.parse(user.log)
    Log.config = user.config
    Log.palette = user.palette
    Log.projectPalette = user.projectPalette

    document.getElementById('app').style.backgroundColor = Log.config.ui.bg
    document.getElementById('app').style.color = Log.config.ui.colour

    if (Log.log.length === 0) return

    let n = new Date()
    let en = Log.data.getEntriesByDate(n)
    let mn = Log.data.getRecentEntries(Log.config.ui.view - 1)
    let sectors = Log.data.listSectors()
    let projects = Log.data.listProjects()

    Log.timer(Log.status())

    Log.vis.peakH(Log.data.sortEntriesByDay()[n.getDay()])
    Log.vis.peakD()

    Log.ui.write('fsf', Log.data.forecast.sf())
    Log.ui.write('fpf', Log.data.forecast.pf())
    Log.ui.write('fpt', Log.data.forecast.pt())
    Log.ui.write('fsd', `${Log.data.forecast.sd().toFixed(2)} h`)

    Log.vis.day()
    Log.vis.bar('weekChart', mn)

    Log.vis.list('sector', 'sectorBars', en)
    Log.vis.list('project', 'projectBars', en)

    Log.ui.write('LHT', Log.data.lh(en).toFixed(2))
    Log.ui.write('LSN', Log.data.lsmin(en).toFixed(2))
    Log.ui.write('LSX', Log.data.lsmax(en).toFixed(2))
    Log.ui.write('ASDT', Log.data.asd(en).toFixed(2))
    Log.ui.write('LPT', Log.data.lp(en).toFixed(2))
    Log.ui.write('focusToday', Log.data.projectFocus(Log.data.listProjects(en)).toFixed(2))
    Log.ui.write('entryCount', en.length)
    Log.ui.write('streakToday', Log.data.streak(Log.log))

    Log.ui.write('LHH', Log.data.lh().toFixed(2))
    Log.ui.write('LSNH', Log.data.lsmin().toFixed(2))
    Log.ui.write('LSXH', Log.data.lsmax().toFixed(2))
    Log.ui.write('ASD', Log.data.asd().toFixed(2))
    Log.ui.write('ALHH', Log.data.avgLh().toFixed(2))
    Log.ui.write('LPH', Log.data.lp().toFixed(2))
    Log.ui.write('entCount', user.log.length)
    Log.ui.write('secCount', sectors.length)
    Log.ui.write('proCount', projects.length)
    Log.ui.write('PHH', Log.data.peakHour())
    Log.ui.write('PDH', Log.data.peakDay())

    Log.vis.peakH(undefined, 'peakTimesHistory')
    Log.vis.peakD(undefined, 'peakDaysHistory')

    Log.vis.focusChart('project', mn)

    Log.ui.write('AFH', Log.data.focusAvg().toFixed(2))
    Log.ui.write('Fmin', Log.data.minFocus('project').toFixed(2))
    Log.ui.write('Fmax', Log.data.maxFocus('project').toFixed(2))

    Log.vis.focusBar('sector', mn, 'sectorFocusBar')
    Log.vis.legend('sector', undefined, 'sectorLegendSummary')

    Log.detail.sector()
    Log.vis.list('sector', 'sectorsList')

    Log.detail.project()
    Log.vis.list('project', 'projectsList')

    Log.vis.line('vis', mn)

    Log.display(undefined, 1000, 'logbook')
  }
}
