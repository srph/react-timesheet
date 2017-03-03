import React from 'react';
import ReactDOM from 'react-dom';
import Timesheet from '../lib/';

ReactDOM.render(
  <Timesheet
    sections={[{
      value: 1,
      label: 'Hello'
    }]}
    subjects={[{
      value: 1,
      label: 'Hello'
    }]}
    professors={[{
      value: 1,
      label: 'Hello'
    }]} />,
  document.getElementById('mount')
);