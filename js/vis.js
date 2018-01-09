Log = window.Log || {}
Log.vis = {

  /**
   * Display a line visualisation
   * @param {Object[]} data - Line data
   * @param {string} con - Container
   */
  line(data, con) {
    if (isUndefined(data)) return
    if (isEmpty(data) || !isString(con) || !exists(con)) return

    const addEntry = ({col, mg, wd}, row) => {
      const div = create('div')
      div.className = 'psr t0 sh1 mb2 lf br3'
      div.style.width = `${wd}%`
      div.style.marginLeft = `${mg}%`
      div.style.backgroundColor = col
      append(row, div)
    }

    const addRow = id => {
      const row = create('div')
      row.className = 'db wf sh1 mt2 mb3'
      row.id = id
      append(con, row)
    }

    data.map((e, i) => {
      const id = `${con}${i}`
      document.getElementById(id) === null && addRow(id)
      !isEmpty(e) && e.map(o => addEntry(o, id))
    })
  },

  /**
   * Display a bar visualisation
   * @param {Object[]} data - Bar data
   * @param {string} con - Container
   */
  bar(data, con) {
    Log.vis.gridLines(con)

    if (isUndefined(data)) return
    if (isEmpty(data) || !isString(con) || !exists(con)) return

    const addEntry = ({col, pos, wh}, row) => {
      const div = create('div')
      div.className = 'psa sw1'
      div.style.height = `${wh}%`
      div.style.bottom = `${pos}%`
      div.style.backgroundColor = col
      append(row, div)
    }

    const addCol = id => {
      const col = create('div')
      const inn = create('div')

      col.className = 'dib hf psr'
      col.style.width = `${100 / Log.config.ui.view}%`
      inn.className = 'sw1 hf cn bb'
      inn.id = id

      col.appendChild(inn)
      append(con, col)
    }

    data.map((e, i) => {
      const id = `${con}${i}`
      document.getElementById(id) === null && addCol(id)
      e.map(o => addEntry(o, id))
    })
  },

  /**
   * Display a day chart
   * @param {Object=} d - Date
   * @param {string=} con - Container
   * @param {string=} mode - Colour mode
   */
  day(d = new Date(), con = 'dayChart') {
    if (!isObject(d) || !isString(con) || !exists(con)) return

    const ent = Log.data.getEntriesByDate(d)

    if (isEmpty(ent)) return

    let lw = 0
    let lp = 0

    const mode = Log.config.ui.colourMode

    ent.map(e => {
      if (e.e !== 'undefined') {
        const div = create('div')
        const es = Log.time.parse(e.s)
        const dp = Log.utils.calcDP(es)
        const wd = Log.utils.calcWidth(Log.time.parse(e.e), es)
        const mg = Log.utils.calcMargin(dp, lw, lp)

        const col = mode === 'sector' ? e.sCol :
        mode === 'project' ? e.pCol :
        mode === 'none' && Log.config.ui.colour

        div.className = 'nodrag psr t0 hf mb2 lf br3'
        div.style.width = `${wd}%`
        div.style.marginLeft = `${mg}%`
        div.style.backgroundColor = col || Log.config.ui.colour

        append(con, div)

        lw = wd
        lp = dp
      }
    })
  },

  /**
   * Display peak days chart
   * @param {string} mode - Hours or days
   * @param {Object[]} peaks - Peaks
   * @param {string=} con - Container
   */
  peakChart(mode, peaks, con) {
    console.log(mode, peaks, con)
    if (peaks === undefined) return
    if (isEmpty(peaks) || ['hours', 'days'].indexOf(mode) < 0 || !isString(con) || !exists(con)) return

    const peak = Math.max(...peaks)

    peaks.map((e, i) => {
      const col = create('div')
      const out = create('div')
      const inn = create('div')
      const id = `${con}-${i}`

      col.className = 'dib hf psr'
      col.style.width = `${100 / peaks.length}%`
      col.id = id
      out.className = 'sw1 hf cn bb'
      inn.className = 'psa b0 sw1 br3'
      inn.style.height = `${e / peak * 100}%`

      if (mode === 'hours') {
        inn.style.backgroundColor = i === (new Date).getHours() ? Log.config.ui.accent : Log.config.ui.colour
        inn.style.borderColor = i === (new Date).getHours() ? Log.config.ui.accent : Log.config.ui.colour
      } else {
        inn.style.backgroundColor = i === (new Date).getDay() ? Log.config.ui.accent : Log.config.ui.colour
        inn.style.borderColor = i === (new Date).getDay() ? Log.config.ui.accent : Log.config.ui.colour
      }

      out.appendChild(inn)
      append(con, col)
      append(id, out)
    })
  },

  /**
   * List sectors or projects
   * @param {string} mode - Sector or project
   * @param {string} con - Container
   * @param {Object[]=} ent - Entries
   */
  list(mode, val, con, ent = Log.log) {
    if (!isValidArray(ent) || isEmpty(ent) || !isString(con) || !exists(con)) return

    const list = Log.data.sortValues(ent, mode, val)

    let col = ''
    let wd = 0

    list.map(e => {
      const sh = mode === 'sec' ? Log.data.sh(e[0], ent) : Log.data.ph(e[0], ent)
      const li = create('li')
      const tl = create('span')
      const st = create('span')
      const br = create('div')
      const dt = create('div')

      li.className = 'mb4 c-pt'
      tl.className = 'dib xw6 elip'
      st.className = 'rf'
      br.className = 'wf sh1'
      dt.className = 'psr t0 hf lf br3'

      mode === 'sec' ?
      (col = Log.palette[e[0]], wd = Log.data.sp(e[0], ent)) :
      (col = Log.projectPalette[e[0]], wd = Log.data.pp(e[0], ent))

      dt.style.backgroundColor = col || Log.config.ui.colour
      dt.style.width = `${wd}%`
      st.innerHTML = `${e[1].toFixed(2)} h`
      li.setAttribute('onclick', `Log.detail.${mode}('${e[0]}')`)
      tl.innerHTML = e[0]

      li.appendChild(tl)
      li.appendChild(st)
      br.appendChild(dt)
      li.appendChild(br)
      append(con, li)
    })
  },

  /**
   * Display a focus distribution bar
   * @param {string} mode - Sector or project
   * @param {Object[]=} ent - Entries
   * @param {string=} con - Container
   */
  focusBar(mode, ent = Log.log, con = 'focusBar') {
    if (!isValidArray(ent) || isEmpty(ent) || !isString(con) || !exists(con)) return

    const sorted = Log.data.sortValues(ent, mode)

    sorted.map(e => {
      const itm = create('div')
      const col = mode === 'sec' ? Log.palette[e[0]] : Log.projectPalette[e[0]]

      itm.className = 'psr t0 hf lf'
      itm.style.backgroundColor = col || Log.config.ui.colour
      itm.style.width = `${e[1]}%`

      append(con, itm)
    })
  },

  /**
   * Create legend
   * @param {string} mode - Sector or project
   * @param {Object[]=} ent - Entries
   * @param {string=} con - Container
   */
  legend(mode, ent = Log.log, con = 'legend') {
    if (!isValidArray(ent) || isEmpty(ent) || !isString(con) || !exists(con) || ['sec', 'pro'].indexOf(mode) < 0) return

    const sorted = Log.data.sortValues(ent, mode)

    sorted.map(e => {
      const item = create('li')
      const code = create('div')
      const name = create('div')
      const col = mode === 'sec' ? Log.palette[e[0]] : Log.projectPalette[e[0]]
      const perc = e[1]

      item.className = 'c3 mb3 f6 lhc'
      code.className = 'dib sh3 sw3 brf mr2 lhs'
      name.className = 'dib'

      code.style.backgroundColor = col || Log.config.ui.colour
      name.innerHTML = `${e[0]} (${perc.toFixed(2)}%)`

      item.appendChild(code)
      item.appendChild(name)
      append(con, item)
    })
  },

  /**
   * Display a focus chart
   * @param {string} mode - Sector or project
   * @param {Object[]=} ent - Entries
   * @param {string=} con - Container
   */
  focusChart(mode, ent = Log.log, con = 'focusChart') {
    if (!isValidArray(ent) || isEmpty(ent) || !isString(con) || !exists(con)) return

    Log.vis.gridLines(con)

    const set = Log.data.sortEntries(ent)

    set.map(e => {
      const list = mode === 'sec' ? Log.data.listSectors(e) : Log.data.listProjects(e)
      const height = list === undefined ? 0 : 1 / list.length * 100
      const col = create('div')
      const inn = create('div')
      const cor = create('div')

      col.className = 'dib hf psr'
      col.style.width = `${100 / set.length}%`
      inn.className = 'sw1 hf cn bb'
      cor.className = 'psa sw1 b0 bg-noir br3'
      cor.style.backgroundColor = Log.config.ui.colour
      cor.style.height = `${height}%`

      inn.appendChild(cor)
      col.appendChild(inn)
      append(con, col)
    })
  },

  gridLines(con) {
    const div100 = create('div')
    const div75 = create('div')
    const div50 = create('div')
    const div25 = create ('div')
    const div0 = create('div')

    div100.className = 'psa wf c-3 bt o2'
    div100.style.top = '0'
    div75.className = 'psa wf c-3 bt o2'
    div75.style.top = '25%'
    div50.className = 'psa wf c-3 bt o2'
    div50.style.bottom = '50%'
    div25.className = 'psa wf c-3 bt o2'
    div25.style.bottom = '25%'
    div0.className = 'psa wf c-3 bt o2 b0'

    append(con, div100)
    append(con, div75)
    append(con, div50)
    append(con, div25)
    append(con, div0)
  },

  pie(data, con) {
    let canvas = document.getElementById(con)
    let halfWidth = canvas.width * .5
    let halfHeight = canvas.height * .5
    let ctx = canvas.getContext('2d')
    let lastend = 0

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // console.log(data)

    for(let i = 0, l = data.length; i < l; i++) {
      // console.log(data[i].col)
      ctx.fillStyle = data[i].col
      ctx.beginPath()
      ctx.moveTo(halfWidth, halfHeight)
      ctx.arc(halfWidth, halfHeight, halfHeight, lastend, lastend + (data[i].arc), false)
      ctx.lineTo(halfWidth, halfHeight)
      ctx.fill()
      lastend += data[i].arc
    }
  }
}
