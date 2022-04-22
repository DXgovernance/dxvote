import moment from 'moment';

export const formatTime = date => {
  const d = new Date(date);
  return moment(d).format('MMM dd');
};

