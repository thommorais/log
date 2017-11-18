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

  hide(el) {
    document.getElementById(el).style.display = 'none'
  }
}
