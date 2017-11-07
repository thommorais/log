window.addEventListener('dragover', function(e) {
  e.preventDefault()
  e.stopPropagation()
  e.dataTransfer.dropEffect = 'copy'
})

window.addEventListener('drop', function(e) {
  e.preventDefault()
  e.stopPropagation()

  let files = e.dataTransfer.files

  for (let file_id in files) {
    let file = files[file_id]

    if (file.name.indexOf('.json') == -1) {
      console.log('skipped', file)
      continue
    }

    let path = file.path
    let reader = new FileReader()

    reader.onload = (e) => {
      let o = JSON.parse(e.target.result);
      localStorage.setItem('user', JSON.stringify(o))
      Log.refresh()
    }

    reader.readAsText(file)
    return
  }
})
