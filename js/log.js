/**
 * Log
 * A log and time-tracking system
 *
 * @author Josh Avanier
 * @version 0.1.1
 * @license MIT
 */

'use strict';

const SHELL = require('shelljs')

var Log = {

  log: [],
  config: {},
  palette: {},
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
   */

  timer(status, con = 'timer') {
    if (status) {
      let l = Log.time.convert(
          Log.time.parse(Log.log[Log.log.length - 1].s)
        ).getTime()

      let tick = _ => {
        let s = Math.floor((new Date().getTime() - l) / 1E3)
        let m = Math.floor(s / 60)
        let h = Math.floor(m / 60)

        h %= 24
        m %= 60
        s %= 60

        document.getElementById(con).innerHTML = `${`0${h}`.substr(-2)}:${`0${m}`.substr(-2)}:${`0${s}`.substr(-2)}`
      }

      Log.clock = setInterval(function() {
        tick()
      }, 1E3)
    } else return
  },

  /**
   * Display a log table
   * @param {Object[]=} ent - The log entries
   * @param {number=} num - The number of entries to show
   * @param {string=} con - The container
   */

  display(ent = Log.log, num = 50, con = 'logTable') {

    /**
     * Take the last n items of an array
     * @param {Object[]} a - The array
     * @param {number=}  n - Number of items
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
    },

    /**
     * Create cells and store data
     * @param {Object} e - A Log entry
     * @param {number} i - The array position
     */

    en = (e, i) => {
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

      ee = e.e === 'undefined' ? '-' : Log.time.parse(e.e)

      c1.innerHTML = count--
      c1.className = 'ar'
      c2.innerHTML = Log.time.displayDate(es)
      c3.innerHTML = Log.time.stamp(es)
      c4.innerHTML = e.e === 'undefined' ? '-' : Log.time.stamp(ee)
      c5.innerHTML = e.e === 'undefined' ? '-' : Log.time.duration(es, ee).toFixed(2)
      c5.className = 'ar'
      c6.innerHTML = e.c
      c7.innerHTML = e.t
      c8.innerHTML = e.d
    }

    // Display last {num} entries
    let b = takeRight(ent, num).reverse()
    let count = Log.log.length

    for (let i = 0, l = b.length; i < l; i++) en(b[i], i)
  },

  detail: {

    /**
     * View sector details
     * @param {string} sec - Sector
     */

    sector(sec = Log.data.listSectors()[0]) {
      let ent = Log.data.getEntriesBySector(sec)

      Log.detail.clear.sector()

      Log.ui.write('sectorTitle', sec)
      Log.ui.write('sectorLastUpdate', Log.time.timeago(Log.time.parse(ent[ent.length - 1].e) * 1E3))

      Log.vis.bar('sectorChart', ent)

      Log.ui.write('secLHH', Log.data.lh(ent).toFixed(2))
      Log.ui.write('secLPH', Log.data.lp(ent).toFixed(2))
      Log.ui.write('secASD', Log.data.asd(ent).toFixed(2))
      Log.ui.write('secLSNH', Log.data.lsmin(ent).toFixed(2))
      Log.ui.write('secLSXH', Log.data.lsmax(ent).toFixed(2))
      Log.ui.write('secPHH', Log.data.peakHour(ent))
      Log.ui.write('secPDH', Log.data.peakDay(ent))
      Log.ui.write('secStreak', Log.data.streak(ent))
    },

    /**
     * View project details
     * @param {string} pro - Project
     */

    project(pro = Log.data.listProjects()[0]) {
      let ent = Log.data.getEntriesByProject(pro)

      Log.detail.clear.project()

      Log.ui.write('projectTitle', pro)

      Log.ui.write('projectLastUpdate', Log.time.timeago(Log.time.parse(ent[ent.length - 1].e) * 1E3))

      Log.vis.bar('projectChart', ent)

      Log.ui.write('proLHH', Log.data.lh(ent).toFixed(2))
      Log.ui.write('proLPH', Log.data.lp(ent).toFixed(2))
      Log.ui.write('proASD', Log.data.asd(ent).toFixed(2))
      Log.ui.write('proLSNH', Log.data.lsmin(ent).toFixed(2))
      Log.ui.write('proLSXH', Log.data.lsmax(ent).toFixed(2))

      Log.ui.write('proPHH', Log.data.peakHour(ent))
      Log.ui.write('proPDH', Log.data.peakDay(ent))

      Log.ui.write('proStreak', Log.data.streak(ent))

      let list = Log.data.listSectors(ent)

      Log.vis.sectorFocusBar(ent, 'sectorDetailFocus')
      Log.vis.sectorLegend(ent, 'sectorLegend')
    },

    clear: {

      sector() {
        let el = 'sectorTitle sectorChart secLHH secLPH secASD secLSNH secLSXH'.split(' ')

        for (let i = 0, l = el.length; i < l; i++) {
          Log.ui.empty(el[i])
        }
      },

      project() {
        let el = 'projectTitle projectLastUpdate projectChart proLHH proLPH proASD proLSNH proLSXH proPHH proPDH proStreak sectorDetailFocus sectorLegend'.split(' ')

        for (let i = 0, l = el.length; i < l; i++) {
          Log.ui.empty(el[i])
        }

        Log.ui.empty('projectTitle')
        Log.ui.empty('projectChart')
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

    calcMargin(a, lw, lp) {
      return a - (lw + lp)
    }
  },

  /**
   * Open a tab
   */

  tab(s) {
    let x = document.getElementsByClassName('sect')
    let b = document.getElementsByClassName('tab')

    for (let i = 0, l = x.length; i < l; i++) {
      x[i].style.display = 'none'
    }

    for (let i = 0, l = b.length; i < l; i++) {
      b[i].className = 'pv1 tab on bg-cl o5 mr3'
    }

    document.getElementById(s).style.display = 'block'
    document.getElementById(`b-${s}`).className = 'pv1 tab on bg-cl of mr3'
  },

  /**
   * Open a subtab
   */

  subtab(s) {
    let x = document.getElementsByClassName('subsect')
    let b = document.getElementsByClassName('subtab')

    for (let i = 0, l = x.length; i < l; i++) {
      x[i].style.display = 'none'
    }

    for (let i = 0, l = b.length; i < l; i++) {
      b[i].className = 'db mb3 subtab on bg-cl o5 mr3'
    }

    document.getElementById(s).style.display = 'block'
    document.getElementById(`b-${s}`).className = 'db mb3 subtab on bg-cl of mr3'
  },

  /**
   * Open a daytab
   */

  daytab(s) {
    let x = document.getElementsByClassName('daysect')
    let b = document.getElementsByClassName('daytab')

    for (let i = 0, l = x.length; i < l; i++) {
      x[i].style.display = 'none'
    }

    for (let i = 0, l = b.length; i < l; i++) {
      b[i].className = 'pv0 daytab on bg-cl o5 mr3'
    }

    document.getElementById(s).style.display = 'block'
    document.getElementById(`b-${s}`).className = 'pv0 daytab on bg-cl of mr3'
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
      Log.ui.write('fsf', '???')
      Log.ui.write('fpf', '???')
      Log.ui.write('fpt', '00:00')
      Log.ui.write('fsd', '0.00 h')
    }
  },

  reset() {
    Log.res.timer()
    Log.res.forecast()

    let el = 'phc pdc dayChart weekChart peakTimesHistory sectorBars projectBars sectorsList projectsList vis logbook LHH LHT LPH LPT ASD ASDT LSN LSX LSNH LSXH focusChart sectorFocusBar projectFocusBar'.split(' ')

    for (let i = 0, l = el.length; i < l; i++) {
      Log.ui.empty(el[i])
    }
  },

  init(log) {
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

    Log.log = user.log
    Log.config = user.config
    Log.palette = user.palette

    Log.ui.icon('b-ovw', '&#128902;&#xFE0E;', 'Overview')
    Log.ui.icon('b-lis', '&#9783;&#xFE0E;', 'Details')
    Log.ui.icon('b-vis', '&#9781;&#xFE0E;', 'Visualisation')
    Log.ui.icon('b-tab', '&#128911;&#xFE0E;', 'Entries')
    Log.ui.icon('b-set', '?', 'Guide')

    Log.ui.icon('peakTimesTitle', '&#9650;&#xFE0E;', 'Peaks')
    Log.ui.icon('forecastTitle', '&#9670;&#xFE0E;', 'Forecast')
    Log.ui.icon('overviewTitle', '&#128902;&#xFE0E;', 'Overview')
    Log.ui.icon('sectorsTodayTitle', '&#11206;&#xFE0E;', 'Sectors')
    Log.ui.icon('projectsTodayTitle', '&#9964;&#xFE0E;', 'Projects')
    Log.ui.icon('statsTitle', '&#9650;&#xFE0E;', 'Statistics')

    Log.ui.icon('tableDate', '&#128710;&#xFE0E;', 'Date')
    Log.ui.icon('tableStart', '&#9210;&#xFE0E;', 'Start')
    Log.ui.icon('tableEnd', '&#9209;&#xFE0E;', 'End')
    Log.ui.icon('tableDuration', '&#11118;&#xFE0E;', 'Duration')
    Log.ui.icon('tableSector', '&#11206;&#xFE0E;', 'Sector')
    Log.ui.icon('tableProject', '&#9964;&#xFE0E;', 'Project')
    Log.ui.icon('tableActivity', '&#11042;&#xFE0E;', 'Activity')

    document.getElementById('app').style.backgroundColor = Log.config.ui.bg
    document.getElementById('app').style.color = Log.config.ui.colour

    let cmd = document.getElementById('cmd')
    let con = document.getElementById('console')

    let cmdIndex = 1

    cmd.addEventListener('submit', function() {
      Log.console.history.push(con.value)
      Log.console.parse(con.value)
      con.value = ''
      cmd.style.display = 'none'
      cmdIndex = 0
    })

    cmd.addEventListener('keydown', function(e) {
      if (e.which === 38) {
        cmdIndex++
        con.value = Log.console.history[Log.console.history.length - cmdIndex]
      } else if (e.which === 40) {
        cmdIndex--

        if (cmdIndex < 0) cmdIndex = 0
        con.value = Log.console.history[Log.console.history.length - cmdIndex]
      }
    })

    document.addEventListener('keydown', function(e) {
      if (e.which >= 65 && e.which <= 90) {
        cmd.style.display = 'block'
        con.focus()
      } else if (e.key === 'Escape') {
        con.value = ''
        cmd.style.display = 'none'
        cmdIndex = 0
      }
    })

    if (Log.log.length === 0) return

    let n = new Date()
    let y = new Date(n)

    y.setDate(n.getDate() - 1)

    let en = Log.data.getEntries(n)
    let ey = Log.data.getEntries(y)
    let mn = Log.data.getRecentEntries(Log.config.ui.view - 1)

    let entriesByDay = Log.data.sortEntriesByDay()

    Log.vis.bar('weekChart', Log.data.parse(mn))
    Log.vis.peakH(entriesByDay[n.getDay()])
    Log.vis.peakD()
    Log.vis.day()

    Log.ui.write('fsf', Log.data.forecast.sf())
    Log.ui.write('fpf', Log.data.forecast.pf())
    Log.ui.write('fpt', Log.data.forecast.pt())
    Log.ui.write('fsd', `${Log.data.forecast.sd().toFixed(2)} h`)

    Log.timer(Log.status())

    let lhh = Log.data.lh()
    let lht = Log.data.lh(en)
    let lph = Log.data.lp()
    let lpt = Log.data.lp(en)
    let asd = Log.data.asd()
    let asdt = Log.data.asd(en)
    let lsn = Log.data.lsmin(en)
    let lsx = Log.data.lsmax(en)
    let lsnh = Log.data.lsmin()
    let lsxh = Log.data.lsmax()

    let lhtt = Log.data.trend(lht, Log.data.lh(ey))
    let asdtt = Log.data.trend(asdt, Log.data.asd(ey))
    let lptt = Log.data.trend(lpt, Log.data.lp(ey))
    let lsnt = Log.data.trend(lsn, Log.data.lsmin(ey))
    let lsxt = Log.data.trend(lsx, Log.data.lsmax(ey))
    let entt = Log.data.trend(en.length, ey.length)

    let els = ['LHH', 'LHT', 'LPH', 'LPT', 'ASD', 'ASDT', 'LSN', 'LSX', 'LSNH', 'LSXH']
    let val = [lhh, lht, lph, lpt, asd, asdt, lsn, lsx, lsnh, lsxh]
    let tels = ['lhtt', 'asdtt', 'lptt', 'lsnt', 'lsxt', 'entt']
    let tval = [lhtt, asdtt, lptt, lsnt, lsxt, entt]

    for (let i = 0, l = els.length; i < l; i++) {
      Log.ui.write(els[i], val[i].toFixed(2))
    }

    Log.ui.write('entryCount', en.length)
    Log.ui.write('streakToday', Log.data.streak(Log.log))

    let t = (e, c) => {
      let s = ''
      let r
      let d = document.getElementById(e)

      c > 0 ? (s = `+${c.toFixed(2)}%`) : (s = `${c.toFixed(2)}%`)

      d.innerHTML = s
    }

    for (let i = 0, l = tels.length; i < l; i++) {
      t(tels[i], tval[i])
    }

    Log.ui.write('PHH', Log.data.peakHour())
    Log.ui.write('PDH', Log.data.peakDay())

    let sectors = Log.data.listSectors()
    let projects = Log.data.listProjects()

    Log.ui.write('entCount', Log.log.length)
    Log.ui.write('secCount', sectors.length)
    Log.ui.write('proCount', projects.length)

    Log.vis.focusBar()

    Log.vis.sectorFocusBar()
    Log.vis.projectFocusBar()

    Log.vis.peakH(undefined, 'peakTimesHistory')

    Log.vis.peakH(entriesByDay[0], 'sunPeakTimes')
    Log.vis.peakH(entriesByDay[1], 'monPeakTimes')
    Log.vis.peakH(entriesByDay[2], 'tuePeakTimes')
    Log.vis.peakH(entriesByDay[3], 'wedPeakTimes')
    Log.vis.peakH(entriesByDay[4], 'thuPeakTimes')
    Log.vis.peakH(entriesByDay[5], 'friPeakTimes')
    Log.vis.peakH(entriesByDay[6], 'satPeakTimes')

    Log.detail.sector()
    Log.detail.project()

    Log.vis.sectorBars(en)
    Log.vis.projectBars(en)

    Log.vis.sectorBars(undefined, 'sectorsList')
    Log.vis.projectBars(undefined, 'projectsList')

    Log.vis.line('vis', Log.data.parse(mn))
    Log.display(Log.log, 1000, 'logbook')
  }
}
