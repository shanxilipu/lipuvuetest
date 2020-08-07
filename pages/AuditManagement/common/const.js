import { formatMessage } from 'umi/locale';

export const SEND_TYPES = [
  {
    value: 1,
    label: formatMessage({ id: 'riskConfig.sms', defaultMessage: '短信' }),
  },
  {
    value: 2,
    label: formatMessage({ id: 'riskConfig.email', defaultMessage: '邮件' }),
  },
  {
    value: 3,
    label: formatMessage({ id: 'riskConfig.smsAndEmail', defaultMessage: '短信和邮件' }),
  },
];

export const SENSITIVE_EVENT_TYPES = [
  {
    value: 1,
    label: formatMessage({ id: 'riskConfig.NonWorkingTimeAccess' }),
  },
  {
    value: 2,
    label: formatMessage({ id: 'riskConfig.MoreThanTheNumOfQueries' }),
  },
  {
    value: 3,
    label: formatMessage({ id: 'riskConfig.QueryBlockingData' }),
  },
  {
    value: 4,
    label: formatMessage({ id: 'riskConfig.DownloadSensitiveData' }),
  },
  {
    value: 5,
    label: formatMessage({ id: 'auditManagement.ModifySensitiveAttr' }),
  },
];

export const LOGS_EVENT_TYPES = [
  {
    value: 1,
    label: formatMessage({ id: 'riskConfig.repeatedCollection', defaultMessage: '重复采集' }),
  },
  {
    value: 2,
    label: formatMessage({ id: 'riskConfig.overTransLimit', defaultMessage: '传输量超标' }),
  },
  {
    value: 3,
    label: formatMessage({ id: 'riskConfig.overStoreLimit', defaultMessage: '存储量超标' }),
  },
  {
    value: 4,
    label: formatMessage({
      id: 'riskConfig.collectionAbnormalInterrupt',
      defaultMessage: '采集异常中断',
    }),
  },
];

const RISK_SOURCE_COLUMN = 'RISK_SOURCE_COLUMN';
const RISK_TYPE_COLUMN = 'RISK_TYPE_COLUMN';
const TEMPLATE_COLUMN = 'TEMPLATE_COLUMN';
const RECEIVE_USER_COLUMN = 'RECEIVE_USER_COLUMN';
const ALARM_ENABLE_COLUMN = 'ALARM_ENABLE_COLUMN';
const TEMPLATE_NUMBER_COLUMN = 'TEMPLATE_NUMBER_COLUMN';
const TEMPLATE_PARAMETER_COLUMN = 'TEMPLATE_PARAMETER_COLUMN';
const SEND_TYPE_COLUMN = 'SEND_TYPE_COLUMN';
export {
  RISK_SOURCE_COLUMN,
  RISK_TYPE_COLUMN,
  TEMPLATE_COLUMN,
  RECEIVE_USER_COLUMN,
  ALARM_ENABLE_COLUMN,
  TEMPLATE_NUMBER_COLUMN,
  TEMPLATE_PARAMETER_COLUMN,
  SEND_TYPE_COLUMN,
};
