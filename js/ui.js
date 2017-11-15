Log = window.Log || {}
Log.ui = {

  /**
   * Write HTML content
   * @param {string} el - Element
   * @param {string} con - Content
   */

  write(el, con) {
    document.getElementById(el).innerHTML = con
  },

  /**
   * Empty an HTML element
   * @param {string} el - Element
   */

  empty(el) {
    Log.ui.write(el, '')
  },

  /**
   * Set icon or text title
   * @param {string} el - Element
   * @param {string} ic - Unicode character
   * @param {string} wr - Text title
   */

  icon(el, ic, wr) {
    document.getElementById(el).innerHTML = user.config.ui.icons ? ic : wr
  },

  hide(el) {
    document.getElementById(el).style.display = 'none'
  },



}
