import moment from 'moment';

/**
 * Generate time, step-by-step, from start to end.
 *
 * @example times('10:00 AM', '10:00 PM', { hours: 1, minutes: 30 })
 * @return Array<Object>
 */
function times(start, end, step) {
  start = moment(start, 'hh:mm a');
  end = moment(end, 'hh:mm a');

  let results = [];
  let current = start;

  while ( current < end ) {
    const next = current.clone()
      .add(step.hours, 'hours')
      .add(step.minutes, 'minutes');

    results.push({
      start: current,
      end: next
    });

    current = next;
  }
  
  return results;
}

export default times;