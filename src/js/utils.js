const isObject = a => typeof(a) === 'object'
const isNumber = a => typeof(a) === 'number'
const isString = a => typeof(a) === 'string'
const isEmpty = a => a.length === 0
const isUndefined = a => a === undefined
const write = (e, c) => document.getElementById(e).innerHTML = c
const clear = e => document.getElementById(e).innerHTML = ''
const create = e => document.createElement(e)
const isValidArray = a => isObject(a) && !isEmpty(a)
const isNumArray = a => isObject(a) && a.every(isNumber)
const hasEntries = a => isValidArray(a) && isObject(a[0])
const append = (e, c) => document.getElementById(e).appendChild(c)
const contains = (s, a) => a.indexOf(s.split(' ')) > -1 ? true : false
const exists = e => document.getElementById(e) !== null
const hide = e => document.getElementById(e).style.display = 'none'
const show = e => document.getElementById(e).style.display = 'block'
const isNull = e => e === null

const notify = m => {
  new window.Notification(m)
}

/**
 * Take the last n items of an array (from lodash)
 * @param {Object[]} a - Array
 * @param {number} [n=1] - Number of items
 * @returns {Object[]} An array with the last n items
 */
const takeRight = (a, n = 1) => {
  const l = a == null ? 0 : a.length
  let slice = (a, s, e) => {
    let l = a == null ? 0 : a.length
    if (!l) return []
    s = s == null ? 0 : s
    e = e === undefined ? l : e
    if (s < 0) s = -s > l ? 0 : (l + s)
    e = e > l ? l : e
    if (e < 0) e += l
    l = s > e ? 0 : ((e - s) >>> 0)
    s >>>= 0
    let i = -1
    const r = new Array(l)
    while (++i < l) r[i] = a[i + s]
    return r
  }
  if (!l) return []
  n = l - n
  return slice(a, n < 0 ? 0 : n, l)
}
