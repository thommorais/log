Log = window.Log || {}
Log.vis = {

  /**
   * Display a line visualisation
   * @param {string} con - Container
   * @param {Object[]=} ent - Entries
   * @param {string=} mode - Colour mode
   */
  line(con, ent = Log.log, mode = Log.config.ui.colourMode) {
    let lw = 0
    let lp = 0

    let addEntry = ({s, e, c, t}, row) => {
      let entry = document.createElement('div')

      let es = Log.time.parse(s)
      let width = Log.utils.calcWidth(Log.time.parse(e), es)
      let dp = Log.utils.calcDP(es)

      entry.className = 'psr t0 sh1 mb2 lf'
      entry.style.width = `${width}%`
      entry.style.marginLeft = `${Log.utils.calcMargin(dp, lw, lp)}%`

      if (mode === 'sector') {
        entry.style.backgroundColor = Log.palette[c] || Log.config.ui.colour
      } else if (mode === 'project') {
        entry.style.backgroundColor = Log.projectPalette[t] || Log.config.ui.colour
      }

      document.getElementById(row).appendChild(entry)

      lw = width
      lp = dp
    }

    let addRow = id => {
      lw = 0
      lp = 0

      let row = document.createElement('div')

      row.className = 'db wf sh1 mt2 mb3'
      row.id = id

      document.getElementById(con).appendChild(row)
    }

    for (let i = 0, l = ent.length; i < l; i++) {
      if (ent[i].e === 'undefined') continue

      let id = con + Log.time.date(Log.time.parse(ent[i].s))

      document.getElementById(id) === null && addRow(id)

      addEntry(ent[i], id)
    }
  },

  /**
   * Display a bar visualisation
   * @param {string} con - Container
   * @param {Object[]=} ent - Entries
   * @param {string=} mode - Colour mode
   */
  bar(con, ent = Log.log, mode = Log.config.ui.colourMode) {
    let lw = 0

    let addEntry = ({s, e, c, t}, row) => {
      let entry = document.createElement('div')
      let width = Log.utils.calcWidth(Log.time.parse(e), Log.time.parse(s))

      entry.className = 'psa sw1'
      entry.style.height = `${width}%`
      entry.style.bottom = `${lw}%`

      if (mode === 'sector') {
        entry.style.backgroundColor = Log.palette[c] || Log.config.ui.colour
      } else if (mode === 'project') {
        entry.style.backgroundColor = Log.projectPalette[t] || Log.config.ui.colour
      }

      document.getElementById(row).appendChild(entry)

      lw += width
    }

    let newCol = id => {
      lw = 0

      let col = document.createElement('div')
      let inn = document.createElement('div')

      col.className = 'dib hf psr'
      col.style.width = `${100 / Log.config.ui.view}%`

      inn.className = 'sw1 hf cn'
      inn.id = id

      col.appendChild(inn)

      document.getElementById(con).appendChild(col)
    }

    let sort = Log.data.sortEntries(ent)

    for (let i = 0, l = sort.length; i < l; i++) {
      let id = `${con}-${i}`

      document.getElementById(id) === null && newCol(id)

      for (let o = 0, l = sort[i].length; o < l; o++) {
        if (sort[i][o].e === 'undefined') continue

        o === 0 && (lw = 0)

        addEntry(sort[i][o], id)
      }
    }
  },

  /**
   * Display a day chart
   * @param {Object=} d - Date
   * @param {string=} con - Container
   * @param {string=} mode - Colour mode
   */
  day(d = new Date(), con = 'dayChart', mode = Log.config.ui.colourMode) {
    let ent = Log.data.getEntriesByDate(d)

    for (let i = 0, l = ent.length, lw = 0, lp = 0; i < l; i++) {
      if (ent[i].e === 'undefined') continue

      let entry = document.createElement('div')
      let es = Log.time.parse(ent[i].s)
      let dp = Log.utils.calcDP(es)
      let width = Log.utils.calcWidth(Log.time.parse(ent[i].e), es)
      let margin = Log.utils.calcMargin(dp, lw, lp)

      entry.className = 'nodrag psr t0 hf mb2 lf'
      entry.style.width = `${width}%`
      entry.style.marginLeft = `${margin}%`

      if (mode === 'sector') {
        entry.style.backgroundColor = Log.palette[ent[i].c] || Log.config.ui.colour
      } else if (mode === 'project') {
        entry.style.backgroundColor = Log.projectPalette[ent[i].t] || Log.config.ui.colour
      }

      document.getElementById(con).appendChild(entry)

      lw = width
      lp = dp
    }
  },

  /**
   * Display peak hours chart
   * @param {Object[]=} ent - Entries
   * @param {string=} con - Container
   */
  peakH(ent = Log.log, con = 'phc') {
    let hours = Log.data.peakHours(ent)
    let max = Log.utils.getMax(hours)

    for (let i = 0, l = hours.length; i < l; i++) {
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
      e.style.height = `${hours[i] / max * 100}%`

      e.appendChild(n)

      document.getElementById(con).appendChild(d)
      document.getElementById(t).appendChild(e)
    }
  },

  /**
   * Display peak days chart
   * @param {Object[]=} ent - Entries
   * @param {string=} con - Container
   */
  peakD(ent = Log.log, con = 'pdc') {
    let peaks = Log.data.peakDays(ent)
    let peakMax = Log.utils.getMax(peaks)

    for (let i = 0, l = peaks.length; i < l; i++) {
      let col = document.createElement('div')
      let inn = document.createElement('div')
      let cor = document.createElement('div')
      let id = `${con}-${i}`

      col.className = 'dib hf psr'
      col.style.width = '14.2857%'
      col.id = id

      cor.className = 'sw1 hf cn'
      cor.style.backgroundColor = i === (new Date).getDay() ? Log.config.ui.accent : Log.config.ui.colour

      inn.className = 'psa b0 wf'
      inn.style.height = `${peaks[i] / peakMax * 100}%`

      inn.appendChild(cor)

      document.getElementById(con).appendChild(col)
      document.getElementById(id).appendChild(inn)
    }
  },

  /**
   * List sectors or projects
   * @param {string} mode - Sector or project
   * @param {string} con - Container
   * @param {Object[]=} ent - Entries
   */
  list(mode, con, ent = Log.log) {
    let list = []

    if (mode === 'sector') {
      list = Log.data.listSectors(ent).sort()
    } else if (mode === 'project') {
      list = Log.data.listProjects(ent).sort()
    }

    for (let i = 0, l = list.length; i < l; i++) {
      let sh = 0

      if (mode === 'sector') {
        sh = Log.data.sh(list[i], ent)
      } else if (mode === 'project') {
        sh = Log.data.ph(list[i], ent)
      }

      let li = document.createElement('li')
      let tl = document.createElement('span')
      let st = document.createElement('span')
      let br = document.createElement('div')
      let dt = document.createElement('div')

      li.className = 'mb4 f6 lhc c-pt'
      tl.className = 'dib sw6 f6 elip'
      st.className = 'f6 rf'
      br.className = 'wf sh1'
      dt.className = 'psr t0 hf lf'

      if (mode === 'sector') {
        dt.style.backgroundColor = Log.palette[list[i]] || Log.config.ui.colour
        dt.style.width = `${(Log.data.sp(list[i], ent))}%`
        st.innerHTML = `${sh.toFixed(2)} h`
        li.setAttribute('onclick', `Log.detail.sector('${list[i]}')`)
      } else if (mode === 'project') {
        dt.style.backgroundColor = Log.projectPalette[list[i]] || Log.config.ui.colour
        dt.style.width = `${(Log.data.pp(list[i], ent))}%`
        st.innerHTML = `${sh.toFixed(2)} h`
        li.setAttribute('onclick', `Log.detail.project('${list[i]}')`)
      }

      tl.innerHTML = list[i]

      br.appendChild(dt)
      li.appendChild(tl)
      li.appendChild(st)
      li.appendChild(br)

      document.getElementById(con).appendChild(li)
    }
  },

  /**
   * Display a focus distribution bar
   * @param {string} mode - Sector or project
   * @param {Object[]=} ent - Entries
   * @param {string=} con - Container
   */
  focusBar(mode, ent = Log.log, con = 'focusBar') {
    let list = []

    if (mode === 'sector') {
      list = Log.data.listSectors(ent)
    } else if (mode === 'project') {
      list = Log.data.listProjects(ent)
    }

    for (let i = 0, l = list.length; i < l; i++) {
      let item = document.createElement('div')
      item.className = 'psr t0 hf lf'

      if (mode === 'sector') {
        item.style.backgroundColor = Log.palette[list[i]] || Log.config.ui.colour
        item.style.width = `${(Log.data.sp(list[i], ent))}%`
      } else if (mode === 'project') {
        item.style.backgroundColor = Log.projectPalette[list[i]] || Log.config.ui.colour
        item.style.width = `${(Log.data.pp(list[i], ent))}%`
      }

      document.getElementById(con).appendChild(item)
    }
  },

  /**
   * Create legend
   * @param {string} mode - Sector or project
   * @param {Object[]=} ent - Entries
   * @param {string=} con - Container
   */
  legend(mode, ent = Log.log, con = 'legend') {
    let list = []

    if (mode === 'sector') {
      list = Log.data.listSectors(ent).sort()
    } else if (mode === 'project') {
      list = Log.data.listProjects(ent).sort()
    }

    for (let i = 0, l = list.length; i < l; i++) {
      let item = document.createElement('li')
      let code = document.createElement('div')
      let name = document.createElement('div')

      item.className = 'c4 mb3 f6 lhc'
      code.className = 'dib f6 p2 brf mr2'
      name.className = 'dib pb1'

      if (mode === 'sector') {
        code.style.backgroundColor = Log.palette[list[i]] || Log.config.ui.colour
        name.innerHTML = `${list[i]} (${Log.data.sp(list[i], ent).toFixed(2)}%)`
      } else if (mode === 'project') {
        code.style.backgroundColor = Log.projectPalette[list[i]] || Log.config.ui.colour
        name.innerHTML = `${list[i]} (${Log.data.pp(list[i], ent).toFixed(2)}%)`
      }

      item.appendChild(code)
      item.appendChild(name)
      document.getElementById(con).appendChild(item)
    }
  },

  /**
   * Display a focus chart
   * @param {string} mode - Sector or project
   * @param {Object[]=} ent - Entries
   * @param {string=} con - Container
   */
  focusChart(mode, ent = Log.log, con = 'focusChart') {
    let set = Log.data.sortEntries(ent)

    for (let i = 0, l = set.length; i < l; i++) {
      let col = document.createElement('div')
      let inn = document.createElement('div')
      let cor = document.createElement('div')

      col.className = 'dib hf psr'
      col.style.width = `${100 / set.length}%`
      inn.className = 'sw1 hf cn'
      cor.className = 'psa sw1 b0 bg-noir'
      cor.style.backgroundColor = Log.config.ui.colour

      if (mode === 'sector') {
        cor.style.height = `${(1 / Log.data.listSectors(set[i]).length) * 100}%`
      } else if (mode === 'project') {
        cor.style.height = `${(1 / Log.data.listProjects(set[i]).length) * 100}%`
      }

      inn.appendChild(cor)
      col.appendChild(inn)
      document.getElementById(con).appendChild(col)
    }
  }
}
