/**
 * Log
 * A log and time-tracking system
 *
 * @author Josh Avanier
 * @version 1.0.2
 * @license MIT
 */

'use strict';

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
    return Log.log.slice(-1)[0].e === 'undefined' ? true : false
  },

  /**
   * Display a session timer
   * @param {boolean} status - Log status
   */
  timer(status) {
    if (status) {
      let l = Log.time.convert(
          Log.time.parse(Log.log.slice(-1)[0].s)
        ).getTime()

      Log.clock = setInterval(() => {
        let s = Math.floor((new Date().getTime() - l) / 1E3)
        let m = Math.floor(s / 60)
        let h = Math.floor(m / 60)

        h %= 24
        m %= 60
        s %= 60

        document.getElementById('timer').innerHTML = `${`0${h}`.substr(-2)}:${`0${m}`.substr(-2)}:${`0${s}`.substr(-2)}`
      }, 1E3)
    } else return
  },

  /**
   * Display a log table
   * @param {Object[]=} ent - Entries
   * @param {number=} num - Number of entries to show
   * @param {string=} con - Container
   */
  display(ent = user.log, num = 50, con = 'logbook') {
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
      let es = Log.time.parse(e.s)
      let ee = Log.time.parse(e.e)
      let cs = Log.time.convert(es)

      ee = e.e === 'undefined' ? '-' : ee

      rw.insertCell(0).innerHTML = user.log.length - i
      rw.insertCell(1).innerHTML = Log.time.displayDate(cs)
      rw.insertCell(2).innerHTML = Log.time.stamp(cs)
      rw.insertCell(3).innerHTML = e.e === 'undefined' ? '-' : Log.time.stamp(Log.time.convert(ee))
      rw.insertCell(4).innerHTML = e.e === 'undefined' ? '-' : `${Log.time.duration(e.s, e.e).toFixed(2)} h`
      rw.insertCell(5).innerHTML = e.c
      rw.insertCell(6).innerHTML = e.t
      rw.insertCell(7).innerHTML = e.d
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
    sector(sec = Log.data.listSectors().sort()[0]) {
      Log.detail.clear.sector()

      if (sec === undefined) return
      if (sec.length === 0) return

      let ent = Log.data.getEntriesBySector(sec, Log.data.getRecentEntries(Log.config.ui.view - 1))
      let his = Log.data.getEntriesBySector(sec)

      Log.ui.write('sectorTitle', sec)

      let timeago = ent.length === 0 ? `No activity in the past ${Log.config.ui.view} days` : `Updated ${Log.time.timeago(Log.time.parse(ent.slice(-1)[0].e) * 1E3)}`

      Log.ui.write('sectorLastUpdate', timeago)

      Log.ui.write('secEnt', his.length)
      Log.ui.write('secLHH', Log.data.lh(his).toFixed(2))
      Log.ui.write('secLSNH', Log.data.lsmin(his).toFixed(2))
      Log.ui.write('secLSXH', Log.data.lsmax(his).toFixed(2))
      Log.ui.write('secASD', Log.data.asd(his).toFixed(2))
      Log.ui.write('secLPH', Log.data.lp(his).toFixed(2))
      Log.ui.write('secPHH', Log.data.peakHour(Log.data.peakHours(his)))
      Log.ui.write('secPDH', Log.data.peakDay(Log.data.peakDays(his)))
      Log.ui.write('secStreak', Log.data.streak(his))

      Log.vis.peakH(his, 'secPeakTimes')
      Log.vis.peakD(his, 'secPeakDays')

      if (ent.length !== 0) {
        Log.vis.bar('sectorChart', ent, 'project')
        Log.vis.focusChart('project', ent, 'secFocusChart')

        Log.ui.write('secAFH', Log.data.focusAvg(ent).toFixed(2))
        Log.ui.write('secFmin', Log.data.minFocus('project', ent).toFixed(2))
        Log.ui.write('secFmax', Log.data.maxFocus('project', ent).toFixed(2))

        Log.vis.focusBar('project', ent, 'projectDetailFocus')
        Log.vis.legend('project', ent, 'projectLegend')
      }
    },

    /**
     * View project details
     * @param {string} pro - Project
     */
    project(pro = Log.data.listProjects().sort()[0]) {
      Log.detail.clear.project()

      if (pro === undefined) return
      if (pro.length === 0) return

      let ent = Log.data.getEntriesByProject(pro, Log.data.getRecentEntries(Log.config.ui.view - 1))
      let his = Log.data.getEntriesByProject(pro)

      Log.ui.write('projectTitle', pro)

      let timeago = ent.length === 0 ? `No activity in the past ${Log.config.ui.view} days` : `Updated ${Log.time.timeago(Log.time.parse(ent.slice(-1)[0].e) * 1E3)}`

      Log.ui.write('projectLastUpdate', timeago)

      Log.ui.write('proEnt', his.length)
      Log.ui.write('proLHH', Log.data.lh(his).toFixed(2))
      Log.ui.write('proLSNH', Log.data.lsmin(his).toFixed(2))
      Log.ui.write('proLSXH', Log.data.lsmax(his).toFixed(2))
      Log.ui.write('proASD', Log.data.asd(his).toFixed(2))
      Log.ui.write('proLPH', Log.data.lp(his).toFixed(2))
      Log.ui.write('proPHH', Log.data.peakHour(Log.data.peakHours(his)))
      Log.ui.write('proPDH', Log.data.peakDay(Log.data.peakDays(his)))
      Log.ui.write('proStreak', Log.data.streak(his))

      Log.vis.peakH(his, 'proPeakTimes')
      Log.vis.peakD(his, 'proPeakDays')

      if (ent.length !== 0) {
        Log.vis.bar('projectChart', ent, 'sector')
        Log.vis.focusChart('sector', ent, 'proFocusChart')

        Log.ui.write('proAFH', Log.data.focusAvg(ent).toFixed(2))
        Log.ui.write('proFmin', Log.data.minFocus('sector', ent).toFixed(2))
        Log.ui.write('proFmax', Log.data.maxFocus('sector', ent).toFixed(2))

        Log.vis.focusBar('sector', ent, 'sectorDetailFocus')
        Log.vis.legend('sector', ent, 'sectorLegend')
      }
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

  journal: {

    /**
     * Display entries from a date
     * @param {Object=} hex - Hex code
     */
    display(date = new Date()) {
      Log.journal.clear()

      let entries = Log.data.getEntriesByDate(date)

      if (entries.length === 0) return

      let months = 'January February March April May June July August September October November December'.split(' ')

      document.getElementById('journalDate').innerHTML = Log.time.displayDate(date)

      Log.vis.day(date, 'journalDay')

      Log.ui.write('jLHT', Log.data.lh(entries).toFixed(2))
      Log.ui.write('jLSN', Log.data.lsmin(entries).toFixed(2))
      Log.ui.write('jLSX', Log.data.lsmax(entries).toFixed(2))
      Log.ui.write('jASDT', Log.data.asd(entries).toFixed(2))
      Log.ui.write('jLPT', Log.data.lp(entries).toFixed(2))
      Log.ui.write('jfocusToday', Log.data.projectFocus(Log.data.listProjects(entries)).toFixed(2))

      for (let i = 0, l = entries.length; i < l; i++) {
        let li = document.createElement('li')
        let time = document.createElement('span')
        let info = document.createElement('span')
        let duration = document.createElement('span')
        let entry = document.createElement('p')
        let es = Log.time.parse(entries[i].s)
        let ee = Log.time.parse(entries[i].e)
        let start = Log.time.convert(es)
        let end = Log.time.convert(ee)

        li.className = i !== l - 1 ? 'f6 lhc mb3 bt pt3' : 'f6 lhc bt pt3'
        time.className = 'mr3 o7'
        info.className = 'o7'
        duration.className = 'rf o7'
        entry.className = 'f4 lhc'

        time.innerHTML = `${date.getHours()}:${date.getMinutes()}`
        info.innerHTML = `${entries[i].c} - ${entries[i].t}`
        duration.innerHTML = `${Log.time.duration(entries[i].s, entries[i].e).toFixed(2)} h`
        entry.innerHTML = entries[i].d

        li.appendChild(time)
        li.appendChild(info)
        li.appendChild(duration)
        li.appendChild(entry)

        let list = ''
        if (start.getHours() >= 0 && start.getHours() < 12) {
          list = 'morningEntries'
        } else if (start.getHours() >= 12 && start.getHours() < 18) {
          list = 'afternoonEntries'
        } else {
          list = 'eveningEntries'
        }

        document.getElementById(list).appendChild(li)
      }
    },

    /**
     * Clear journal
     */
    clear() {
      Log.ui.empty('journalDay')
      Log.ui.empty('morningEntries')
      Log.ui.empty('afternoonEntries')
      Log.ui.empty('eveningEntries')
    },

    /**
     * Journal navigation
     */
    nav() {
      let entries = Log.data.sortEntries().reverse()
      let months = 'January February March April May June July August September October November December'.split(' ')

      for (let i = 0, l = entries.length; i < l; i++) {
        if (entries[i].length !== 0) {
          let li = document.createElement('li')
          let date = Log.time.convert(Log.time.parse(entries[i][0].s))

          li.className = 'lhd c-pt'
          li.innerHTML = Log.time.displayDate(date)
          // li.innerHTML = `${months[date.getMonth()]} ${date.getDate()}`

          li.setAttribute('onclick', `Log.journal.translate('${Log.time.toHex(date)}')`)
          document.getElementById('journalNav').appendChild(li)
        }
      }
    },

    translate(hex) {
      Log.journal.display(Log.time.convert(Log.time.parse(hex)))
    }
  },

  utils: {

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

  reset() {
    clearInterval(Log.clock)
    Log.ui.write('timer', '00:00:00')

    Log.ui.write('fsf', '&mdash;')
    Log.ui.write('fpf', '&mdash;')
    Log.ui.write('fpt', '00:00')
    Log.ui.write('fsd', '0.00 h')

    let el = 'phc pdc dayChart weekChart peakTimesHistory sectorBars projectBars sectorsList projectsList vis logbook focusChart sectorFocusBar sectorLegendSummary journalNav'.split(' ')

    for (let i = 0, l = el.length; i < l; i++) {
      Log.ui.empty(el[i])
    }
  },

  nav: {
    menu: 'ovw lis vis tab jou gui'.split(' '),
    index: 0,

    horizontal() {
      Log.nav.index = Log.nav.index === 5 ? 0 : Log.nav.index + 1
      Log.tab(Log.nav.menu[Log.nav.index], 'sect', 'tab')
    }
  },

  init() {
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

        if (Log.console.history.length >= 100) Log.console.history.shift()

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
      } else if (e.which === 38) {
        cmd.style.display = 'block'
        con.focus()
        cmdIndex++

        if (cmdIndex > Log.console.history.length) {
          cmdIndex = Log.console.history.length
        }

        con.value = Log.console.history[Log.console.history.length - cmdIndex]
      } else if (e.which === 40) {
        cmd.style.display = 'block'
        con.focus()
        cmdIndex--

        if (cmdIndex < 1) cmdIndex = 1
        con.value = Log.console.history[Log.console.history.length - cmdIndex]
      } else if (e.key === 'Tab') {
        e.preventDefault()
        Log.nav.horizontal()
      }

      if (e.key === 'o' && (e.ctrlKey || e.metaKey)) {
      	e.preventDefault()
      	Log.console.importUser()
      	return
      }

      if (e.key === 'e' && (e.ctrlKey || e.metaKey)) {
      	e.preventDefault()
      	Log.console.exportUser()
      	return
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
      return
    }

    Log.log = Log.data.parse(user.log)
    Log.config = user.config
    Log.palette = user.palette
    Log.projectPalette = user.projectPalette

    document.getElementById('app').style.backgroundColor = Log.config.ui.bg
    document.getElementById('app').style.color = Log.config.ui.colour

    if (user.log.length === 0 || Log.log.length === 0) {
      Log.nav.index = 5
      Log.tab('gui', 'sect', 'tab')
      return
    }

    let n = new Date()
    let en = Log.data.getEntriesByDate(n)
    let mn = Log.data.getRecentEntries(Log.config.ui.view - 1)

    Log.timer(Log.status())

    Log.vis.peakH(Log.data.sortEntriesByDay()[n.getDay()])
    Log.vis.peakD()

    Log.ui.write('fsf', Log.data.forecast.sf())
    Log.ui.write('fpf', Log.data.forecast.pf())
    Log.ui.write('fpt', Log.data.forecast.pt())
    Log.ui.write('flh', `${Log.data.forecast.lh().toFixed(2)} h`)
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
    Log.ui.write('secCount', Log.data.listSectors().length)
    Log.ui.write('proCount', Log.data.listProjects().length)
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

    Log.display(undefined, 1000)

    Log.journal.display()
    Log.journal.nav()
  }
}
