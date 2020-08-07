import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import { Col, Form, Row, Select, message } from 'antd';
import { qryAllSafeSensitiveLevel } from '@/services/sensitiveManagement/levelConfig';
import { qryAllMeasureConfig } from '@/services/sensitiveManagement/measureConfig';
import { checkLanguageIsEnglish } from '@/utils/utils';

const { Option } = Select;
const FormItem = Form.Item;

@Form.create()
class SensitiveRule extends PureComponent {
  state = {
    levelType: [],
    desensitizeType: [],
    // sensitiveObject: {},
  };
  // ===================================
  // life cycle
  // ===================================

  componentDidMount() {
    const { viewDidMountHandler } = this.props;

    if (viewDidMountHandler) {
      viewDidMountHandler('SensitiveRule', this);
    }

    this.listAllSafeSensitiveLevel();
    this.listAllSafeDesensitizeType();
  }

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

  // handleSensitiveRuleSubmit = () => {
  //   this.setState({
  //     sensitiveObject: this.getValue(),
  //   });
  // }

  resetModel = () => {
    const { form } = this.props;
    form.resetFields();
  };

  listAllSafeSensitiveLevel = () => {
    const params = {};
    qryAllSafeSensitiveLevel(params).then(result => {
      if (!result) return;
      const { resultCode, resultMsg } = result;
      if (resultCode !== '0') {
        message.error(resultMsg);
      } else {
        const { resultObject } = result;
        this.setState({
          levelType: resultObject,
        });
      }
    });
  };

  listAllSafeDesensitizeType = () => {
    const params = {};
    qryAllMeasureConfig(params).then(result => {
      if (!result) return;
      const { resultCode, resultMsg } = result;
      if (resultCode !== '0') {
        message.error(resultMsg);
      } else {
        const { resultObject } = result;
        this.setState({
          desensitizeType: resultObject,
        });
      }
    });
  };

  getLevelType = () => {
    const { levelType } = this.state;
    const arr = levelType.map((item, index) => {
      return (
        <Option title={item.levelName} key={index} value={item.id}>
          {item.levelName}
        </Option>
      );
    });
    // arr.unshift(
    //   <Option key="" value="">
    //     请选择...
    //   </Option>
    // );
    return arr;
  };

  getDesensitizeType = () => {
    const { desensitizeType } = this.state;
    const arr = desensitizeType.map((item, index) => {
      return (
        <Option title={item.desensitizeName} key={index} value={item.id}>
          {item.desensitizeName}
        </Option>
      );
    });
    // arr.unshift(
    //   <Option key="" value="">
    //     请选择...
    //   </Option>
    // );
    return arr;
  };

  // ===================================
  // render
  // ===================================

  render() {
    const { form, editable, editedItem } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        sm: { span: checkLanguageIsEnglish() ? 12 : 8 },
      },
      wrapperCol: {
        sm: { span: checkLanguageIsEnglish() ? 12 : 16 },
      },
    };
    return (
      <Form>
        <Row>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={formatMessage({
                id: 'SafetyConfig.OverwriteOriginalSettings',
                defaultMessage: '覆盖原设置',
              })}
            >
              {getFieldDecorator('isCovert', {
                rules: [
                  {
                    required: true,
                    message: `${formatMessage({
                      id: 'SafetyConfig.originalSettingsTip',
                      defaultMessage: '请选择覆盖原设置',
                    })}`,
                  },
                ],
                initialValue: editedItem && editedItem.isCovert ? editedItem.isCovert : undefined,
              })(
                <Select
                  placeholder={formatMessage({
                    id: 'COMMON_SELECT_ICON',
                    defaultMessage: '请选择',
                  })}
                  disabled={!editable}
                >
                  <Option value="1">
                    {formatMessage({ id: 'COMMON_YES', defaultMessage: '是' })}
                  </Option>
                  <Option value="2">
                    {formatMessage({ id: 'COMMON_NO', defaultMessage: '否' })}
                  </Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={formatMessage({
                id: 'FieldInquire.SensitivityLevel',
                defaultMessage: '敏感级别',
              })}
            >
              {getFieldDecorator('levelId', {
                rules: [
                  {
                    required: true,
                    message: `${formatMessage({
                      id: 'COMMON_SELECT_ICON',
                      defaultMessage: '请选择',
                    })}`,
                  },
                ],
                initialValue: editedItem && editedItem.levelId ? editedItem.levelId : undefined,
              })(
                <Select
                  placeholder={formatMessage({
                    id: 'COMMON_SELECT_ICON',
                    defaultMessage: '请选择',
                  })}
                  disabled={!editable}
                >
                  {this.getLevelType()}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={formatMessage({
                id: 'FieldInquire.DesensitizationMeasures',
                defaultMessage: '脱敏措施',
              })}
            >
              {getFieldDecorator('desensitizeId', {
                rules: [
                  {
                    required: true,
                    message: `${formatMessage({
                      id: 'COMMON_SELECT_ICON',
                      defaultMessage: '请选择',
                    })}`,
                  },
                ],
                initialValue:
                  editedItem && editedItem.desensitizeId ? editedItem.desensitizeId : undefined,
              })(
                <Select
                  placeholder={formatMessage({
                    id: 'COMMON_SELECT_ICON',
                    defaultMessage: '请选择',
                  })}
                  disabled={!editable}
                >
                  {this.getDesensitizeType()}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
export default SensitiveRule;
