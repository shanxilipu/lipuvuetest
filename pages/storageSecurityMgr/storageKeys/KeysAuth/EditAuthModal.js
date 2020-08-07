import React, { useState } from 'react';
import { Form, Col, Input, message } from 'antd';
import { formatMessage } from 'umi/locale';
import Modal from '@/components/Modal';
import AuthForm from './AuthForm';
import { defaultHandleResponse } from '@/utils/utils';
import { DEFAULT_FORM_LAYOUT } from '@/pages/common/const';
import { batchAuthUpdate } from '@/pages/storageSecurityMgr/services/encryptionKeysMgr';

const EditAuthModal = (props = {}) => {
  let formRef;
  const { visible, onCancel, data, onOk } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const handleSubmit = () => {
    if (formRef) {
      const values = formRef.getValues();
      if (!values) {
        return false;
      }
      setConfirmLoading(true);
      const { authDetailId } = data;
      batchAuthUpdate([{ authDetailId, ...values }]).then(response => {
        setConfirmLoading(false);
        defaultHandleResponse(response, () => {
          message.success(formatMessage({ id: 'COMMON_SAVE_SUCCESS', defaultMessage: '保存成功' }));
          onCancel();
          onOk();
        });
      });
    }
  };
  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      noCancelConfirmLoading
      confirmLoading={confirmLoading}
      title={formatMessage({ id: 'storage.encrypt.editAuth', defaultMessage: '编辑授权' })}
    >
      <div>
        <Col span={24}>
          <Form.Item
            {...DEFAULT_FORM_LAYOUT}
            label={formatMessage({ id: 'datasource.code', defaultMessage: '数据源编码' })}
          >
            <Input disabled value={data.dataSources} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            {...DEFAULT_FORM_LAYOUT}
            label={formatMessage({ id: 'TABLE_CODE', defaultMessage: '表编码' })}
          >
            <Input disabled value={data.genTabCode} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            {...DEFAULT_FORM_LAYOUT}
            label={formatMessage({ id: 'USERMGR_USER_CODE', defaultMessage: '用户编码' })}
          >
            <Input disabled value={data.userCode} />
          </Form.Item>
        </Col>
        <AuthForm
          data={data}
          Ref={ref => {
            formRef = ref;
          }}
        />
      </div>
    </Modal>
  );
};
export default EditAuthModal;
