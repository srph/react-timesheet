## React Timesheet
[WIP] Timesheets for you, and you, and for everybody!

## Features
Currently ad-hoc for a private school application I'm working on.

- [x] Async persistence
- [ ] Async fetch
- [ ] Handle loading
- [ ] Handle errors
- [x] New schedule
- [x] Edit schedule
- [x] Drag-n-drop schedule
- [x] Typehead

## Installing
```bash
npm i --save @srph/react-timesheet
```

## Usage
```js
<Timesheet time={{
  start: '10:00 AM',
  end: '10:00 PM',
  increment: { hours: 1, minutes: 30 }
}} schedules={{
  'Monday': [{
  	start: '10:00 AM',
  	end: '11:30 AM',
  	data: {}
  }]
}} />
```

See [example](examples).