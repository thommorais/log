/**
 * Log
 * A log and time-tracking system
 *
 * @author Josh Avanier
 * @version 0.1.1
 * @license MIT
 */

"use strict";

var shell = require("shelljs")

shell.cd()
const HOME = shell.pwd()
shell.cd(__dirname)

var Log = {

  log: [], // holds user's logs
  config: {}, // holds user's preferences
  clock: {}, // holds timer interval

  /**
   * Get log status; true means a session is in progress
   * @returns {boolean} Log status
   */

  status() {
    if (Log.log.length == 0) return
    return Log.log[Log.log.length - 1].e == "undefined" ? true : false
  },

  /**
   * Display a session timer
   * @param {boolean} status - Log status
   */

  timer(status) {
    if (status) {
      let l = Log.time.convert(
                Log.time.parse(Log.log[Log.log.length - 1].s)
              ).getTime(),

      tick = _ => {
        let s = Math.floor((new Date().getTime() - l) / 1E3),
            m = Math.floor(s / 60),
            h = Math.floor(m / 60)

        h %= 24
        m %= 60
        s %= 60

        document.getElementById("timer").innerHTML = `${`0${h}`.substr(-2)}:${`0${m}`.substr(-2)}:${`0${s}`.substr(-2)}`
      }

      Log.clock = setInterval(function() { tick() }, 1E3)
    } else return
  },

  /**
   * Display a log table
   * @param {Object[]=} ent - The log entries
   * @param {number=}   num - The number of entries to show
   * @param {string=}   con - The container
   */

  display(ent = Log.log, num = 50, con = "logTable") {

    /**
     * Take the last n items of an array
     * @param {Object[]} a - The array
     * @param {number=}  n - Number of items
     * @returns {Object[]} An array with the last n items
     */

    let takeRight = (a, n = 1) => {
      const l = a == null ? 0 : a.length
      let slice = (a, s, e) => {
        let l = a == null ? 0 : a.length
        if (!l) return []
        s = s == null ? 0 : s
        e = e === undefined ? l : e
        if (s < 0) s = -s > l ? 0 : (l + s)
        e = e > l ? l : e
        if (e < 0) e += l
        l = s > e ? 0 : ((e - s) >>> 0)
        s >>>= 0
        let i = -1
        const r = new Array(l)
        while (++i < l) r[i] = a[i + s]
        return r
      }
      if (!l) return []
      n = l - n
      return slice(a, n < 0 ? 0 : n, l)
    },

    /**
     * Create cells and store data
     * @param {Object} e - A Log entry
     * @param {number} i - The array position
     */

    en = (e, i) => {
      let row = document.getElementById(con).insertRow(i),

          c1 = row.insertCell(0),
          c2 = row.insertCell(1),
          c3 = row.insertCell(2),
          c4 = row.insertCell(3),
          c5 = row.insertCell(4),
          c6 = row.insertCell(5),
          c7 = row.insertCell(6),

          es = Log.time.parse(e.s),
          ee = Log.time.parse(e.e)

      c1.innerHTML = Log.time.displayDate(es)
      c2.innerHTML = Log.time.stamp(es)
      c3.innerHTML = Log.time.stamp(ee)
      c4.innerHTML = Log.time.duration(es, ee).toFixed(2)
      c5.innerHTML = e.c
      c6.innerHTML = e.t
      c7.innerHTML = e.d
    }

    // Display last {num} entries
    let b = takeRight(ent, num)

    for (let i = 0, l = b.length; i < l; i++) en(b[i], i)
  },

  utils: {

    /**
     * Get the max value in an array
     * @param {Object[]} a - An array
     * @returns {number} Max value
     */

    getMax(a) {
      return a.reduce(function(x, y) {
        return Math.max(x, y)
      })
    },

    calcWidth(a, b) {
      return (a - b) / 86400 * 100
    },

    calcDP(a) {
      let s = Log.time.convert(a),
          y = s.getFullYear(),
          m = s.getMonth(),
          d = s.getDate()

      return (new Date(y, m, d, s.getHours(), s.getMinutes(), s.getSeconds()).getTime() / 1E3 - (new Date(y, m, d).getTime() / 1E3)) / 86400 * 100
    },

    calcMargin(a, lw, lp) {
      return a - (lw + lp)
    }
  },

  /**
   * Open a tab
   */

  tab(s) {
    let x = document.getElementsByClassName("sect"),
        b = document.getElementsByClassName("tab")

    for (let i = 0, l = x.length; i < l; i++)
      x[i].style.display = "none"

    for (let i = 0, l = b.length; i < l; i++)
      b[i].className = "pv1 tab on bg-cl o5 mr3"

    document.getElementById(s).style.display = "block"
    document.getElementById(`b-${s}`).className = "pv1 tab on bg-cl of mr3"
  },

  build() {

    let icon = Log.config.ui.icons,

    ic = (a, b, c) => {
      document.getElementById(a).innerHTML = icon ? b : c
    }

    ic("b-ovw", "&#128902;", "Overview")
    ic("b-lis", "&#9783;", "Details")
    ic("b-vis", "&#9781;", "Visualisation")
    ic("b-tab", "&#128911;", "Table")
    ic("b-set", "?", "Guide")

    ic("peakTimesTitle", "&#9650;", "Peak Times")
    ic("forecastTitle", "&#9670;", "Forecast")
    ic("overviewTitle", "&#128902;", "Overview")
    ic("sectorsTodayTitle", "&#11206;", "Sectors")
    ic("sectorsTitle", "&#11206;", "Sectors")
    ic("statsTitle", "&#9650;", "Statistics")
    ic("projectsTitle", "&#9964;", "Projects")

    ic("tableDate", "&#128710;", "Date")
    ic("tableStart", "&#9210;", "Start")
    ic("tableEnd", "&#9209;", "End")
    ic("tableDuration", "&#11118;", "Duration")
    ic("tableSector", "&#11206;", "Sector")
    ic("tableProject", "&#9964;", "Project")
    ic("tableActivity", "&#11042;", "Activity")
  },

  refresh() {
    Log.reset()
    Log.init()
  },

  res: {

    timer() {
      clearInterval(Log.clock)
      document.getElementById("timer").innerHTML = "00:00:00"
    },

    chart(con) {
      document.getElementById(con).innerHTML = ""
    },

    forecast() {
      document.getElementById("fsf").innerHTML = "???"
      document.getElementById("fpf").innerHTML = "???"
      document.getElementById("fpt").innerHTML = "00:00"
      document.getElementById("fsd").innerHTML = "0.00 h"
    },

    stats() {
      let e = "LHH LHT LPH LPT ASD ASDT LSN LSX LSNH LSXH".split(" "),
          r = e => { document.getElementById(e).innerHTML = "0.00" }

      for (let i = 0, l = e.length; i < l; i++) r(e[i])
    },

  },

  reset() {
    let c = e => {
      document.getElementById(e).innerHTML = ""
    }

    Log.res.timer()
    Log.res.forecast()
    Log.res.chart("phc")
    Log.res.chart("pdc")
    Log.res.chart("dayChart")
    Log.res.chart("weekChart")
    Log.res.stats()
    Log.res.chart("peakTimesHistory")

    c("projectBars")
    c("sectorsList")
    c("projectsList")
    c("vis")
    c("logbook")
  },

  /**
   * Initialise
   */

  init() {
    Log.config = config
    Log.log = Log.data.parse(log)

    document.getElementById("app").style.backgroundColor = Log.config.ui.bg
    document.getElementById("app").style.color = Log.config.ui.colour
    document.getElementById("app").style.fontFamily = Log.config.ui.font

    Log.build()

    let ld = Log.data,
        // sp = ld.sp,

        n = new Date(),
        y = new Date(n),

    d = (e, m) => {
      document.getElementById(e).innerHTML = m.toFixed(2)
    },

    s = (e, c) => {
      document.getElementById(e).className = c
    },

    t = (e, c) => {
      let s = "", r, d = document.getElementById(e)

      c > 0 ? (s = `+${c.toFixed(2)}%`) :
        (s = `${c.toFixed(2)}%`)

      d.innerHTML = s
    }

    y.setDate(n.getDate() - 1)

    let en = Log.data.getEntries(n),
        ey = Log.data.getEntries(y),
        mn = Log.data.getRecentEntries(Log.config.ui.view - 1)

    Log.vis.bar(mn, "weekChart")
    Log.vis.peakH(Log.data.getEntriesByDay(n.getDay()))
    Log.vis.peakD()
    Log.vis.day()

    let fc = Log.data.forecast()

    document.getElementById("fsf").innerHTML = fc.sf
    document.getElementById("fpf").innerHTML = fc.pf
    document.getElementById("fpt").innerHTML = fc.pt
    document.getElementById("fsd").innerHTML = fc.sd.toFixed(2) + " h"

    let status = Log.status()

    Log.timer(status)

    document.getElementById("status").className = status ? "rf mb4 f6 pulse" : "rf mb4 f6"

    let lhh = ld.lh(),
        lht = ld.lh(en),
        lph = ld.lp(),
        lpt = ld.lp(en),
        asd = ld.asd(),
        asdt = ld.asd(en),
        lsn = ld.lsmin(en),
        lsx = ld.lsmax(en),
        lsnh = ld.lsmin(),
        lsxh = ld.lsmax(),

        lhtt = ld.trend(lht, ld.lh(ey)),
        asdtt = ld.trend(asdt, ld.asd(ey)),
        lptt = ld.trend(lpt, ld.lp(ey)),
        lsnt = ld.trend(lsn, ld.lsmin(ey)),
        lsxt = ld.trend(lsx, ld.lsmax(ey))

    let els = ["LHH", "LHT", "LPH", "LPT", "ASD", "ASDT", "LSN", "LSX", "LSNH", "LSXH"],
        val = [lhh, lht, lph, lpt, asd, asdt, lsn, lsx, lsnh, lsxh],
        tels = ["lhtt", "asdtt", "lptt", "lsnt", "lsxt"],
        tval = [lhtt, asdtt, lptt, lsnt, lsxt]

    for (let i = 0, l = els.length; i < l; i++)
      document.getElementById(els[i]).innerHTML = val[i].toFixed(2)

    for (let i = 0, l = tels.length; i < l; i++)
      t(tels[i], tval[i])

    document.getElementById("cmd").addEventListener("submit", function() {
      Log.console.parse(document.getElementById("console").value)
      document.getElementById("console").value = ""
    })

    document.addEventListener("keydown", function(e) {
      if (e.which >= 65 && e.which <= 90) {
        document.getElementById("cmd").style.display = "block"
        document.getElementById("console").focus()
      } else if (e.key == "Escape") {
        document.getElementById("console").value = ""
        document.getElementById("cmd").style.display = "none"
      }
      return
    })

    Log.vis.peakH(undefined, "peakTimesHistory")
    // Log.vis.sectorBar(en)
    Log.vis.sectorBars(en)
    Log.vis.projectBars(en)

    Log.vis.sectorBars(undefined, "sectorsList")
    Log.vis.projectBars(undefined, "projectsList")

    Log.vis.line(mn, "vis")
    Log.display(Log.log, 50, "logbook")
  }
}
