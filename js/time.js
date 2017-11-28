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
   * Create a timestamp
   * @param {Object} d - Date
   * @returns {string} Timestamp
   */
  stamp(d) {
    let f = Log.config.system.timeFormat

    if (f === '24') {
      let h = `0${d.getHours()}`
      let m = `0${d.getMinutes()}`
      let s = `0${d.getSeconds()}`

      return `${h.substr(-2)}:${m.substr(-2)}:${s.substr(-2)}`
    } else if (f === '12') {
      return Log.time.twelveHours(d)
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
   * @param {number} d - Date
   * @returns {string} Formatted date
   */
  displayDate(d) {
    let f = Log.config.system.calendar

    if (f === 'gregorian') {
      return `${d.getFullYear()} ${d.getMonth() + 1} ${d.getDate()}`
    } else if (f === 'monocal') {
      return MONO.short(MONO.convert(d))
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
    let sec = ((new Date()) - t) / 1E3
    let min = Math.abs(Math.floor(sec / 60))

    if (min === 0) {
      return 'less than a minute ago'
    }

    if (min === 1) {
      return 'a minute ago'
    }

    if (min < 59) {
      return `${min} minutes ago`
    }

    if (min < 1440) {
      return `${Math.floor(min / 60)} hours ago`
    }

    if (min < 2880) {
      return 'yesterday'
    }

    if (min < 86400) {
      return `${Math.floor(min / 1440)} days ago`
    }

    if (min < 1051199) {
      return `${Math.floor(min / 43200)} months ago`
    }

    return `over ${Math.floor(min / 525960)} years ago`
  },

  /**
   * List dates
   * @param {Object} start - Start date
   * @param {Object} end - End date
   * @returns {Object[]} List of dates
   */
  listDates(start, end) {
    let interval = 1
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
    return (b - a) / 3600
  }
}
