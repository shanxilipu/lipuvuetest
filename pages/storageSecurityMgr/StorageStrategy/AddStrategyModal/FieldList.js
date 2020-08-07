import React, { useState, useEffect } from 'react';
import { formatMessage } from 'umi/locale';
import Table from '@/components/Table';
import { defaultHandleResponse } from '@/utils/utils';
import { getSensitiveFieldsByTable } from '@/pages/storageSecurityMgr/services/encryptionStrategy';

const columns = [
  {
    dataIndex: 'fieldCode',
    title: formatMessage({ id: 'FIELD_CODE', defaultMessage: '字段编码' }),
  },
  {
    dataIndex: 'levelName',
    title: formatMessage({ id: 'FieldInquire.SensitivityLevel', defaultMessage: '敏感级别' }),
  },
];

const FieldList = (props = {}) => {
  const { groupId = '', tableId = '', tableCode, onSelectField, scrollYMark } = props;
  const UNIQUE_KEY = `${groupId}.${tableId}`;
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const getData = () => {
    if (groupId && tableId && tableCode) {
      setLoading(true);
      getSensitiveFieldsByTable({ groupId, tableId, tableCode }).then(response => {
        setLoading(false);
        defaultHandleResponse(response, resultObject => {
          setList(resultObject || []);
        });
      });
    }
  };
  useEffect(
    () => {
      getData();
    },
    [UNIQUE_KEY]
  );
  return (
    <Table
      noPadding
      rowKey="fieldId"
      loading={loading}
      dataSource={list}
      showFoot={false}
      columns={columns}
      onRow={() => ({
        onClick: (e, r) => onSelectField(r),
      })}
      scrollYMark={scrollYMark}
    />
  );
};
export default FieldList;
