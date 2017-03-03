import React, {PropTypes as T} from 'react';
import {DraggableCore} from 'react-draggable';
import linkState from 'react-link-state';
import clamp from 'lodash/clamp';
import moment from 'moment';
import classnames from 'classnames';
import generate from './generate';
import Select from 'react-select';
import getIncrementDifference from './getIncrementDifference';
import ClickOutside from 'react-click-outside';
import get from 'lodash/get';

const height = 125;
const width = 250;

class Timesheet extends React.Component {
  static propTypes = {
    time: T.shape({
      start: T.string.isRequired,
      end: T.string.isRequired,
      increment: T.shape({
        start: T.number,
        end: T.number,
      }).isRequired
    }),

    schedules: T.object.isRequired,

    component: T.shape({
      time: T.func,
      schedule: T.func
    }),

    sections: T.array.isRequired,
    subjects: T.array.isRequired,
    professors: T.array.isRequired,
    onStore: T.func.isRequired,
    onUpdate: T.func.isRequired
  };

  static defaultProps = {
    time: {
      start: '10:00 AM',
      end: '10:00 PM',
      increment: { hours: 1, minutes: 30 }
    }
  };

  state = {
    schedules: this.props.schedules,
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

  componentDidMount() {
    document.addEventListener('keyup', this.handleEscape);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.schedules === this.props.schedules) {
      return;
    }

    this.setState({ schedules: nextProps.schedules });
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.handleEscape);
  }

  render() {
    const {times, schedules, editing, edit} = this.state;
    const now = moment();

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
                  grid={[width, height]}
                  cancel=".draggable-cancel"
                  onStart={this.handleDragStart(day, ii)}
                  onDrag={this.handleDrag.bind(this)}
                  onStop={this.handleDragStop.bind(this)}
                  key={ii}>
                  <div onDoubleClick={this.handleEdit(day, ii)}
                    className={classnames('timesheet__overlay', {
                      'timesheet__overlay--current': now.isSameOrAfter(schedule.start) && now.isSameOrBefore(schedule.end),
                      'timesheet__overlay--done': now.isAfter(schedule.end)
                    })}
                    style={{
                      transform: `translateY(${height * times.findIndex((time) => time.start.isSame(schedule.start))}px)`,
                      height: height * getIncrementDifference(schedule.start, schedule.end, this.props.time.increment)
                    }}>

                    <h6 className="timesheet__overlay-other">{schedule.data.section.name || 'Section Name'}</h6>
                    <h4 className="timesheet__overlay-title">{schedule.data.subject.name || 'Subject Name'}</h4>
                    <h6 className="timesheet__overlay-other">{schedule.data.professor.name || 'Professor Name'}</h6>

                    <DraggableCore
                      allowAnyClick
                      grid={[width, height]}
                      onStart={this.handleResizeStart(day, ii)}
                      onDrag={this.handleResize}
                      onStop={this.handleResizeStop}>
                      <div className="timesheet__overlay-resizer draggable-cancel"></div>
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
                top: (height * (edit.time)) + 30,
                left: (width * (Object.keys(this.state.schedules).findIndex((day) => edit.day === day) + 1)) + 75
              }}>
              <form onSubmit={this.handleSubmit}>
                <div className="timesheet__popover-body">
                  <div className="u-spacer">
                    <Select autofocus
                      value={get(schedules, `[${edit.day}][${edit.index}].data.section.id`)}
                      onChange={this.handleInput('section')}
                      options={this.props.sections}
                      placeholder="Section Name" />
                  </div>

                  <div className="u-spacer">
                    <Select
                      value={get(schedules, `[${edit.day}][${edit.index}].data.subject.id`)}
                      onChange={this.handleInput('subject')}
                      options={this.props.subjects}
                      placeholder="Subject Name" />
                  </div>

                  <div className="u-spacer">
                    <Select type="text"
                      value={get(schedules, `[${edit.day}][${edit.index}].data.professor.id`)}
                      onChange={this.handleInput('professor')}
                      options={this.props.professors}
                      placeholder="Professor Name" />
                  </div>
                </div>

                <footer className="timesheet__popover-footer">
                  <button type="button" onClick={this.state.recent ? this.handleCancel : this.handleCancelEdit}>{this.state.recent ? 'Cancel' : 'Close'}</button>
                  <button>{this.state.recent ? 'Create' : 'Update'}</button>
                </footer>
              </form>
            </ClickOutside>}
        </div>
      </div>
    );
  }

  /**
   * Validate if there are no overlapping stuff
   * @param {Object: day, schedule, start, end} data Schedule we're validating
   */
  validate(dest) {
    const {schedules, times} = this.state;
    const day = schedules[dest.day];
    const last = times[times.length -1];
    // Check if start and end time are not the same
    // Check if there are overlapping schedules
    // Must start before and after start
    // Must end before and after end
    return dest.start.isBefore(dest.end) &&
      dest.end.isSameOrBefore(last.end) && !day.find((schedule) =>
      dest.schedule !== schedule &&
      ((dest.start.isSameOrAfter(schedule.start) &&
      dest.start.isSameOrBefore(schedule.end) &&
      dest.end.isSameOrAfter(schedule.start) &&
      dest.end.isSameOrBefore(schedule.end)) ||
      (schedule.start.isSameOrAfter(dest.start) &&
      schedule.start.isSameOrBefore(dest.end) &&
      schedule.end.isSameOrAfter(dest.start) &&
      schedule.end.isSameOrBefore(dest.end)))
    );
  }

  /**
   * Handle form submission
   */
  handleSubmit = (evt) =>  {
    evt.preventDefault();
    this.handleCancelEdit();
  }

  handleCancel = () =>  {
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
  handleCancelEdit = () => {
    this.setState({
      edit: null,
      editing: false,
      recent: false
    });
  }

  handleEscape = (evt) =>  {
    if ( evt.keyCode === 27 ) {
      if ( this.state.recent ) {
        this.handleCancel();
      } else {
        this.handleCancelEdit();
      }
    }
  }

  handleInput(field) {
    return (option) => {
      option = option || {label: '', value: ''};
      const {edit, schedules} = this.state;
      const schedule = schedules[edit.day][edit.index];
      schedule.data[field].id = option.value;
      schedule.data[field].name = option.label;
      this.setState({ schedules });
    }
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
      const time = times.findIndex((time) => schedule.start.isSame(time.start));

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
      const time = times.findIndex((time) => time.start.isSame(schedule.start));
      const diw = Object.keys(schedules).indexOf(day);

      this.setState({
        drag: {
          x: width * diw,
          y: height * time
        },

        source: { day, index }
      });
    }
  }

  handleDrag = (evt, position) => {
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

  handleDragStop = (evt) => {
    if ( !this.state.dragging ) {
      return;
    }

    const {source, schedules, times, drag} = this.state;
    const diw = Object.keys(schedules); // All days in words
    const day = diw[clamp(Math.ceil(drag.x / width), 0, diw.length - 1)]; // Target day (index)
    const time = times[clamp(Math.ceil(drag.y / height), 0, times.length - 1)]; // Target time (index)
    const schedule = schedules[source.day][source.index];

    let start = schedule.start;
    let end = schedule.end;
    // If we dragged across another time (vertical),
    // we'll compute those changes for validation.
    if ( !time.start.isSame(schedule.start) ) {
      const {increment} = this.props.time;
      const difference = getIncrementDifference(schedule.start, schedule.end, increment);
      start = time.start.clone();
      end = time.start.clone()
        .add(difference * increment.hours, 'hours')
        .add(difference * increment.minutes, 'minutes');
    }

    // We'll apply changes only once we've verified that thing are valid
    if ( this.validate({ day, schedule, start, end }) ) {
      // Changes for when dragged across another time (vertical)
      schedule.start = start;
      schedule.end = end;

      // Changes for when dragged across another day (horizontal)
      if ( day !== source.day ) {
        schedules[source.day].splice(source.index, 1)[0];
        schedules[day].splice(0, 0, schedule);
      }
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

  handleResize = (evt, position) => {
    this.setState({
      resize: this.state.resize + (position.deltaY / height),
      resizing: true,
      edit: null,
      editing: false
    });
  }

  handleResizeStop = () => {
    if (!this.state.resizing) {
      return;
    }

    const {increment} = this.props.time;
    const {schedules, source, resize} = this.state;
    const schedule = schedules[source.day][source.index];
    const end = schedule.start.clone()
      .add(resize * increment.hours, 'hours')
      .add(resize * increment.minutes, 'minutes');

    if ( this.validate({ day: source.day, schedule, start: schedule.start, end }) ) {
      schedule.end = end;
    }

    this.setState({
      schedules,
      source: null,
      resize: null,
      resizing: false
    });
  }
}

export default Timesheet;