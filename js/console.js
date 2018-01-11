Log = window.Log || {}
Log.console = {
  history: [],

  /**
   * Parse command
   * @param {string} i - Input
   */
  parse(i) {
    const command = i.split(' ')[0].toLowerCase()
    switch (command) {
      case 'start':
      case 'begin':
        Log.console.startLog(i);
        break;
      case 'pomodoro':
      case 'tomato':
        Log.console.startTomatoLog(i);
        break;
      case 'stop':
      case 'end':
      case 'pause':
        Log.console.endLog();
        Log.stopTimer ? Log.stopTimer() : 'noop'
        break;
      case 'resume':
      case 'continue':
        Log.console.resume();
        break;
      case 'edit':
        Log.console.edit(i);
        break;
      case 'delete':
        Log.console.delete(i);
        break;
      case 'set':
        Log.console.set(i);
        break;
      case 'import':
        Log.console.importUser();
        break;
      case 'export':
        Log.console.exportUser();
        break;
      case 'rename':
        Log.console.rename(i);
        break;
      case 'invert':
        Log.console.invert();
        break;
	  case 'quit': case 'exit':
	  	app.quit();
	  	break;
      default:
        return
    }
  },

  /**
   * Import user data
   */
  importUser() {
    const path = dialog.showOpenDialog({
      properties: ['openFile']
    })

    if (!path) return

    let string = ''
    let notif

    try {
      string = fs.readFileSync(path[0], 'utf-8')
    } catch (e) {
      notif = new window.Notification('An error occured while trying to load this file.')
      return
    }

    Log.path = path[0]
    localStorage.setItem('logDataPath', path[0])
    dataStore.path = Log.path

    localStorage.setItem('user', string)
    user = JSON.parse(localStorage.getItem('user'))

    notif = new window.Notification('Your log data was successfully imported.')

    Log.options.update()
  },

  /**
   * Export user data
   */
  exportUser() {
    const data = JSON.stringify(JSON.parse(localStorage.getItem('user')))

    dialog.showSaveDialog((fileName) => {
      if (fileName === undefined) return

      fs.writeFile(fileName, data, (err) => {
        let notif
        if (err) {
          notif = new window.Notification(`An error occured creating the file ${err.message}`)
          return
        } else {
          notif = new window.Notification('Your log data has been exported.')
        }
      })
    })
  },

  /**
   * Start a log entry with pomodoro timing
   * @param {Object[]} s - Input array
   */
  startTomatoLog(s) {
    const currentTimer = timer()()((state, phaseChanged) => {
      if (phaseChanged) {
        state.phase === 'break' || state.phase === 'longBreak' ? Log.console.endLog() : Log.console.startLog(s)
        state.phase === 'break' || state.phase === 'longBreak' ? Log.playSoundEffect('timerEnd') : Log.playSoundEffect('timerStart')
        let notif = new window.Notification(`Started ${state.phase}`)
      }
    })
    Log.stopTimer = () => currentTimer.stop()
    Log.console.startLog(s)
  },

  /**
   * Start a log entry
   * @param {Object[]} s - Input array
   */
  startLog(s) {
    if (!isEmpty(user.log) && user.log.slice(-1)[0].e === 'undefined') Log.console.endLog()

    let p = []
    let indices = []
    let sect = ''
    let proj = ''
    let desc = ''

    if (s.includes('"')) {
      p = s.split('')

      p.map((e, i) => e === '"' && indices.push(i))

      for (let i = indices[0] + 1; i < indices[1]; i++) sect += p[i]
      for (let i = indices[2] + 1; i < indices[3]; i++) proj += p[i]
      for (let i = indices[4] + 1; i < indices[5]; i++) desc += p[i]
    } else if (s.includes(';')) {
      p = s.split(';')
      sect = p[0].substring(6, p[0].length).trim()
      proj = p[1].trim()
      desc = p[2].trim()
    } else if (s.includes('|')) {
      p = s.split('|')
      sect = p[0].substring(6, p[0].length).trim()
      proj = p[1].trim()
      desc = p[2].trim()
    } else if (s.includes(',')) {
      p = s.split(',')
      sect = p[0].substring(6, p[0].length).trim()
      proj = p[1].trim()
      desc = p[2].trim()
    } else return

    user.log.push({
      s: Log.time.toHex(new Date()),
      e: 'undefined',
      c: sect,
      t: proj,
      d: desc
    })

    let notif = new window.Notification(`Log started: ${sect} - ${proj} - ${desc}`)

    Log.options.update()
  },

  /**
   * End a log entry
   */
  endLog() {
    if (isUndefined(Log.log)) return
    if (isEmpty(Log.log)) return

    let last = user.log.slice(-1)[0]
    if (last.e !== 'undefined') return
    last.e = Log.time.toHex(new Date())
    clearInterval(timer)

    let notif = new window.Notification(`Log ended: ${last.c} - ${last.t} - ${last.d}`)

    Log.options.update()
  },

  /**
   * Resume a paused log entry
   */
  resume() {
    if (isUndefined(Log.log)) return
    if (isEmpty(Log.log)) return

    const last = user.log.slice(-1)[0]

    if (last.e === 'undefined') return

    user.log.push({
      s: Log.time.toHex(new Date()),
      e: 'undefined',
      c: last.c,
      t: last.t,
      d: last.d
    })

    let notif = new window.Notification(`Log resumed: ${last.c} - ${last.t} - ${last.d}`)

    Log.options.update()
  },

  /**
   * Set a config attribute
   * @param {string} i - Input
   */
  set(i) {
    const c = i.split(' ')
    const a = c[1].toLowerCase()

    if (contains(a, 'background bg'))
      Log.options.setBG(c[2])
    else if (contains(a, 'color colour text'))
      Log.options.setColour(c[2])
    else if (contains(a, 'highlight accent'))
      Log.options.setAccent(c[2])
    else if (contains(a, 'font typeface type'))
      Log.options.setFont(c[2])
    else if (contains(a, 'view'))
      Log.options.setView(c[2])
    else if (contains(a, 'cal calendar'))
      Log.options.setCalendar(c[2])
    else if (contains(a, 'timeformat time'))
      Log.options.setTimeFormat(c[2])
    else if (contains(a, 'dateformat date'))
      Log.options.setDateFormat(c[2])
    else if (contains(a, 'weekstart'))
      Log.options.setWeekStart(c[2])
    else if (contains(a, 'category sector cat sec'))
      Log.options.setColourCode(i)
    else if (contains(a, 'project pro'))
      Log.options.setProjectColourCode(i)
    else if (contains(a, 'colourmode colormode'))
      Log.options.setColourMode(c[2])
    else return
  },

  /**
   * Delete one or more logs
   * @param {string} i - Input
   */
  delete(i) {
    if (isUndefined(Log.log)) return
    if (isEmpty(Log.log)) return
    // all except first word are entry indices
    const ascendingUniqueIndices = i.split(' ').slice(1).filter( /* uniq */ (v, i, self) => self.indexOf(v) === i).sort()
    // remove all indices. We start from the highest to avoid the shifting of indices after removal.
    ascendingUniqueIndices.reverse().forEach(index => user.log.splice(Number(index) - 1, 1))

    Log.options.update()
  },

  /**
   * Edit a log
   * @param {string} i - Input
   */
  edit(i) {
    if (isEmpty(user.log)) return
    const c = i.split(' ')
    const a = c[2]
    const id = Number(c[1]) - 1

    const proc = input => {
      const p = input.split('')
      let indices = []
      let key = ''

      p.map((e, i) => e === '"' && indices.push(i))

      for (let i = indices[0] + 1; i < indices[1]; i++) key += p[i]

      return key.trim()
    }

    if (contains(a, 'sec sector'))
      user.log[id].c = proc(i)
    else if (contains(a, 'title pro project'))
      user.log[id].t = proc(i)
    else if (contains(a, 'desc dsc description'))
      user.log[id].d = proc(i)
    else if (contains(a, 'start'))
      user.log[id].s = Log.time.convertDateTime(proc(i))
    else if (contains(a, 'end'))
      user.log[id].e = Log.time.convertDateTime(proc(i))
    else if (contains(a, 'duration dur')) {
      const duration = parseInt(proc(i), 10) * 60 || 0
      user.log[id].e = Log.time.offset(user.log[id].s, duration)
    } else return

    Log.options.update()
  },

  /**
   * Rename a sector or project
   * @param {Object[]} s - Input
   */
  rename(s) {
    if (!s.includes('"')) return

    const mode = s.split(' ')[1]

    if (!contains(mode, 'sec sector pro project')) return

    const p = s.split('')

    let indices = []
    let oldName = ''
    let newName = ''
    let notif

    const notFound = mode => {
      const message = mode === 'sector' ? `The sector "${oldName}" does not exist in your logs.` : `The project "${oldName}" does not exist in your logs.`
      notif = new window.Notification(message)
    }

    p.map((e, i) => e === '"' && indices.push(i))

    if (indices[0] === undefined) return
    if (indices[1] === undefined) return
    if (indices[2] === undefined) return
    if (indices[3] === undefined) return

    for (let i = indices[0] + 1; i < indices[1]; i++) oldName += p[i]
    for (let i = indices[2] + 1; i < indices[3]; i++) newName += p[i]

    if (mode === 'sector' || mode === 'sec') {
      if (isEmpty(Log.data.getEntriesBySector(oldName))) {
        notFound('sector')
        return
      }

      user.log.map(e => {
        if (e.c === oldName) e.c = newName
      })
    } else if (mode === 'project' || mode === 'pro') {
      if (isEmpty(Log.data.getEntriesByProject(oldName))) {
        notFound('project')
        return
      }

      user.log.map(e => {
        if (e.t === oldName) e.t = newName
      })
    } else return

    notif = new window.Notification(`The sector "${oldName}" has been renamed to "${newName}."`)

    Log.options.update()
  },

  /**
   * Invert interface colours
   */
  invert() {
    const bg = user.config.ui.bg
    const c = user.config.ui.colour

    user.config.ui.bg = c
    user.config.ui.colour = bg

    Log.options.update()
  }
}
