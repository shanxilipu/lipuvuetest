import React from 'react';
import { Badge } from 'antd';
import { formatMessage } from 'umi/locale';

const INVALID_CODE = 0;
const VALID_CODE = 1;

export const ALL_STATES = [
  { value: VALID_CODE, label: formatMessage({ id: 'COMMON_VALID', defaultMessage: '有效' }) },
  { value: INVALID_CODE, label: formatMessage({ id: 'COMMON_INVALID', defaultMessage: '无效' }) },
];

const RoleState = (props = {}) => {
  const { status = INVALID_CODE } = props;
  if (![`${VALID_CODE}`, `${INVALID_CODE}`].includes(`${status}`)) {
    return '';
  }
  const text = (ALL_STATES.find(o => `${o.value}` === `${status}`) || {}).label;
  return <Badge status={status === VALID_CODE ? 'success' : 'default'} text={text} />;
};
export default RoleState;
