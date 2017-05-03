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
        request: true,
        requester: {
          id: 2,
          department: {
            name: 'BEIT'
          },
          user: {
            name: 'Loser Gatchalian'
          }
        },
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

      'Room #14 A': [{
        start: moment('10:00 am', 'hh:mm a'),
        end: moment('1:00 pm', 'hh:mm a'),
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
      'Room #14 B': [{
        start: moment('10:00 am', 'hh:mm a'),
        end: moment('1:00 pm', 'hh:mm a'),
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
      }]
    }
  };

  render() {
    return (
      <Timesheet
        request={false}
        requester={{
          id: 1,
          department: {
            name: 'CSIT'
          },
          user: {
            name: 'Winner Gatchalian'
          }
        }}
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
        onUpdate={this.handleUpdate}
        onDelete={this.handleDelete}
        onRequestAction={this.handleRequestAction} />
    );
  }

  handleStore = (day, schedule) => {
    const {schedules} = this.state;

    this.setState({
      schedules: {
        ...schedules,
        [day]: [...schedules[day], schedule]
      }
    });
  }

  handleUpdate = (day, index, schedule, dest = day) => {
    const {schedules} = this.state;

    if (dest === day) {
      this.setState({
        schedules: {
          ...schedules,
          [day]: schedules[day].map((_, i) => {
            return i === index ? schedule : _;
          })
        }
      });
    } else {
      this.setState({
        schedules: {
          ...schedules,
          [day]: schedules[day].filter((_, i) => i !== index),
          [dest]: [...schedules[dest], schedule]
        }
      });
    }
  }

  handleRequestAction = (day, index, action) => {
    const {schedules} = this.state;

    if (action) {
      this.setState({
        schedules: {
          ...schedules,
          [day]: schedules[day].map((schedule, i) => {
            return i === index ? {
              ...schedule,
              request: false,
              requester: null
            } : schedule;
          })
        }
      });
    } else {
      this.setState({
        schedules: {
          ...schedules,
          [day]: schedules[day].filter((schedule, i) => {
            return i !== index;
          })
        }
      });
    }
  }

  handleDelete = (day, index) => {
    if (!confirm('Are you sure to delete this schedule?')) {
      return;
    }
      
    const {schedules} = this.state;
    
    this.setState({
      schedules: {
        ...schedules,
        [day]: schedules[day].filter((schedule, i) => {
          return i !== index;
        })
      }
    });
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('mount')
);