Log = window.Log || {}
Log.vis = {

  /**
   * Display a line visualisation
   * @param {string} con - Container
   * @param {Object[]=} ent - Entries
   */

  line(con, ent = Log.log) {
    let lw = 0 // the width of the last data element
    let lp = 0 // the percentage of the last data element

    /**
     * Add a data element to the chart
     * @param {Object} e - A Log entry
     * @param {Object} r - The Log entry's attributes
     */

    let addEntry = ({s, c}, width, dp, margin, id) => {
      let v = document.createElement('div')

      v.className = 'psr t0 sh1 mb2 lf'
      v.style.width = `${width}%`
      v.style.margin = `0 0 0 ${margin}%`
      v.style.backgroundColor = Log.palette[c] || Log.config.ui.colour

      // let id = con + Log.time.date(Log.time.parse(s))
      document.getElementById(id).appendChild(v)

      lw = width
      lp = dp
    }

    /**
     * Create a new row
     * @param {string} id - The new row's ID
     */

    let nr = id => {
      lw = 0
      lp = 0

      let e = document.createElement('div')

      e.className = 'db wf sh1 mt2 mb3'
      e.id = id

      document.getElementById(con).appendChild(e)
    }

    /**
     * Check if column exists
     * @param {string} id - The column ID
     * @returns {boolean} Column existence status
     */

    let check = id => (document.getElementById(id) == null)

    for (let i = 0, l = ent.length; i < l; i++) {
      if (ent[i].e === 'undefined') continue

      let es = Log.time.parse(ent[i].s)
      let ee = Log.time.parse(ent[i].e)
      let dt = Log.time.date(es)
      let end = Log.time.date(ee)
      let id = con + dt

      check(id) && nr(id)

      let wi = Log.utils.calcWidth(ee, es)
      let dp = Log.utils.calcDP(es)
      let mr = Log.utils.calcMargin(dp, lw, lp)

      addEntry(ent[i], wi, dp, mr, id)
    }
  },

  /**
   * Display a bar visualisation
   * @param {string} con - Container
   * @param {Object[]=} ent - Entries
   */

  bar(con, ent = Log.log) {
    let lw = 0 // the width of the last data element

    /**
     * Add a data element to the chart
     * @param {Object} e - A Log entry
     * @param {Object} r - A width
     */

    let addEntry = ({s, c}, w, id) => {
      let d = document.createElement('div')

      d.className = 'psa sw1'
      d.style.height = `${w}%`
      d.style.bottom = `${lw}%`
      d.style.backgroundColor = Log.palette[c] || Log.config.ui.colour

      document.getElementById(id).appendChild(d)

      lw += w
    }

    /**
     * Create a new column
     * @param {string} id - The new column's ID
     */

    let nc = id => {
      lw = 0

      let dy = document.createElement('div')
      let e = document.createElement('div')

      dy.className = 'dib hf psr'
      dy.style.width = `${100 / Log.config.ui.view}%`

      e.className = 'sw1 hf cn'
      e.id = id

      dy.appendChild(e)

      document.getElementById(con).appendChild(dy)
    }

    let sort = Log.data.sortEntries(ent)

    for (let i = 0, l = sort.length; i < l; i++) {
      let id = `${con}-${i}`

      document.getElementById(id) === null && nc(id)

      for (let o = 0, l = sort[i].length; o < l; o++) {
        if (sort[i][o].e === 'undefined') continue

        if (o === 0) lw = 0

        let s = Log.time.parse(sort[i][o].s)
        let e = Log.time.parse(sort[i][o].e)
        // let d = Log.time.date(s)

        addEntry(sort[i][o], Log.utils.calcWidth(e, s), id)
      }
    }
  },

  /**
   * Display a day chart
   * @param {Object=} d - Date
   * @param {string=} con - Container
   */

  day(d = new Date(), con = 'dayChart') {
    let en = Log.data.getEntries(d)
    let lw = 0 // the width of the last data element
    let lp = 0 // the percentage of the last data element

    let add = ({c, t, d}, width, dp, margin) => {
      let div = document.createElement('div')

      div.className = 'nodrag psr t0 hf mb2 lf'
      div.style.width = `${width}%`
      div.style.marginLeft = `${margin}%`
      div.style.backgroundColor = Log.palette[c] || Log.config.ui.colour

      div.setAttribute('title', `${c}: ${t} - ${d}`)

      document.getElementById(con).appendChild(div)

      lw = width
      lp = dp
    }

    for (let i = 0, l = en.length; i < l; i++) {
      if (en[i].e === 'undefined') continue

      let es = Log.time.parse(en[i].s)
      let ee = Log.time.parse(en[i].e)
      let wd = Log.utils.calcWidth(ee, es)
      let dp = Log.utils.calcDP(es)
      let mr = Log.utils.calcMargin(dp, lw, lp)

      add(en[i], wd, dp, mr)
    }
  },

  /**
   * Display peak hours chart
   * @param {Object[]=} ent - Entries
   * @param {string=} con - Container
   */

  peakH(ent = Log.log, con = 'phc') {
    let h = Log.data.peakHours(ent)
    let m = Log.utils.getMax(h)

    let add = i => {
      let d = document.createElement('div')
      let e = document.createElement('div')
      let n = document.createElement('div')
      let t = `${con}-${i}`

      d.className = 'dib hf psr'
      d.style.width = '4.1667%'
      d.id = t

      n.className = 'sw1 hf cn'
      n.style.backgroundColor = i === (new Date).getHours() ? Log.config.ui.accent : Log.config.ui.colour

      e.className = 'psa b0 wf'
      e.style.height = `${h[i] / m * 100}%`

      e.appendChild(n)

      document.getElementById(con).appendChild(d)
      document.getElementById(t).appendChild(e)
    }

    for (let i = 0, l = h.length; i < l; i++) {
      add(i)
    }
  },

  /**
   * Display peak days chart
   * @param {Object[]=} ent - Entries
   * @param {string=} con - Container
   */

  peakD(ent = Log.log, con = 'pdc') {
    let d = Log.data.peakDays(ent)
    let m = Log.utils.getMax(d)

    add = i => {
      let v = document.createElement('div')
      let e = document.createElement('div')
      let n = document.createElement('div')
      let t = `${con}-${i}`

      v.className = 'dib hf psr'
      v.style.width = '14.2857%' // 100 / 7
      v.id = t

      n.className = `sw1 hf cn`
      n.style.backgroundColor = i === (new Date).getDay() ? Log.config.ui.accent : Log.config.ui.colour

      e.className = 'psa b0 wf'
      e.style.height = `${d[i] / m * 100}%`

      e.appendChild(n)

      document.getElementById(con).appendChild(v)
      document.getElementById(t).appendChild(e)
    }

    for (let i = 0, l = d.length; i < l; i++) {
      add(i)
    }
  },

  /**
   * Display sector bar
   * @param {Object[]=} ent - Entries
   * @param {string=} con - Container
   */

  sectorBar(ent = Log.log, con = 'sectorBar') {
    let s = Log.data.listSectors(ent).sort()

    /**
     * Add a partition to the sector bar
     * @param {Object} sec - A sector
     */

    let add = sec => {
      let d = document.createElement('div')
      let v = Log.data.sp(sec, ent)

      d.className = 'psr t0 hf mb2 lf bg-blanc'
      d.style.width = `${v}%`
      d.title = `${sec} (${v.toFixed(2)}%)`

      document.getElementById(con).appendChild(d)
    }

    for (let i = 0, l = s.length; i < l; i++) {
      add(s[i])
    }
  },

  /**
   * Display sector bars
   * @param {Object[]=} ent - Entries
   * @param {string=} con - Container
   */

  sectorBars(ent = Log.log, con = 'sectorBars') {
    let s = Log.data.listSectors(ent).sort()

    /**
     * Add an item to the sector bar list
     * @param {string} sec - A sector
     */

    let add = sec => {
      let sh = Log.data.sh(sec, ent)
      let li = document.createElement('li')
      let tl = document.createElement('span')
      let st = document.createElement('span')
      let br = document.createElement('div')
      let dt = document.createElement('div')

      li.className = 'mb4 f6 lhc'
      tl.className = 'dib sw6 f6 elip'
      st.className = 'f6 rf'
      br.className = 'wf sh1'
      dt.className = 'psr t0 hf lf'
      dt.style.backgroundColor = Log.palette[sec] || Log.config.ui.colour
      dt.style.width = `${(Log.data.sp(sec, ent))}%`
      tl.innerHTML = sec
      st.innerHTML = `${sh.toFixed(2)} h`

      li.setAttribute('onclick', `Log.detail.sector('${sec}')`)

      br.appendChild(dt)
      li.appendChild(tl)
      li.appendChild(st)
      li.appendChild(br)

      document.getElementById(con).appendChild(li)
    }

    for (let i = 0, l = s.length; i < l; i++) {
      add(s[i])
    }
  },

  /**
   * Display project bars
   * @param {Object[]=} ent - Entries
   * @param {string=} con - Container
   */

  projectBars(ent = Log.log, con = 'projectBars') {
    let s = Log.data.listProjects(ent).sort()

    /**
     * Add an item to the project bars list
     * @param {string} pro - A project
     */

    let add = pro => {
      let sh = Log.data.ph(pro, ent)
      let li = document.createElement('li')
      let tl = document.createElement('span')
      let st = document.createElement('span')
      let br = document.createElement('div')
      let dt = document.createElement('div')

      li.className = 'mb4 f6 lhc'
      tl.className = 'dib sw6 f6 elip'
      st.className = 'f6 rf'
      br.className = 'wf sh1'
      dt.className = 'psr t0 hf lf'
      dt.style.backgroundColor = Log.config.ui.colour
      dt.style.width = `${(Log.data.pp(pro, ent))}%`
      tl.innerHTML = pro
      st.innerHTML = `${sh.toFixed(2)} h`

      li.setAttribute('onclick', `Log.detail.project('${pro}')`)

      br.appendChild(dt)
      li.appendChild(tl)
      li.appendChild(st)
      li.appendChild(br)

      document.getElementById(con).appendChild(li)
    }

    for (let i = 0, l = s.length; i < l; i++) {
      add(s[i])
    }
  }
}
