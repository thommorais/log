/**
 * Log
 * A log and time-tracking system
 *
 * Console functions
 *
 * @author Josh Avanier
 * @version 0.1.1
 * @license MIT
 */

Log = window.Log || {}
Log.console = {
  commands: [
    'start', 'end', 'delete', 'set', 'import', 'filter', 'export'
  ],

  /**
   * Parse command
   * @param {string} i - Input
   */

  parse(i) {
    let k = Log.console.commands.indexOf(i.split(' ')[0].toLowerCase())

    if (k != -1) {
      switch (k) {
        case 0:
          Log.console.startLog(i);
          break;
        case 1:
          Log.console.endLog();
          break;
        case 2:
          console.log('delete');
          break;
        case 3:
          Log.console.set(i);
          break;
        case 4:
          Log.console.importUser(i);
          break;
        case 5:
          Log.console.filter(i);
          break;
        case 6:
          Log.console.exportUser();
          break;
      }
    } else return
  },

  /**
   * Import user log and config files
   * @param {string} i - Input parameters
   */

  importUser(i) {
    let s = i.split(' '),
        file = ''

    if (s[1].substr(-1) === '/') s[1].substr(0, s[1].length - 1)

    if (shell.test("-f", `${s[1]}`)) file = shell.cat(`${s[1]}`)

    localStorage.setItem('user', file)
    user = JSON.parse(localStorage.getItem('user'))

    Log.refresh()
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
    let ch = s.split(''),
        indices = [],
        sect = '',
        proj = '',
        desc = ''

    if (s.indexOf('"') >= 0) {
      for (let i = 0, l = ch.length; i < l; i++)
        ch[i] === '"' && indices.push(i)

      for (let i = indices[0] + 1; i < indices[1]; i++) sect += ch[i]
      for (let i = indices[2] + 1; i < indices[3]; i++) proj += ch[i]
      for (let i = indices[4] + 1; i < indices[5]; i++) desc += ch[i]
    } else if (s.indexOf(`;`) >= 0) {
      let p = s.split(`;`)
      sect = p[0].substring(6, p[0].length).trim()
      proj = p[1].trim()
      desc = p[2].trim()
    } else if (s.indexOf(`|`) >= 0) {
      let p = s.split(`|`)
      sect = p[0].substring(6, p[0].length).trim()
      proj = p[1].trim()
      desc = p[2].trim()
    } else if (s.indexOf(`,`) >= 0) {
      let p = s.split(`,`)
      sect = p[0].substring(6, p[0].length).trim()
      proj = p[1].trim()
      desc = p[2].trim()
    }

    let time = new Date(),
        start = (
          new Date(
            time.getFullYear(),
            time.getMonth(),
            time.getDate(),
            time.getHours(),
            time.getMinutes(),
            time.getSeconds()).getTime() / 1E3
          ).toString(16)

    user.log.push({
      s: start,
      e: 'undefined',
      c: sect,
      t: proj,
      d: desc
    })

    localStorage.setItem('user', JSON.stringify(user))

    Log.refresh()
  },

  /**
   * End a log entry
   */

  endLog() {
    let t = new Date()

    user.log[user.log.length - 1].e = (
      new Date(
        t.getFullYear(),
        t.getMonth(),
        t.getDate(),
        t.getHours(),
        t.getMinutes(),
        t.getSeconds()
      ).getTime() / 1E3
    ).toString(16)

    localStorage.setItem('user', JSON.stringify(user))

    clearInterval(timer)
    Log.refresh()
  },

  /**
   * Set a config attribute
   * @param {string} s - Input
   */

  set(i) {
    let c = i.split(' '),
        a = c[1].toLowerCase()

    if (a === 'background' || a === 'bg') {
      Log.options.setBG(c[2])
    } else if (a === 'color' || a === 'colour' || a === 'text') {
      Log.options.setColour(c[2])
    } else if (a === 'highlight' || a === 'accent') {
      Log.options.setAccent(c[2])
    } else if (a === 'font' || a === 'typeface' || a === 'type') {
      Log.options.setFont(c[2])
    } else if (a === 'icons' || a === 'icon') {
      Log.options.setIcons(c[2])
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
    } else return
  },

  /**
   * Filter logs
   */

  filter(s) {
    let c = s.split(' '),
        a = c[1].toLowerCase(),
        indices = [],
        f = '',
        h = s.split('')

    for (let i = 0, l = h.length; i < l; i++)
      h[i] === '"' && indices.push(i)

    for (let i = indices[0] + 1, l = indices[1]; i < l; i++)
      f += h[i]

    if (a === 'category' || a === 'sector') {
      Log.reset()
      Log.init(Log.data.getEntriesBySector(f))
    } else if (a === 'project' || a === 'title') {
      Log.reset()
      Log.log = Log.data.parse(Log.data.getEntriesByProject(f))
      Log.init(Log.data.getEntriesByProject(f))
      console.log(Log.data.getEntriesByProject(f))
    } else if (a === 'none' || a === 'reset') {
      Log.reset()
      Log.init(Log.log)
    } else return
  }
}
