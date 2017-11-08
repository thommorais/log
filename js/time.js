/**
 * Log
 * A log and time-tracking system
 *
 * Time functions
 *
 * @author Josh Avanier
 * @version 0.1.1
 * @license MIT
 */

Log = window.Log || {}
Log.time = {

  /**
   * Convert hexadecimal into decimal
   * @param {string} s - A hexadecimal string
   * @returns {number} Decimal conversion
   */

  parse(s) {
    return parseInt(s, 16)
  },

  /**
   * Convert Unix time
   * @param {number} t - Unix time
   */

  convert(t) {
    return new Date(t * 1E3)
  },

  /**
   * Convert Unix time into a timestamp
   * @param {number} t - Unix time
   * @returns {string} Timestamp
   */

  stamp(t) {
    let d = Log.time.convert(t),
        f = Log.config.system.timeFormat,
        h = `0${d.getHours()}`,
        m = `0${d.getMinutes()}`,
        s = `0${d.getSeconds()}`

    if (f === '24')
      return `${h.substr(-2)}:${m.substr(-2)}:${s.substr(-2)}`
    else if (f === '12')
      return Log.time.twelveHours(d)
  },

  /**
   * Convert to 12-hour time
   * @param {Object} d - Date and time
   * @returns {string} 12-hour format
   */

  twelveHours(d) {
    let h = d.getHours(),
        m = d.getMinutes(),
        s = d.getSeconds(),
        x = h >= 12 ? 'PM' : 'AM'

    h = h % 12
    h = h ? h : 12
    h = (`0${h}`).slice(-2)
    m = (`0${m}`).slice(-2)
    s = (`0${s}`).slice(-2)

    return `${h}:${m}:${s} ${x}`
  },

  /**
   * Convert Unix time into date
   * @param {number} t - Unix time
   * @returns {string} year, month, day
   */

  date(t) {
    let a = Log.time.convert(t)
    return `${a.getFullYear()}${a.getMonth()}${a.getDate()}`
  },

  /**
   * Display a date
   * @param {number} t - Unix time
   */

  displayDate(t) {
    let a = Log.time.convert(t),
        f = Log.config.system.calendar

    if (f === 'gregorian')
      return `${a.getFullYear()} ${a.getMonth() + 1} ${a.getDate()}`
    else if (f === 'monocal')
      return MONO.short(MONO.convert(a))
    else if (f === 'aequirys')
      return Aequirys.display(Aequirys.convert(a))
  },

  /**
   * Calculate duration
   * @param {number} a - Start (Unix time)
   * @param {number} b - End (Unix time)
   * @returns {number} Duration
   */

  duration(a, b) {
    return (b - a) / 3600
  }
}
