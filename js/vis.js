/**
 * Log
 * A log and time-tracking system
 *
 * Visualisations
 *
 * @author Josh Avanier
 * @version 0.1.1
 * @license MIT
 */

Log = window.Log || {}
Log.vis = {

  /**
   * Display a line visualisation
   * @param {Object[]=} ent - The Log entries
   * @param {string}    con - The container
   */

  line(ent = Log.log, con) {
    let lw = 0, // the width of the last data element
        lp = 0, // the percentage of the last data element

    /**
     * Add a data element to the chart
     * @param {Object} e - A Log entry
     * @param {Object} r - The Log entry's attributes
     */

    addEntry = (e, width, dp, margin) => {
      let v = document.createElement("div")

      v.className    = `psr t0 sh1 mb2 lf bg-blanc`
      v.style.width  = `${width}%`
      v.style.margin = `0 0 0 ${margin}%`
      v.style.backgroundColor = Log.config.ui.colour

      let id = con + Log.time.date(Log.time.parse(e.s))
      document.getElementById(id).appendChild(v)

      lw = width
      lp = dp
    },

    /**
     * Create a new row
     * @param {string} id - The new row's ID
     */

    nr = id => {
      lw = 0
      lp = 0

      let e = document.createElement("div")

      e.className = "db wf sh1 mt2 mb3"
      e.id        = con + id

      document.getElementById(con).appendChild(e)
    },

    /**
     * Check if column exists
     * @param {string} id - The column ID
     * @returns {boolean} Column existence status
     */

    check = id => (document.getElementById(id) == null)

    for (let i = 0, l = ent.length; i < l; i++) {
      if (ent[i].e == "undefined") continue

      let es  = Log.time.parse(ent[i].s),
          ee  = Log.time.parse(ent[i].e),

          dt  = Log.time.date(es),
          end = Log.time.date(ee),

          id  = con + dt

      // Split entries that span through midnight
      if (dt !== end) {
        check(id) && nr(dt)

        let aa = Log.time.convert(es),
            aae = Log.time.parse((+new Date(aa.getFullYear(), aa.getMonth(), aa.getDate(), 23, 59).getTime() / 1E3).toString(16)),
            awi = Log.utils.calcWidth(aae, es),
            adp = Log.utils.calcDP(es),
            amr = Log.utils.calcMargin(adp, lw, lp)

        addEntry(ent[i], awi, adp, amr)

        check(con + end) && nr(end)

        let ea = Log.time.convert(ee),
            eas = Log.time.parse((+new Date(ea.getFullYear(), ea.getMonth(), ea.getDate(), 0, 0).getTime() / 1E3).toString(16)),
            ewi = Log.utils.calcWidth(ee, eas),
            edp = Log.utils.calcDP(eas),
            emr = Log.utils.calcMargin(edp, lw, lp)

        addEntry(ent[i], ewi, edp, emr)
      } else {
        check(id) && nr(dt)

        let wi = Log.utils.calcWidth(ee, es),
            dp = Log.utils.calcDP(es),
            mr = Log.utils.calcMargin(dp, lw, lp)

        addEntry(ent[i], wi, dp, mr)
      }
    }
  },

  /**
   * Display a bar visualisation
   * @param {Object[]=} ent - Log entries
   * @param {string}    con - The container
   */

  bar(ent = Log.log, con) {
    let lw = 0, // the width of the last data element

    /**
     * Add a data element to the chart
     * @param {Object} e - A Log entry
     * @param {Object} r - A width
     */

    addEntry = (e, w) => {
      let d = document.createElement("div")

      d.className    = `psa sw1 bg-blanc`
      d.style.height = `${w}%`
      d.style.bottom = `${lw}%`
      d.style.backgroundColor = Log.config.ui.colour

      let id = Log.time.date(Log.time.parse(e.s))
      document.getElementById(id).appendChild(d)

      lw += w
    },

    /**
     * Create a new column
     * @param {string} id - The new column's ID
     */

    nc = id => {
      lw = 0

      let dy = document.createElement("div"),
          e = document.createElement("div")

      dy.className   = "dib hf psr"
      dy.style.width = `${100 / Log.config.ui.view}%` // 100 / 28

      e.className = `sw1 hf cn`
      e.id = id

      dy.appendChild(e)

      document.getElementById(con).appendChild(dy)
    }

    for (let i = 0, l = ent.length; i < l; i++) {
      if (ent[i].e == "undefined") continue

      let s = Log.time.parse(ent[i].s),
          e = Log.time.parse(ent[i].e),
          d = Log.time.date(s)

      document.getElementById(d) == null && nc(d)

      addEntry(ent[i], Log.utils.calcWidth(e, s))
    }
  },

  /**
   * Display a day chart
   * @param {Object=} d - A date
   */

  day(d = new Date(), con = "dayChart") {
    let en = Log.data.getEntries(d),

        lw = 0, // the width of the last data element
        lp = 0, // the percentage of the last data element

    add = (e, width, dp, margin) => {
      let d = document.createElement("div")

      d.className    = `psr t0 hf mb2 lf`
      d.style.width  = `${width}%`
      d.style.margin = `0 0 0 ${margin}%`
      d.style.backgroundColor = Log.config.ui.colour

      document.getElementById(con).appendChild(d)

      lw = width
      lp = dp
    }

    for (let i = 0, l = en.length; i < l; i++) {
      if (en[i].e == "undefined") continue

      let es = Log.time.parse(en[i].s),
          ee = Log.time.parse(en[i].e),

          wd = Log.utils.calcWidth(ee, es),
          dp = Log.utils.calcDP(es),
          mr = Log.utils.calcMargin(dp, lw, lp)

      add(en[i], wd, dp, mr)
    }
  },

  /**
   * Display peak hours chart
   * @param {Object[]=} ent - Log entries
   * @param {string=}   con - The container
   */

  peakH(ent = Log.log, con = "phc") {
    let h = Log.data.peakHours(ent),
        m = Log.utils.getMax(h),

    add = i => {
      let d = document.createElement("div"),
          e = document.createElement("div"),
          n = document.createElement("div"),
          t = `${con}-${i}`,
          b = i == (new Date).getHours() ? "of" : "o5"

      d.className = "dib hf psr"
      d.style.width = `4.166666666666667%`
      d.id = t

      n.className = `sw1 hf cn`
      n.style.backgroundColor = Log.config.ui.colour

      e.className = "psa b0 wf"
      e.style.height = `${h[i] / m * 100}%`

      e.appendChild(n)

      document.getElementById(con).appendChild(d)
      document.getElementById(t).appendChild(e)
    }

    for (let i = 0, l = h.length; i < l; i++) add(i)
  },

  /**
   * Display peak days chart
   * @param {Object[]=} ent - Log entries
   * @param {string=}   con - The container
   */

  peakD(ent = Log.log, con = "pdc") {
    let d = Log.data.peakDays(ent),
        m = Log.utils.getMax(d),

    add = i => {
      let v = document.createElement("div"),
          e = document.createElement("div"),
          n = document.createElement("div"),
          t = `${con}-${i}`,
          b = i == (new Date).getDay() ? "of" : "o5"

      v.className    = "dib hf psr"
      v.style.width  = "14.285714285714286%" // 100 / 7
      v.id           = t

      n.className    = `sw1 hf cn`
      n.style.backgroundColor = Log.config.ui.colour

      e.className    = "psa b0 wf"
      e.style.height = `${d[i] / m * 100}%`

      e.appendChild(n)

      document.getElementById(con).appendChild(v)
      document.getElementById(t).appendChild(e)
    }

    for (let i = 0, l = d.length; i < l; i++) add(i)
  },

  /**
   * Display sector bar
   * @param {Object[]=} ent - Log entries
   * @param {string=}   con - The container
   */

  sectorBar(ent = Log.log, con = "sectorBar") {
    let s = Log.data.listSectors(ent).sort(),

    /**
     * Add a partition to the sector bar
     * @param {Object} sec - A sector
     */

    add = sec => {
      let d = document.createElement("div"),
          v = Log.data.sp(ent, sec)

      d.className   = `psr t0 hf mb2 lf bg-blanc`
      d.style.width = `${v}%`
      d.title       = `${sec} (${v.toFixed(2)}%)`

      document.getElementById(con).appendChild(d)
    }

    for (let i = 0, l = s.length; i < l; i++) add(s[i])
  },

  /**
   * Display sector bars
   * @param {Object[]=} ent - Log entries
   * @param {string=}   con - The container
   */

  sectorBars(ent = Log.log, con = "sectorBars") {
    let s = Log.data.listSectors(ent).sort(),

    /**
     * Add an item to the sector bar list
     * @param {string} sec - A sector
     */

    add = sec => {

      /*
        ------------------------
        SECTOR           LH 2.34
        ++++++++++==============
        ------------------------
      */

      let sh = Log.data.sh(ent, sec),

          li = document.createElement("li"),
          tl = document.createElement("span"),
          st = document.createElement("span"),
          br = document.createElement("div"),
          dt = document.createElement("div")

      li.className = "mb4 f6"

      tl.className = "f6 mb2 mon upc tk"
      st.className = "f6 rf"
      br.className = "wf sh1 mb3"

      dt.className   = "psr t0 hf lf"
      dt.style.backgroundColor = Log.config.ui.colour
      dt.style.width = `${(Log.data.sp(ent, sec))}%`

      tl.innerHTML = sec
      st.innerHTML = `LH ${sh.toFixed(2)}`

      br.appendChild(dt)
      li.appendChild(tl)
      li.appendChild(st)
      li.appendChild(br)

      document.getElementById(con).appendChild(li)
    }

    for (let i = 0, l = s.length; i < l; i++) add(s[i])
  },

  /**
   * Display project bars
   * @param {Object[]=} ent - Log entries
   * @param {string=}   con - The container
   */

  projectBars(ent = Log.log, con = "projectBars") {
    let s = Log.data.listProjects(ent).sort(),

    /**
     * Add an item to the project bars list
     * @param {string} pro - A project
     */

    add = pro => {

      /*
        ------------------------
        PROJECT          LH 2.34
        ++++++++++==============
        ------------------------
      */

      let sh = Log.data.ph(ent, pro),

          li = document.createElement("li"),
          tl = document.createElement("span"),
          st = document.createElement("span"),
          br = document.createElement("div"),
          dt = document.createElement("div")

      li.className   = "mb4 f6"

      tl.className   = "f6 mb2 mon upc tk"
      tl.innerHTML   = pro

      st.className   = "f6 rf"
      st.innerHTML   = `LH ${sh.toFixed(2)}`

      br.className   = "wf sh1 mb3"
      dt.className   = "psr t0 hf lf"
      dt.style.backgroundColor = Log.config.ui.colour
      dt.style.width = `${(Log.data.pp(ent, pro))}%`

      br.appendChild(dt)
      li.appendChild(tl)
      li.appendChild(st)
      li.appendChild(br)

      document.getElementById(con).appendChild(li)
    }

    for (let i = 0, l = s.length; i < l; i++) add(s[i])
  }
}
