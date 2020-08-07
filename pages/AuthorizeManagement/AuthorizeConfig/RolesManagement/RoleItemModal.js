import React from 'react';
import isEmpty from 'lodash/isEmpty';
import Modal from '@/components/Modal';
import { Form, Input, Select, Col, message } from 'antd';
import { formatMessage } from 'umi/locale';
import { DEFAULT_FORM_LAYOUT, COMMON_RULE } from '@/pages/common/const';
import { saveRole } from '@/services/authorizeManagement/rolesManagement';
import { defaultHandleResponse } from '@/utils/utils';
import { ALL_STATES } from './RoleState';

@Form.create()
class RoleItemModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmLoading: false,
    };
  }

  handleSubmit = () => {
    const {
      onOk,
      onCancel,
      role = {},
      extraData = {},
      form: { validateFields },
    } = this.props;
    validateFields((err, values) => {
      if (err) {
        return false;
      }
      const payload = [{ ...role, ...extraData, ...values }];
      this.setState({ confirmLoading: true });
      saveRole(payload).then(response => {
        this.setState({ confirmLoading: false });
        defaultHandleResponse(response, () => {
          message.success(formatMessage({ id: 'COMMON_SAVE_SUCCESS', defaultMessage: '保存成功' }));
          onOk();
          onCancel();
        });
      });
    });
  };

  onCancel = () => {
    const { onCancel } = this.props;
    const { confirmLoading } = this.state;
    if (!confirmLoading) {
      onCancel();
    }
  };

  render() {
    const {
      role = {},
      visible,
      form: { getFieldDecorator },
    } = this.props;
    const { confirmLoading } = this.state;
    const title = isEmpty(role)
      ? formatMessage({ id: 'NEW_ROLE', defaultMessage: '新建角色' })
      : formatMessage({ id: 'MODIFY_ROLE', defaultMessage: '修改角色' });
    return (
      <Modal
        width={750}
        title={title}
        destroyOnClose
        visible={visible}
        onOk={this.handleSubmit}
        onCancel={this.onCancel}
        confirmLoading={confirmLoading}
      >
        <Form {...DEFAULT_FORM_LAYOUT}>
          <Col span={12}>
            <Form.Item label={formatMessage({ id: 'ROLE_NAME', defaultMessage: '角色名称' })}>
              {getFieldDecorator('roleName', {
                rules: [COMMON_RULE],
                initialValue: role.roleName,
              })(
                <Input
                  placeholder={formatMessage({ id: 'ROLE_NAME', defaultMessage: '角色名称' })}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={formatMessage({ id: 'ROLE_CODE', defaultMessage: '角色编码' })}>
              {getFieldDecorator('roleCode', {
                rules: [COMMON_RULE],
                initialValue: role.roleCode,
              })(
                <Input
                  placeholder={formatMessage({ id: 'ROLE_CODE', defaultMessage: '角色编码' })}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={formatMessage({ id: 'OWNER_ENTERPRISE', defaultMessage: '归属企业' })}
            >
              <Input disabled value={role.comAcctName} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={formatMessage({ id: 'COMMON_STATE', defaultMessage: '状态' })}>
              {getFieldDecorator('roleStatus', {
                rules: [COMMON_RULE],
                initialValue: role.roleStatus || ALL_STATES[0].value,
              })(
                <Select placeholder={formatMessage({ id: 'COMMON_STATE', defaultMessage: '状态' })}>
                  {ALL_STATES.map(o => (
                    <Select.Option key={o.value} value={o.value}>
                      {o.label}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              labelCol={{ span: 3 }}
              wrapperCol={{ span: 20 }}
              label={formatMessage({ id: 'ROLE_DESCRIPTION', defaultMessage: '角色描述' })}
            >
              {getFieldDecorator('roleDesc', {
                initialValue: role.roleDesc,
              })(
                <Input.TextArea
                  autoSize={{ minRows: 3 }}
                  placeholder={formatMessage({
                    id: 'ROLE_DESCRIPTION',
                    defaultMessage: '角色描述',
                  })}
                />
              )}
            </Form.Item>
          </Col>
        </Form>
      </Modal>
    );
  }
}
export default RoleItemModal;
