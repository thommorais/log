/**
 * Log
 * A log and time-tracking system
 *
 * @author Josh Avanier
 * @license MIT
 */

'use strict';

var Log = {

  path: '',

  log: [],
  config: {},
  palette: {},
  projectPalette: {},
  clock: {},

  keyEventInitialized: false,

  cache: {
    sortEntries: [],
    sectors: [],
    sectorCount: 0,
    secFocus: [],
    projects: [],
    projectCount: 0,
    proFocus: [],
    peakHours: [],
    peakDays: [],
    durations: [],

    entriesByDay: []
  },

  setCache() {
    Log.cache.sortEntries = Log.data.sortEntries()
    Log.cache.sectors = Log.data.listSec()
    Log.cache.sectorCount = Log.cache.sectors.length
    Log.cache.secFocus = Log.data.listFocus('sector')
    Log.cache.projects = Log.data.listPro()
    Log.cache.projectCount = Log.cache.projects.length
    Log.cache.proFocus = Log.data.listFocus('project')
    Log.cache.peakHours = Log.data.peakHours()
    Log.cache.peakDays = Log.data.peakDays()
    Log.cache.durations = Log.data.listDurations()
    Log.cache.entriesByDay = Log.data.entriesByDay(new Date().getDay())
  },

  /**
   * Get log status; true means a session is in progress
   * @returns {boolean} Log status
   */
  status() {
    if (isEmpty(Log.log)) return
    return isUndefined(Log.log.slice(-1)[0].e) ? true : false
  },

  /**
   * Display a session timer
   * @param {boolean} status - Log status
   */
  timer(status) {
    if (status) {
      const l = Log.time.convert(
        Log.log.slice(-1)[0].s
      ).getTime()

      Log.clock = setInterval(_ => {
        let s = ~~((new Date().getTime() - l) / 1E3)
        let m = ~~(s / 60)
        let h = ~~(m / 60)

        h %= 24
        m %= 60
        s %= 60

        if (Log.config.system.timeFormat === 'decimal') {
          write('timer', Log.time.toDecimal(~~((new Date().getTime() - l) / 1E3)))
        } else {
          write('timer', `${`0${h}`.substr(-2)}:${`0${m}`.substr(-2)}:${`0${s}`.substr(-2)}`)
        }
      }, 1E3)
    } else return
  },

  /**
   * Play a sound effect
   * @param {string} sound - name of the sound file in /media
   */
  playSoundEffect(sound) {
    const audio = new Audio(`${__dirname}/media/${sound}.mp3`)
    audio.play()
  },

  /**
   * Display a log table
   * @param {Object[]=} ent - Entries
   * @param {number=} num - Number of entries to show
   * @param {string=} con - Container
   */
  display(ent = user.log, num = 50, con = 'logbook') {
    if (!isValidArray(ent) || isEmpty(ent) || !isNumber(num) ||
    !isString(con) || !exists(con)) return

    ent.slice(ent.length - num).reverse().map(({id, s, e, c, t, d}, i) => {
      const rw = document.getElementById(con).insertRow(i)
      const date = Log.time.convert(s)
      const ic = rw.insertCell(0)
      const dc = rw.insertCell(1)
      const st = Log.time.stamp(date)

      ic.className = 'pl0'
      ic.innerHTML = ent.length - i

      dc.className = 'c-pt'
      dc.innerHTML = Log.time.displayDate(date)
      dc.setAttribute('onclick', `Log.nav.toJournal('${s}')`)

      if (isUndefined(e)) {
        rw.insertCell(2).innerHTML = `${st}`
        rw.insertCell(3).innerHTML = '&mdash;'
      } else {
        rw.insertCell(2).innerHTML = `${st}&ndash;${Log.time.stamp(Log.time.convert(e))}`

        if (Log.config.system.timeFormat === 'decimal') {
          rw.insertCell(3).innerHTML = Log.time.toDecimal(Log.time.durationSeconds(s, e))
        } else {
          rw.insertCell(3).innerHTML = Log.time.duration(s, e).toFixed(2)
        }
      }

      const sc = rw.insertCell(4)
      const pc = rw.insertCell(5)

      sc.className = 'c-pt'
      pc.className = 'c-pt'

      sc.setAttribute('onclick', `Log.nav.toSectorDetail('${c}')`)
      pc.setAttribute('onclick', `Log.nav.toProjectDetail('${t}')`)

      sc.innerHTML = c
      pc.innerHTML = t

      rw.insertCell(6).innerHTML = d
    })
  },

  detail: {

    /**
     * View sector details
     * @param {string} sec - Sector
     */
    sec(sec = Log.cache.sectors.sort()[0]) {
      Log.detail.clear.sector()

      if (isUndefined(sec) || isEmpty(sec)) return

      const ent = Log.data.entriesBySector(sec, Log.data.recentEntries(Log.config.ui.view - 1))
      const his = Log.data.entriesBySector(sec)
      const ago = isEmpty(ent) ? `No activity in the past ${Log.config.ui.view} days` : `Updated ${Log.time.timeago(Log.time.parse(ent.slice(-1)[0].e) * 1E3)}`
      const dur = Log.data.listDurations(his)

      sectorTitle.innerHTML = sec
      sectorLastUpdate.innerHTML = ago

      sEnt.innerHTML = his.length
      sLHH.innerHTML = `${Log.data.total(dur).toFixed(2)} h`
      sLSNH.innerHTML = `${Log.data.min(dur).toFixed(2)} h`
      sLSXH.innerHTML = `${Log.data.max(dur).toFixed(2)} h`
      sASD.innerHTML = `${Log.data.avg(dur).toFixed(2)} h`
      sPHH.innerHTML = Log.data.peakHour(Log.data.peakHours(his))
      sPDH.innerHTML = Log.data.peakDay(Log.data.peakDays(his))
      sStreak.innerHTML = Log.data.streak(Log.data.sortEntries(his))

      Log.vis.peakChart('hours', Log.data.peakHours(his), 'sPeakTimes')
      Log.vis.peakChart('days', Log.data.peakDays(his), 'sPeakDays')

      if (!isEmpty(ent)) {
        const foc = Log.data.listFocus('project', Log.data.sortEntries(ent))

        Log.vis.bar(Log.data.bar(ent, 'project'), 'sectorChart')
        Log.vis.focusChart('project', ent, 'sFocusChart')

        sFavg.innerHTML = Log.data.avg(foc).toFixed(2)
        sFmin.innerHTML = Log.data.min(foc).toFixed(2)
        sFmax.innerHTML = Log.data.max(foc).toFixed(2)

        Log.vis.focusBar('pro', ent, 'projectDetailFocus')
        Log.vis.legend('pro', ent, 'projectLegend')
      }

      const con = 'secLogbook'

      if (!isValidArray(ent) || isEmpty(ent) || !exists(con)) return

      const arr = Log.data.entriesBySector(sec)

      arr.slice(arr.length - 100).reverse().map((e, i) => {
        const rw = document.getElementById(con).insertRow(i)
        const date = Log.time.convert(e.s)
        const start = Log.time.stamp(date)

        const idCell = rw.insertCell(0)
        idCell.className = 'pl0'
        idCell.innerHTML = e.id
        rw.insertCell(1).innerHTML = Log.time.displayDate(date)

        if (isUndefined(e.e)) {
          rw.insertCell(2).innerHTML = start
          rw.insertCell(3).innerHTML = '&ndash;'
        } else {
          rw.insertCell(2).innerHTML = `${start}&ndash;${Log.time.stamp(Log.time.convert(e.e))}`
          rw.insertCell(3).innerHTML = Log.time.duration(e.s, e.e).toFixed(2)
        }

        const proCell = rw.insertCell(4)
        proCell.className = 'c-pt'
        proCell.setAttribute('onclick', `Log.nav.toProjectDetail('${e.t}')`)
        proCell.innerHTML = e.t

        rw.insertCell(5).innerHTML = e.d
      })
    },

    /**
     * View project details
     * @param {string} pro - Project
     */
    pro(pro = Log.cache.projects.sort()[0]) {
      Log.detail.clear.project()

      if (isUndefined(pro) || isEmpty(pro)) return

      const ent = Log.data.entriesByProject(pro, Log.data.recentEntries(Log.config.ui.view - 1))
      const his = Log.data.entriesByProject(pro)
      const durations = Log.data.listDurations(his)
      const ago = isEmpty(ent) ? `No activity in the past ${Log.config.ui.view} days` : `Updated ${Log.time.timeago(Log.time.parse(ent.slice(-1)[0].e) * 1E3)}`

      projectTitle.innerHTML = pro
      projectLastUpdate.innerHTML = ago

      pEnt.innerHTML = his.length
      pLHH.innerHTML = `${Log.data.total(durations).toFixed(2)} h`
      pLSNH.innerHTML = `${Log.data.min(durations).toFixed(2)} h`
      pLSXH.innerHTML = `${Log.data.max(durations).toFixed(2)} h`
      pASD.innerHTML = `${Log.data.avg(durations).toFixed(2)} h`
      pPHH.innerHTML = Log.data.peakHour(Log.data.peakHours(his))
      pPDH.innerHTML = Log.data.peakDay(Log.data.peakDays(his))
      pStreak.innerHTML = Log.data.streak(Log.data.sortEntries(his))

      Log.vis.peakChart('hours', Log.data.peakHours(his), 'pPeakTimes')
      Log.vis.peakChart('days', Log.data.peakDays(his), 'pPeakDays')

      if (!isEmpty(ent)) {
        const foc = Log.data.listFocus('sector', Log.data.sortEntries(ent))

        Log.vis.bar(Log.data.bar(ent), 'projectChart')
        Log.vis.focusChart('sec', ent, 'pFocusChart')

        pFavg.innerHTML = Log.data.avg(foc).toFixed(2)
        pFmin.innerHTML = Log.data.min(foc).toFixed(2)
        pFmax.innerHTML = Log.data.max(foc).toFixed(2)

        Log.vis.focusBar('sec', ent, 'sectorDetailFocus')
        Log.vis.legend('sec', ent, 'sectorLegend')
      }

      const con = 'proLogbook'
      const arr = Log.data.entriesByProject(pro)

      arr.slice(arr.length - 100).reverse().map((e, i) => {
        const rw = document.getElementById(con).insertRow(i)
        const date = Log.time.convert(e.s)
        const start = Log.time.stamp(date)

        const idCell = rw.insertCell(0)
        idCell.className = 'pl0'
        idCell.innerHTML = e.id
        rw.insertCell(1).innerHTML = Log.time.displayDate(date)

        if (isUndefined(e.e)) {
          rw.insertCell(2).innerHTML = `${start}`
          rw.insertCell(3).innerHTML = '&ndash;'
        } else {
          rw.insertCell(2).innerHTML = `${start}&ndash;${Log.time.stamp(Log.time.convert(e.e))}`
          rw.insertCell(3).innerHTML = Log.time.duration(e.s, e.e).toFixed(2)
        }

        const secCell = rw.insertCell(4)
        secCell.className = 'c-pt'
        secCell.setAttribute('onclick', `Log.nav.toSectorDetail('${e.c}')`)
        secCell.innerHTML = e.c

        rw.insertCell(5).innerHTML = e.d
      })
    },

    clear: {

      /**
       * Clear sector details
       */
      sector() {
        'sectorTitle sectorChart sPeakTimes sPeakDays projectDetailFocus projectLegend sFocusChart secLogbook'.split(' ').map(e => clear(e))
      },

      /**
       * Clear project details
       */
      project() {
        'projectTitle projectLastUpdate projectChart sectorDetailFocus sectorLegend pPeakTimes pPeakDays pFocusChart proLogbook'.split(' ').map(e => clear(e))
      }
    }
  },

  utils: {

    /**
     * Calculate DP
     */
    calcDP(a) {
      if (isUndefined(a)) return
      const s = Log.time.convert(a)
      const y = s.getFullYear()
      const m = s.getMonth()
      const d = s.getDate()

      return ((new Date(y, m, d, s.getHours(), s.getMinutes(), s.getSeconds())).getTime() / 1E3 - (new Date(y, m, d)).getTime() / 1E3) / 86400 * 100
    }
  },

  /**
   * Open a tab
   */
  tab(s, g, t, v = false) {
    const x = document.getElementsByClassName(g)
    const b = document.getElementsByClassName(t)

    Log.nav.index = Log.nav.menu.indexOf(s)

    for (let i = 0, l = x.length; i < l; i++) {
      x[i].style.display = 'none'
    }

    for (let i = 0, l = b.length; i < l; i++) {
      b[i].className = v ?
        `db mb3 ${t} on bg-cl o5 mr3` :
        `pv1 ${t} on bg-cl o5 mr3`
    }

    document.getElementById(s).style.display = 'block'
    document.getElementById(`b-${s}`).className = v ?
      `db mb3 ${t} on bg-cl of mr3` :
      `pv1 ${t} on bg-cl of mr3`
  },

  /**
   * Refresh
   */
  refresh() {
    Log.reset()
    Log.load()
  },

  reset() {
    clearInterval(Log.clock)
    write('timer', '00:00:00')

    'phc pdc dyc ovc pth pdh sectorBars projectBars sectorsList projectsList visual logbook focusChart sectorFocusBar sectorLegendSummary jNav jDyc jEnt cal'.split(' ').map(e => clear(e))
  },

  nav: {
    menu: 'ovw lis vis tab jou gui'.split(' '),
    index: 0,

    horizontal() {
      Log.nav.index = Log.nav.index === 5 ? 0 : Log.nav.index + 1
      Log.tab(Log.nav.menu[Log.nav.index], 'sect', 'tab')
    },

    /**
     * Navigate to journal entry
     * @param {string} h - Hexadecimal time
     */
    toJournal(h) {
      Log.tab('jou', 'sect', 'tab')
      Log.journal.translate(h)
    },

    /**
     * Navigate to sector detail
     * @param {string} s - Sector
     */
    toSectorDetail(s) {
      Log.tab('lis', 'sect', 'tab')
      Log.tab('sec', 'subsect', 'subtab', true)
      Log.detail.sec(s)
    },

    /**
     * Navigate to project detail
     * @param {string} p - Project
     */
    toProjectDetail(p) {
      Log.tab('lis', 'sect', 'tab')
      Log.tab('pro', 'subsect', 'subtab', true)
      Log.detail.pro(p)
    }
  },

  cmd: {
    index: 0,

    show() {
      cmd.style.display = 'block'
      con.focus()
    },

    hide() {
      con.value = ''
      cmd.style.display = 'none'
    }
  },

  load() {
    Log.config = user.config
    Log.palette = user.palette
    Log.projectPalette = user.projectPalette
    Log.log = Log.data.parse(user.log)

    ui.style.backgroundColor = Log.config.ui.bg
    ui.style.color = Log.config.ui.colour

    if (isEmpty(user.log)) {
      Log.nav.index = 5
      Log.tab('gui', 'sect', 'tab')
      return
    }

    Log.setCache()

    Log.timer(Log.status())

    const en = Log.data.entriesByDate()
    const mn = Log.data.recentEntries(Log.config.ui.view - 1)
    const dur = Log.data.listDurations(en)
    const hLh = Log.data.total(Log.cache.durations)

    Log.vis.peakChart('hours', Log.data.peakHours(Log.data.sortEntriesByDay()[new Date().getDay()]), 'phc')
    Log.vis.peakChart('days', Log.cache.peakDays, 'pdc')

    if (Log.log.length !== 1) {
      fsf.innerHTML = Log.data.forecast.sf()
      flh.innerHTML = `${Log.data.forecast.lh().toFixed(2)} h`
      fsd.innerHTML = `${Log.data.forecast.sd().toFixed(2)} h`
    }

    Log.vis.meterLines('ovwMeter')
    Log.vis.day()
    Log.vis.bar(Log.data.bar(mn), 'ovc')

    if (!isEmpty(en)) {
      LHT.innerHTML = `${Log.data.lh(en).toFixed(2)} h`
      LSN.innerHTML = `${Log.data.min(dur).toFixed(2)} h`
      LSX.innerHTML = `${Log.data.max(dur).toFixed(2)} h`
      ASDT.innerHTML = `${Log.data.avg(dur).toFixed(2)} h`
      LPT.innerHTML = `${Log.data.lp(en).toFixed(2)}%`
      FOC.innerHTML = Log.data.proFocus(Log.data.listPro(en)).toFixed(2)
      ENC.innerHTML = en.length
      STK.innerHTML = Log.data.streak()

      const now = Log.log.slice(-1)[0]
      const date = Log.time.convert(now.s)
      const startTime = Log.time.stamp(date)
      const endTime = Log.time.stamp(Log.time.convert(now.e))

      lastTime.innerHTML = isUndefined(now.e) ? `${startTime}&ndash;` : `${startTime}&ndash;${endTime}`

      lastID.innerHTML = user.log.length
      lastSector.innerHTML = now.c
      lastProject.innerHTML = now.t
      lastDescription.innerHTML = now.d
    }

    Log.vis.list('sec', 'hours', 'sectorBars', en)
    Log.vis.list('pro', 'hours', 'projectBars', en)

    LHH.innerHTML = `${hLh.toFixed(2)} h`
    LSNH.innerHTML = `${Log.data.min(Log.cache.durations).toFixed(2)} h`
    LSXH.innerHTML = `${Log.data.max(Log.cache.durations).toFixed(2)} h`
    ASD.innerHTML = `${Log.data.avg(Log.cache.durations).toFixed(2)} h`
    ALHH.innerHTML = `${Log.data.avgLh().toFixed(2)} h`
    LPH.innerHTML = `${Log.data.lp().toFixed(2)}%`
    entCount.innerHTML = user.log.length
    secCount.innerHTML = Log.cache.sectorCount
    proCount.innerHTML = Log.cache.projectCount
    PHH.innerHTML = Log.data.peakHour()
    PDH.innerHTML = Log.data.peakDay()

    Log.vis.peakChart('hours', Log.cache.peakHours, 'pth')
    Log.vis.peakChart('days', Log.cache.peakDays, 'pdh')
    Log.vis.focusChart('pro', mn)

    Favg.innerHTML = Log.data.avg(Log.cache.proFocus).toFixed(2)
    Fmin.innerHTML = Log.data.min(Log.cache.proFocus).toFixed(2)
    Fmax.innerHTML = Log.data.max(Log.cache.proFocus).toFixed(2)

    Log.vis.focusBar('sec', Log.log, 'sectorFocusBar')
    Log.vis.legend('sec', Log.log, 'sectorLegendSummary')

    if (Log.log.length !== 1) {
      Log.detail.sec(Log.data.sortValues(Log.log, 'sec', 'hours')[0][0])
      Log.vis.list('sec', 'hours', 'sectorsList')
      Log.detail.pro(Log.data.sortValues(Log.log, 'pro', 'hours')[0][0])
      Log.vis.list('pro', 'hours', 'projectsList')
    }

    Log.vis.meterLines('visMeter')
    Log.vis.line(Log.data.line(mn), 'visual')
    Log.display(user.log, 100)
    Log.journal.cal()
    Log.vis.meterLines('jMeter')
    Log.journal.display()
    Log.journal.nav()
  },

  init() {
    if (localStorage.hasOwnProperty('logHistory')) {
      Log.console.history = JSON.parse(localStorage.getItem('logHistory')) || []
    } else {
      Log.console.history = []
      localStorage.setItem('logHistory', JSON.stringify(Log.console.history))
    }

    cmd.addEventListener('submit', function() {
    Log.cmd.index = 0
      if (con.value !== '') {
        if (con.value != Log.console.history[Log.console.history.length - 1]) Log.console.history.push(con.value)
        if (Log.console.history.length >= 100) Log.console.history.shift()
        localStorage.setItem('logHistory', JSON.stringify(Log.console.history))
        Log.console.parse(con.value)
      }

      Log.cmd.hide()
    })

    if (!Log.keyEventInitialized) {
      Log.keyEventInitialized = true

      document.onkeydown = e => {
        if (e.which >= 65 && e.which <= 90) {
          Log.cmd.show()
        } else if (e.which >= 48 && e.which <= 54 && (e.ctrlKey || e.metaKey)) {
          Log.nav.index = e.which - 49
          Log.tab(Log.nav.menu[Log.nav.index], 'sect', 'tab')
        } else if (e.key === 'Escape') {
          Log.cmd.hide()
          Log.cmd.index = 0
        } else if (e.which === 38) {
          Log.cmd.show()
          Log.cmd.index++

          const history = Log.console.history.length

          if (Log.cmd.index > history) {
            Log.cmd.index = history
          }

          con.value = Log.console.history[history - Log.cmd.index]
        } else if (e.which === 40) {
          cmd.style.display = 'block'
          con.focus()
          Log.cmd.index--

        if (Log.cmd.index < 1) Log.cmd.index = 1
        con.value = Log.console.history[Log.console.history.length - Log.cmd.index]
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
      }
    }

    let user = {
      config: dataStore.get('config') || {},
      palette: dataStore.get('palette') || {},
      projectPalette: dataStore.get('projectPalette') || {},
      log: dataStore.get('log') || []
    }

    Log.load()
  }
}
