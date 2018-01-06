function test(n, t, e) {
  t !== e ? console.error(`\u2715 ${n}`) : console.log(`%c\u2714 ${n}`, 'color:#83BD75')
  return
}

let a = [1, 2, 3, 4, 5]

test('Min value', Log.data.min(a), 1)
test('Max value', Log.data.max(a), 5)
test('Avg value', Log.data.avg(a), 3)

test('Data parse (empty [])', Log.data.parse([]), undefined)
test('Data parse ([] with non-{} child)', Log.data.parse([1]), undefined)
test('Log.data.getEntriesByDate', Log.data.getEntriesByDate(0), undefined)
test('Log.journal.display', Log.journal.display(0), undefined)
