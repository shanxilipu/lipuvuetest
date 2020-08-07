import React from 'react';
import * as _ from 'lodash';
import { Modal, Form, Input, Select, Checkbox, InputNumber, Row, Col, message } from 'antd';
import { formatMessage } from 'umi/locale';
import { defaultFormItemLayout, commonRules } from '@/utils/const';
import { checkLanguageIsEnglish, defaultHandleResponse, randomWord } from '@/utils/utils';
import {
  // ALL_PERIOD_UNITS,
  ALL_STORAGE_UNITS,
  getRepeatedPeriodInitialValue,
  getStorageInitialValue,
} from './helper';
import { saveCollectionAlarm } from '@/services/auditManagement/collectionAlarm';
import styles from './index.less';

const fullRowFormItemLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 24 },
};

const getRandomTaskName = () => `dat_col_${randomWord(false, 8)}`;

@Form.create()
class CollectionAlarmModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmLoading: false,
      rules: {},
      randomTaskName: getRandomTaskName(),
    };
  }

  componentDidUpdate(prevProps) {
    const { visible } = this.props;
    if (visible && !prevProps.visible) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ randomTaskName: getRandomTaskName() });
      this.setInitialRules();
    }
  }

  setRule = (name, flag) => {
    const { rules } = this.state;
    this.setState({ rules: { ...rules, [name]: flag } });
  };

  getInputRules = name => {
    const { rules } = this.state;
    let required = rules[name];
    if (_.isUndefined(required)) {
      required = true;
    }
    return required ? [...commonRules] : [];
  };

  setInitialRules = () => {
    const { item } = this.props;
    const names = ['repeatCheckEnable', 'overtransCheckEnable', 'overstoreCheckEnable'];
    const rules = {};
    names.forEach(n => {
      let val = item[n];
      if (_.isUndefined(item[n])) {
        val = true;
      }
      rules[n] = val;
    });
    this.setState({ rules });
  };

  getInitialValue = name => {
    const { item } = this.props;
    const isAdding = _.isEmpty(item);
    if (name === 'repeatCheckPeriod' || name === 'repeatCheckPeriodUnit') {
      if (isAdding) {
        return name === 'repeatCheckPeriod' ? 1 : 24 * 60 * 60; // 初始 1天
      }
      const { value, unit } = getRepeatedPeriodInitialValue(item.repeatCheckPeriod);
      return name === 'repeatCheckPeriod' ? value : unit;
    }
    if (name === 'overstoreThreshold' || name === 'overstoreThresholdUnit') {
      if (isAdding) {
        return name === 'overstoreThreshold' ? 1 : 1024 * 1024 * 1024; // 初始 1GB
      }
      const { value, unit } = getStorageInitialValue(item.overstoreThreshold);
      return name === 'overstoreThreshold' ? value : unit;
    }
    return '';
  };

  handleSubmit = () => {
    const {
      form: { validateFields },
      item,
      onOk,
      onCancel,
    } = this.props;
    validateFields((err, values) => {
      if (err) {
        return false;
      }
      const data = { ...item, ...values };
      const {
        repeatCheckPeriod,
        repeatCheckPeriodUnit,
        overstoreThreshold,
        overstoreThresholdUnit,
      } = data;
      data.repeatCheckPeriod = repeatCheckPeriod * repeatCheckPeriodUnit;
      data.overstoreThreshold = overstoreThreshold * overstoreThresholdUnit;
      delete data.repeatCheckPeriodUnit;
      delete data.overstoreThresholdUnit;
      this.setState({ confirmLoading: true });
      saveCollectionAlarm([data]).then(response => {
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
    const { confirmLoading, randomTaskName } = this.state;
    const {
      item,
      visible,
      onCancel,
      ALL_STATES,
      form: { getFieldDecorator },
    } = this.props;
    const isAdding = _.isEmpty(item);
    const title = isAdding
      ? formatMessage({ id: 'BUTTON_ADD', defaultMessage: '新增' })
      : formatMessage({ id: 'COMMON_EDIT', defaultMessage: '编辑' });
    const commonInputNumberProps = {
      formatter: value => `${value}`.replace('.', ''),
    };
    return (
      <Modal
        width={720}
        title={title}
        destroyOnClose
        visible={visible}
        confirmLoading={confirmLoading}
        onCancel={onCancel}
        onOk={this.handleSubmit}
      >
        <Form {...defaultFormItemLayout}>
          <Form.Item
            label={formatMessage({
              id: 'alarmCollectionConfig.collectionTaskName',
              defaultMessage: '采集任务名称',
            })}
          >
            {getFieldDecorator('taskName', {
              rules: commonRules,
              initialValue: item.taskName || randomTaskName,
            })(
              <Input
                placeholder={formatMessage({
                  id: 'alarmCollectionConfig.collectionTaskName',
                  defaultMessage: '采集任务名称',
                })}
              />
            )}
          </Form.Item>
          <Form.Item label={formatMessage({ id: 'COMMON_STATE', defaultMessage: '状态' })}>
            {getFieldDecorator('state', {
              rules: commonRules,
              initialValue: isAdding ? true : item.state,
            })(
              <Select placeholder={formatMessage({ id: 'COMMON_STATE', defaultMessage: '状态' })}>
                {ALL_STATES.map(o => (
                  <Select.Option key={o.label} value={o.value}>
                    {o.label}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Row>
            <Col xs={6} />
            <Col xs={16} className={styles.modalParamsFormItemsCon}>
              <Col span={24}>
                <Col span={8}>
                  <Form.Item {...fullRowFormItemLayout}>
                    {getFieldDecorator('repeatCheckEnable', {
                      valuePropName: 'checked',
                      initialValue: isAdding ? true : item.repeatCheckEnable,
                    })(
                      <Checkbox onChange={e => this.setRule('repeatCheckEnable', e.target.checked)}>
                        {formatMessage({
                          id: 'alarmCollectionConfig.repeatCollectionAlarmThreshold',
                          defaultMessage: '重复采集告警阈值',
                        })}
                        :
                      </Checkbox>
                    )}
                  </Form.Item>
                </Col>
                <Col span={16} className={styles.paramsCon}>
                  <span>
                    {formatMessage({ id: 'alarmCollectionConfig.every', defaultMessage: '每' })}
                  </span>
                  <Form.Item {...fullRowFormItemLayout}>
                    {getFieldDecorator('repeatCheckPeriod', {
                      initialValue: this.getInitialValue('repeatCheckPeriod'),
                      rules: this.getInputRules('repeatCheckEnable'),
                    })(<InputNumber min={1} max={7} {...commonInputNumberProps} />)}
                  </Form.Item>
                  <Form.Item {...fullRowFormItemLayout}>
                    {getFieldDecorator('repeatCheckPeriodUnit', {
                      initialValue: this.getInitialValue('repeatCheckPeriodUnit'),
                      rules: this.getInputRules('repeatCheckEnable'),
                    })(
                      <Select>
                        <Select.Option value={24 * 60 * 60}>
                          {formatMessage({ id: 'UNIT.DAY', defaultMessage: '天' })}
                        </Select.Option>
                        {/* {ALL_PERIOD_UNITS.map(o => ( */}
                        {/*  <Select.Option key={o.value} value={o.value}> */}
                        {/*    {o.label} */}
                        {/*  </Select.Option> */}
                        {/* ))} */}
                      </Select>
                    )}
                  </Form.Item>
                  <span>
                    {formatMessage({ id: 'alarmCollectionConfig.over', defaultMessage: '超过' })}
                  </span>
                  <Form.Item {...fullRowFormItemLayout}>
                    {getFieldDecorator('repeatMaxTime', {
                      initialValue: item.repeatMaxTime || 1,
                      rules: this.getInputRules('repeatCheckEnable'),
                    })(<InputNumber min={1} max={99} {...commonInputNumberProps} />)}
                  </Form.Item>
                  <span>
                    {formatMessage({ id: 'alarmCollectionConfig.times', defaultMessage: '次' })}
                    {checkLanguageIsEnglish() ? '(s)' : ''}
                  </span>
                </Col>
              </Col>
              <Col span={24}>
                <Col span={8}>
                  <Form.Item {...fullRowFormItemLayout}>
                    {getFieldDecorator('overtransCheckEnable', {
                      valuePropName: 'checked',
                      initialValue: isAdding ? true : item.overtransCheckEnable,
                    })(
                      <Checkbox
                        onChange={e => this.setRule('overtransCheckEnable', e.target.checked)}
                      >
                        {formatMessage({
                          id: 'alarmCollectionConfig.overTransAlarmThreshold',
                          defaultMessage: '传输量超标告警阈值',
                        })}
                        :
                      </Checkbox>
                    )}
                  </Form.Item>
                </Col>
                <Col span={16} className={styles.paramsCon}>
                  <span>{formatMessage({ id: 'alarmCollectionConfig.transDataOver' })}</span>
                  <Form.Item {...fullRowFormItemLayout}>
                    {getFieldDecorator('overtransThreshold', {
                      initialValue: item.overtransThreshold || 1,
                      rules: this.getInputRules('overtransCheckEnable'),
                    })(<InputNumber min={1} max={99999999} {...commonInputNumberProps} />)}
                  </Form.Item>
                  <span>
                    {formatMessage({ id: 'alarmCollectionConfig.rows', defaultMessage: '行' })}
                    {checkLanguageIsEnglish() ? '(s)' : ''}
                  </span>
                </Col>
              </Col>
              <Col span={24}>
                <Col span={8}>
                  <Form.Item {...fullRowFormItemLayout}>
                    {getFieldDecorator('overstoreCheckEnable', {
                      valuePropName: 'checked',
                      initialValue: isAdding ? true : item.overstoreCheckEnable,
                    })(
                      <Checkbox
                        onChange={e => this.setRule('overstoreCheckEnable', e.target.checked)}
                      >
                        {formatMessage({
                          id: 'alarmCollectionConfig.overStoreAlarmThreshold',
                          defaultMessage: '存储量超标告警阈值',
                        })}
                        :
                      </Checkbox>
                    )}
                  </Form.Item>
                </Col>
                <Col span={16} className={styles.paramsCon}>
                  <span>{formatMessage({ id: 'alarmCollectionConfig.storageDataOver' })}</span>
                  <Form.Item {...fullRowFormItemLayout}>
                    {getFieldDecorator('overstoreThreshold', {
                      initialValue: this.getInitialValue('overstoreThreshold'),
                      rules: this.getInputRules('overstoreCheckEnable'),
                    })(<InputNumber min={1} max={1023} {...commonInputNumberProps} />)}
                  </Form.Item>
                  <Form.Item {...fullRowFormItemLayout}>
                    {getFieldDecorator('overstoreThresholdUnit', {
                      initialValue: this.getInitialValue('overstoreThresholdUnit'),
                      rules: this.getInputRules('overstoreCheckEnable'),
                    })(
                      <Select>
                        {ALL_STORAGE_UNITS.map(o => (
                          <Select.Option key={o.value} value={o.value}>
                            {o.label}
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              </Col>
              <Col span={24}>
                <Form.Item {...fullRowFormItemLayout}>
                  {getFieldDecorator('exceptionCheckEnable', {
                    valuePropName: 'checked',
                    initialValue: isAdding ? true : item.exceptionCheckEnable,
                  })(
                    <Checkbox>
                      {formatMessage({
                        id: 'alarmCollectionConfig.abnormalInterrupt',
                        defaultMessage: '异常中断告警',
                      })}
                    </Checkbox>
                  )}
                </Form.Item>
              </Col>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
export default CollectionAlarmModal;
