import React, { Component } from 'react';
import clamp from 'lodash/clamp';
import {DraggableCore} from 'react-draggable';
import {width, height} from './utils/settings';
import getIncrementDifference from './utils/getIncrementDifference';

export default class DraggableLayer extends Component {
  state = {
    x: 0,
    y: 0,
    dragging: 0
  };

  render() {
    return (
      <DraggableCore
        allowAnyClick
        grid={[width, height]}
        cancel=".draggable-cancel"
        onStart={this.handleDragStart}
        onDrag={this.handleDrag}
        onStop={this.handleDragStop}>
        {this.props.children}
      </DraggableCore>
    );
  }

  // day, index
  handleDragStart = (evt, position) => {
    const {schedule, schedules, times, source} = this.props;
    const time = times.findIndex((time) => time.start.isSame(schedule.start));
    const diw = Object.keys(schedules).indexOf(source.day);

    this.setState({
      x: width * diw,
      y: height * time
    });
  }

  handleDrag = (evt, position) => {
    this.setState({
      x: this.state.x + position.deltaX,
      y: this.state.y + position.deltaY,
      dragging: true
    });
  }

  handleDragStop = (evt) => {
    if (!this.state.dragging) {
      return;
    }

    const {x, y} = this.state;
    const {source, schedule, schedules, times} = this.props;
    const diw = Object.keys(schedules); // All days in words
    const day = diw[clamp(Math.ceil(x / width), 0, diw.length - 1)]; // Target day (index)
    const time = times[clamp(Math.ceil(y / height), 0, times.length - 1)]; // Target time (index)

    let start = schedule.start;
    let end = schedule.end;
    // If we dragged across another time (vertical),
    // we'll compute those changes for validation.
    if (!time.start.isSame(schedule.start)) {
      const {increment} = this.props.time;
      const difference = getIncrementDifference(schedule.start, schedule.end, increment);
      start = time.start.clone();
      end = time.start.clone()
        .add(difference * increment.hours, 'hours')
        .add(difference * increment.minutes, 'minutes');
    }

    // We'll apply changes only once we've verified that thing are valid
    if (this.props.validate({ day, schedule, start, end })) {
      // Changes for when dragged across another time (vertical)
      schedule.start = start;
      schedule.end = end;

      // Changes for when dragged across another day (horizontal)
      if (day !== source.day) {
        schedules[source.day].splice(source.index, 1)[0];
        schedules[day].splice(0, 0, schedule);
      }
    }

    // Just noting that we're no longer resetting state (setting the
    // dragging flag to false) after this because the component is being
    // re-rendered on another column after [dragging] calling this callback
    this.props.onDrag(source.day, source.index, schedule);
  }
}
