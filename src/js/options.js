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
      Log.options.update.localStorage()
    },

    /**
     * Update palette
     */
    palette() {
      dataStore.set('palette', user.palette)
      Log.options.update.localStorage()
    },

    /**
     * Update project palette
     */
    projectPalette() {
      dataStore.set('projectPalette', user.projectPalette)
      Log.options.update.localStorage()
    },

    /**
     * Update log
     */
    log() {
      dataStore.set('log', user.log)
      Log.options.update.localStorage()
    },

    /**
     * Update all
     */
    all() {
      Log.options.update.config()
      Log.options.update.palette()
      Log.options.update.projectPalette()
      Log.options.update.log()
      Log.options.update.localStorage()
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
   * @param {string} sec - Sector
   * @param {string} col - Colour
   */
  setColourCode(sec, col) {
    user.palette[sec] = col
    Log.options.update.palette()
  },

  /**
   * Set project colour code
   * @param {string} pro - Project
   * @param {string} col - Colour
   */
  setProjectColourCode(s) {
    user.projectPalette[pro] = col
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
