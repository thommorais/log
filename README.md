![Screenshot](img/screenshot.png)

![MIT](https://joshavanier.github.io/badges/svg/mit.svg)

The **Log** is a simple log and time-tracker available as an Electron app for Linux, macOS, and Windows.

## Features

- Write log entries
- Log data visualisations and statistics

## Statistics

- `LHt` - Total logged hours for today
- `ASDt` - Average session duration for today
- `LSn` - Shortest log session for today
- `LSx` - Longest log session for today
- `LPt` - Log percentage; how much of the day was logged

- `LHh` - Total logged hours over all
- `LShn` - Shortest log session
- `LShx` - Longest log session
- `LPt` - Log percentage; how much of the time period was logged
- `ASD` - Average session duration

- `SF` - Forecasted sector focus
- `PF` - Forecasted project focus
- `PT` - Forecasted peak hour for today
- `SD` - Forecasted average session duration for today

## Console Commands
To use the console, simply start typing.

- `import /folder/` - Import existing log and config files
- `start "Sector" "Project" "Description"` - Start a log entry
- `end` - End a log entry
- `set bg #fff` - Set the interface's background colour
- `set text red` - Set the interface's text colour
- `set view x` - View only data from the past x days
- `set icons false` - Disable icons in interface
- `set calendar gregorian` - Set to use a certain calendar system
- `set time 24` - Set the time format to 12- or 24-hours

## To-do
- Add ability to drag and drop log and config files
- Find a proper set of icons
- Add customisable sector colour coding
- Add ability to edit and delete log entries within app
- Streamline input: make quotes optional if Sector, Project, or Description is just one word
- Console command history; pressing up and down arrow keys shows recent console input

## Development

```
npm install
npm start
```

---

Josh Avanier

[![@joshavanier](https://joshavanier.github.io/badges/svg/twitter.svg)](https://twitter.com/joshavanier) [![joshavanier.com](https://joshavanier.github.io/badges/svg/website.svg)](https://joshavanier.com)
