import React, {Component} from 'react';
import ClickOutside from 'react-click-outside';
import Select from 'react-select';
import settings from './utils/settings';

export default class Popover extends Component {
  state = {
    professor: this.props.schedule.data.professor,
    subject: this.props.schedule.data.subject,
    section: this.props.schedule.data.section
  };

  componentDidMount() {
    document.addEventListener('keyup', this.handleEscape);
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.handleEscape);
  }

  render() {
    const {state} = this;
    const {recent, schedules, source, scaled} = this.props;

    const height = scaled ? settings.scaled : settings.height;
    const width = scaled ? settings.scaled : settings.width;

    const top = (height * (source.time)) + (scaled ? -45 : 30);
    const left = (width * (Object.keys(schedules).findIndex((day) => source.day === day) + 1)) + (scaled ? 85 : 150);
    
    return (
      <ClickOutside onClickOutside={this.props.onCancel}
        className="timesheet__popover draggable-cancel"
        style={{ top, left }}>
        <form onSubmit={this.handleSubmit}>
          <div className="timesheet__popover-body">
            <div className="u-spacer">
              <Select autofocus
                value={state.section.id}
                onChange={this.handleInput('section')}
                options={this.props.sections}
                placeholder="Section Name" />
            </div>

            <div className="u-spacer">
              <Select
                value={state.subject.id}
                onChange={this.handleInput('subject')}
                options={this.props.subjects}
                placeholder="Subject Name" />
            </div>

            <div className="u-spacer">
              <Select
                value={state.professor.id}
                onChange={this.handleInput('professor')}
                options={this.props.professors}
                placeholder="Professor Name" />
            </div>
          </div>

          <footer className="timesheet__popover-footer">
            <button type="button" onClick={this.props.onCancel}>Cancel</button>
            <button>{recent ? 'Create' : 'Update'}</button>
          </footer>
        </form>
      </ClickOutside>
    );
  }

  handleEscape = (evt) =>  {
    if ( evt.keyCode === 27 ) {
      this.props.onCancel();
    }
  }

  handleInput = (field) => {
    return (option) => {
      option = option || { label: '', value: '' };

      this.setState({
        [field]: {
          ...this.state[field],
          id: option.value,
          name: option.label
        }
      });
    }
  }

  handleSubmit = (evt) => {
    evt.preventDefault();

    this.props.onSubmit({
      ...this.props.schedule,
      data: {
        ...this.props.schedule.data,
        ...this.state
      }
    });
  }
}
