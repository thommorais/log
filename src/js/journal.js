Log = window.Log || {}
Log.journal = {

  /**
   * Display entries from a date
   * @param {Object=} hex - Hex code
   */
  display(date = new Date()) {
    if (!isObject(date)) return

    Log.journal.clear()

    const ent = Log.data.entriesByDate(date)

    if (isEmpty(ent)) return

    journalDate.innerHTML = `${Log.time.displayDate(date)} (${days[date.getDay()]})`

    Log.vis.day(date, 'jDyc')

    const dur = Log.data.listDurations(ent)

    jLHT.innerHTML = `${Log.data.total(dur).toFixed(2)} h`
    jLSN.innerHTML = `${Log.data.min(dur).toFixed(2)} h`
    jLSX.innerHTML = `${Log.data.max(dur).toFixed(2)} h`
    jASDT.innerHTML = `${Log.data.avg(dur).toFixed(2)} h`
    jLPT.innerHTML = `${Log.data.lp(ent).toFixed(2)}%`
    jFT.innerHTML = Log.data.proFocus(Log.data.listPro(ent)).toFixed(2)

    const l = ent.length

    ent.map(({id, s, e, c, t, d, dur}, i) => {
      append('jEnt', createEl(
        `<li class="${i !== l - 1 ? 'f6 lhc pb3 mb3' : 'f6 lhc'}">
          <span class="mr3 o7">ID ${id + 1}</span>
          <span class="mr3 o7">
            ${Log.time.stamp(Log.time.convert(s))} &ndash;
            ${Log.time.stamp(Log.time.convert(e))}
          </span>
          <span class="mr3 o7">${c}</span>
          <span class="o7">${t}</span>
          <span class="rf o7">${dur.toFixed(2)} h</span>
          <p class="f4 lhc">${d}</p>
        </li>`
      ))
    })
  },

  cal() {
    let ent = Log.data.sortEntries(Log.data.recentEntries(400))

    console.log(Log.data.sortEntries(Log.log))

    const sf = ent => {
      let a = 0
      let b = ''

      Log.data.listSec(ent).map(e => {
        const x = Log.data.sp(e, ent)
        x > a && (a = x, b = e)
      })

      return b
    }

    const diff = Log.time.convert(ent[0][0].s).getDay()

    for (let i = 0; i < 7; i++) {
      const rw = document.getElementById('cal').insertRow(i)
      for (let o = 0; o < 52; o++) {
        const id = (365 - i) - (7 * o) - 1
        const cell = rw.insertCell(o)
        cell.id = `c${id}`
        // cell.innerHTML = id

        if (ent[365 - id] !== undefined && ent[365 - id].length !== 0) {
          let focus = sf(ent[365 - id])
          if (Log.config.ui.colourMode === 'none') {
            cell.style.backgroundColor = Log.config.ui.colour
          } else {
            cell.style.backgroundColor = Log.palette[focus] || Log.projectPalette[focus] || Log.config.ui.colour
          }
          cell.setAttribute('onclick', `Log.journal.translate('${ent[365 - id][0].s}')`)

          cell.title = `${Log.time.displayDate(Log.time.convert(ent[365 - id][0].s))}`
        }
      }
    }
  },

  /**
   * Clear journal
   */
  clear() {
    clear('jDyc')
    clear('jEnt')
  },

  /**
   * Journal navigation
   */
  nav() {
    const a = Log.cache.sortEntries.reverse()
    !isEmpty(a) && a.map((e, i) => {
      !isEmpty(e) && jNav.appendChild(createEl(
        `<li class="lhd c-pt" onclick="Log.journal.translate('${e[0].s}')">
          ${Log.time.displayDate(Log.time.convert(e[0].s))}
        </li>`
      ))
    })
  },

  /**
   * Convert hex into Date and display in Journal
   * @param {string} h - Hexadecimal time
   */
  translate(h) {
    Log.journal.display(Log.time.convert(h))
  }
}
