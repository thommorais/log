Log = window.Log || {}
Log.time = {

  /**
   * Convert hexadecimal into decimal
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
    return (new Date(t.getFullYear(), t.getMonth(), t.getDate(), t.getHours(), t.getMinutes(), t.getSeconds()).getTime() / 1E3).toString(16)
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
   * Convert Unix time into a timestamp
   * @param {number} t - Unix time
   * @returns {string} Timestamp
   */

  stamp(t) {
    let d = Log.time.convert(t)
    let f = Log.config.system.timeFormat
    let h = `0${d.getHours()}`
    let m = `0${d.getMinutes()}`
    let s = `0${d.getSeconds()}`

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
    let a = Log.time.convert(t)
    let f = Log.config.system.calendar

    if (f === 'gregorian')
      return `${a.getFullYear()} ${a.getMonth() + 1} ${a.getDate()}`
    else if (f === 'monocal')
      return MONO.short(MONO.convert(a))
    else if (f === 'aequirys')
      return Aequirys.display(Aequirys.convert(a))
  },

  timeago(t) {
    let seconds = ((new Date()) - t) / 1E3
    let minutes = Math.floor(seconds / 60)

    minutes = Math.abs(minutes)

    if (minutes === 0) {
      return 'less than a minute ago'
    }

    if (minutes === 1) {
      return 'a minute ago'
    }

    if (minutes < 59) {
      return minutes + ' minutes ago'
    }

    if (minutes < 90) {
      return 'about an hour ago'
    }

    if (minutes < 1440) {
      return Math.floor(minutes / 60) + ' hours ago'
    }

    if (minutes < 2880) {
      return 'yesterday'
    }

    if (minutes < 86400) {
      return Math.floor(minutes / 1440) + ' days ago'
    }

    if (minutes < 1051199) {
      return Math.floor(minutes / 43200) + ' months ago'
    }

    return `over ${Math.floor(minutes / 525960)} years ago`
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
