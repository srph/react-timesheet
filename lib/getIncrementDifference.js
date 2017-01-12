import moment from 'moment';

/**
 * Get the time increment difference between the start and end time.
 * diff = duration / increment
 *
 * @param {string} start (10:00 am)
 * @param {string} end (11:30 am)
 * @param {object} increment ({ hours: 1, minutes: 30 })
 * @return {float}
 */
export default function getIncrementDifference(start, end, increment) {
  start = moment(start, 'hh:mm a');
  end = moment(end, 'hh:mm a');
  increment = moment.duration(increment).asHours();
  const difference = moment.duration(end.diff(start)).asHours();
  return difference / increment;
}