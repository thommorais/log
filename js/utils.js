let isObject = a => typeof(a) === 'object'
let isNumber = a => typeof(a) === 'number'
let isString = a => typeof(a) === 'string'
let isEmpty = a => a.length === 0
let write = (e, c) => document.getElementById(e).innerHTML = c
let clear = e => document.getElementById(e).innerHTML = ''
let create = e => document.createElement(e)
let isValidArray = a => isObject(a) && !isEmpty(a)
let isNumArray = a => isObject(a) && a.every(isNumber)
let append = (e, c) => document.getElementById(e).appendChild(c)
let contains = (s, a) => a.indexOf(s.split(' ')) > -1 ? true : false
