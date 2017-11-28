Log = window.Log || {}
Log.console = {
  history: [],

  commands: [
    'start', 'end', 'delete', 'set', 'import', 'export', 'invert', 'edit'
  ],

  /**
   * Parse command
   * @param {string} i - Input
   */
  parse(i) {
    let k = Log.console.commands.indexOf(i.split(' ')[0].toLowerCase())

    if (k === -1) return

    switch (k) {
      case 0:
        Log.console.startLog(i);
        break;
      case 1:
        Log.console.endLog();
        break;
      case 2:
        Log.console.delete(i);
        break;
      case 3:
        Log.console.set(i);
        break;
      case 4:
        Log.console.importUser(i);
        break;
      case 5:
        Log.console.exportUser();
        break;
      case 6:
        Log.console.invert();
        break;
      case 7:
        Log.console.edit(i);
        break;
    }
  },

  /**
   * Import user data
   * @param {string} i - Input
   */
  importUser(i) {
    let s = i.split(' ')

    if (s[1].substr(-1) === '/') {
      s[1].substr(0, s[1].length - 1)
    }

    if (SHELL.test("-f", s[1])) {
      let file = SHELL.cat(s[1])
      localStorage.setItem('user', file)
      user = JSON.parse(localStorage.getItem('user'))
      Log.refresh()
    } else return
  },

  /**
   * Export user data
   */
  exportUser() {
    let data = JSON.stringify(JSON.parse(localStorage.getItem('user')))

    dialog.showSaveDialog((fileName) => {
      if (fileName === undefined) return
      fs.writeFile(fileName, data, (err) => {
        if (err) {
          alert (`An error occured creating the file ${err.message}`)
          return
        }
      })
    })
  },

  /**
   * Start a log entry
   * @param {Object[]} s - Input array
   */
  startLog(s) {
    let start = Log.time.toHex(new Date())
    let p = []
    let indices = []
    let sect = ''
    let proj = ''
    let desc = ''

    if (s.indexOf('"') >= 0) {
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
    } else if (s.indexOf(';') >= 0) {
      p = s.split(';')
      sect = p[0].substring(6, p[0].length).trim()
      proj = p[1].trim()
      desc = p[2].trim()
    } else if (s.indexOf('|') >= 0) {
      p = s.split('|')
      sect = p[0].substring(6, p[0].length).trim()
      proj = p[1].trim()
      desc = p[2].trim()
    } else if (s.indexOf(',') >= 0) {
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

    Log.options.update()
  },

  /**
   * End a log entry
   */
  endLog() {
    user.log[user.log.length - 1].e = Log.time.toHex(new Date())
    clearInterval(timer)
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
   * Delete a log
   * @param {string} i - Input
   */
  delete(i) {
    let c = i.split(' ')
    let id = Number(c[1]) - 1
    user.log.splice(id, 1)
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
    } else return

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
