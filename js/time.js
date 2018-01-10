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
   * @param {number} t - Unix time
   * @returns {Object} Date
   */
  convert(t) {
    return new Date(t * 1E3)
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

  /**
   * Create a timestamp
   * @param {Object} d - Date
   * @returns {string} Timestamp
   */
  stamp(d) {
    return Log.config.system.timeFormat === '24' ? `${`0${d.getHours()}`.substr(-2)}:${`0${d.getMinutes()}`.substr(-2)}` : Log.time.twelveHours(d)
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
    let x = h >= 12 ? 'PM' : 'AM'

    h = h % 12
    h = h ? h : 12
    h = (`0${h}`).slice(-2)
    m = (`0${m}`).slice(-2)
    s = (`0${s}`).slice(-2)

    return `${h}:${m}:${s} ${x}`
  },

  /**
   * Convert hexadecimal timestamp into date
   * @param {string} hex - Hexadecimal timestamp
   * @returns {string} Date
   */
  date(hex) {
    const a = Log.time.convert(Log.time.parse(hex))
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
      let months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')
      let date = (`0${d.getDate()}`).slice(-2)

      return `${date} ${months[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`
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
    const min = Math.abs(Math.floor(((new Date()) - t) / 1E3 / 60))
    if (min === 0) return 'less than a minute ago'
    if (min === 1) return 'a minute ago'
    if (min < 59) return `${min} minutes ago`
    if (min === 60) return 'an hour ago'
    if (min < 1440) return `${Math.floor(min / 60)} hours ago`
    if (min < 2880) return 'yesterday'
    if (min < 86400) return `${Math.floor(min / 1440)} days ago`
    if (min < 1051199) return `${Math.floor(min / 43200)} months ago`
    return `over ${Math.floor(min / 525960)} years ago`
  },

  /**
   * List dates
   * @param {Object} start - Start date
   * @param {Object} end - End date
   * @returns {Object[]} List of dates
   */
  listDates(start, end) {
    let list = []
    let current = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0)

    while (current <= end) {
      list.push(new Date(current))
      current = Date.prototype.addDays.call(current, 1)
    }

     return list
  },

  /**
   * Calculate duration
   * @param {number} a - Start (Unix time)
   * @param {number} b - End (Unix time)
   * @returns {number} Duration
   */
  duration(a, b) {
    return (Log.time.parse(b) - Log.time.parse(a)) / 3600
  },

  /**
   * Returns a timestamp `duration` seconds after `start`
   * @param {string} start - hexadecimal timestamp
   * @param {number} duration - length to offset by (seconds)
   * @returns {string} end - hexadecimal timestamp
   */
  offset(start, duration) {
    return (Log.time.parse(start) + duration).toString(16)
  }
}
