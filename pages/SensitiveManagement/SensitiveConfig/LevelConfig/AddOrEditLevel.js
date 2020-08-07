import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
// import { Modal, Form, Input, Spin, message } from 'antd';
import { Modal, Form, Input, Spin, message } from 'antd';
import {
  insertSafeSensitiveLevel,
  updateSafeSensitiveLevel,
} from '@/services/sensitiveManagement/levelConfig';

const { TextArea } = Input;

const formItemLayout = {
  labelCol: {
    sm: { span: 7 },
  },
  wrapperCol: {
    sm: { span: 16 },
  },
};

const codeValidator = (rule, value, callback) => {
  const reg = /^[^\u4e00-\u9fa5]+$/g;
  if (value && !reg.test(value) == true) {
    callback(
      `${formatMessage({ id: 'LevelConfig.DoNotEnterChinese', defaultMessage: '请勿输入中文' })}`
    );
  } else {
    callback();
  }
};

@Form.create()
class AddOrEditLevel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      taskItem: {},
    };
  }

  componentWillReceiveProps(nextProps) {
    const { taskItem, visible, form } = this.props;
    if (nextProps.isAddItem && !visible && nextProps.visible) {
      const data = {
        levelName: '',
        levelCode: '',
        levelDescribe: '',
      };
      this.setState({
        taskItem: {},
      });
      form.setFieldsValue(data);
    }
    if (JSON.stringify(nextProps.taskItem) !== JSON.stringify(taskItem)) {
      this.setState({
        taskItem: nextProps.taskItem,
      });
      form.setFieldsValue(nextProps.taskItem);
    }
  }

  hideModal = () => {
    const { showModelFlag } = this.props;
    showModelFlag(false);
  };

  getPageList = val => {
    const { getPageList } = this.props;
    getPageList(val);
  };

  handleOk = () => {
    const { taskItem, form, isAddItem } = this.props;
    const id = !isAddItem && taskItem.id ? taskItem.id : '';
    const self = this;
    form.validateFields((err, values) => {
      if (!err) {
        self.setState({
          loading: false,
        });
        let formData = {};
        formData.id = id;
        formData.levelCode = values.levelCode;
        formData.levelName = values.levelName;
        formData.levelDescribe = values.levelDescribe;
        self.setState({
          loading: true,
        });
        const func = id ? updateSafeSensitiveLevel : insertSafeSensitiveLevel;
        func(formData).then(result => {
          this.setState({
            loading: false,
          });
          if (!result) return;
          const { resultCode, resultMsg } = result;
          if (resultCode !== '0') {
            message.error(resultMsg);
          } else {
            self.hideModal(false);
            message.success(
              `${formatMessage({
                id: 'LevelConfig.AddedOrModifiedSuccessfully',
                defaultMessage: '添加/修改成功',
              })}`
            );
            self.getPageList(1); // 跳转到第一页
          }
        });
        formData = null;
      }
    });
  };

  render() {
    const { loading, taskItem } = this.state;

    const {
      form: { getFieldDecorator },
      visible,
    } = this.props;
    return (
      <Modal title="信息录入" visible={visible} onOk={this.handleOk} onCancel={this.hideModal}>
        <Spin spinning={loading}>
          <Form>
            <Form.Item
              colon={false}
              {...formItemLayout}
              label={formatMessage({ id: 'LevelConfig.LevelCode', defaultMessage: '级别编码' })}
            >
              {getFieldDecorator('levelCode', {
                rules: [
                  {
                    required: true,
                    message: `${formatMessage({
                      id: 'COMMON_ENTER_TIP',
                      defaultMessage: '请输入',
                    })}`,
                  },
                  {
                    validator: codeValidator,
                  },
                ],
                initialValue: taskItem.levelCode,
              })(
                <Input
                  style={{ width: '88%' }}
                  placeholder={formatMessage({ id: 'COMMON_ENTER_TIP', defaultMessage: '请输入' })}
                />
              )}
            </Form.Item>
            <Form.Item
              colon={false}
              {...formItemLayout}
              label={formatMessage({ id: 'LevelConfig.LevelName', defaultMessage: '级别名称' })}
            >
              {getFieldDecorator('levelName', {
                rules: [
                  {
                    required: true,
                    message: `${formatMessage({
                      id: 'COMMON_ENTER_TIP',
                      defaultMessage: '请输入',
                    })}`,
                  },
                ],
                initialValue: taskItem.levelName,
              })(
                <Input
                  style={{ width: '88%' }}
                  placeholder={formatMessage({ id: 'COMMON_ENTER_TIP', defaultMessage: '请输入' })}
                />
              )}
            </Form.Item>
            <Form.Item
              colon={false}
              {...formItemLayout}
              label={formatMessage({
                id: 'LevelConfig.LevelDescription',
                defaultMessage: '级别说明',
              })}
            >
              {getFieldDecorator('levelDescribe', {
                rules: [
                  {
                    required: true,
                    message: `${formatMessage({
                      id: 'COMMON_ENTER_TIP',
                      defaultMessage: '请输入',
                    })}`,
                  },
                ],
                initialValue: taskItem.levelDescribe,
              })(
                <TextArea
                  style={{ width: '88%' }}
                  placeholder={formatMessage({ id: 'COMMON_ENTER_TIP', defaultMessage: '请输入' })}
                />
              )}
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    );
  }
}

export default AddOrEditLevel;
