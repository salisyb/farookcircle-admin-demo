/* eslint-disable no-else-return */
import { format, formatDistanceToNow } from 'date-fns';
import moment from 'moment-timezone';

// ----------------------------------------------------------------------

export function fDate(date) {
  return format(new Date(date), 'dd MMMM yyyy');
}

export function fDateTime(date) {
  return format(new Date(date), 'dd MMM yyyy HH:mm');
}

export function fDateTimeSuffix(date) {
  return format(new Date(date), 'dd/MM/yyyy hh:mm p');
}

export function fToNow(date) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
  });
}

export const formatMessageTime = (updatedAt) => {
  const now = moment();
  const messageTime = moment(updatedAt);

  if (now.diff(messageTime, 'days') === 0) {
    // If the message is from today, show only the time
    return messageTime.format('LT');
  } else if (now.diff(messageTime, 'days') === 1) {
    // If the message is from yesterday, show 'Yesterday' and the time
    return 'Yesterday';
  } else if (now.diff(messageTime, 'days') <= 7) {
    // If the message is from within the last week, show the day and time
    return messageTime.format('dddd');
  } else {
    // For messages older than a week, show the full date and time
    return messageTime.calendar();
  }
};
