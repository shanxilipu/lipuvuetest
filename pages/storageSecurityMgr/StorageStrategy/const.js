import { formatMessage } from 'umi/locale';

export const TO_BE_INITIALIZED = '5';
export const TO_BE_CUTOVER = '3';
export const EXECUTING = '4';
export const EXECUTED_FAILED = '1';
export const EXECUTED_SUCCESS = '2';

export const STATES = [
  {
    value: TO_BE_INITIALIZED,
    label: formatMessage({ id: 'storage.strategy.toBeInitialized', defaultMessage: '待初始化' }),
  },
  {
    value: TO_BE_CUTOVER,
    label: formatMessage({ id: 'storage.strategy.toBeCutover', defaultMessage: '待割接' }),
  },
  {
    value: EXECUTING,
    label: formatMessage({ id: 'storage.strategy.executing', defaultMessage: '执行中' }),
  },
  {
    value: EXECUTED_FAILED,
    label: formatMessage({ id: 'storage.strategy.executedFail', defaultMessage: '执行失败' }),
  },
  {
    value: EXECUTED_SUCCESS,
    label: formatMessage({ id: 'storage.strategy.executedSuccess', defaultMessage: '执行成功' }),
  },
];
