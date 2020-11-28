import moment from 'moment';

export const formatDate = (date: Date) => {
    return moment(date).format('DD.MM - HH:mm');
};

export const addZero = (value) => {
    return value > 9 ? value : `0${value}`;
};
