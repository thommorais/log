![Screenshot](img/screenshot.png)

![MIT](https://joshavanier.github.io/badges/svg/mit.svg)

The **Log** is a simple log and time-tracker available as an Electron app for Linux, macOS, and Windows. Download it [here](https://joshavanier.itch.io/log).

## Features

- Write log entries
- Log data visualisations and statistics
- Customise the interface to match your style

## Console Commands
To use the console, simply start typing.

- `import /location/file.json` - Import existing log data
- `export` - Export log data
- `start "Sector" "Project" "Description"` - Start a log entry
- `end` - End a log entry
- `edit {ID} {attribute} "Lorem ipsum"` - Edit an entry's attributes
- `set bg #fff` - Set the interface's background colour
- `set colour red` - Set the interface's text colour
- `set accent blue` - Set the interface's accent colour
- `set sector "Sector Name" {colour}` - Set a colour code for your sector
- `set project "Project Name" {colour}` - Set a colour code for your project
- `set colourmode {sector/project}` - Set colour mode
- `set view x` - View only data from the past x days
- `set calendar gregorian` - Set to use a certain calendar system
- `set time 24` - Set the time format to 12- or 24-hours

## To-do
- Create an app icon
- Streamline input: make quotes optional if Sector, Project, or Description is just one word
- Add ability to sort table columns
- Pomodoro timer

## Development

```
npm install
npm start
```

---

Josh Avanier

[![@joshavanier](https://joshavanier.github.io/badges/svg/twitter.svg)](https://twitter.com/joshavanier) [![joshavanier.com](https://joshavanier.github.io/badges/svg/website.svg)](https://joshavanier.com)
