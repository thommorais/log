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

    const add = ({col, mg, wd}, row) => {
      append(row, createEl(
        `<div class="psr t0 sh1 mb2 lf br3" style="background-color:${col};width:${wd}%;margin-left:${mg}%"></div>`
      ))
    }

    data.map((e, i) => {
      const id = `${con}${i}`
      if (isNull(document.getElementById(id))) {
        append(con, createEl(
          `<div id="${id}" class="db wf sh1 mt2 mb3"></div>`
        ))
      }
      !isEmpty(e) && e.map(o => add(o, id))
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
      append(row, createEl(
        `<div class="psa sw1" style="background-color:${col};height:${wh}%;bottom:${pos}%"></div>`
      ))
    }

    const addCol = id => {
      append(con, createEl(
        `<div class="dib hf psr" style="width:${100 / Log.config.ui.view}%"><div id="${id}" class="sw1 hf cn bb"></div></div>`
      ))
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
  day(d = new Date(), con = 'dyc') {
    if (!isObject(d) || !isString(con) || !exists(con)) return

    const ent = Log.data.entriesByDate(d)

    if (isEmpty(ent)) return

    let lw = 0
    let lp = 0

    ent.map(({s, e, dur, sCol, pCol}) => {
      if (!isUndefined(e)) {
        const dp = Log.utils.calcDP(s)
        const wd = dur * 3600 / 86400 * 100
        const cl = (Log.config.ui.colourMode === 'sector' ? sCol :
          Log.config.ui.colourMode === 'project' ? pCol :
          Log.config.ui.colourMode === 'none' && Log.config.ui.colour) || Log.config.ui.colour

        append(con, createEl(
          `<div class="nodrag psr t0 hf mb2 lf br3" style="background-color:${cl};width:${wd}%;margin-left:${dp - (lw + lp)}%"></div>`
        ))

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
      const col = mode === 'hours' ?
        (i === (new Date).getHours() ? Log.config.ui.accent : Log.config.ui.colour) :
        (i === (new Date).getDay() ? Log.config.ui.accent : Log.config.ui.colour)

      append(con, createEl(
        `<div id="${id}" class="dib hf psr" style="width:${100 / peaks.length}%"><div class="sw1 hf cn bb"><div class="psa b0 sw1 br3" style="background-color:${col};height:${e / peak * 100}%"></div></div></div>`
      ))
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

      append(con, createEl(
        `<li class="mb4 c-pt" onclick="Log.detail.${mode}('${e[0]}')">
          <span class="dib xw6 elip">${e[0]}</span>
          <span class="rf">${e[1].toFixed(2)} h</span>
          <div class="wf sh1">
            <div class="psr t0 hf lf br3" style="background-color:${col || Log.config.ui.colour};width:${wd}%"></div>
          </div>
        </li>`
      ))
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
      append(con, createEl(
        `<div class="psr t0 hf lf" style="background-color:${(mode === 'sec' ? Log.palette[e[0]] : Log.projectPalette[e[0]]) || Log.config.ui.colour};width:${e[1]}%"></div>`
      ))
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
      const col = (mode === 'sec' ? Log.palette[e[0]] : Log.projectPalette[e[0]]) || Log.config.ui.colour
      append(con, createEl(
        `<li class="c3 mb3 f6 lhc"><div class="dib sh3 sw3 brf mr2 lhs" style="background-color:${col}"></div><div class="dib">${e[0]} (${e[1].toFixed(2)}%)</div></li>`
      ))
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
      const list = mode === 'sec' ? Log.data.listSec(e) : Log.data.listPro(e)
      append(con, createEl(
        `<div class="dib hf psr" style="width:${100 / length}%">
          <div class="sw1 hf cn bb">
            <div class="psa sw1 b0 br3" style="background-color:${Log.config.ui.colour};height:${list === undefined ? 0 : 1 / list.length * 100}%"></div>
          </div>
        </div>`
      ))
    })
  },

  /**
   * Create chart lines
   * @param {string} c - Container
   */
  gridLines(c) {
    append(c, createEl(`<div class="psa wf bt o1 t0"></div>`))
    append(c, createEl(`<div class="psa wf bt o1" style="top:25%"></div>`))
    append(c, createEl(`<div class="psa wf bt o1" style="top:50%"></div>`))
    append(c, createEl(`<div class="psa wf bt o1" style="bottom:25%"></div>`))
    append(c, createEl(`<div class="psa wf bt o1 b0"></div>`))
  },

  meterLines(c) {
    let l = 0
    let e = ''

    for (let i = 0; i < 24; i++) {
      l += 4.166666666666667
      e = i % 2 === 0 ? `<div class="psa h5 br o5" style="left:${l}%"></div>`
      : `<div class="psa hf br o7" style="left:${l}%"></div>`
      append(c, createEl(e))
    }
  }
}
