import React from 'react';
import { Modal, Form, Input } from 'antd';
import { formatMessage } from 'umi/locale';
import { COMMONRule, defaultFormItemLayout } from '../constant';

@Form.create()
class RenameModal extends React.PureComponent {
  handleSubmit = () => {
    const {
      form: { validateFields },
      onOk,
    } = this.props;
    validateFields((err, values) => {
      if (err) {
        return false;
      }
      onOk(values.value);
    });
  };

  render() {
    const {
      visible,
      onCancel,
      initialValue = '',
      form: { getFieldDecorator },
      confirmLoading = false,
      renameLabel = formatMessage({ id: 'COMMON_NAME' }),
    } = this.props;
    return (
      <Modal
        destroyOnClose
        title={formatMessage({ id: 'COMMON_RENAME' })}
        visible={visible}
        width={400}
        onCancel={onCancel}
        onOk={this.handleSubmit}
        confirmLoading={confirmLoading}
      >
        <Form {...defaultFormItemLayout}>
          <Form.Item label={renameLabel}>
            {getFieldDecorator('value', {
              rules: [COMMONRule],
              initialValue,
            })(<Input placeholder={renameLabel} onPressEnter={this.handleSubmit} />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
export default RenameModal;
