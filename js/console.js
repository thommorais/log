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
    "start", "end", "delete", "set", "import"
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
      }
    } else return
  },

  importUser: {

    log(loc) {
      shell.cat(loc).to(`${__dirname}/data/config.js`)
    },

    config(loc) {
      shell.cat(loc).to(`${__dirname}/data/config.js`)
    }

  },

  importUser(input) {
    let s = input.split(" ")

    if (s[1].substr(-1) === '/') s[1].substr(0, s[1].length - 1)

    if (shell.test("-f", `${s[1]}/config.js`))
      shell.cat(`${s[1]}/config.js`).to(`${__dirname}/data/config.js`)

    if (shell.test("-f", `${s[1]}/log.js`))
      shell.cat(`${s[1]}/log.js`).to(`${__dirname}/data/log.js`)
  },

  /**
   * Start a log entry
   * @param {Object[]} s - Input array
   */

  startLog(s) {
    let ch = s.split(""),
        indices = []

    for (let i = 0, l = ch.length; i < l; i++)
      if (ch[i] === "\"") indices.push(i)

    let time = new Date(),
        start = (new Date(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()).getTime() / 1E3).toString(16),
        sect = "",
        proj = "",
        desc = ""

    for (let i = indices[0] + 1, l = indices[1]; i < l; i++) sect += ch[i]
    for (let i = indices[2] + 1, l = indices[3]; i < l; i++) proj += ch[i]
    for (let i = indices[4] + 1, l = indices[5]; i < l; i++) desc += ch[i]

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

  endLog() {
    let time = new Date(),
        end = (new Date(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()).getTime() / 1E3).toString(16)

    // sed -i -e "s/undefined/$D/g" $1
    shell.sed('-i', 'undefined', end, (__dirname + "/data/log.js"))
    shell.cd()
    shell.sed('-i', 'undefined', end, ".log-data/log.js")
    shell.cd(__dirname)

    log[log.length - 1].e = `${end}`

    clearInterval(timer)
    Log.refresh()
  },

  set(s) {
    let c = s.split(" "),
        a = c[1].toLowerCase()

    if (a == "background" || a == "bg") {
      Log.options.setBG(c[2])
    } else if (a == "color" || a == "colour" || a == "text") {
      Log.options.setColour(c[2])
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
   * Import logs
   * @param {string=} loc - File location
   */

  importLog(loc = `${HOME}/.log-data/log.js`) {
    shell.cat(loc).to(`${__dirname}/data/log.js`)
  },

  /**
   * Import user preferences
   * @param {string=} config - File location
   */

  importConfig(config = `${HOME}/.log-data/config.js`) {
    shell.cat(config).to(`${__dirname}/data/config.js`)
  },
}
