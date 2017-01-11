import React, {PropTypes} from 'react';
import {DraggableCore} from 'react-draggable';
import {ResizableBox} from 'react-resizable';
import {clamp} from 'lodash';
import moment from 'moment';
import generate from './generate';

class Timesheet extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      schedules: {
        MTH: [{
          start: '10:00 am',
          end: '11:30 am',
          text: 'Heaveho'
        }],

        TF: [],
        WS: []
      },

      times: generate(
        this.props.time.start,
        this.props.time.end,
        this.props.time.increment
      ),

      source: null,
      drag: null,
      dragging: false
    };
  }

  render() {
    const {times, schedules} = this.state;

    return (
      <div className="timesheet">
        <div className="timesheet__heading">
          <div className="timesheet__heading-column timesheet__heading-column--narrow">Time</div>

          {Object.keys(schedules).map((schedule, i) =>
            <div className="timesheet__heading-column" key={i}>{schedule}</div>
          )}
        </div>

        <div className="timesheet__body">
          <div className="timesheet__column timesheet__column--narrow">
            {times.map((time, i) =>
              <div className="timesheet__item" key={i}>
                <div className="timesheet__time">{time.start.format('hh:mm a')} - {time.end.format('hh:mm a')}</div>
              </div>
            )}
          </div>

          {Object.keys(schedules).map((day, i) =>
            <div className="timesheet__column" key={i}>
              {times.map((time, ii) =>
                <div className="timesheet__item" key={ii}></div>
              )}

              {schedules[day].map((schedule, ii) =>
                <DraggableCore
                  allowAnyClick
                  grid={[125, 125]}
                  onStart={this.start(day, ii)}
                  onDrag={this.drag(day, ii)}
                  onStop={this.stop.bind(this)}
                  key={ii}>
                  <div className="timesheet__overlay" style={{ transform: `translateY(${125 * times.findIndex((time) => time.start.format('hh:mm a') === schedule.start)}px)` }}>
                    {schedule.text}
                    <div className="timesheet__overlay-resizer">Drag</div>
                  </div>
                </DraggableCore>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  start(day, index) {
    return (evt, position) => {
      const {schedules, times} = this.state;
      const schedule = schedules[day][index];
      const time = times.findIndex((time) => time.start.format('hh:mm a') === schedule.start)
      const diw = Object.keys(schedules).indexOf(day);

      this.setState({
        drag: {
          x: 125 * diw,
          y: 125 * time
        },

        source: { day, index }
      });
    }
  }

  drag(day, index) {
    return (evt, position) => {
      this.setState({
        drag: {
          x: this.state.drag.x + position.deltaX,
          y: this.state.drag.y + position.deltaY
        },

        dragging: true
      });
    }
  }

  stop(evt) {
    if ( !this.state.dragging ) {
      return;
    }

    const {source, schedules, times, drag} = this.state;
    const diw = Object.keys(schedules); // All days in words
    const day = diw[clamp(Math.ceil(drag.x / 125), 0, diw.length - 1)]; // Target day (index)
    const time = times[clamp(Math.ceil(drag.y / 125), 0, times.length - 1)]; // Target time (index)
    const schedule = schedules[source.day][source.index];

    // If we dragged across another day (horizontal)
    if ( day !== source.day ) {
      schedules[source.day].splice(source.index, 1)[0];
      schedules[day].splice(0, 0, schedule);
    }

    // If we dragged across another time (vertical)
    if ( time.start.format('hh:mm a') !== schedule.start ) {
      schedule.start = time.start.format('hh:mm a');
      schedule.end = time.end.format('hh:mm a');
    }

    this.setState({
      schedules,
      source: null,
      drag: null,
      dragging: false
    });
  }
}

Timesheet.propTypes = {
  time: PropTypes.shape({
    start: PropTypes.string.isRequired,
    end: PropTypes.string.isRequired,
    increment: PropTypes.shape({
      start: PropTypes.number,
      end: PropTypes.number,
    }).isRequired
  }),

  schedules: PropTypes.object,

  component: PropTypes.shape({
    time: PropTypes.func,
    schedule: PropTypes.func
  })
};

Timesheet.defaultProps = {
  time: {
    start: '10:00 AM',
    end: '10:00 PM',
    increment: { hours: 1, minutes: 30 }
  }
}

export default Timesheet;