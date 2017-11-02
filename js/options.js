/**
 * Log
 * A log and time-tracking system
 *
 * Options and preferences
 *
 * @author Josh Avanier
 * @version 0.1.1
 * @license MIT
 */

Log = window.Log || {}
Log.options = {

  /**
   * Set background colour
   * @param {string} c - The colour
   */

  setBG(c) {
    shell.sed("-i", /^.*bg:.*$/, `\t\tbg: "${c}",`, "data/config.js")
    Log.config.ui.bg = c
    // document.getElementById("app").style.backgroundColor = c
  },

  /**
   * Set text colour
   * @param {string} c - The colour
   */

  setColour(c) {
    shell.sed("-i", /^.*colour:.*$/, `\t\tcolour: "${c}",`, "data/config.js")
    Log.config.ui.colour = c
    // document.getElementById("app").style.color = c
  },

  /**
   * Set accent colour
   * @param {string} c - The colour
   */

  setAccent(c) {
    shell.sed("-i", /^.*accent:.*$/, `\t\taccent: "${c}",`, "data/config.js")
    Log.config.ui.accent = c
  },
  
  /**
   * Set interface font family
   * @param {string} f - The font family
   */

  setFont(font) {
    shell.sed("-i", /^.*font:.*$/, `\t\tfont: "${f}",`, "data/config.js")
    Log.config.ui.font = f
    // document.getElementById("app").style.fontFamily = f
  },

  /**
   * Set icon view
   * @param {boolean} a - True or false
   */

  setIcons(a) {
    shell.sed("-i", /^.*icons:.*$/, `\t\ticons: ${a},`, "data/config.js")
    Log.config.ui.icons = a
    // Log.refresh()
  },

  /**
   * Set overview (days to show)
   * @param {number} n - The number of days
   */

  setView(n) {
    shell.sed("-i", /^.*view:.*$/, `\t\tview: ${n},`, "data/config.js")
    Log.config.ui.view = n
    // Log.refresh()
  },

  /**
   * Set calendrical system
   * @param {string} c - The calendrical system
   */

  setCalendar(c) {
    shell.sed("-i", /^.*calendar:.*$/, `\t\tcalendar: "${c}",`, "data/config.js")
    Log.config.system.calendar = c
    // Log.refresh()
  },

  /**
   * Set time format
   * @param {string} f - The time format
   */

  setTimeFormat(f) {
    shell.sed("-i", /^.*timeFormat:.*$/, `\t\ttimeFormat: "${f}",`, "data/config.js")
    Log.config.system.timeFormat = f
    // Log.refresh()
  },

  /**
   * Set the week start
   * @param {string} d - The day of the week
   */

  setWeekStart(d) {
    shell.sed("-i", /^.*weekStart:.*$/, `\t\tweekStart: "${d}",`, "data/config.js")
    Log.config.system.weekStart = d
    // Log.refresh()
  }
}
