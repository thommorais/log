Log = window.Log || {}
Log.options = {

  /**
   * Update data and settings
   */
  update() {
    localStorage.setItem('user', JSON.stringify(user))
    dataStore.set('config', user.config)
    dataStore.set('palette', user.palette)
    dataStore.set('projectPalette', user.projectPalette)
    dataStore.set('log', user.log)
    Log.refresh()
  },

  /**
   * Set background colour
   * @param {string} c - Colour
   */
  setBG(c) {
    user.config.ui.bg = c
    Log.options.update()
  },

  /**
   * Set text colour
   * @param {string} c - Colour
   */
  setColour(c) {
    user.config.ui.colour = c
    Log.options.update()
  },

  /**
   * Set accent colour
   * @param {string} c - Colour
   */
  setAccent(c) {
    user.config.ui.accent = c
    Log.options.update()
  },

  /**
   * Set colour mode
   * @param {string} m - Mode
   */
  setColourMode(m) {
    if (contains(m, 'sector project none')) {
      user.config.ui.colourMode = m
      Log.options.update()
    }
  },

  /**
   * Set sector colour code
   * @param {string} s - Input
   */
  setColourCode(s) {
    const ch = s.split('')
    let indices = []
    let sec = ''

    ch.map((e, i) => e === '"' && indices.push(i))

    for (let i = indices[0] + 1; i < indices[1]; i++) sec += ch[i]

    user.palette[sec] = s.substring(indices[1] + 1, s.length).trim()
    Log.options.update()
  },

  /**
   * Set project colour code
   * @param {string} s - Input
   */
  setProjectColourCode(s) {
    const ch = s.split('')
    let indices = []
    let sec = ''

    ch.map((e, i) => e === '"' && indices.push(i))

    for (let i = indices[0] + 1; i < indices[1]; i++) sec += ch[i]

    user.projectPalette[sec] = s.substring(indices[1] + 1, s.length).trim()
    Log.options.update()
  },

  /**
   * Set interface font family
   * @param {string} f - Font
   */
  setFont(f) {
    user.config.ui.font = f
    Log.options.update()
  },

  /**
   * Set overview (days to show)
   * @param {number} n - Number of days
   */
  setView(n) {
    user.config.ui.view = n
    Log.options.update()
  },

  /**
   * Set calendrical system
   * @param {string} c - Calendrical system
   */
  setCalendar(c) {
    if (contains(c, 'aequirys monocal desamber gregorian')) {
      user.config.system.calendar = c
      Log.options.update()
    }
  },

  /**
   * Set time format
   * @param {string} f - Format
   */
  setTimeFormat(f) {
    if (contains(f, '24 12')) {
      user.config.system.timeFormat = f
      Log.options.update()
    }
  },

  /**
   * Set the week start
   * @param {string} d - Day of the week
   */
  setWeekStart(d) {
    user.config.system.weekStart = d
    Log.options.update()
  }
}
