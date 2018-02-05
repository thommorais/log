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

t('entriesByDate !Date', Log.data.entriesByDate(0), undefined)
t('entriesByDate past', Log.data.entriesByDate(new Date(1997, 2, 2)), undefined)
t('entriesByDate future', Log.data.entriesByDate(new Date(2019, 2, 2)), undefined)

console.log('')

t('entriesByPeriod !Date', Log.data.entriesByPeriod(1), undefined)
t('entriesByPeriod !Date', Log.data.entriesByPeriod(new Date(), 1), undefined)
t('entriesByPeriod impossible range', Log.data.entriesByPeriod(new Date(2018, 0, 2), new Date(2018, 0, 1)), undefined)

console.log('')

t('recentEntries string', Log.data.recentEntries('1'), undefined)
t('recentEntries 0', Log.data.recentEntries(0), undefined)

console.log('')

t('entriesByDay string', Log.data.entriesByDay('Sunday'), undefined)
t('entriesByDay invalid number', Log.data.entriesByDay(-1), undefined)
t('entriesByDay invalid number', Log.data.entriesByDay(8), undefined)
t('entriesByDay empty []', Log.data.entriesByDay(0, []), undefined)
t('entriesByDay invalid array', Log.data.entriesByDay(0, [1]), undefined)

console.log('')

t('entriesByProject nonexistent', Log.data.entriesByProject('Egg'), undefined)
t('entriesByProject [!{}]', Log.data.entriesByProject('Log', [1]), undefined)
t('entriesByProject non-string', Log.data.entriesByProject(1), undefined)

console.log('')

t('entriesBySector nonexistent', Log.data.entriesBySector('Egg'), undefined)
t('entriesBySector [!{}]', Log.data.entriesBySector('Code', [1]), undefined)
t('entriesBySector non-string', Log.data.entriesBySector(1), undefined)

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
