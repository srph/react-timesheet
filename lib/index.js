import React, {PropTypes} from 'react';
import {DraggableCore} from 'react-draggable';
import {clamp} from 'lodash';
import moment from 'moment';
import generate from './generate';
import getIncrementDifference from './getIncrementDifference';

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
      dragging: false,
      resize: null,
      resizing: false
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
                  cancel=".timesheet__overlay-resizer"
                  onStart={this.handleDragStart(day, ii)}
                  onDrag={this.handleDrag.bind(this)}
                  onStop={this.handleDragStop.bind(this)}
                  key={ii}>
                  <div
                    className="timesheet__overlay"
                    style={{
                      transform: `translateY(${125 * times.findIndex((time) => time.start.format('hh:mm a') === schedule.start)}px)`,
                      height: 125 * getIncrementDifference(schedule.start, schedule.end, this.props.time.increment)
                    }}>
                    {schedule.text}

                    <DraggableCore
                      allowAnyClick
                      grid={[125, 125]}
                      onStart={this.handleResizeStart(day, ii)}
                      onDrag={this.handleResize.bind(this)}
                      onStop={this.handleResizeStop.bind(this)}>
                      <div className="timesheet__overlay-resizer">Drag</div>
                    </DraggableCore>
                  </div>
                </DraggableCore>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  handleDragStart(day, index) {
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

  handleDrag(evt, position) {
    this.setState({
      drag: {
        x: this.state.drag.x + position.deltaX,
        y: this.state.drag.y + position.deltaY
      },

      dragging: true
    });
  }

  handleDragStop(evt) {
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
      const {increment} = this.props.time;
      const difference = getIncrementDifference(schedule.start, schedule.end, increment);
      schedule.start = time.start.format('hh:mm a');
      schedule.end = time.start.clone()
        .add(difference * increment.hours, 'hours')
        .add(difference * increment.minutes, 'minutes')
        .format('hh:mm a');
    }

    this.setState({
      schedules,
      source: null,
      drag: null,
      dragging: false
    });
  }

  handleResizeStart(day, index) {
    return () => {
      const {start, end} = this.state.schedules[day][index];

      this.setState({
        // Difference from start date
        // (start - end) / increment
        resize: getIncrementDifference(start, end, this.props.time.increment),
        source: { day, index }
      });
    }
  }

  handleResize(evt, position) {
    this.setState({
      resize: this.state.resize + (position.deltaY / 125),
      resizing: true
    });
  }

  handleResizeStop() {
    if ( !this.state.resizing ) {
      return;
    }

    const {increment} = this.props.time;
    const {schedules, source, resize} = this.state;
    const schedule = schedules[source.day][source.index];
    schedule.end = moment(schedule.start, 'hh:mm a')
      .add(resize * increment.hours, 'hours')
      .add(resize * increment.minutes, 'minutes')
      .format('hh:mm a'); 

    this.setState({
      schedules,
      source: null,
      resize: null,
      resizing: false
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