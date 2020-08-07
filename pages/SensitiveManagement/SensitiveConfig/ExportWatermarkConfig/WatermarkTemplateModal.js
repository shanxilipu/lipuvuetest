import React from 'react';
import * as _ from 'lodash';
import { formatMessage } from 'umi/locale';
import { Form, Modal, Checkbox, Input, Row, Col, message } from 'antd';
import { COMMON_RULE, DEFAULT_FORM_LAYOUT } from '@/pages/common/const';
import { updateWatermarkTemplate } from '@/services/sensitiveManagement/waterMarkConfig';
import { checkLanguageIsEnglish, defaultHandleResponse } from '@/utils/utils';

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
const fieldNameMark = checkLanguageIsEnglish() ? 'enUsNote' : 'zhCnNote';

@Form.create()
class WatermarkTemplateModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmLoading: false,
      fieldTitleInputValue: '', // 选项中，如果字段名称为标题，则多出一个输入框填写标题
    };
  }

  componentDidUpdate(prevProps) {
    const { visible } = this.props;
    if (visible && !prevProps.visible) {
      this.setInitialFieldTitle();
    }
  }

  /**
   * 设置标题输入框的值
   */
  setInitialFieldTitle = () => {
    const {
      template: { fieldList = [] },
    } = this.props;
    const fieldObj = fieldList.find(o => `${o.fieldId}` === '1') || {};
    const fieldTitleInputValue = fieldObj.templateName || '';
    this.setState({ fieldTitleInputValue });
  };

  getCheckboxFieldsInitialValue = () => {
    const {
      template: { fieldList = [] },
    } = this.props;
    return fieldList.map(o => o.fieldId);
  };

  handleSubmit = () => {
    const {
      form: { validateFields },
      template,
      onOk,
      onCancel,
      allFields,
    } = this.props;
    const { fieldTitleInputValue } = this.state;
    validateFields((err, values) => {
      if (err) {
        return false;
      }
      const { templateFields, templateCode, templateName } = values;
      if (templateFields.includes(1) || templateFields.includes('1')) {
        if (!fieldTitleInputValue) {
          message.warning(
            formatMessage({
              id: 'ExportWatermarkConfig.inputTitleWarning',
              defaultMessage: '请填写标题值',
            })
          );
          return false;
        }
      }
      const fieldList = templateFields.map(fieldId => {
        const origin = allFields.find(o => o.id === fieldId) || {};
        const obj = { templateName: origin.templateName, fieldId };
        if (`${fieldId}` === '1') {
          obj.templateName = fieldTitleInputValue;
        }
        if (template.id) {
          obj.watermarkId = template.id;
        }
        return obj;
      });
      const payload = { ...template, templateCode, templateName, fieldList };
      this.setState({ confirmLoading: true });
      updateWatermarkTemplate(payload).then(response => {
        this.setState({ confirmLoading: false });
        defaultHandleResponse(response, () => {
          message.success(formatMessage({ id: 'COMMON_SAVE_SUCCESS', defaultMessage: '保存成功' }));
          onOk();
          onCancel();
        });
      });
    });
  };

  render() {
    const {
      visible,
      onCancel,
      template,
      allFields,
      form: { getFieldDecorator },
    } = this.props;
    const { confirmLoading, fieldTitleInputValue } = this.state;
    return (
      <Modal
        width={800}
        title={
          _.isEmpty(template)
            ? formatMessage({
                id: 'ExportWatermarkConfig.NewWatermarkTemplate',
                defaultMessage: '新增水印模板',
              })
            : formatMessage({
                id: 'ExportWatermarkConfig.EditWatermarkTemplate',
                defaultMessage: '编辑水印模板',
              })
        }
        destroyOnClose
        visible={visible}
        onCancel={onCancel}
        onOk={this.handleSubmit}
        confirmLoading={confirmLoading}
        okText={formatMessage({ id: 'COMMON_SAVE', defaultMessage: '保存' })}
      >
        <Form {...DEFAULT_FORM_LAYOUT}>
          <Form.Item
            label={formatMessage({
              id: 'ExportWatermarkConfig.TemplateCode',
              defaultMessage: '模板编码',
            })}
          >
            {getFieldDecorator('templateCode', {
              rules: [COMMON_RULE, { validator: codeValidator }],
              initialValue: template.templateCode || '',
            })(
              <Input
                placeholder={formatMessage({ id: 'COMMON_ENTER_TIP', defaultMessage: '请输入' })}
              />
            )}
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'ExportWatermarkConfig.TemplateName',
              defaultMessage: '模板名称',
            })}
          >
            {getFieldDecorator('templateName', {
              rules: [
                COMMON_RULE,
                {
                  max: 20,
                  message: `${formatMessage({
                    id: 'ExportWatermarkConfig.charactersMaximum',
                    defaultMessage: '最大长度20个字符',
                  })}`,
                },
              ],
              initialValue: template.templateName || '',
            })(
              <Input
                placeholder={formatMessage({ id: 'COMMON_ENTER_TIP', defaultMessage: '请输入' })}
              />
            )}
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'ExportWatermarkConfig.ShowOptions',
              defaultMessage: '展示选项',
            })}
          >
            {getFieldDecorator('templateFields', {
              rules: [COMMON_RULE],
              initialValue: this.getCheckboxFieldsInitialValue(),
            })(
              <Checkbox.Group style={{ width: '100%' }}>
                <Row>
                  {// 和后端规定，id是1的就是标题
                  allFields.map(field =>
                    `${field.id}` === '1' ? (
                      <Col span={24} style={{ marginTop: 5, marginBottom: 5 }}>
                        <Checkbox key={field.id} value={field.id}>
                          {field[fieldNameMark]}
                        </Checkbox>
                        <Input
                          placeholder={formatMessage({
                            id: 'COMMON_ENTER_TIP',
                            defaultMessage: '请输入',
                          })}
                          style={{ width: '35%' }}
                          value={fieldTitleInputValue}
                          onChange={e => this.setState({ fieldTitleInputValue: e.target.value })}
                        />
                      </Col>
                    ) : (
                      <Col span={12} style={{ marginBottom: 10 }}>
                        <Checkbox key={field.id} value={field.id}>
                          {field[fieldNameMark]}
                        </Checkbox>
                      </Col>
                    )
                  )}
                </Row>
              </Checkbox.Group>
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
export default WatermarkTemplateModal;
