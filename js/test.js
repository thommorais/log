function test(n, t, e) {
  t !== e ? console.error(`\u2715 ${n}: ${t}`) : console.log(`%c\u2714 ${n}`, 'color:#83BD75')
  return
}

let a = [1, 2, 3, 4, 5]

test('Min value [num]', Log.data.min(a), 1)
test('Max value [num]', Log.data.max(a), 5)
test('Avg value [num]', Log.data.avg(a), 3)

test('Min value [!num]', Log.data.min(['a']), '-')
test('Max value [!num]', Log.data.max(['a']), '-')
test('Avg value [!num]', Log.data.avg(['a']), '-')

test('data.parse empty []', Log.data.parse([]), undefined)
test('data.parse [!{}]', Log.data.parse([1]), undefined)

test('getEntriesByDate !Date', Log.data.getEntriesByDate(0), undefined)
test('getEntriesByDate past', Log.data.getEntriesByDate(new Date(1997, 2, 2)), undefined)
test('getEntriesByDate future', Log.data.getEntriesByDate(new Date(2019, 2, 2)), undefined)
test('getEntriesByPeriod impossible range', Log.data.getEntriesByPeriod(new Date(2018, 0, 2), new Date(2018, 0, 1)), undefined)
test('getRecentEntries string', Log.data.getRecentEntries('1'), undefined)
test('getEntriesByDay string', Log.data.getEntriesByDay('Sunday'), undefined)

test('getEntriesByProject nonexistent', Log.data.getEntriesByProject('Egg'), undefined)
test('getEntriesByProject [!{}]', Log.data.getEntriesByProject('Egg', [1]), undefined)
test('getEntriesBySector nonexistent', Log.data.getEntriesBySector('Egg'), undefined)
test('getEntriesBySector [!{}]', Log.data.getEntriesBySector('Egg', [1]), undefined)

test('sortEntries [!{}]', Log.data.sortEntries([1]), undefined)
test('sortEntries !Date', Log.data.sortEntries(undefined, 1), undefined)

test('sortEntriesByDay [!{}]', Log.data.sortEntriesByDay([1]), undefined)

test('Log.journal.display', Log.journal.display(0), undefined)
