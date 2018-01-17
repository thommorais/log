t = (n, t, e) => {
  t !== e ? console.error(`\u2715 ${n}: ${t}`) : console.log(`%c\u2714 ${n}`, 'color:#83BD75')
  return
}

console.log('CONSOLE.JS')


console.log('DATA.JS')

t('data.parse (empty [])', Log.data.parse([]), undefined)
t('data.parse [!{}]', Log.data.parse([1]), undefined)
t('data.parse (non-array)', Log.data.parse(1), undefined)

console.log('')

t('getEntriesByDate !Date', Log.data.getEntriesByDate(0), undefined)
t('getEntriesByDate past', Log.data.getEntriesByDate(new Date(1997, 2, 2)), undefined)
t('getEntriesByDate future', Log.data.getEntriesByDate(new Date(2019, 2, 2)), undefined)

console.log('')

t('getEntriesByPeriod !Date', Log.data.getEntriesByPeriod(1), undefined)
t('getEntriesByPeriod !Date', Log.data.getEntriesByPeriod(new Date(), 1), undefined)
t('getEntriesByPeriod impossible range', Log.data.getEntriesByPeriod(new Date(2018, 0, 2), new Date(2018, 0, 1)), undefined)

console.log('')

t('getRecentEntries string', Log.data.getRecentEntries('1'), undefined)
t('getRecentEntries 0', Log.data.getRecentEntries(0), undefined)

console.log('')

t('getEntriesByDay string', Log.data.getEntriesByDay('Sunday'), undefined)
t('getEntriesByDay invalid number', Log.data.getEntriesByDay(-1), undefined)
t('getEntriesByDay invalid number', Log.data.getEntriesByDay(8), undefined)
t('getEntriesByDay empty []', Log.data.getEntriesByDay(0, []), undefined)
t('getEntriesByDay invalid array', Log.data.getEntriesByDay(0, [1]), undefined)

console.log('')

t('getEntriesByProject nonexistent', Log.data.getEntriesByProject('Egg'), undefined)
t('getEntriesByProject [!{}]', Log.data.getEntriesByProject('Log', [1]), undefined)
t('getEntriesByProject non-string', Log.data.getEntriesByProject(1), undefined)

console.log('')

t('getEntriesBySector nonexistent', Log.data.getEntriesBySector('Egg'), undefined)
t('getEntriesBySector [!{}]', Log.data.getEntriesBySector('Code', [1]), undefined)
t('getEntriesBySector non-string', Log.data.getEntriesBySector(1), undefined)

console.log('')

t('sortEntries [!{}]', Log.data.sortEntries([1]), undefined)
t('sortEntries !Date', Log.data.sortEntries(undefined, 1), undefined)

t('sortEntriesByDay [!{}]', Log.data.sortEntriesByDay([1]), undefined)

console.log('')

let a = [1, 2, 3, 4, 5]

t('Min value [num]', Log.data.min(a), 1)
t('Max value [num]', Log.data.max(a), 5)
t('Avg value [num]', Log.data.avg(a), 3)

t('Min value [!num]', Log.data.min(['a']), '-')
t('Max value [!num]', Log.data.max(['a']), '-')
t('Avg value [!num]', Log.data.avg(['a']), '-')

t('Min value (empty set)', Log.data.min([]), 0)
t('Max value (empty set)', Log.data.max([]), 0)
t('Avg value (empty set)', Log.data.avg([]), 0)

console.log('')

t('Log.journal.display', Log.journal.display(0), undefined)
