import { formatMessage } from 'umi/locale';

export const COMMON_RULE = {
  required: true,
  message: formatMessage({ id: 'COMMON_REQUIRED', defaultMessage: '必填' }),
};

export const DEFAULT_FORM_LAYOUT = {
  labelCol: {
    sm: { span: 6 },
  },
  wrapperCol: {
    sm: { span: 16 },
  },
};

export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
