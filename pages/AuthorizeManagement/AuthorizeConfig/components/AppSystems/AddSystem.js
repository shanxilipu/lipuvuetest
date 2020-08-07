import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { Modal, Form, Input, Spin, message } from 'antd';
import {
  insertSafeAppSystem,
  updateSafeAppSystem,
} from '@/services/authorizeManagement/applySysUserManagement';

const { TextArea } = Input;

const formItemLayout = {
  labelCol: {
    sm: { span: 7 },
  },
  wrapperCol: {
    sm: { span: 16 },
  },
};

@Form.create()
class AddSystem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { sysItemAct, form } = this.props;
    if (JSON.stringify(nextProps.sysItemAct) !== JSON.stringify(sysItemAct)) {
      const inieObj = {};
      inieObj.appsysCode = nextProps.sysItemAct.appsysCode || '';
      inieObj.appsysName = nextProps.sysItemAct.appsysName || '';
      inieObj.appsysDescribe = nextProps.sysItemAct.appsysDescribe || '';
      form.setFieldsValue(inieObj);
    }
  }

  hideModal = refresh => {
    const { showModelFlag } = this.props;
    showModelFlag(false, refresh);
  };

  handleOk = () => {
    const { form, selectedCatalogue, type, sysItemAct } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const params = {};
        params.appsysCode = values.appsysCode;
        params.appsysName = values.appsysName;
        params.appsysDescribe = values.appsysDescribe;
        params.appsysCatalogId = selectedCatalogue.catalogId;
        let fun = '';
        if (type === 'add') {
          fun = insertSafeAppSystem;
        } else {
          fun = updateSafeAppSystem;
          params.id = sysItemAct.id;
        }
        this.setState({
          loading: true,
        });
        fun(params).then(result => {
          this.setState({
            loading: false,
          });
          if (!result) return;
          const {
            resultCode,
            resultMsg = `${formatMessage({ id: 'applySysUserManagement.OperationFailed' })}`,
          } = result;
          if (resultCode !== '0') {
            message.error(resultMsg);
          } else {
            form.resetFields();
            if (type === 'add') {
              message.success(
                `${formatMessage({ id: 'applySysUserManagement.AddedSuccessfully' })}`
              );
              this.hideModal(true, true);
              return false;
            }
            message.success(
              `${formatMessage({ id: 'applySysUserManagement.EditedSuccessfully' })}`
            );
            this.hideModal(true);
          }
        });
      }
    });
  };

  // 检查编码是否符合要求
  checkCode = (rule, value, callback) => {
    // const { type, sysItemAct } = this.props;
    // const { appsysCode } = sysItemAct;
    if (!value) {
      callback();
      return false;
    }
    if (!/^A\d{6}$/.test(`${value}`)) {
      callback(`${formatMessage({ id: 'applySysUserManagement.AddSysCodeRule' })}`);
      return false;
    }
    callback();
    // if (type === 'add') {
    //   this.organizationCodeIsExist(value, callback);
    // } else if (appsysCode === value) {
    //   callback();
    // } else {
    //   this.organizationCodeIsExist(value, callback);
    // }
  };

  checkDes = (rule, value, callback) => {
    if (!value) {
      callback();
      return false;
    }
    if (/[\n|\r|\r\n]/g.test(`${value}`)) {
      callback(`${formatMessage({ id: 'applySysUserManagement.AddSysDescriptionRule' })}`);
      return false;
    }
    callback();
  };

  render() {
    const { loading } = this.state;
    const {
      form: { getFieldDecorator },
      showModel,
      type,
    } = this.props;
    return (
      <Modal
        title={
          type === 'add'
            ? `${formatMessage({ id: 'applySysUserManagement.CreateApplySys' })}`
            : `${formatMessage({ id: 'applySysUserManagement.EditApplySys' })}`
        }
        visible={showModel}
        onOk={this.handleOk}
        onCancel={() => {
          this.hideModal(false);
        }}
        width="500px"
      >
        <Spin spinning={loading}>
          <Form>
            <Form.Item
              colon={false}
              {...formItemLayout}
              label={`${formatMessage({ id: 'applySysUserManagement.SystemCode' })}`}
            >
              {getFieldDecorator('appsysCode', {
                rules: [
                  {
                    required: true,
                    message: `${formatMessage({ id: 'applySysUserManagement.SysCodeTip' })}`,
                  },
                  {
                    max: 50,
                    message: `${formatMessage({ id: 'applySysUserManagement.SysCodeRule' })}`,
                  },
                  { validator: this.checkCode },
                ],
              })(
                <Input
                  placeholder={`${formatMessage({ id: 'applySysUserManagement.SysCodeRule' })}`}
                />
              )}
            </Form.Item>
            <Form.Item
              colon={false}
              {...formItemLayout}
              label={`${formatMessage({ id: 'auditManagement.systemName' })}`}
            >
              {getFieldDecorator('appsysName', {
                rules: [
                  {
                    required: true,
                    message: `${formatMessage({ id: 'applySysUserManagement.SysNameTip' })}`,
                  },
                  {
                    max: 50,
                    message: `${formatMessage({ id: 'applySysUserManagement.SysNameRule' })}`,
                  },
                ],
              })(<Input placeholder={`${formatMessage({ id: 'auditManagement.pleaseEnter' })}`} />)}
            </Form.Item>
            <Form.Item
              colon={false}
              {...formItemLayout}
              label={`${formatMessage({ id: 'applySysUserManagement.SystemDescription' })}`}
            >
              {getFieldDecorator('appsysDescribe', {
                rules: [
                  {
                    max: 200,
                    message: `${formatMessage({
                      id: 'applySysUserManagement.SysDescriptionRule',
                    })}`,
                  },
                  { validator: this.checkDes },
                ],
              })(
                <TextArea
                  rows={5}
                  placeholder={`${formatMessage({ id: 'auditManagement.pleaseEnter' })}`}
                  onChange={this.onFileChange}
                />
              )}
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    );
  }
}

export default AddSystem;
