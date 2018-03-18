const isObject = a => typeof (a) === 'object';
const isNumber = a => typeof (a) === 'number';
const isEmpty = a => a.length === 0;
const isValidArray = a => isObject(a) && !isEmpty(a);
