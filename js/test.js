function test(n, t, e) {
  if (t !== e) {
    console.error(`Fail: ${n}`)
    return
  } else {
    console.log(`Pass: ${n}`)
  }
}

let a = [1, 2, 3, 4, 5]

test('Min value', Log.data.min(a), 1)
test('Max value', Log.data.max(a), 5)
test('Avg value', Log.data.avg(a), 3)

test('Data parse (empty array)', Log.data.parse([]), undefined)
test('Data parse (array with non-object child)', Log.data.parse([1]), undefined)

test('Log.data.getEntriesByDate', Log.data.getEntriesByDate(0), undefined)

test('Log.journal.display', Log.journal.display(0), undefined)
