import React, {Component} from 'react';
import ClickOutside from 'react-click-outside';
import Select from 'react-select';
import settings from './utils/settings';

export default class HoverCard extends Component {
  render() {
    const {schedule, source, schedules, current, done} = this.props;
    const top = (settings.scaled * (source.time)) + -45;
    const left = (settings.scaled * (Object.keys(schedules).findIndex((day) => source.day === day) + 1)) + 85;

    return (
      <div
        className="timesheet__popover draggable-cancel"
        style={{ top, left }}>
        <div className="timesheet__popover-body">
          {(current || done) && <div className="timesheet__overlay-status">
            {current ? 'On-going' : 'Done'}
          </div>}

          <h6 className="timesheet__overlay-other">{schedule.data.section.name || 'Section Name'}</h6>
          <h4 className="timesheet__overlay-title">{schedule.data.subject.name || 'Subject Name'}</h4>
          <h6 className="timesheet__overlay-other">{schedule.data.professor.name || 'Professor Name'}</h6>
        </div>
      </div>
    );
  }
}
