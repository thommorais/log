Log = window.Log || {}
Log.ui = {

  /**
   * Write HTML content
   * @param {string} id - Element ID
   * @param {string} con - Content
   */
  write(id, con) {
    document.getElementById(id).innerHTML = con
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
