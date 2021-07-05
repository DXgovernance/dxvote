import moment from 'moment';
import { BigNumber } from './bignumber';
import { bnum } from './helpers';

export const formatDate = (date: Date) => {
    return moment(date).format('DD.MM - HH:mm');
};

export const timeToTimestamp = (timestamp: BigNumber) => {
    if (timestamp.toNumber() > moment().unix())
      return moment().to( moment.unix(timestamp.toNumber()) ).toString();
    else
      return "";
};

export const addZero = (value) => {
    return value > 9 ? value : `0${value}`;
};
