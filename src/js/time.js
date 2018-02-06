const Aequirys = require('aequirys')
const Monocal = require('./utils/monocal.min.js')
const Desamber = require('./utils/desamber.js')

const months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')

Log = window.Log || {}
Log.time = {

  /**
   * Convert hexadecimal to decimal
   * @param {string} s - Hexadecimal string
   * @returns {number} Decimal conversion
   */
  parse(s) {
    return parseInt(s, 16)
  },

  /**
   * Convert to hexadecimal format
   * @param {number} t - Unix time
   */
  toHex(t) {
    return (new Date(
      t.getFullYear(), t.getMonth(), t.getDate(),
      t.getHours(), t.getMinutes(), t.getSeconds()
    ).getTime() / 1E3).toString(16)
  },

  /**
   * Convert Unix time
   * @param {number} h - Hexadecimal time
   * @returns {Object} Date
   */
  convert(h) {
    return new Date(Log.time.parse(h) * 1E3)
  },

  /**
   * Convert datetime into Log format (from Twig)
   * @param {string} i - Datetime
   * @returns {string} Datetime in Log format
   */
  convertDateTime(i) {
    const m = i.split(' ')
    return (+new Date(m[0], Number(m[1] - 1), m[2], m[3], m[4], m[5]).getTime() / 1E3).toString(16)
  },

  decimal(time) {
    const d = new Date(time)
    const ms = time - d.setHours(0, 0, 0, 0)
    return parseInt(ms / 864 * 10)
  },

  toDecimal(sec) {
    return parseInt((sec / 864) * 100)
  },

  /**
   * Create a timestamp
   * @param {Object} d - Date
   * @returns {string} Timestamp
   */
  stamp(d) {
    if (Log.config.system.timeFormat === '24') {
      return `${`0${d.getHours()}`.substr(-2)}:${`0${d.getMinutes()}`.substr(-2)}`
    } else if (Log.config.system.timeFormat === '12') {
      return Log.time.twelveHours(d)
    } else {
      let t = Log.time.decimal(d).toString()
      return `${t.substr(0,(t.length-3))}:${t.substr(-3)}`
    }
  },

  /**
   * Convert to 12-hour time
   * @param {Object} d - Date
   * @returns {string} 12-hour format
   */
  twelveHours(d) {
    let h = d.getHours()
    let m = d.getMinutes()
    let s = d.getSeconds()
    const x = h >= 12 ? 'PM' : 'AM'

    h = h % 12
    h = h ? h : 12
    h = (`0${h}`).slice(-2)
    m = (`0${m}`).slice(-2)
    s = (`0${s}`).slice(-2)

    return `${h}:${m}:${s} ${x}`
  },

  /**
   * Convert hexadecimal timestamp into date
   * @param {string} h - Hexadecimal time
   * @returns {string} Date
   */
  date(h) {
    const a = Log.time.convert(h)
    return `${a.getFullYear()}${a.getMonth()}${a.getDate()}`
  },

  /**
   * Display a date
   * @param {number} d - Date
   * @returns {string} Formatted date
   */
  displayDate(d) {
    const f = Log.config.system.calendar

    if (f === 'gregorian') {
      return `${`0${d.getDate()}`.slice(-2)} ${months[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`
    } else if (f === 'monocal') {
      return Monocal.short(Monocal.convert(d))
    } else if (f === 'aequirys') {
      return Aequirys.display(Aequirys.convert(d))
    } else if (f === 'desamber') {
      return Desamber.display(Desamber.convert(d))
    }
  },

  /**
   * Calculate elapsed time
   * @param {number} t - Unix time
   * @returns {string} Elapsed time
   */
  timeago(t) {
    const min = Math.abs(~~(((new Date()) - t) / 1E3 / 60))
    if (min === 0) return 'less than a minute ago'
    if (min === 1) return 'a minute ago'
    if (min < 59) return `${min} minutes ago`
    if (min === 60) return 'an hour ago'
    if (min < 1440) return `${~~(min / 60)} hours ago`
    if (min < 2880) return 'yesterday'
    if (min < 86400) return `${~~(min / 1440)} days ago`
    if (min < 1051199) return `${~~(min / 43200)} months ago`
    return `over ${~~(min / 525960)} years ago`
  },

  /**
   * List dates
   * @param {Object} s - Start date
   * @param {Object} e - End date
   * @returns {Object[]} List of dates
   */
  listDates(s, e) {
    let l = []
    let c = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0)

    while (c <= e) {
      l[l.length] = new Date(c)
      c = Date.prototype.addDays.call(c, 1)
    }

    return l
  },

  /**
   * Calculate duration
   * @param {number} a - Start (Hex time)
   * @param {number} b - End (Hex time)
   * @returns {number} Duration
   */
  duration(a, b) {
    return Log.time.durationSeconds(a, b) / 3600
  },

  /**
   * Calculate duration in seconds
   * @param {number} a - Start (Hex time)
   * @param {number} b - End (Hex time)
   * @returns {number} Duration
   */
  durationSeconds(a, b) {
    return Log.time.parse(b) - Log.time.parse(a)
  },

  /**
   * Returns a timestamp `duration` seconds after `start`
   * @param {string} s - hexadecimal timestamp
   * @param {number} d - duration to offset by (seconds)
   * @returns {string} end - hexadecimal timestamp
   */
  offset(s, d) {
    return (Log.time.parse(s) + d).toString(16)
  }
}
