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
      append(row, create({
        type: 'div',
        className: 'psr t0 sh1 mb2 lf br3',
        backgroundColor: col,
        width: `${wd}%`,
        marginLeft: `${mg}%`
      }))
    }

    const addRow = id => {
      append(con, create({
        type: 'div',
        id: id,
        className: 'db wf sh1 mt2 mb3'
      }))
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
      append(row, create({
        type: 'div',
        className: 'psa sw1',
        backgroundColor: col,
        height: `${wh}%`,
        bottom: `${pos}%`
      }))
    }

    const addCol = id => {
      const col = create({
        type: 'div',
        className: 'dib hf psr',
        width: `${100 / Log.config.ui.view}%`
      })

      col.appendChild(create({
        type: 'div',
        id: id,
        className: 'sw1 hf cn bb'
      }))

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
        const dp = Log.utils.calcDP(s)
        const wd = dur * 3600 / 86400 * 100
        const col = Log.config.ui.colourMode === 'sector' ? sCol :
                    Log.config.ui.colourMode === 'project' ? pCol :
                    Log.config.ui.colourMode === 'none' && Log.config.ui.colour

        append(con, create({
          type: 'div',
          className: 'nodrag psr t0 hf mb2 lf br3',
          backgroundColor: col || Log.config.ui.colour,
          width: `${wd}%`,
          marginLeft: `${dp - (lw + lp)}%`
        }))

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
      const id = `${con}-${i}`
      const col = create({
        type: 'div',
        id: id,
        className: 'dib hf psr',
        width: `${100 / peaks.length}%`
      })

      const out = create({
        type: 'div',
        className: 'sw1 hf cn bb'
      })

      out.appendChild(create({
        type: 'div',
        className: 'psa b0 sw1 br3',
        backgroundColor: mode === 'hours' ?
          (i === (new Date).getHours() ? Log.config.ui.accent : Log.config.ui.colour) :
          (i === (new Date).getDay() ? Log.config.ui.accent : Log.config.ui.colour),
        height: `${e / peak * 100}%`
      }))

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

      if (Log.config.ui.colourMode === 'none') col = Log.config.ui.colour

      const li = create({
        type: 'li',
        className: 'mb4 c-pt',
        onclick: `Log.detail.${mode}('${e[0]}')`
      })

      const br = create({
        type: 'div',
        className: 'wf sh1'
      })

      li.appendChild(create({
        type: 'span',
        className: 'dib xw6 elip',
        innerHTML: e[0]
      }))

      li.appendChild(create({
        type: 'span',
        className: 'rf',
        innerHTML: `${e[1].toFixed(2)} h`
      }))

      br.appendChild(create({
        type: 'div',
        className: 'psr t0 hf lf br3',
        backgroundColor: col || Log.config.ui.colour,
        width: `${wd}%`
      }))

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
      const col = mode === 'sec' ? Log.palette[e[0]] : Log.projectPalette[e[0]]
      append(con, create({
        type: 'div',
        className: 'psr t0 hf lf',
        backgroundColor: col || Log.config.ui.colour,
        width: `${e[1]}%`
      }))
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
      const item = create({
        type: 'li',
        className: 'c3 mb3 f6 lhc'
      })

      item.appendChild(create({
        type: 'div',
        className: 'dib sh3 sw3 brf mr2 lhs',
        backgroundColor: col || Log.config.ui.colour
      }))

      item.appendChild(create({
        type: 'div',
        className: 'dib',
        innerHTML: `${e[0]} (${e[1].toFixed(2)}%)`
      }))

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

      const col = create({
        type: 'div',
        className: 'dib hf psr',
        width: `${100 / length}%`
      })

      const inn = create({
        type: 'div',
        className: 'sw1 hf cn bb'
      })

      inn.appendChild(create({
        type: 'div',
        className: 'psa sw1 b0 bg-noir br3',
        backgroundColor: Log.config.ui.colour,
        height: `${height}%`
      }))

      col.appendChild(inn)
      append(con, col)
    })
  },

  /**
   * Create chart lines
   * @param {string} con - Container
   */
  gridLines(con) {
    append(con, create({
      type: 'div',
      className: 'psa wf bt o1',
      top: '0'
    }))

    append(con, create({
      type: 'div',
      className: 'psa wf bt o1',
      top: '25%'
    }))

    append(con, create({
      type: 'div',
      className: 'psa wf bt o1',
      bottom: '50%'
    }))

    append(con, create({
      type: 'div',
      className: 'psa wf bt o1',
      bottom: '25%'
    }))

    append(con, create({
      type: 'div',
      className: 'psa wf bt o1 b0'
    }))
  }
}
