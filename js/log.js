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
    sectorFocus: [],
    projects: [],
    projectCount: 0,
    projectFocus: [],
    peakHours: [],
    peakDays: [],
    durations: []
  },

  /**
   * Get log status; true means a session is in progress
   * @returns {boolean} Log status
   */
  status() {
    if (isEmpty(Log.log)) return
    return Log.log.slice(-1)[0].e === 'undefined' ? true : false
  },

  /**
   * Display a session timer
   * @param {boolean} status - Log status
   */
  timer(status) {
    if (status) {
      const l = Log.time.convert(
        Log.time.parse(Log.log.slice(-1)[0].s)
      ).getTime()

      Log.clock = setInterval(() => {
        let s = Math.floor((new Date().getTime() - l) / 1E3)
        let m = Math.floor(s / 60)
        let h = Math.floor(m / 60)

        h %= 24
        m %= 60
        s %= 60

        write('timer', `${`0${h}`.substr(-2)}:${`0${m}`.substr(-2)}:${`0${s}`.substr(-2)}`)
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
    if (!isValidArray(ent) || isEmpty(ent) || !isNumber(num) || !isString(con) || !exists(con)) return

    Log.utils.takeRight(ent, num).reverse().map((e, i) => {
      const rw = document.getElementById(con).insertRow(i)
      const date = Log.time.convert(Log.time.parse(e.s))

      const idCell = rw.insertCell(0)
      idCell.className = 'pl0'
      idCell.innerHTML = e.id

      const dateCell = rw.insertCell(1)
      dateCell.className = 'c-pt'
      dateCell.innerHTML = Log.time.displayDate(date)

      dateCell.setAttribute('onclick', `Log.nav.toJournal('${e.s}')`)

      const startTime = Log.time.stamp(date)
      const endTime = Log.time.stamp(Log.time.convert(Log.time.parse(e.e)))

      if (e.e === 'undefined') {
        rw.insertCell(2).innerHTML = `${startTime}`
        rw.insertCell(3).innerHTML = '&ndash;'
      } else {
        rw.insertCell(2).innerHTML = `${startTime}&ndash;${endTime}`
        rw.insertCell(3).innerHTML = `${Log.time.duration(e.s, e.e).toFixed(2)} h`
      }

      const secCell = rw.insertCell(4)
      const proCell = rw.insertCell(5)

      secCell.className = 'c-pt'
      proCell.className = 'c-pt'

      secCell.setAttribute('onclick', `Log.nav.toSectorDetail('${e.c}')`)

      proCell.setAttribute('onclick', `Log.nav.toProjectDetail('${e.t}')`)

      secCell.innerHTML = e.c
      proCell.innerHTML = e.t
      rw.insertCell(6).innerHTML = e.d
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

      const ent = Log.data.getEntriesBySector(sec, Log.data.getRecentEntries(Log.config.ui.view - 1))
      const his = Log.data.getEntriesBySector(sec)

      write('sectorTitle', sec)

      const timeago = isEmpty(ent) ? `No activity in the past ${Log.config.ui.view} days` : `Updated ${Log.time.timeago(Log.time.parse(ent.slice(-1)[0].e) * 1E3)}`

      write('sectorLastUpdate', timeago)

      const durations = Log.data.listDurations(his)

      write('sEnt', his.length)
      write('sLHH', `${Log.data.total(durations).toFixed(2)} h`)
      write('sLSNH', `${Log.data.min(durations).toFixed(2)} h`)
      write('sLSXH', `${Log.data.max(durations).toFixed(2)} h`)
      write('sASD', `${Log.data.avg(durations).toFixed(2)} h`)
      write('sPHH', Log.data.peakHour(Log.data.peakHours(his)))
      write('sPDH', Log.data.peakDay(Log.data.peakDays(his)))
      write('sStreak', Log.data.streak(Log.data.sortEntries(his)))

      Log.vis.peakChart('hours', Log.data.peakHours(his), 'sPeakTimes')
      Log.vis.peakChart('days', Log.data.peakDays(his), 'sPeakDays')

      if (!isEmpty(ent)) {
        const mode = Log.config.ui.colourMode === 'none' ? 'none' : 'project'
        const focus = Log.data.listFocus('project', Log.data.sortEntries(ent))
        const data = Log.data.bar(ent)

        Log.vis.bar(data, 'sectorChart')
        Log.vis.focusChart('project', ent, 'sFocusChart')

        write('sFavg', Log.data.avg(focus).toFixed(2))
        write('sFmin', Log.data.min(focus).toFixed(2))
        write('sFmax', Log.data.max(focus).toFixed(2))

        Log.vis.focusBar('pro', ent, 'projectDetailFocus')
        Log.vis.legend('pro', ent, 'projectLegend')
      }

      const con = 'secLogbook'

      if (!isValidArray(ent) || isEmpty(ent) || !exists(con)) return

      Log.utils.takeRight(Log.data.getEntriesBySector(sec), 100).reverse().map((e, i) => {
        const rw = document.getElementById(con).insertRow(i)
        const date = Log.time.convert(Log.time.parse(e.s))
        const startTime = Log.time.stamp(date)
        const endTime = Log.time.stamp(Log.time.convert(Log.time.parse(e.e)))

        const idCell = rw.insertCell(0)
        idCell.className = 'pl0'
        idCell.innerHTML = e.id
        rw.insertCell(1).innerHTML = Log.time.displayDate(date)

        if (e.e === 'undefined') {
          rw.insertCell(2).innerHTML = `${startTime}`
          rw.insertCell(3).innerHTML = '&ndash;'
        } else {
          rw.insertCell(2).innerHTML = `${startTime}&ndash;${endTime}`
          rw.insertCell(3).innerHTML = `${Log.time.duration(e.s, e.e).toFixed(2)} h`
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

      const ent = Log.data.getEntriesByProject(pro, Log.data.getRecentEntries(Log.config.ui.view - 1))
      const his = Log.data.getEntriesByProject(pro)
      const durations = Log.data.listDurations(his)

      write('projectTitle', pro)

      const timeago = isEmpty(ent) ? `No activity in the past ${Log.config.ui.view} days` : `Updated ${Log.time.timeago(Log.time.parse(ent.slice(-1)[0].e) * 1E3)}`

      write('projectLastUpdate', timeago)

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
        const mode = Log.config.ui.colourMode === 'none' ? 'none' : 'sector'
        const focus = Log.data.listFocus('sector', Log.data.sortEntries(ent))
        const data = Log.data.bar(ent)

        Log.vis.bar(data, 'projectChart')
        Log.vis.focusChart('sector', ent, 'pFocusChart')

        write('pFavg', Log.data.avg(focus).toFixed(2))
        write('pFmin', Log.data.min(focus).toFixed(2))
        write('pFmax', Log.data.max(focus).toFixed(2))

        Log.vis.focusBar('sec', ent, 'sectorDetailFocus')
        Log.vis.legend('sec', ent, 'sectorLegend')
      }

      const con = 'proLogbook'

      Log.utils.takeRight(Log.data.getEntriesByProject(pro), 100).reverse().map((e, i) => {
        const rw = document.getElementById(con).insertRow(i)
        const date = Log.time.convert(Log.time.parse(e.s))

        const startTime = Log.time.stamp(date)
        const endTime = Log.time.stamp(Log.time.convert(Log.time.parse(e.e)))

        const idCell = rw.insertCell(0)
        idCell.className = 'pl0'
        idCell.innerHTML = e.id
        rw.insertCell(1).innerHTML = Log.time.displayDate(date)

        if (e.e === 'undefined') {
          rw.insertCell(2).innerHTML = `${startTime}`
          rw.insertCell(3).innerHTML = '&ndash;'
        } else {
          rw.insertCell(2).innerHTML = `${startTime}&ndash;${endTime}`
          rw.insertCell(3).innerHTML = `${Log.time.duration(e.s, e.e).toFixed(2)} h`
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

      const entries = Log.data.getEntriesByDate(date)

      if (isEmpty(entries)) return

      document.getElementById('journalDate').innerHTML = Log.time.displayDate(date)

      Log.vis.day(date, 'journalDay')

      const durations = Log.data.listDurations(entries)

      write('jLHT', `${Log.data.total(durations).toFixed(2)} h`)
      write('jLSN', `${Log.data.min(durations).toFixed(2)} h`)
      write('jLSX', `${Log.data.max(durations).toFixed(2)} h`)
      write('jASDT', `${Log.data.avg(durations).toFixed(2)} h`)
      write('jLPT', Log.data.lp(entries).toFixed(2))
      write('jfocusToday', Log.data.projectFocus(Log.data.listProjects(entries)).toFixed(2))

      const l = entries.length

      entries.map((e, i) => {
        const li = create('li')
        const id = create('span')
        const tim = create('span')
        const sec = create('span')
        const pro = create('span')
        const dur = create('span')
        const ent = create('p')

        li.className = i !== l - 1 ? 'f6 lhc bb pb3 mb3' : 'f6 lhc'
        id.className = 'mr3 o7'
        tim.className = 'mr3 o7'
        sec.className = 'mr3 o7'
        pro.className = 'o7'
        dur.className = 'rf o7'
        ent.className = 'f4 lhc'

        id.innerHTML = `#${e.id}`
        tim.innerHTML = `${Log.time.stamp(Log.time.convert(Log.time.parse(e.s)))} &ndash; ${Log.time.stamp(Log.time.convert(Log.time.parse(e.e)))}`
        sec.innerHTML = e.c
        pro.innerHTML = e.t
        dur.innerHTML = `${e.dur.toFixed(2)} h`
        ent.innerHTML = e.d

        li.appendChild(id)
        li.appendChild(tim)
        li.appendChild(sec)
        li.appendChild(pro)
        li.appendChild(dur)
        li.appendChild(ent)

        document.getElementById('journalEntries').appendChild(li)
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
      const entries = Log.cache.sortEntries.reverse()

      if (isEmpty(entries)) return

      entries.map((e, i) => {
        if (!isEmpty(e)) {
          const li = create('li')
          const s = e[0].s

          li.className = 'lhd c-pt'
          li.innerHTML = Log.time.displayDate(Log.time.convert(Log.time.parse(s)))

          li.setAttribute('onclick', `Log.journal.translate('${s}')`)
          document.getElementById('journalNav').appendChild(li)
        }
      })
    },

    translate(hex) {
      Log.journal.display(Log.time.convert(Log.time.parse(hex)))
    }
  },

  utils: {

    /**
     * Take the last n items of an array (from lodash)
     * @param {Object[]} a - Array
     * @param {number=} n - Number of items
     * @returns {Object[]} An array with the last n items
     */
    takeRight(a, n = 1) {
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
     * Calculate width
     */
    calcWidth(a, b) {
      return (a - b) / 86400 * 100
    },

    /**
     * Calculate DP
     */
    calcDP(a) {
      const s = Log.time.convert(a)
      const y = s.getFullYear()
      const m = s.getMonth()
      const d = s.getDate()

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
    const x = document.getElementsByClassName(g)
    const b = document.getElementsByClassName(t)

    Log.nav.index = Log.nav.menu.indexOf(s)

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
    write('timer', '00:00')

    'phc pdc dayChart weekChart peakTimesHistory sectorBars projectBars sectorsList projectsList visual logbook focusChart sectorFocusBar sectorLegendSummary journalNav journalDay journalEntries'.split(' ').map(e => clear(e))
  },

  nav: {
    menu: 'ovw lis vis tab jou gui'.split(' '),
    index: 0,

    horizontal() {
      Log.nav.index = Log.nav.index === 5 ? 0 : Log.nav.index + 1
      Log.tab(Log.nav.menu[Log.nav.index], 'sect', 'tab')
    },

    toJournal(hex) {
      Log.tab('jou', 'sect', 'tab')
      Log.journal.translate(hex)
    },

    toSectorDetail(sec) {
      Log.tab('lis', 'sect', 'tab')
      Log.tab('sec', 'subsect', 'subtab', true)
      Log.detail.sec(sec)
    },

    toProjectDetail(pro) {
      Log.tab('lis', 'sect', 'tab')
      Log.tab('pro', 'subsect', 'subtab', true)
      Log.detail.pro(pro)
    }
  },

  init() {
    if (localStorage.hasOwnProperty('logHistory')) {
      Log.console.history = JSON.parse(localStorage.getItem('logHistory'))
    } else {
      Log.console.history = []
      localStorage.setItem('logHistory', JSON.stringify(Log.console.history))
    }

    const cmd = document.getElementById('cmd')
    const con = document.getElementById('console')
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

    if (!Log.keyEventInitialized) {
      Log.keyEventInitialized = true;
      document.addEventListener('keydown', function(e) {
        if (e.which >= 65 && e.which <= 90) {
          cmd.style.display = 'block'
          con.focus()
        } else if (e.which >= 48 && e.which <= 54 && (e.ctrlKey || e.metaKey)) {
          Log.nav.index = e.which - 49
          Log.tab(Log.nav.menu[Log.nav.index], 'sect', 'tab')
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
    }

    let user = {
      config: dataStore.get('config') || {},
      palette: dataStore.get('palette') || {},
      projectPalette: dataStore.get('projectPalette') || {},
      log: dataStore.get('log') || []
    }

    Log.config = user.config
    Log.palette = user.palette
    Log.projectPalette = user.projectPalette
    Log.log = Log.data.parse(user.log)

    document.getElementById('app').style.backgroundColor = Log.config.ui.bg
    document.getElementById('app').style.color = Log.config.ui.colour

    if (isEmpty(user.log)) {
      Log.nav.index = 5
      Log.tab('gui', 'sect', 'tab')
      return
    }

    Log.cache.sortEntries = Log.data.sortEntries()
    Log.cache.sectors = Log.data.listSectors()
    Log.cache.sectorCount = Log.cache.sectors.length
    Log.cache.sectorFocus = Log.data.listFocus('sector')
    Log.cache.projects = Log.data.listProjects()
    Log.cache.projectCount = Log.cache.projects.length
    Log.cache.projectFocus = Log.data.listFocus('project')
    Log.cache.peakHours = Log.data.peakHours()
    Log.cache.peakDays = Log.data.peakDays()
    Log.cache.durations = Log.data.listDurations()

    Log.timer(Log.status())

    const en = Log.data.getEntriesByDate()
    const mn = Log.data.getRecentEntries(Log.config.ui.view - 1)
    const dur = Log.data.listDurations(en)
    const hLh = Log.data.total(Log.cache.durations)

    Log.vis.peakChart('hours', Log.data.peakHours(Log.data.sortEntriesByDay()[new Date().getDay()]), 'phc')
    Log.vis.peakChart('days', Log.cache.peakDays, 'pdc')

    write('fsf', Log.data.forecast.sf())
    write('flh', `${Log.data.forecast.lh().toFixed(2)} h`)
    write('fsd', `${Log.data.forecast.sd().toFixed(2)} h`)

    Log.vis.day()
    Log.vis.bar(Log.data.bar(mn), 'weekChart')

    if (!isEmpty(en)) {
      write('LHT', `${Log.data.lh(en).toFixed(2)} h`)
      write('LSN', `${Log.data.min(dur).toFixed(2)} h`)
      write('LSX', `${Log.data.max(dur).toFixed(2)} h`)
      write('ASDT', `${Log.data.avg(dur).toFixed(2)} h`)
      write('LPT', `${Log.data.lp(en).toFixed(2)}%`)
      write('FOC', Log.data.projectFocus(Log.data.listProjects(en)))
      write('ENC', en.length)
      write('STK', Log.data.streak())

      const now = Log.log.slice(-1)[0]
      const date = Log.time.convert(Log.time.parse(now.s))
      const startTime = Log.time.stamp(date)
      const endTime = Log.time.stamp(Log.time.convert(Log.time.parse(now.e)))

      now.e === 'undefined' ? write('lastTime', `${startTime}&ndash;`) : write('lastTime', `${startTime}&ndash;${endTime}`)

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

    write('Favg', Log.data.avg(Log.cache.projectFocus).toFixed(2))
    write('Fmin', Log.data.min(Log.cache.projectFocus).toFixed(2))
    write('Fmax', Log.data.max(Log.cache.projectFocus).toFixed(2))

    Log.vis.focusBar('sec', Log.log, 'sectorFocusBar')
    Log.vis.legend('sec', Log.log, 'sectorLegendSummary')
    Log.detail.sec(Log.data.sortValues(Log.log, 'sec', 'hours')[0][0])
    Log.vis.list('sec', 'hours', 'sectorsList')
    Log.detail.pro(Log.data.sortValues(Log.log, 'pro', 'hours')[0][0])
    Log.vis.list('pro', 'hours', 'projectsList')
    Log.vis.line(Log.data.line(mn), 'visual')
    Log.display(Log.log, 100)
    Log.journal.display()
    Log.journal.nav()
  }
}
