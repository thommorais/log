const timer = require('headless-work-timer')

Log = window.Log || {}
Log.console = {
  history: [],

  /**
   * Parse command
   * @param {string} i - Input
   */
  parse(i) {
    let command = i.split(' ')[0].toLowerCase()

    switch (command) {
      case 'start': case 'begin':
        Log.console.startLog(i);
        break;
      case 'pomodoro': case 'tomato':
        Log.console.startTomatoLog(i);
        break;
      case 'stop': case 'end': case 'pause':
        Log.console.endLog();
        Log.stopTimer ? Log.stopTimer() : 'noop'
        break;
      case 'resume': case 'continue':
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
      default:
        return
    }
  },

  /**
   * Import user data
   */
  importUser() {
    let path = dialog.showOpenDialog({properties: ['openFile']})

		if (!path) return

    let string = ''
    let notif

		try {
			string = fs.readFileSync(path[0], 'utf-8')
		} catch (e) {
      notif = new window.Notification('An error occured while trying to load this file.')
      return
		}

    // if (localStorage.hasOwnProperty('logDataPath')) {
    //   Log.path = localStorage.getItem('logDataPath')
    // } else {
    //   Log.path = path[0]
    //   localStorage.setItem('logDataPath', JSON.stringify(path[0]))
    // }

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
    let data = JSON.stringify(JSON.parse(localStorage.getItem('user')))
    let notif

    dialog.showSaveDialog((fileName) => {
      if (fileName === undefined) return

      fs.writeFile(fileName, data, (err) => {
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
    Log.stopTimer = timer()()( (state, phaseChanged) => {
      console.log(state)
      if (phaseChanged) {
        state.phase === 'break' || state.phase === 'longBreak' ? Log.console.endLog() : Log.console.startLog(s)
        let notif = new window.Notification(`Started ${state.phase}`)
      }
    })
    Log.console.startLog(s)
  },

  /**
   * Start a log entry
   * @param {Object[]} s - Input array
   */
  startLog(s) {
    if (user.log.length !== 0 && user.log.slice(-1)[0].e === 'undefined') return

    let start = Log.time.toHex(new Date())
    let p = []
    let indices = []
    let sect = ''
    let proj = ''
    let desc = ''

    if (s.includes('"')) {
      p = s.split('')

      for (let i = 0, l = p.length; i < l; i++) {
        p[i] === '"' && indices.push(i)
      }

      for (let i = indices[0] + 1; i < indices[1]; i++) {
        sect += p[i]
      }

      for (let i = indices[2] + 1; i < indices[3]; i++) {
        proj += p[i]
      }

      for (let i = indices[4] + 1; i < indices[5]; i++) {
        desc += p[i]
      }
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
    }

    user.log.push({
      s: start,
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
    let last = user.log.slice(-1)[0]

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
    let c = i.split(' ')
    let a = c[1].toLowerCase()

    if (a === 'background' || a === 'bg') {
      Log.options.setBG(c[2])
    } else if (a === 'color' || a === 'colour' || a === 'text') {
      Log.options.setColour(c[2])
    } else if (a === 'highlight' || a === 'accent') {
      Log.options.setAccent(c[2])
    } else if (a === 'font' || a === 'typeface' || a === 'type') {
      Log.options.setFont(c[2])
    } else if (a === 'view') {
      Log.options.setView(c[2])
    } else if (a === 'cal' || a === 'calendar') {
      Log.options.setCalendar(c[2])
    } else if (a === 'timeformat' || a === 'time') {
      Log.options.setTimeFormat(c[2])
    } else if (a === 'dateformat' || a === 'date') {
      Log.options.setDateFormat(c[2])
    } else if (a === 'weekstart') {
      Log.options.setWeekStart(c[2])
    } else if (a === 'category' || a === 'sector' || a === 'cat' || a === 'sec') {
      Log.options.setColourCode(i)
    } else if (a === 'project' || a === 'pro') {
      Log.options.setProjectColourCode(i)
    } else if (a === 'colourmode' || a === 'colormode') {
      Log.options.setColourMode(c[2])
    } else return
  },

  /**
   * Delete one or more logs
   * @param {string} i - Input
   */
  delete(i) {
    // all except first word are entry indices
    const ascendingUniqueIndices = i.split(' ').slice(1).filter( /* uniq */ (v, i, self) => self.indexOf(v) === i).sort()
    // remove all indices. We start from the highest to avoid the shifting of indices after removal.
    ascendingUniqueIndices.reverse().forEach( index => user.log.splice(Number(index) - 1, 1))

    Log.options.update()
  },

  /**
   * Edit a log
   * @param {string} i - Input
   */
  edit(i) {
    let c = i.split(' ')
    let a = c[2]
    let id = Number(c[1]) - 1

    let proc = input => {
      let p = input.split('')
      let indices = []
      let key = ''

      for (let i = 0, l = p.length; i < l; i++) {
        p[i] === '"' && indices.push(i)
      }

      for (let i = indices[0] + 1; i < indices[1]; i++) {
        key += p[i]
      }

      return key.trim()
    }

    if (a === 'sec' || a === 'sector') {
      user.log[id].c = proc(i)
    } else if (a === 'title' || a === 'pro' || a === 'project') {
      user.log[id].t = proc(i)
    } else if (a === 'desc' || a === 'dsc' || a === 'description') {
      user.log[id].d = proc(i)
    } else if (a === 'start') {
      user.log[id].s = Log.time.convertDateTime(proc(i))
    } else if (a === 'end') {
      user.log[id].e = Log.time.convertDateTime(proc(i))
    } else return

    Log.options.update()
  },

  /**
   * Rename a sector or project
   * @param {Object[]} s - Input
   */
  rename(s) {
    if (!s.includes('"')) return

    let mode = s.split(' ')[1]
    let p = s.split('')
    let indices = []
    let oldName = ''
    let newName = ''
    let notif

    let notFound = mode => {
      let message = mode === 'sector' ? `The sector "${oldName}" does not exist in your logs.` : `The project "${oldName}" does not exist in your logs.`
      notif = new window.Notification(message)
    }

    for (let i = 0, l = p.length; i < l; i++) {
      p[i] === '"' && indices.push(i)
    }

    for (let i = indices[0] + 1; i < indices[1]; i++) oldName += p[i]

    for (let i = indices[2] + 1; i < indices[3]; i++) newName += p[i]

    if (mode === 'sector' || mode === 'sec') {
      if (Log.data.getEntriesBySector(oldName).length === 0) {
        notFound('sector')
        return
      }

      for (let i = 0, l = user.log.length; i < l; i++) {
        if (user.log[i].c === oldName) {
          user.log[i].c = newName
        }
      }
    } else if (mode === 'project' || mode === 'pro') {
      if (Log.data.getEntriesByProject(oldName).length === 0) {
        notFound('project')
        return
      }

      for (let i = 0, l = user.log.length; i < l; i++) {
        if (user.log[i].t === oldName) {
          user.log[i].t = newName
        }
      }
    } else return

    notif = new window.Notification(`The sector "${oldName}" has been renamed to "${newName}."`)

    Log.options.update()
  },

  /**
   * Invert interface colours
   */
  invert() {
    let bg = user.config.ui.bg
    let c = user.config.ui.colour

    user.config.ui.bg = c
    user.config.ui.colour = bg

    Log.options.update()
  }
}
