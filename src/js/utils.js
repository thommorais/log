const isObject = a => typeof(a) === 'object'
const isNumber = a => typeof(a) === 'number'
const isString = a => typeof(a) === 'string'
const isEmpty = a => a.length === 0
const isUndefined = a => a === undefined
const write = (e, c) => document.getElementById(e).innerHTML = c
const clear = e => document.getElementById(e).innerHTML = ''
const isValidArray = a => isObject(a) && !isEmpty(a)
const isNumArray = a => isObject(a) && a.every(isNumber)
const hasEntries = a => isValidArray(a) && isObject(a[0])
const append = (e, c) => document.getElementById(e).appendChild(c)
const contains = (s, a) => a.indexOf(s.split(' ')) > -1 ? true : false
const exists = e => document.getElementById(e) !== null
const isNull = e => e === null

const notify = m => {
  new window.Notification(m)
}

const createEl = c => {
  const e = document.createElement('div')
  e.innerHTML = c
  return e.firstElementChild
}
