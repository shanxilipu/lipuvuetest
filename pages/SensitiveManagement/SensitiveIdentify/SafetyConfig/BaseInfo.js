import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import { Col, DatePicker, Form, Input, Row, Select } from 'antd';
import moment from 'moment';

const { Option } = Select;

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
class BaseInfo extends PureComponent {
  state = {
    // baseInfoObject: {},
  };

  componentDidMount() {
    const { viewDidMountHandler } = this.props;

    if (viewDidMountHandler) {
      viewDidMountHandler('BaseInfo', this);
    }
  }

  // ===================================
  // public
  // ===================================

  isFieldsValid = () => {
    const { form } = this.props;
    let isValid = true;
    form.validateFields(error => {
      isValid = !error;
    });
    return isValid;
  };

  getValue = () => {
    const { form } = this.props;
    if (this.isFieldsValid()) {
      return form.getFieldsValue();
    }
    return false;
  };

  resetModel = () => {
    const { form } = this.props;
    form.resetFields();
  };

  toTimestr = timeStamp => {
    const time = new Date(timeStamp);
    const Y = time.getFullYear();
    const M = (time.getMonth() + 1).toString().padStart(2, '0');
    const D = time
      .getDate()
      .toString()
      .padStart(2, '0');
    const h = time
      .getHours()
      .toString()
      .padStart(2, '0');
    const m = time
      .getMinutes()
      .toString()
      .padStart(2, '0');
    const s = time
      .getSeconds()
      .toString()
      .padStart(2, '0');
    const resultTime = `${Y}-${M}-${D} ${h}:${m}:${s}`;
    return resultTime;
  };

  // handleBasicInfoSubmit = () => {
  //   this.setState({
  //     baseInfoObject: this.getValue(),
  //   });
  // }

  // ===================================
  // render
  // ===================================

  render() {
    const { form, editable, editedItem } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        sm: { span: 8 },
      },
      wrapperCol: {
        sm: { span: 15 },
      },
    };

    return (
      <Form onSubmit={this.handleBasicInfoSubmit}>
        <Row>
          <Col span={6}>
            <Form.Item
              {...formItemLayout}
              label={formatMessage({ id: 'SafetyConfig.EntryCode', defaultMessage: '条目编码' })}
            >
              {getFieldDecorator('itemCode', {
                rules: [
                  {
                    required: true,
                    message: `${formatMessage({
                      id: 'SafetyConfig.EntryCodeTip',
                      defaultMessage: '请输入条目编码',
                    })}`,
                  },
                  {
                    validator: codeValidator,
                  },
                ],
                initialValue: editedItem && editedItem.itemCode ? editedItem.itemCode : '',
              })(
                <Input
                  placeholder={formatMessage({ id: 'COMMON_ENTER_TIP', defaultMessage: '请输入' })}
                  disabled={!editable}
                  onContextMenu={false}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              {...formItemLayout}
              label={formatMessage({ id: 'FieldConfirm.EntryName', defaultMessage: '条目名称' })}
            >
              {getFieldDecorator('itemName', {
                rules: [
                  {
                    required: true,
                    message: `${formatMessage({
                      id: 'SafetyConfig.EntryNameTip',
                      defaultMessage: '请填写条目名称',
                    })}`,
                  },
                  {
                    max: 20,
                    message: `${formatMessage({
                      id: 'ExportWatermarkConfig.charactersMaximum',
                      defaultMessage: '最大长度20个字符',
                    })}`,
                  },
                ],
                initialValue: editedItem && editedItem.itemName ? editedItem.itemName : '',
              })(
                <Input
                  placeholder={formatMessage({ id: 'COMMON_ENTER_TIP', defaultMessage: '请输入' })}
                  disabled={!editable}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              {...formItemLayout}
              label={formatMessage({
                id: 'SafetyConfig.ExecutionTime',
                defaultMessage: '执行时间',
              })}
            >
              {getFieldDecorator('scheduleTime', {
                rules: [
                  {
                    required: true,
                    message: `${formatMessage({
                      id: 'SafetyConfig.ExecutionTimeTip',
                      defaultMessage: '请选择执行时间',
                    })}`,
                  },
                ],
                initialValue:
                  editedItem && editedItem.scheduleTime
                    ? moment(this.toTimestr(editedItem.scheduleTime), 'YYYY-MM-DD HH:mm:ss')
                    : undefined,
              })(
                <DatePicker
                  showTime
                  placeholder={formatMessage({
                    id: 'SafetyConfig.ExecutionTimeTip',
                    defaultMessage: '请选择执行时间',
                  })}
                  disabled={!editable}
                  format="YYYY-MM-DD HH:mm:ss"
                />
              )}
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              {...formItemLayout}
              label={formatMessage({
                id: 'SafetyConfig.ExecutionCycle',
                defaultMessage: '执行周期',
              })}
            >
              {getFieldDecorator('scheduleType', {
                rules: [
                  {
                    required: true,
                    message: `${formatMessage({
                      id: 'SafetyConfig.ExecutionCycleTip',
                      defaultMessage: '请选择执行周期',
                    })}`,
                  },
                ],
                initialValue: editedItem && editedItem.scheduleType ? editedItem.scheduleType : '',
              })(
                <Select
                  placeholder={formatMessage({
                    id: 'SafetyConfig.ExecutionCycleTip',
                    defaultMessage: '请选择执行周期',
                  })}
                  disabled={!editable}
                >
                  <Option value="1">
                    {formatMessage({ id: 'SafetyConfig.Day', defaultMessage: '日' })}
                  </Option>
                  <Option value="2">
                    {formatMessage({ id: 'SafetyConfig.Month', defaultMessage: '月' })}
                  </Option>
                  <Option value="3">
                    {formatMessage({ id: 'SafetyConfig.Aperiodic', defaultMessage: '非周期' })}
                  </Option>
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
export default BaseInfo;
