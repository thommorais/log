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
    durations: []
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
      ic.innerHTML = id

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

      write('sectorTitle', sec)
      write('sectorLastUpdate', ago)

      write('sEnt', his.length)
      write('sLHH', `${Log.data.total(dur).toFixed(2)} h`)
      write('sLSNH', `${Log.data.min(dur).toFixed(2)} h`)
      write('sLSXH', `${Log.data.max(dur).toFixed(2)} h`)
      write('sASD', `${Log.data.avg(dur).toFixed(2)} h`)
      write('sPHH', Log.data.peakHour(Log.data.peakHours(his)))
      write('sPDH', Log.data.peakDay(Log.data.peakDays(his)))
      write('sStreak', Log.data.streak(Log.data.sortEntries(his)))

      Log.vis.peakChart('hours', Log.data.peakHours(his), 'sPeakTimes')
      Log.vis.peakChart('days', Log.data.peakDays(his), 'sPeakDays')

      if (!isEmpty(ent)) {
        const foc = Log.data.listFocus('project', Log.data.sortEntries(ent))

        Log.vis.bar(Log.data.bar(ent, 'project'), 'sectorChart')
        Log.vis.focusChart('project', ent, 'sFocusChart')

        write('sFavg', Log.data.avg(foc).toFixed(2))
        write('sFmin', Log.data.min(foc).toFixed(2))
        write('sFmax', Log.data.max(foc).toFixed(2))

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

      write('projectTitle', pro)
      write('projectLastUpdate', ago)

      write('pEnt', his.length)
      write('pLHH', `${Log.data.total(durations).toFixed(2)} h`)
      write('pLSNH', `${Log.data.min(durations).toFixed(2)} h`)
      write('pLSXH', `${Log.data.max(durations).toFixed(2)} h`)
      write('pASD', `${Log.data.avg(durations).toFixed(2)} h`)
      write('pPHH', Log.data.peakHour(Log.data.peakHours(his)))
      write('pPDH', Log.data.peakDay(Log.data.peakDays(his)))
      write('pStreak', Log.data.streak(Log.data.sortEntries(his)))

      Log.vis.peakChart('hours', Log.data.peakHours(his), 'pPeakTimes')
      Log.vis.peakChart('days', Log.data.peakDays(his), 'pPeakDays')

      if (!isEmpty(ent)) {
        const foc = Log.data.listFocus('sector', Log.data.sortEntries(ent))

        Log.vis.bar(Log.data.bar(ent), 'projectChart')
        Log.vis.focusChart('sec', ent, 'pFocusChart')

        write('pFavg', Log.data.avg(foc).toFixed(2))
        write('pFmin', Log.data.min(foc).toFixed(2))
        write('pFmax', Log.data.max(foc).toFixed(2))

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

  journal: {

    /**
     * Display entries from a date
     * @param {Object=} hex - Hex code
     */
    display(date = new Date()) {
      if (!isObject(date)) return

      Log.journal.clear()

      const ent = Log.data.entriesByDate(date)

      if (isEmpty(ent)) return

      journalDate.innerHTML = Log.time.displayDate(date)

      Log.vis.day(date, 'journalDay')

      const dur = Log.data.listDurations(ent)

      write('jLHT', `${Log.data.total(dur).toFixed(2)} h`)
      write('jLSN', `${Log.data.min(dur).toFixed(2)} h`)
      write('jLSX', `${Log.data.max(dur).toFixed(2)} h`)
      write('jASDT', `${Log.data.avg(dur).toFixed(2)} h`)
      write('jLPT', `${Log.data.lp(ent).toFixed(2)}%`)
      write('jfocusToday', Log.data.proFocus(Log.data.listPro(ent)).toFixed(2))

      const l = ent.length

      ent.map(({id, s, e, c, t, d, dur}, i) => {
        const cl = i !== l - 1 ? 'f6 lhc bb pb3 mb3' : 'f6 lhc'

        append('journalEntries', createEl(
          `<li class="${cl}">
            <span class="mr3 o7">#${id}</span>
            <span class="mr3 o7">
              ${Log.time.stamp(Log.time.convert(s))} &ndash;
              ${Log.time.stamp(Log.time.convert(e))}
            </span>
            <span class="mr3 o7">${c}</span>
            <span class="o7">${t}</span>
            <span class="rf o7">${dur.toFixed(2)} h</span>
            <p class="f4 lhc">${d}</p>
          </li>`
        ))
      })
    },

    /**
     * Clear journal
     */
    clear() {
      clear('journalDay')
      clear('journalEntries')
    },

    /**
     * Journal navigation
     */
    nav() {
      const ent = Log.cache.sortEntries.reverse()
      !isEmpty(ent) && ent.map((e, i) => {
        if (!isEmpty(e)) {
          const s = e[0].s
          journalNav.appendChild(createEl(
            `<li class="lhd c-pt" onclick="Log.journal.translate('${s}')">
              ${Log.time.displayDate(Log.time.convert(s))}
            </li>`
          ))
        }
      })
    },

    /**
     * Convert hex into Date and display in Journal
     * @param {string} h - Hexadecimal time
     */
    translate(h) {
      Log.journal.display(Log.time.convert(h))
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

      return (new Date(y, m, d, s.getHours(), s.getMinutes(), s.getSeconds()).getTime() / 1E3 - (new Date(y, m, d).getTime() / 1E3)) / 86400 * 100
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

    'phc pdc dayChart weekChart peakTimesHistory peakDaysHistory sectorBars projectBars sectorsList projectsList visual logbook focusChart sectorFocusBar sectorLegendSummary journalNav journalDay journalEntries'.split(' ').map(e => clear(e))
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
      write('fsf', Log.data.forecast.sf())
      write('flh', `${Log.data.forecast.lh().toFixed(2)} h`)
      write('fsd', `${Log.data.forecast.sd().toFixed(2)} h`)
    }

    Log.vis.day()
    Log.vis.bar(Log.data.bar(mn), 'weekChart')

    if (!isEmpty(en)) {
      write('LHT', `${Log.data.lh(en).toFixed(2)} h`)
      write('LSN', `${Log.data.min(dur).toFixed(2)} h`)
      write('LSX', `${Log.data.max(dur).toFixed(2)} h`)
      write('ASDT', `${Log.data.avg(dur).toFixed(2)} h`)
      write('LPT', `${Log.data.lp(en).toFixed(2)}%`)
      write('FOC', Log.data.proFocus(Log.data.listPro(en)).toFixed(2))
      write('ENC', en.length)
      write('STK', Log.data.streak())

      const now = Log.log.slice(-1)[0]
      const date = Log.time.convert(now.s)
      const startTime = Log.time.stamp(date)
      const endTime = Log.time.stamp(Log.time.convert(now.e))

      isUndefined(now.e) ?
      write('lastTime', `${startTime}&ndash;`) :
      write('lastTime', `${startTime}&ndash;${endTime}`)

      write('lastID', user.log.length)
      write('lastSector', now.c)
      write('lastProject', now.t)
      write('lastDescription', now.d)
    }

    Log.vis.list('sec', 'hours', 'sectorBars', en)
    Log.vis.list('pro', 'hours', 'projectBars', en)

    write('LHH', `${hLh.toFixed(2)} h`)
    write('LSNH', `${Log.data.min(Log.cache.durations).toFixed(2)} h`)
    write('LSXH', `${Log.data.max(Log.cache.durations).toFixed(2)} h`)
    write('ASD', `${Log.data.avg(Log.cache.durations).toFixed(2)} h`)
    write('ALHH', `${Log.data.avgLh().toFixed(2)} h`)
    write('LPH', `${Log.data.lp().toFixed(2)}%`)
    write('entCount', user.log.length)
    write('secCount', Log.cache.sectorCount)
    write('proCount', Log.cache.projectCount)
    write('PHH', Log.data.peakHour())
    write('PDH', Log.data.peakDay())

    Log.vis.peakChart('hours', Log.cache.peakHours, 'peakTimesHistory')
    Log.vis.peakChart('days', Log.cache.peakDays, 'peakDaysHistory')
    Log.vis.focusChart('pro', mn)

    write('Favg', Log.data.avg(Log.cache.proFocus).toFixed(2))
    write('Fmin', Log.data.min(Log.cache.proFocus).toFixed(2))
    write('Fmax', Log.data.max(Log.cache.proFocus).toFixed(2))

    Log.vis.focusBar('sec', Log.log, 'sectorFocusBar')
    Log.vis.legend('sec', Log.log, 'sectorLegendSummary')

    if (Log.log.length !== 1) {
      Log.detail.sec(Log.data.sortValues(Log.log, 'sec', 'hours')[0][0])
      Log.vis.list('sec', 'hours', 'sectorsList')
      Log.detail.pro(Log.data.sortValues(Log.log, 'pro', 'hours')[0][0])
      Log.vis.list('pro', 'hours', 'projectsList')
    }

    Log.vis.line(Log.data.line(mn), 'visual')
    Log.display(Log.log, 100)
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
