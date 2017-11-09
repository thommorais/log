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

    calcWidth(a, b) {
      return (a - b) / 86400 * 100
    },

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

  refresh() {
    Log.reset()
    Log.init()
  },

  res: {

    timer() {
      clearInterval(Log.clock)
      document.getElementById('timer').innerHTML = '00:00:00'
    },

    forecast() {
      document.getElementById('fsf').innerHTML = '???'
      document.getElementById('fpf').innerHTML = '???'
      document.getElementById('fpt').innerHTML = '00:00'
      document.getElementById('fsd').innerHTML = '0.00 h'
    },

    stats() {
      let e = 'LHH LHT LPH LPT ASD ASDT LSN LSX LSNH LSXH'.split(' ')
      let r = e => document.getElementById(e).innerHTML = '0.00'
      for (let i = 0, l = e.length; i < l; i++) r(e[i])
    },

  },

  reset() {
    let c = e => document.getElementById(e).innerHTML = ''

    Log.res.timer()
    Log.res.forecast()

    c('phc')
    c('pdc')
    c('dayChart')
    c('weekChart')

    Log.res.stats()

    c('peakTimesHistory')
    c('sectorBars')
    c('projectBars')
    c('sectorsList')
    c('projectsList')
    c('vis')
    c('logbook')
  },

  /**
   * Initialise
   */

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
      localStorage.clear()
    }

    Log.log = user.log
    Log.config = user.config
    Log.palette = user.palette

    let icon = user.config.ui.icons

    let ic = (a, b, c) => {
      document.getElementById(a).innerHTML = icon ? b : c
    }

    ic('b-ovw', '&#128902;', 'Overview')
    ic('b-lis', '&#9783;', 'Details')
    ic('b-vis', '&#9781;', 'Visualisation')
    ic('b-tab', '&#128911;', 'Table')
    ic('b-set', '?', 'Guide')

    ic('peakTimesTitle', '&#9650;', 'Peak Times')
    ic('forecastTitle', '&#9670;', 'Forecast')
    ic('overviewTitle', '&#128902;', 'Overview')
    ic('sectorsTodayTitle', '&#11206;', 'Sectors')
    ic('sectorsTitle', '&#11206;', 'Sectors')
    ic('statsTitle', '&#9650;', 'Statistics')
    ic('projectsTitle', '&#9964;', 'Projects')

    ic('tableDate', '&#128710;', 'Date')
    ic('tableStart', '&#9210;', 'Start')
    ic('tableEnd', '&#9209;', 'End')
    ic('tableDuration', '&#11118;', 'Duration')
    ic('tableSector', '&#11206;', 'Sector')
    ic('tableProject', '&#9964;', 'Project')
    ic('tableActivity', '&#11042;', 'Activity')

    document.getElementById('app').style.backgroundColor = Log.config.ui.bg
    document.getElementById('app').style.color = Log.config.ui.colour
    document.getElementById('app').style.fontFamily = Log.config.ui.font

    document.getElementById('cmd').addEventListener('submit', function() {
      Log.console.parse(document.getElementById('console').value)
      document.getElementById('console').value = ''
    })

    document.addEventListener('keydown', function(e) {
      if (e.which >= 65 && e.which <= 90) {
        document.getElementById('cmd').style.display = 'block'
        document.getElementById('console').focus()
      } else if (e.key === 'Escape') {
        document.getElementById('console').value = ''
        document.getElementById('cmd').style.display = 'none'
      }
    })

    if (Log.log.length === 0) return

    let ld = Log.data
    let n = new Date()
    let y = new Date(n)

    let d = (e, m) => {
      document.getElementById(e).innerHTML = m.toFixed(2)
    }

    let s = (e, c) => {
      document.getElementById(e).className = c
    }

    let t = (e, c) => {
      let s = ''
      let r
      let d = document.getElementById(e)

      c > 0 ? (s = `+${c.toFixed(2)}%`) : (s = `${c.toFixed(2)}%`)

      d.innerHTML = s
    }

    y.setDate(n.getDate() - 1)

    let en = Log.data.getEntries(n)
    let ey = Log.data.getEntries(y)
    let mn = Log.data.getRecentEntries(Log.config.ui.view - 1)

    Log.vis.bar('weekChart', Log.data.parse(mn))
    Log.vis.peakH(Log.data.getEntriesByDay(n.getDay()))
    Log.vis.peakD()
    Log.vis.day()

    let fc = Log.data.forecast()

    document.getElementById('fsf').innerHTML = fc.sf
    document.getElementById('fpf').innerHTML = fc.pf
    document.getElementById('fpt').innerHTML = fc.pt
    document.getElementById('fsd').innerHTML = fc.sd.toFixed(2) + ' h'

    Log.timer(Log.status())

    let lhh = ld.lh()
    let lht = ld.lh(en)
    let lph = ld.lp()
    let lpt = ld.lp(en)
    let asd = ld.asd()
    let asdt = ld.asd(en)
    let lsn = ld.lsmin(en)
    let lsx = ld.lsmax(en)
    let lsnh = ld.lsmin()
    let lsxh = ld.lsmax()

    let lhtt = ld.trend(lht, ld.lh(ey))
    let asdtt = ld.trend(asdt, ld.asd(ey))
    let lptt = ld.trend(lpt, ld.lp(ey))
    let lsnt = ld.trend(lsn, ld.lsmin(ey))
    let lsxt = ld.trend(lsx, ld.lsmax(ey))

    let els = ['LHH', 'LHT', 'LPH', 'LPT', 'ASD', 'ASDT', 'LSN', 'LSX', 'LSNH', 'LSXH']
    let val = [lhh, lht, lph, lpt, asd, asdt, lsn, lsx, lsnh, lsxh]
    let tels = ['lhtt', 'asdtt', 'lptt', 'lsnt', 'lsxt']
    let tval = [lhtt, asdtt, lptt, lsnt, lsxt]

    for (let i = 0, l = els.length; i < l; i++) {
      document.getElementById(els[i]).innerHTML = val[i].toFixed(2)
    }

    for (let i = 0, l = tels.length; i < l; i++) {
      t(tels[i], tval[i])
    }

    Log.vis.peakH(undefined, 'peakTimesHistory')
    Log.vis.sectorBars(en)
    Log.vis.projectBars(en)

    Log.vis.sectorBars(undefined, 'sectorsList', true)
    Log.vis.projectBars(undefined, 'projectsList', true)

    Log.vis.line('vis', Log.data.parse(mn))
    Log.display(Log.log, 1000, 'logbook')
  }
}
