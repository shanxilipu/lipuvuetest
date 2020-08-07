import React from 'react';
import { formatMessage } from 'umi/locale';
import { Modal, Form, Select, Input, Button, Popconfirm } from 'antd';

const { Option } = Select;
const dataCodeArr = [
  { value: 'utf8', label: 'UTF-8' },
  // { value: 'GB2312', label: 'GB2312' },
  // { value: 'GB18030', label: 'GB18030' },
];

const formItemLayout = {
  labelCol: {
    xs: { span: 16 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

class SSHSetModal extends React.PureComponent {
  handelSHHSet = () => {
    const {
      form: { getFieldsValue },
      setInfo,
      onCancel,
      onOk,
    } = this.props;
    const { dataCode: oldDataCode, scrollBack: oldScrollBack } = setInfo;
    const values = getFieldsValue();
    const { dataCode, scrollBack } = values;
    if (oldDataCode === dataCode && oldScrollBack === scrollBack) {
      onCancel();
    } else {
      onOk({ ...setInfo, ...values });
    }
  };

  render() {
    const {
      visible,
      onCancel,
      form: { getFieldDecorator },
      setInfo,
    } = this.props;
    return (
      <Modal
        width="700px"
        footer={[
          <Button key="cancle" onClick={onCancel}>
            {formatMessage({ id: 'applySysUserManagement.cancel' })}
          </Button>,
          <Popconfirm
            key="ok"
            onConfirm={this.handelSHHSet}
            title={
              <div>
                <div>{`${formatMessage({ id: 'remoteAccess.modifiedSessionTip' })}:`}</div>
                <div>{`${formatMessage({ id: 'remoteAccess.modifiedSessionTip1' })}`}</div>
              </div>
            }
          >
            <Button type="primary">
              {formatMessage({ id: 'applySysUserManagement.determine' })}
            </Button>
          </Popconfirm>,
        ]}
        title={`${formatMessage({ id: 'remoteAccess.SessionConfig' })}`}
        onCancel={onCancel}
        visible={visible}
      >
        <Form {...formItemLayout}>
          <Form.Item label={`${formatMessage({ id: 'remoteAccess.CharacterSetEncoding' })}`}>
            {getFieldDecorator('dataCode', {
              rules: [{ required: true, message: 'Please input your username!' }],
              initialValue: setInfo.dataCode,
            })(
              <Select>
                {dataCodeArr.map(code => (
                  <Option key={code.value} value={code.value}>
                    {code.label}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label={`${formatMessage({ id: 'remoteAccess.maxNumberOfLines' })}`}>
            {getFieldDecorator('scrollBack', {
              rules: [{ required: true, message: '' }],
              initialValue: setInfo.scrollBack,
            })(<Input />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(SSHSetModal);
