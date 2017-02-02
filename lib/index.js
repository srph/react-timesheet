import React, {PropTypes} from 'react';
import {DraggableCore} from 'react-draggable';
import linkState from 'react-link-state';
import axios from 'axios';
import clamp from 'lodash/clamp';
import moment from 'moment';
import generate from './generate';
import getIncrementDifference from './getIncrementDifference';
import ClickOutside from 'react-click-outside';

class Timesheet extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      schedules: {
        MTH: [{
          start: moment('10:00 am', 'hh:mm a'),
          end: moment('11:30 am', 'hh:mm a'),
          data: {
            subject: {
              id: 1,
              name: 'Hello, Worldo'
            },

            professor: {
              id: 2,
              name: 'Win Gatchalian'
            },

            section: {
              id: 1,
              name: 'Math I'
            }
          }
        }],

        TF: [],
        WS: []
      },

      times: generate(
        this.props.time.start,
        this.props.time.end,
        this.props.time.increment
      ),

      recent: false, // Flag if a schedule was recently created
      edit: null, // Data / cache of what we're editing
      editing: false, // Flag if we're in create mode
      source: null,
      drag: null,
      dragging: false,
      resize: null,
      resizing: false
    };

    this.handleEscape = this.handleEscape.bind(this);
    this.handleCancelEdit = this.handleCancelEdit.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keyup', this.handleEscape);
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.handleEscape);
  }

  render() {
    const {times, schedules, editing, edit} = this.state;

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
                <div className="timesheet__item"
                  onDoubleClick={this.handleCreate(day, ii)}
                  key={ii}>
                </div>
              )}

              {schedules[day].map((schedule, ii) =>
                <DraggableCore
                  allowAnyClick
                  grid={[125, 125]}
                  cancel=".draggable-cancel"
                  onStart={this.handleDragStart(day, ii)}
                  onDrag={this.handleDrag.bind(this)}
                  onStop={this.handleDragStop.bind(this)}
                  key={ii}>
                  <div onDoubleClick={this.handleEdit(day, ii)}
                    className="timesheet__overlay"
                    style={{
                      transform: `translateY(${125 * times.findIndex((time) => time.start.isSame(schedule.start))}px)`,
                      height: 125 * getIncrementDifference(schedule.start, schedule.end, this.props.time.increment)
                    }}>

                    <h4>{schedule.data.section.name}</h4>
                    <h4>{schedule.data.subject.name}</h4>
                    <h4>{schedule.data.professor.name}</h4>

                    <DraggableCore
                      allowAnyClick
                      grid={[125, 125]}
                      onStart={this.handleResizeStart(day, ii)}
                      onDrag={this.handleResize.bind(this)}
                      onStop={this.handleResizeStop.bind(this)}>
                      <div className="timesheet__overlay-resizer draggable-cancel">Drag</div>
                    </DraggableCore>
                  </div>
                </DraggableCore>
              )}
            </div>
          )}

          {editing &&
            <ClickOutside onClickOutside={this.handleCancelEdit}
              className="timesheet__popover draggable-cancel"
              style={{
                top: (125 * (edit.time)) + 30,
                left: (125 * (Object.keys(this.state.schedules).findIndex((day) => edit.day === day) + 1)) + 75
              }}>
              <input autoFocus
                type="text"
                valueLink={linkState(this, `schedules.${edit.day}.${edit.index}.data.section.name`)}
                className="form-input"
                placeholder="Section Name" />

              <input autoFocus
                type="text"
                valueLink={linkState(this, `schedules.${edit.day}.${edit.index}.data.subject.name`)}
                className="form-input"
                placeholder="Subject Name" />

              <input autoFocus
                type="text"
                valueLink={linkState(this, `schedules.${edit.day}.${edit.index}.data.professor.name`)}
                className="form-input"
                placeholder="Professor Name" />
            </ClickOutside>}
        </div>
      </div>
    );
  }

  /**
   * @param {Object: day, index} data Schedule we're validating
   * @param {Object: {day, start, end} dest Schedule
   */
  validate(dest) {
    const {schedules} = this.state;
    const day = schedules[dest.day];

    return !!day.find((schedule) =>
      // Must start before and after start
      dest.start < schedule.start &&
      dest.start > schedule.end &&
      // Must end before and after end
      dest.end < schedule.start &&
      dest.end > schedule.end);
  }

  /**
   * Cancel recently created schedule
   */
  cancel() {
    const {schedules, times, edit} = this.state;
    const schedule = schedules[edit.day];
    schedule.splice(edit.index, 1);

    this.setState({
      edit: null,
      editing: false,
      recent: false,
      schedules
    });
  }

  /**
   * Cancel edit mode.
   *
   * @see .handleEscape
   * @see The editing panel
   */
  handleCancelEdit() {
    this.setState({
      edit: null,
      editing: false,
      recent: false
    });
  }

  handleEscape(evt) {
    if ( evt.keyCode === 27 ) {
      if ( this.state.recent ) {
        this.cancel();
      } else if ( this.state.editing ) {
        this.handleCancelEdit();
      }
    }
  }

  handleInput() {
    // const {edit, schedules} = this.state;
    // const schedule = schedules[edit.day][edit.index];
    // schedule.
    // this.setState({ schedules });
  }

  /**
   * @param {string} day Key of the schedule or day is being created
   * @param {int} index Index of the time the schedule is being created
   */
  handleCreate(day, index) {
    return () => {
      const {schedules, times} = this.state;
      const time = times[index];
      const schedule = schedules[day];
      // Index of the time in the array

      schedule.push({
        start: time.start,
        end: time.end,
        data: {
          subject: {
            id: 0,
            name: ''
          },

          professor: {
            id: 0,
            name: ''
          },
          
          section: {
            id: 0,
            name: ''
          },
        }
      });

      this.setState({
        schedules,
        editing: true,
        edit: { day, index: schedule.length - 1, time: index },
        recent: true
      });
    }
  }

  handleEdit(day, index) {
    return () => {
      const {schedules, times} = this.state;
      const schedule = schedules[day][index];
      // Index of the time in the array
      const time = times.findIndex((time) => schedule.start === time.start.format('hh:mm a'));

      this.setState({
        editing: true,
        edit: { day, index, time }
      });
    }
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

      dragging: true,
      edit: null,
      editing: false,
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

      console.log(this.validate({
        day,
        start: schedule.start,
        end: schedule.end
      }));
    }

    this.setState({
      schedules,
      source: null,
      drag: null,
      dragging: false,
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
      resizing: true,
      edit: null,
      editing: false
    });
  }

  handleResizeStop() {
    if ( !this.state.resizing ) {
      return;
    }

    const {increment} = this.props.time;
    const {schedules, source, resize} = this.state;
    const schedule = schedules[source.day][source.index];
    schedule.end = schedule.start
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