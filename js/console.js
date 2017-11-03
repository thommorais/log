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
    "start", "end", "delete", "set", "import", "filter"
  ],

  parse(input) {
    let i = Log.console.commands.indexOf(input.split(" ")[0].toLowerCase())

    if (i != -1) {
      switch (i) {
        case 0:
          Log.console.startLog(input);
          break;
        case 1:
          Log.console.endLog();
          break;
        case 2:
          console.log("delete");
          break;
        case 3:
          Log.console.set(input);
          break;
        case 4:
          Log.console.importUser(input);
          break;
        case 5:
          Log.console.filter(input);
          break;
      }
    } else return
  },

  /**
   * Import user log and config files
   * @param {string} input - Input parameters
   */

  importUser(input) {
    let s = input.split(" ")

    if (s[1].substr(-1) === '/') s[1].substr(0, s[1].length - 1)

    if (shell.test("-f", `${s[1]}/config.js`))
      shell.cat(`${s[1]}/config.js`).to(`${__dirname}/data/config.js`)

    if (shell.test("-f", `${s[1]}/log.js`))
      shell.cat(`${s[1]}/log.js`).to(`${__dirname}/data/log.js`)
  },

  /**
   * Import logs
   * @param {string=} loc - File location
   */

  importLog(loc = `${HOME}/.log-data/log.js`) {
    shell.cat(loc).to(`${__dirname}/data/log.js`)
    loc !== undefined && shell.cat(l).to(`${HOME}/.log-data/log.js`)
  },

  /**
   * Import user preferences
   * @param {string=} loc - File location
   */

  importConfig(loc = `${HOME}/.log-data/config.js`) {
    shell.cat(loc).to(`${__dirname}/data/config.js`)
    loc !== undefined && shell.cat(l).to(`${HOME}/.log-data/config.js`)
  },

  /**
   * Start a log entry
   * @param {Object[]} s - Input array
   */

  startLog(s) {
    let ch = s.split(""),
        indices = [],
        sect = "",
        proj = "",
        desc = ""

    if (s.indexOf(`"`) >= 0) {
      for (let i = 0, l = ch.length; i < l; i++)
        ch[i] === "\"" && indices.push(i)

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
        start = (new Date(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()).getTime() / 1E3).toString(16)

    let entry = `{s:"${start}",e:"undefined",c:"${sect}",t:"${proj}",d:"${desc}"},\n]`

    shell.sed('-i', ']', `${entry}`, (__dirname + "/data/log.js"))
    shell.cd()
    shell.sed('-i', ']', entry, ".log-data/log.js")
    shell.cd(__dirname)

    log.push({
      s: start,
      e: "undefined",
      c: sect,
      t: proj,
      d: desc
    })

    Log.refresh()
  },

  /**
   * End a log entry
   */

  endLog() {
    let t = new Date(),
        e = (new Date(t.getFullYear(), t.getMonth(), t.getDate(), t.getHours(), t.getMinutes(), t.getSeconds()).getTime() / 1E3).toString(16)

    shell.sed('-i', 'undefined', e, (__dirname + "/data/log.js"))
    shell.cd()
    shell.sed('-i', 'undefined', e, ".log-data/log.js")
    shell.cd(__dirname)

    log[log.length - 1].e = `${e}`

    clearInterval(timer)
    Log.refresh()
  },

  /**
   * Set a config attribute
   * @param {string} s - The input parameters
   */

  set(s) {
    let c = s.split(" "),
        a = c[1].toLowerCase()

    if (a == "background" || a == "bg") {
      Log.options.setBG(c[2])
    } else if (a == "color" || a == "colour" || a == "text") {
      Log.options.setColour(c[2])
    } else if (a == "highlight" || a == "accent") {
      Log.options.setAccent(c[2])
    } else if (a == "font" || a == "typeface" || a == "type") {
      Log.options.setFont(c[2])
    } else if (a == "icons" || a == "icon") {
      if (c[2] == "true" || c[2] == "false")
        Log.options.setIcons(c[2])
    } else if (a == "view") {
      Log.options.setView(c[2])
    } else if (a == "cal" || a == "calendar") {
      Log.options.setCalendar(c[2])
    } else if (a == "timeformat" || a == "time") {
      Log.options.setTimeFormat(c[2])
    } else if (a == "dateformat" || a == "date") {
      Log.options.setDateFormat(c[2])
    } else if (a == "weekstart") {
      Log.options.setWeekStart(c[2])
    }
  },

  /**
   * Filter logs
   */

  filter(s) {
    let c = s.split(" "),
        a = c[1].toLowerCase(),
        indices = [],
        f = "",
        h = s.split("")

    for (let i = 0, l = h.length; i < l; i++)
      h[i] == `"` && indices.push(i)

    for (let i = indices[0] + 1, l = indices[1]; i < l; i++)
      f += h[i]

    if (a == "category" || a == "sector") {
      Log.reset()
      Log.init(Log.data.getEntriesBySector(f))
    } else if (a == "project" || a == "title") {
      Log.reset()
      Log.init(Log.data.getEntriesByProject(f))
    } else if (a == "none" || a == "reset") {
      Log.reset()
      Log.init(log)
    } else return
  }
}
