Log = window.Log || {}
Log.options = {

  /**
   * Update data and settings
   */
  update: {

    /**
     * Update localStorage
     */
    localStorage() {
      localStorage.setItem('user', JSON.stringify(user))
      Log.refresh()
    },

    /**
     * Update config
     */
    config() {
      dataStore.set('config', user.config)
      Log.refresh()
    },

    /**
     * Update palette
     */
    palette() {
      dataStore.set('palette', user.palette)
      Log.refresh()
    },

    /**
     * Update project palette
     */
    projectPalette() {
      dataStore.set('projectPalette', user.projectPalette)
      Log.refresh()
    },

    /**
     * Update log
     */
    log() {
      dataStore.set('log', user.log)
      Log.refresh()
    },

    /**
     * Update all
     */
    all() {
      localStorage.setItem('user', JSON.stringify(user))
      dataStore.set('config', user.config)
      dataStore.set('palette', user.palette)
      dataStore.set('projectPalette', user.projectPalette)
      dataStore.set('log', user.log)
      Log.refresh()
    }
  },

  /**
   * Set background colour
   * @param {string} c - Colour
   */
  setBG(c) {
    user.config.ui.bg = c
    Log.options.update.config()
  },

  /**
   * Set text colour
   * @param {string} c - Colour
   */
  setColour(c) {
    user.config.ui.colour = c
    Log.options.update.config()
  },

  /**
   * Set accent colour
   * @param {string} c - Colour
   */
  setAccent(c) {
    user.config.ui.accent = c
    Log.options.update.config()
  },

  /**
   * Set colour mode
   * @param {string} m - Mode
   */
  setColourMode(m) {
    if (!contains(m, 'sector project none')) return
    user.config.ui.colourMode = m
    Log.options.update.config()
  },

  /**
   * Set sector colour code
   * @param {string} s - Input
   */
  setColourCode(s) {
    const ch = s.split('')
    let ind = []
    let sec = ''

    ch.map((e, i) => e === '"' && ind.push(i))

    for (let i = ind[0] + 1; i < ind[1]; i++) sec += ch[i]

    user.palette[sec] = s.substring(ind[1] + 1, s.length).trim()
    Log.options.update.palette()
  },

  /**
   * Set project colour code
   * @param {string} s - Input
   */
  setProjectColourCode(s) {
    const ch = s.split('')
    let ind = []
    let pro = ''

    ch.map((e, i) => e === '"' && ind.push(i))

    for (let i = ind[0] + 1; i < ind[1]; i++) pro += ch[i]

    user.projectPalette[pro] = s.substring(ind[1] + 1, s.length).trim()
    Log.options.update.projectPalette()
  },

  /**
   * Set overview (days to show)
   * @param {number} n - Number of days
   */
  setView(n) {
    user.config.ui.view = n
    Log.options.update.config()
  },

  /**
   * Set calendrical system
   * @param {string} c - Calendrical system
   */
  setCalendar(c) {
    if (!contains(c, 'aequirys monocal desamber gregorian')) return
    user.config.system.calendar = c
    Log.options.update.config()
  },

  /**
   * Set time format
   * @param {string} f - Format
   */
  setTimeFormat(f) {
    if (!contains(f, '24 12 decimal')) return
    user.config.system.timeFormat = f
    Log.options.update.config()
  }
}
