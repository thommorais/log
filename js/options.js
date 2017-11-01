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
   * @param {string} colour - The colour
   */

  setBG(colour) {
    shell.sed("-i", /^.*bg:.*$/, `\t\tbg: "${colour}",`, "data/config.js")
    Log.config.ui.bg = colour
    document.getElementById("app").style.backgroundColor = colour
  },

  /**
   * Set text colour
   * @param {string} colour - The colour
   */

  setColour(colour) {
    shell.sed("-i", /^.*colour:.*$/, `\t\tcolour: "${colour}",`, "data/config.js")
    Log.config.ui.colour = colour
    document.getElementById("app").style.color = colour
  },

  /**
   * Set interface font family
   * @param {string} font - The font family
   */

  setFont(font) {
    shell.sed("-i", /^.*font:.*$/, `\t\tfont: "${font}",`, "data/config.js")
    Log.config.ui.font = font
    document.getElementById("app").style.fontFamily = font
  },

  setIcons(a) {
    shell.sed("-i", /^.*icons:.*$/, `\t\ticons: ${a},`, "data/config.js")
    Log.config.ui.icons = a
    Log.refresh()
  },

  setView(n) {
    shell.sed("-i", /^.*view:.*$/, `\t\tview: ${n},`, "data/config.js")
    Log.config.ui.view = n
    Log.refresh()
  },

  /**
   * Set calendrical system
   * @param {string} cal - The calendrical system
   */

  setCalendar(cal) {
    shell.sed("-i", /^.*calendar:.*$/, `\t\tcalendar: "${cal}",`, "data/config.js")
    Log.config.system.calendar = cal
    Log.refresh()
  },

  setTimeFormat(format) {
    shell.sed("-i", /^.*timeFormat:.*$/, `\t\ttimeFormat: "${format}",`, "data/config.js")
    Log.config.system.timeFormat = format
    Log.refresh()
  },

  setWeekStart(start) {
    shell.sed("-i", /^.*weekStart:.*$/, `\t\tweekStart: "${start}",`, "data/config.js")
    Log.config.system.weekStart = start
    Log.refresh()
  }
}
