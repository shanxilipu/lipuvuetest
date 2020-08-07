import React from 'react';
import { Card, Form, Row, TimePicker, TreeSelect, Button, Popconfirm } from 'antd';
import { formatMessage } from 'umi/locale';
import moment from 'moment';

class AllowAccessTime extends React.PureComponent {
  // 清除错误校验
  handleChange = () => {
    const { form } = this.props;
    const startVal = form.getFieldValue('ALLOW_TIME_START');
    const endVal = form.getFieldValue('ALLOW_TIME_END');
    if (form.getFieldValue('ALLOW_TIME_START') !== '') {
      form.resetFields(['ALLOW_TIME_START']);
      form.setFieldsValue({ ALLOW_TIME_START: startVal });
    }
    if (form.getFieldValue('ALLOW_TIME_END') !== '') {
      form.resetFields(['ALLOW_TIME_END']);
      form.setFieldsValue({ ALLOW_TIME_END: endVal });
    }
  };

  handleValidator = (rule, value, callback) => {
    const { form } = this.props;
    let messageTip = '';
    // 不能只填一个时间
    if (
      (!form.getFieldValue('ALLOW_TIME_START') && form.getFieldValue('ALLOW_TIME_END')) ||
      (!form.getFieldValue('ALLOW_TIME_END') && form.getFieldValue('ALLOW_TIME_START'))
    ) {
      messageTip = `${formatMessage({
        id: 'AserCodeLinkConfig.FillInAnotherTime',
        defaultMessage: '请填写另一个时间!',
      })}`;
      callback(messageTip);
    }
    // 计算相差的时间
    const ALLOW_TIME_START = moment(form.getFieldValue('ALLOW_TIME_START'), 'HH:mm:ss');
    const ALLOW_TIME_END = moment(form.getFieldValue('ALLOW_TIME_END'), 'HH:mm:ss');
    const dValue = ALLOW_TIME_END.diff(moment(ALLOW_TIME_START));
    if (dValue <= 0) {
      messageTip = `${formatMessage({
        id: 'AserCodeLinkConfig.EndTimeTip',
        defaultMessage: '结束时间不能小于起始时间!',
      })}`;
      callback(messageTip);
    }
    callback();
  };

  getInitialValue = (dataIndex, value) => {
    if (dataIndex === 'ALLOW_DAY') {
      if (typeof value === 'string') {
        return value ? value.split(',') : [];
      }
      return value;
    }
    if (typeof value === 'string') {
      return value ? moment(value, 'HH:mm:ss') : '';
    }
    return value;
  };

  render() {
    const {
      titleExtra,
      initialValues = {},
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Card
        title={formatMessage({
          id: 'AserCodeLinkConfig.SelectTime',
          defaultMessage: '选择时间',
        })}
        type="inner"
        size="small"
        extra={titleExtra || null}
      >
        <Form layout="inline">
          <Row>
            <Form.Item
              label={formatMessage({
                id: 'AserCodeLinkConfig.Sunday',
                defaultMessage: '周天',
              })}
            >
              {getFieldDecorator('ALLOW_DAY', {
                rules: [
                  {
                    required: true,
                    message: `${formatMessage({
                      id: 'COMMON_SELECT_ICON',
                      defaultMessage: '请选择',
                    })}`,
                  },
                ],
                initialValue: this.getInitialValue('ALLOW_DAY', initialValues.ALLOW_DAY),
              })(
                <TreeSelect
                  treeCheckable
                  style={{ width: '459px' }}
                  searchPlaceholder={formatMessage({
                    id: 'AserCodeLinkConfig.SelectTimeTip',
                    defaultMessage: '请选择时间',
                  })}
                  treeData={[
                    {
                      title: `${formatMessage({
                        id: 'AserCodeLinkConfig.Monday',
                        defaultMessage: '周一',
                      })}`,
                      value: '1',
                      key: '0-0',
                    },
                    {
                      title: `${formatMessage({
                        id: 'AserCodeLinkConfig.Tuesday',
                        defaultMessage: '周二',
                      })}`,
                      value: '2',
                      key: '0-1',
                    },
                    {
                      title: `${formatMessage({
                        id: 'AserCodeLinkConfig.Wednesday',
                        defaultMessage: '周三',
                      })}`,
                      value: '3',
                      key: '0-2',
                    },
                    {
                      title: `${formatMessage({
                        id: 'AserCodeLinkConfig.Thursday',
                        defaultMessage: '周四',
                      })}`,
                      value: '4',
                      key: '0-3',
                    },
                    {
                      title: `${formatMessage({
                        id: 'AserCodeLinkConfig.Friday',
                        defaultMessage: '周五',
                      })}`,
                      value: '5',
                      key: '0-4',
                    },
                    {
                      title: `${formatMessage({
                        id: 'AserCodeLinkConfig.Saturday',
                        defaultMessage: '周六',
                      })}`,
                      value: '6',
                      key: '0-5',
                    },
                    {
                      title: `${formatMessage({
                        id: 'AserCodeLinkConfig.Sunday',
                        defaultMessage: '周天',
                      })}`,
                      value: '7',
                      key: '0-6',
                    },
                  ]}
                />
              )}
            </Form.Item>
          </Row>
          <Form.Item
            label={formatMessage({
              id: 'AserCodeLinkConfig.Time',
              defaultMessage: '时间',
            })}
          >
            {getFieldDecorator('ALLOW_TIME_START', {
              rules: [
                {
                  required: true,
                  message: `${formatMessage({
                    id: 'COMMON_SELECT_ICON',
                    defaultMessage: '请选择',
                  })}`,
                },
                {
                  validator: (rule, value, callback) => this.handleValidator(rule, value, callback),
                },
              ],
              initialValue: this.getInitialValue(
                'ALLOW_TIME_START',
                initialValues.ALLOW_TIME_START
              ),
            })(
              <TimePicker
                placeholder={formatMessage({
                  id: 'AserCodeLinkConfig.StartTime',
                  defaultMessage: '开始时间',
                })}
                format="HH:mm:ss"
                style={{ width: 200 }}
                onChange={this.handleChange}
              />
            )}
          </Form.Item>
          <Form.Item>～</Form.Item>
          <Form.Item>
            {getFieldDecorator('ALLOW_TIME_END', {
              rules: [
                {
                  required: true,
                  message: `${formatMessage({
                    id: 'COMMON_SELECT_ICON',
                    defaultMessage: '请选择',
                  })}`,
                },
                {
                  validator: (rule, value, callback) => this.handleValidator(rule, value, callback),
                },
              ],
              initialValue: this.getInitialValue('ALLOW_TIME_END', initialValues.ALLOW_TIME_END),
            })(
              <TimePicker
                placeholder={formatMessage({
                  id: 'AserCodeLinkConfig.EndTime',
                  defaultMessage: '结束时间',
                })}
                format="HH:mm:ss"
                style={{ width: 213 }}
                onChange={this.handleChange}
              />
            )}
          </Form.Item>
        </Form>
      </Card>
    );
  }
}

@Form.create()
class AllowAccessTimeForm extends React.PureComponent {
  handleSaveData = () => {
    const {
      handleSaveData,
      form: { validateFields },
    } = this.props;
    validateFields((err, values) => {
      if (err) {
        return false;
      }
      const params = { ...values };
      const { ALLOW_TIME_START, ALLOW_TIME_END, ALLOW_DAY } = values;
      params.ALLOW_TIME_START = ALLOW_TIME_START ? moment(ALLOW_TIME_START).format('HH:mm:ss') : '';
      params.ALLOW_TIME_END = ALLOW_TIME_END ? moment(ALLOW_TIME_END).format('HH:mm:ss') : '';
      params.ALLOW_DAY = ALLOW_DAY && ALLOW_DAY.length ? ALLOW_DAY.join(',') : '';
      handleSaveData(params);
    });
  };

  handleDeleteData = () => {
    const { handleDeleteData } = this.props;
    handleDeleteData();
  };

  render() {
    const { form } = this.props;
    return (
      <AllowAccessTime
        {...this.props}
        form={form}
        titleExtra={
          <>
            <Button type="primary" onClick={this.handleSaveData}>
              {formatMessage({ id: 'COMMON_SAVE', defaultMessage: '保存' })}
            </Button>
            <Popconfirm
              title={formatMessage({ id: 'CONFIRM_DELETION', defaultMessage: '确认删除' })}
              onConfirm={this.handleDeleteData}
            >
              <Button style={{ marginLeft: 10 }}>
                {formatMessage({ id: 'COMMON_DELETE', defaultMessage: '删除' })}
              </Button>
            </Popconfirm>
          </>
        }
      />
    );
  }
}
export { AllowAccessTimeForm, AllowAccessTime };
