Log = window.Log || {}
Log.console = {
  history: [],

  /**
   * Parse command
   * @param {string} i - Input
   */
  parse(i) {
    const command = i.split(' ')[0].toLowerCase()
    let params = []

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
        params = Log.console.getParams(i)
        Log.console.edit(params[1], params[2], params[3]);
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
        params = Log.console.getParams(i)
        Log.console.rename(params[1], params[2], params[3]);
        break;
      case 'invert':
        Log.console.invert();
        break;
  	  case 'quit':
      case 'exit':
  	  	app.quit();
        break;
      default:
        return
    }
  },

  /**
   * Get quoted parameters from string
   * @param {string} s - String
   * @return {Object[]} Parameters
   */
  getParams(s) {
    if (!isString(s)) return
    if (!s.includes('"')) return

    const quote = s.indexOf('"') - 1
    const part = s.slice(0, quote).split(' ')
    const p = s.split('')
    let params = []
    let ind = []
    let param = ''

    part.map(e => !e.includes('"') && params.push(e))
    p.map((e, i) => e === '"' && ind.push(i))

    for (let i = 0, l = ind.length; i < l; i++) {
      param = ''
      for (let o = ind[i] + 1; o < ind[i + 1]; o++) {
        param += p[o]
      }
      params.push(param)
      i++
    }

    return params
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
      notify('An error occured while trying to load this file.')
      return
    }

    Log.path = path[0]
    localStorage.setItem('logDataPath', path[0])
    dataStore.path = Log.path

    localStorage.setItem('user', string)
    user = JSON.parse(localStorage.getItem('user'))

    notify('Your log data was successfully imported.')

    Log.options.update.all()
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
          notify(`An error occured creating the file ${err.message}`)
          return
        } else {
          notify('Your log data has been exported.')
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
        notify(`Started ${state.phase}`)
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

    notify(`Started log: ${sect} - ${proj} - ${desc}`)

    Log.options.update.log()
  },

  /**
   * End a log entry
   */
  endLog() {
    if (isUndefined(Log.log)) return
    if (isEmpty(Log.log)) return

    const last = user.log.slice(-1)[0]
    if (last.e !== 'undefined') return
    last.e = Log.time.toHex(new Date())
    clearInterval(timer)

    notify(`Ended log: ${last.c} - ${last.t} - ${last.d}`)

    Log.options.update.log()
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

    notify(`Log resumed: ${last.c} - ${last.t} - ${last.d}`)

    Log.options.update.log()
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
  	const words = i.split(' ').slice(1)

    if (words[0] === 'project') {
  		user.log.forEach((entry, id) => {
  			if (entry.t === words[1]) user.log.splice(id, 1)
  		})
  	} else if (words[0] === 'sector') {
  		user.log.forEach((entry, id) => {
  			if (entry.c === words[1]) user.log.splice(id, 1)
  		})
  	} else {
  		const ascendingUniqueIndices = words.filter( /* uniq */ (v, i, self) => self.indexOf(v) === i).sort()
  		// remove all indices. We start from the highest to avoid the shifting of indices after removal.
  		ascendingUniqueIndices.reverse().forEach(index => user.log.splice(Number(index) - 1, 1))
  	}

      Log.options.update.all()
  },

  /**
   * Edit a log
   * @param {string} id - Entry ID
   * @param {string} attr - Entry attribute
   * @param {string} value - Value
   */
  edit(id, attr, value) {
    if (isEmpty(user.log)) return

    id = Number(id) - 1

    if (contains(attr, 'sec sector'))
      user.log[id].c = value
    else if (contains(attr, 'title pro project'))
      user.log[id].t = value
    else if (contains(attr, 'desc dsc description'))
      user.log[id].d = value
    else if (contains(attr, 'start'))
      user.log[id].s = Log.time.convertDateTime(value)
    else if (contains(attr, 'end'))
      user.log[id].e = Log.time.convertDateTime(value)
    else if (contains(attr, 'duration dur')) {
      const duration = parseInt(value, 10) * 60 || 0
      user.log[id].e = Log.time.offset(user.log[id].s, duration)
    } else return

    Log.options.update.all()
  },

  /**
   * Rename a sector or project
   * @param {string} mode - Sector or project
   * @param {string} old - Old name
   * @param {string} val - New name
   */
  rename(mode, old, val) {
    if (!contains(mode, 'sec sector pro project')) return

    const notFound = mode => {
      const message = mode === 'sector' ? `The sector "${old}" does not exist in your logs.` : `The project "${old}" does not exist in your logs.`
      notify(message)
    }

    if (contains(mode, 'sector sec')) {
      if (isEmpty(Log.data.getEntriesBySector(old))) {
        notFound('sector')
        return
      }

      user.log.map(e => {if (e.c === old) e.c = val})
    } else if (contains(mode, 'project pro')) {
      if (isEmpty(Log.data.getEntriesByProject(old))) {
        notFound('project')
        return
      }

      user.log.map(e => {if (e.t === old) e.t = val})
    } else return

    notify(`The sector "${old}" has been renamed to "${val}."`)

    Log.options.update.all()
  },

  /**
   * Invert interface colours
   */
  invert() {
    const bg = user.config.ui.bg
    const c = user.config.ui.colour
    user.config.ui.bg = c
    user.config.ui.colour = bg
    Log.options.update.config()
  }
}
