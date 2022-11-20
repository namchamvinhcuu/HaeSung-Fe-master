import moment from 'moment';
const calDateAgo = (date) => {
  var date = moment(date);

  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + ' years ago';
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' months ago';
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' days ago';
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' hours ago';
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' minutes ago';
  }
  return Math.floor(seconds) + ' seconds ago';
};

function toCamel(o) {
  var newO, origKey, newKey, value;
  if (o instanceof Array) {
    return o.map(function (value) {
      if (typeof value === 'object') {
        value = toCamel(value);
      }
      return value;
    });
  } else {
    newO = {};
    for (origKey in o) {
      if (o.hasOwnProperty(origKey)) {
        newKey = (origKey.charAt(0).toLowerCase() + origKey.slice(1) || origKey).toString();
        value = o[origKey];
        if (value instanceof Array || (value !== null && value.constructor === Object)) {
          value = toCamel(value);
        }
        newO[newKey] = value;
      }
    }
  }
  return newO;
}

function dateToTicks(date) {
  const epochOffset = 621355968000000000;
  const ticksPerMillisecond = 10000;

  const ticks = epochOffset + date.getTime() * ticksPerMillisecond;

  return Math.floor(ticks / 10000);
}

const addDays = (date, days) => {
  let result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const minusDays = (date, days) => {
  let result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

const getCurrentWeek = () => {
  const todaydate = new Date();
  const oneJan = new Date(todaydate.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((todaydate - oneJan) / (24 * 60 * 60 * 1000));
  const curWeek = Math.ceil((todaydate.getDay() + 1 + numberOfDays) / 7);
  return curWeek;
};

const isNumber = (input) => {
  if (!input) return false;
  return isFinite(input);
};

export { calDateAgo, toCamel, dateToTicks, addDays, minusDays, getCurrentWeek, isNumber };
