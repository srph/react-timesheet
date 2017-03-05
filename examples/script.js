import React from 'react';
import ReactDOM from 'react-dom';
import Timesheet from '../lib/';
import moment from 'moment';

class App extends React.Component {
  state = {
    schedules: {
      'Room #13': [{
        start: moment('10:00 am', 'hh:mm a'),
        end: moment('11:30 am', 'hh:mm a'),
        data: {
          subject: {
            id: 1,
            name: 'Introduction to Software Engineering'
          },

          professor: {
            id: 2,
            name: 'Win Gatchalian'
          },

          section: {
            id: 1,
            name: 'BSIT 4 Block D'
          }
        }
      }],

      'Room #14 A': [],
      'Room #14 B': []
    }
  };

  render() {
    return (
      <Timesheet
          time={{
            start: '10:00 AM',
            end: '10:00 PM',
            increment: { hours: 1, minutes: 30 }
          }}
          schedules={this.state.schedules}
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
          }]}
          onStore={this.handleStore}
          onUpdate={this.handleUpdate} />
    );
  }

  handleStore = (day, schedule) => {
    const {schedules} = this.state;
    console.log(schedule);
    this.setState({
      schedules: {
        ...schedules,
        [day]: [...schedules[day], schedule]
      }
    });
  }

  handleUpdate = (day, index, schedule) => {
    const {schedules} = this.state;

    this.setState({
      schedules: {
        ...schedules,
        [day]: schedules[day].map((_, i) => {
          return i === index ? schedule : _;
        })
      }
    });
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('mount')
);