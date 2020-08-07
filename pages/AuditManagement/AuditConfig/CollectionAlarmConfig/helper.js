import { checkLanguageIsEnglish } from '@/utils/utils';
import { formatMessage } from 'umi/locale';

export const ALL_PERIOD_UNITS = [
  { label: formatMessage({ id: 'UNIT.SECOND', defaultMessage: '秒' }), value: 1 },
  { label: formatMessage({ id: 'UNIT.MINUTE', defaultMessage: '分钟' }), value: 60 },
  { label: formatMessage({ id: 'UNIT.HOUR', defaultMessage: '小时' }), value: 60 * 60 },
  { label: formatMessage({ id: 'UNIT.DAY', defaultMessage: '天' }), value: 24 * 60 * 60 },
];
export const ALL_STORAGE_UNITS = ['Byte', 'KB', 'MB', 'GB', 'TB', 'PB'].map((label, i) => ({
  label,
  // eslint-disable-next-line no-restricted-properties
  value: Math.pow(1024, i),
}));

export function secondsFormatter(s) {
  const days = Math.floor(s / (24 * 3600));
  const hours = Math.floor((s - days * 24 * 3600) / 3600);
  const minutes = Math.floor((s - days * 24 * 3600 - hours * 3600) / 60);
  const seconds = s - days * 24 * 3600 - hours * 3600 - minutes * 60;
  const isEn = checkLanguageIsEnglish();
  let res = isEn ? 'Every ' : '每';
  if (days > 0) {
    res = `${res}${days}${isEn ? (days > 1 ? ' days ' : ' day ') : '天'}`;
  }
  if (hours > 0) {
    res = `${res}${hours}${isEn ? (hours > 1 ? ' hours ' : ' hour ') : '时'}`;
  }
  if (minutes > 0) {
    res = `${res}${minutes}${isEn ? (minutes > 1 ? ' minutes ' : ' minute ') : '分'}`;
  }
  if (seconds > 0) {
    res = `${res}${seconds}${isEn ? (seconds > 1 ? ' seconds ' : ' second ') : '秒'}`;
  }
  if (isEn) {
    return res.substring(0, res.length - 1);
  }
  return res;
}

export function storageFormatter(bytes) {
  let unit = 1024 * 1024 * 1024 * 1024 * 1024; // 1PB
  let level = 0;
  const units = ['PB', 'TB', 'GB', 'MB', 'KB', 'B'];
  while (unit > 1) {
    if (bytes >= unit) {
      break;
    }
    unit /= 1024;
    level++;
  }
  return `${bytes / unit}${units[level]}`;
}

export function getRepeatedPeriodInitialValue(s = 0) {
  if (!s || s < 0) {
    return { value: 1, unit: 24 * 60 * 60 };
  }
  const days = Math.floor(s / (24 * 3600));
  const hours = Math.floor((s - days * 24 * 3600) / 3600);
  const minutes = Math.floor((s - days * 24 * 3600 - hours * 3600) / 60);
  const seconds = s - days * 24 * 3600 - hours * 3600 - minutes * 60;
  let value = days;
  let unit = 1;
  if (days > 0) {
    unit = 24 * 60 * 60;
  } else if (hours > 0) {
    value = hours;
    unit = 60 * 60;
  } else if (minutes > 0) {
    value = minutes;
    unit = 60;
  } else {
    value = seconds;
  }
  return { value, unit };
}

export function getStorageInitialValue(bytes = 0) {
  if (!bytes || bytes < 0) {
    return { value: 1, unit: 1024 * 1024 * 1024 };
  }
  let unit = 1024 * 1024 * 1024 * 1024 * 1024; // 1PB
  while (unit > 1) {
    if (bytes >= unit) {
      break;
    }
    unit /= 1024;
  }
  return { value: bytes / unit, unit };
}
