import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { Modal, Form, Input, Spin, message } from 'antd';
import {
  insertSafeAppUser,
  updateSafeAppUser,
} from '@/services/authorizeManagement/applySysUserManagement';

const formItemLayout = {
  labelCol: {
    sm: { span: 7 },
  },
  wrapperCol: {
    sm: { span: 16 },
  },
};

@Form.create()
class AddUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { userItemAct, form } = this.props;
    if (JSON.stringify(nextProps.userItemAct) !== JSON.stringify(userItemAct)) {
      const inieObj = {};
      inieObj.appUserCode = nextProps.userItemAct.appUserCode || '';
      inieObj.appUserName = nextProps.userItemAct.appUserName || '';
      inieObj.appUserPhone = nextProps.userItemAct.appUserPhone || '';
      inieObj.appUserMail = nextProps.userItemAct.appUserMail || '';
      form.setFieldsValue(inieObj);
    }
  }

  hideModal = (refresh, setPage) => {
    const { showModelFlag } = this.props;
    showModelFlag(false, refresh, setPage);
  };

  handleOk = () => {
    const { form, selectedSys, type, userItemAct } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const params = { ...values };
        params.appsysId = selectedSys.id;
        let fun = '';
        if (type === 'add') {
          fun = insertSafeAppUser;
        } else {
          fun = updateSafeAppUser;
          params.id = userItemAct.id;
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
    if (this.CheckChinese(value)) {
      callback(`${formatMessage({ id: 'applySysUserManagement.UserCodeRule' })}`);
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

  // 中文校验
  CheckChinese = val => {
    let flag = false;
    const reg = new RegExp('[\\u4E00-\\u9FFF]+', 'g');
    if (reg.test(val)) {
      flag = true;
    }
    return flag;
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
            ? `${formatMessage({ id: 'applySysUserManagement.AddUser' })}`
            : `${formatMessage({ id: 'applySysUserManagement.EditUser' })}`
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
              label={`${formatMessage({ id: 'auditManagement.UserCode' })}`}
            >
              {getFieldDecorator('appUserCode', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'COMMON_REQUIRED', defaultMessage: '必填' }),
                  },
                  {
                    max: 50,
                    message: `${formatMessage({ id: 'applySysUserManagement.UserCodeRuleTwo' })}`,
                  },
                  { validator: this.checkCode },
                ],
              })(<Input placeholder={`${formatMessage({ id: 'auditManagement.pleaseEnter' })}`} />)}
            </Form.Item>
            <Form.Item
              colon={false}
              {...formItemLayout}
              label={`${formatMessage({ id: 'applySysUserManagement.SysUserName' })}`}
            >
              {getFieldDecorator('appUserName', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'COMMON_REQUIRED', defaultMessage: '必填' }),
                  },
                  {
                    max: 50,
                    message: `${formatMessage({ id: 'applySysUserManagement.SysUserNameRule' })}`,
                  },
                ],
              })(<Input placeholder={`${formatMessage({ id: 'auditManagement.pleaseEnter' })}`} />)}
            </Form.Item>
            <Form.Item
              colon={false}
              {...formItemLayout}
              label={`${formatMessage({ id: 'applySysUserManagement.phoneNumber' })}`}
            >
              {getFieldDecorator('appUserPhone', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'COMMON_REQUIRED', defaultMessage: '必填' }),
                  },
                  {
                    pattern: /^[1]([3-9])[0-9]{9}$/,
                    message: `${formatMessage({ id: 'applySysUserManagement.phoneNumberRule' })}`,
                  },
                ],
              })(<Input placeholder={`${formatMessage({ id: 'auditManagement.pleaseEnter' })}`} />)}
            </Form.Item>
            <Form.Item
              colon={false}
              {...formItemLayout}
              label={formatMessage({ id: 'riskConfig.email', defaultMessage: '邮件' })}
            >
              {getFieldDecorator('appUserMail', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'COMMON_REQUIRED', defaultMessage: '必填' }),
                  },
                  {
                    pattern: /^[a-z\d]+(\.[a-z\d]+)*@([\da-z](-[\da-z])?)+(\.{1,2}[a-z]+)+$/,
                    message: `${formatMessage({
                      id: 'applySysUserManagement.emailRule',
                      defaultMessage: '邮件格式不正确',
                    })}`,
                  },
                ],
              })(
                <Input
                  type="email"
                  placeholder={formatMessage({ id: 'auditManagement.pleaseEnter' })}
                />
              )}
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    );
  }
}

export default AddUser;
