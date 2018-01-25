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
      const div = create('div', 'psr t0 sh1 mb2 lf br3')
      div.style.width = `${wd}%`
      div.style.marginLeft = `${mg}%`
      div.style.backgroundColor = col
      append(row, div)
    }

    const addRow = id => {
      const row = create('div', 'db wf sh1 mt2 mb3')
      row.id = id
      append(con, row)
    }

    data.map((e, i) => {
      const id = `${con}${i}`
      isNull(document.getElementById(id)) && addRow(id)
      !isEmpty(e) && e.map(o => addEntry(o, id))
    })
  },

  /**
   * Display a bar visualisation
   * @param {Object[]} data - Bar data
   * @param {string} con - Container
   * @param {boolean=} lines - Lines
   */
  bar(data, con, lines = true) {
    lines && Log.vis.gridLines(con)

    if (isUndefined(data)) return
    if (isEmpty(data) || !isString(con) || !exists(con)) return

    const addEntry = ({col, pos, wh}, row) => {
      const div = create('div', 'psa sw1')
      div.style.height = `${wh}%`
      div.style.bottom = `${pos}%`
      div.style.backgroundColor = col
      append(row, div)
    }

    const addCol = id => {
      const col = create('div', 'dib hf psr')
      const inn = create('div', 'sw1 hf cn bb')
      col.style.width = `${100 / Log.config.ui.view}%`
      inn.id = id
      col.appendChild(inn)
      append(con, col)
    }

    data.map((e, i) => {
      const id = `${con}${i}`
      isNull(document.getElementById(id)) && addCol(id)
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

    ent.map(({s, e, dur, sCol, pCol}) => {
      if (!isUndefined(e)) {
        const div = create('div', 'nodrag psr t0 hf mb2 lf br3')
        const dp = Log.utils.calcDP(s)
        const wd = dur * 3600 / 86400 * 100
        const col = Log.config.ui.colourMode === 'sector' ? sCol :
                    Log.config.ui.colourMode === 'project' ? pCol :
                    Log.config.ui.colourMode === 'none' && Log.config.ui.colour

        div.style.width = `${wd}%`
        div.style.marginLeft = `${dp - (lw + lp)}%`
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
    if (isUndefined(peaks)) return
    if (isEmpty(peaks) || ['hours', 'days'].indexOf(mode) < 0 || !isString(con) || !exists(con)) return

    const peak = Log.data.max(peaks)

    peaks.map((e, i) => {
      const col = create('div', 'dib hf psr')
      const out = create('div', 'sw1 hf cn bb')
      const inn = create('div', 'psa b0 sw1 br3')
      const id = `${con}-${i}`

      col.style.width = `${100 / peaks.length}%`
      col.id = id
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
   * @param {string} val - Hours or percentages
   * @param {string} con - Container
   * @param {Object[]=} ent - Entries
   */
  list(mode, val, con, ent = Log.log) {
    if (!isValidArray(ent) || isEmpty(ent) || !isString(con) || !exists(con)) return

    let col = ''
    let sh = 0
    let wd = 0

    Log.data.sortValues(ent, mode, val).map(e => {
      if (mode === 'sec') {
        col = Log.palette[e[0]]
        sh = Log.data.sh(e[0], ent)
        wd = Log.data.sp(e[0], ent)
      } else {
        col = Log.projectPalette[e[0]]
        sh = Log.data.ph(e[0], ent)
        wd = Log.data.pp(e[0], ent)
      }

      if (Log.config.ui.colourMode === 'none') {
        col = Log.config.ui.colour
      }

      const li = create('li', 'mb4 c-pt')
      const br = create('div', 'wf sh1')
      const dt = create('div', 'psr t0 hf lf br3')

      dt.style.backgroundColor = col || Log.config.ui.colour
      dt.style.width = `${wd}%`
      li.setAttribute('onclick', `Log.detail.${mode}('${e[0]}')`)

      li.appendChild(create('span', 'dib xw6 elip', e[0]))
      li.appendChild(create('span', 'rf', `${e[1].toFixed(2)} h`))
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

    Log.data.sortValues(ent, mode).map(e => {
      const itm = create('div', 'psr t0 hf lf')
      const col = mode === 'sec' ? Log.palette[e[0]] : Log.projectPalette[e[0]]

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

    Log.data.sortValues(ent, mode).map(e => {
      const col = mode === 'sec' ? Log.palette[e[0]] : Log.projectPalette[e[0]]
      const item = create('li', 'c3 mb3 f6 lhc')
      const code = create('div', 'dib sh3 sw3 brf mr2 lhs')

      code.style.backgroundColor = col || Log.config.ui.colour

      item.appendChild(code)
      item.appendChild(create('div', 'dib', `${e[0]} (${e[1].toFixed(2)}%)`))
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

    const set = Log.data.sortEntries(ent)
    const length = set.length

    set.map(e => {
      const list = mode === 'sec' ? Log.data.listSectors(e) : Log.data.listProjects(e)
      const height = list === undefined ? 0 : 1 / list.length * 100
      const col = create('div', 'dib hf psr')
      const inn = create('div', 'sw1 hf cn bb')
      const cor = create('div', 'psa sw1 b0 bg-noir br3')

      col.style.width = `${100 / length}%`
      cor.style.backgroundColor = Log.config.ui.colour
      cor.style.height = `${height}%`

      inn.appendChild(cor)
      col.appendChild(inn)
      append(con, col)
    })
  },

  /**
   * Create chart lines
   * @param {string} con - Container
   */
  gridLines(con) {
    const d100 = create('div', 'psa wf bt o1')
    const d75 = create('div', 'psa wf bt o1')
    const d50 = create('div', 'psa wf bt o1')
    const d25 = create ('div', 'psa wf bt o1')

    d100.style.top = '0'
    d75.style.top = '25%'
    d50.style.bottom = '50%'
    d25.style.bottom = '25%'

    append(con, d100)
    append(con, d75)
    append(con, d50)
    append(con, d25)
    append(con, create('div', 'psa wf bt o1 b0'))
  }
}
