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
    user.config.ui.bg = c
    localStorage.setItem("user", JSON.stringify(user))
    Log.refresh()
  },

  /**
   * Set text colour
   * @param {string} c - The colour
   */

  setColour(c) {
    user.config.ui.colour = c
    localStorage.setItem("user", JSON.stringify(user))
    Log.refresh()
  },

  /**
   * Set accent colour
   * @param {string} c - The colour
   */

  setAccent(c) {
    user.config.ui.accent = c
    localStorage.setItem("user", JSON.stringify(user))
    Log.refresh()
  },

  /**
   * Set sector colour code
   * @param {string} s - Input string
   */

  setColourCode(s) {
    let ch = s.split(""),
        indices = [],
        sec = ""

    for (let i = 0, l = ch.length; i < l; i++)
      ch[i] === "\"" && indices.push(i)

    for (let i = indices[0] + 1; i < indices[1]; i++) sec += ch[i]

    let col = s.substring(indices[1] + 1, s.length).trim()

    user.palette[sec] = col
    localStorage.setItem("user", JSON.stringify(user))
    Log.refresh()
  },

  /**
   * Set interface font family
   * @param {string} f - The font family
   */

  setFont(f) {
    user.config.ui.font = f
    localStorage.setItem("user", JSON.stringify(user))
    Log.refresh()
  },

  /**
   * Set icon view
   * @param {string} a - True or false
   */

  setIcons(a) {
    user.config.ui.icons = a == "true" ? true : false
    localStorage.setItem("user", JSON.stringify(user))
    Log.refresh()
  },

  /**
   * Set overview (days to show)
   * @param {number} n - The number of days
   */

  setView(n) {
    user.config.ui.view = n
    localStorage.setItem("user", JSON.stringify(user))
    Log.refresh()
  },

  /**
   * Set calendrical system
   * @param {string} c - The calendrical system
   */

  setCalendar(c) {
    user.config.system.calendar = c
    localStorage.setItem("user", JSON.stringify(user))
    Log.refresh()
  },

  /**
   * Set time format
   * @param {string} f - The time format
   */

  setTimeFormat(f) {
    user.config.system.timeFormat = f
    localStorage.setItem("user", JSON.stringify(user))
    Log.refresh()
  },

  /**
   * Set the week start
   * @param {string} d - The day of the week
   */

  setWeekStart(d) {
    user.config.system.weekStart = d
    localStorage.setItem("user", JSON.stringify(user))
    Log.refresh()
  }
}
