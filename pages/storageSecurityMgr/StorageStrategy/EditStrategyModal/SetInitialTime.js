import React, { useState, useEffect } from 'react';
import { formatMessage } from 'umi/locale';
import Modal from '@/components/Modal';
import { DatePicker } from 'antd';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from '@/pages/common/const';

const SetInitialTime = (props = {}) => {
  const { visible, onCancel, onOk } = props;
  const [value, setValue] = useState(null);
  useEffect(
    () => {
      if (visible) {
        setValue(moment(moment().format(DEFAULT_DATE_FORMAT)));
      }
    },
    [visible]
  );
  return (
    <Modal
      width={350}
      centered={false}
      visible={visible}
      onCancel={onCancel}
      onOk={() => onOk(moment(value).format(DEFAULT_DATE_FORMAT))}
      title={formatMessage({ id: 'storage.strategy.initialTime', defaultMessage: '初始化时间' })}
    >
      {visible ? (
        <DatePicker
          showTime
          allowClear={false}
          style={{ width: '100%' }}
          format={DEFAULT_DATE_FORMAT}
          value={value}
          onChange={val => setValue(val)}
        />
      ) : null}
    </Modal>
  );
};
export default SetInitialTime;
