let isObject = a => typeof(a) === 'object'
let isNumber = a => typeof(a) === 'number'
let isString = a => typeof(a) === 'string'
let isEmpty = a => a.length === 0
let isUndefined = a => a === undefined

let write = (e, c) => {
  c = isNumber(c) ? c.toFixed(2) : c
  // c = c.slice(-2) === '00' ? Number(c).toFixed(0) : c
  document.getElementById(e).innerHTML = c
}
let clear = e => document.getElementById(e).innerHTML = ''
let create = e => document.createElement(e)
let isValidArray = a => isObject(a) && !isEmpty(a)
let isNumArray = a => isObject(a) && a.every(isNumber)

let hasEntries = a => isValidArray(a) && typeof(a[0]) === 'object'

let append = (e, c) => document.getElementById(e).appendChild(c)
let contains = (s, a) => a.indexOf(s.split(' ')) > -1 ? true : false
let exists = e => document.getElementById(e) !== null
let hide = e => document.getElementById(e).style.display = 'none'
let show = e => document.getElementById(e).style.display = 'block'
