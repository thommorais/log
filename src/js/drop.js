window.addEventListener('dragover', function(e) {
  e.preventDefault()
  e.stopPropagation()
  e.dataTransfer.dropEffect = 'copy'
})

window.addEventListener('drop', function(e) {
  e.preventDefault()
  e.stopPropagation()

  const files = e.dataTransfer.files

  for (let file_id in files) {
    const file = files[file_id]

    if (file.name.indexOf('.json') === -1) {
      console.log('skipped', file)
      continue
    }

    const path = file.path
    const reader = new FileReader()

    reader.onload = e => {
      const o = JSON.parse(e.target.result)

      user.config.ui.bg = o.config.ui.bg || '#f8f8f8'
      user.config.ui.colour = o.config.ui.colour || '#202020'
      user.config.ui.accent = o.config.ui.accent || '#eb4e32'
      user.config.ui.colourMode = o.config.ui.colourMode || 'sector'
      user.config.ui.view = o.config.ui.view || 28

      user.config.system.calendar = o.config.system.calendar || 'gregorian'
      user.config.system.timeFormat = o.config.system.timeFormat || '24'

      user.palette = o.palette || {}
      user.projectPalette = o.projectPalette || {}
      user.log = o.log || []

      localStorage.setItem('user', JSON.stringify(user))
      Log.refresh()
    }

    reader.readAsText(file)
    return
  }
})
