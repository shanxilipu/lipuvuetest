import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { Icon, Input, Button, Form, Select, DatePicker, Table } from 'antd';

import moment from 'moment';
import { connect } from 'dva';

const { RangePicker } = DatePicker;
const { Option } = Select;

@Form.create()
@connect(({ sendCheckRule, loading }) => ({
  data: sendCheckRule.data,
  total: sendCheckRule.total,
  isLoading: loading.effects['sendCheckRule/queryCodeSend'],
  pageIndex: sendCheckRule.pageIndex,
  pageSize: sendCheckRule.pageSize,
}))
class sendCheck extends Component {
  componentWillMount = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'sendCheckRule/queryCodeSend',
      payload: {
        createDateStart: '',
        createDateEnd: '',
        sendDateStart: '',
        sendDateEnd: '',
        userCode: '',
        mobilePhone: '',
        msgType: '',
        state: '',
        // pageIndex: 1
      },
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { createDate = ['', ''], sendDate = ['', ''] } = values;
        let createDateStart = '';
        let createDateEnd = '';
        let sendDateStart = '';
        let sendDateEnd = '';
        [createDateStart, createDateEnd] = createDate;
        [sendDateStart, sendDateEnd] = sendDate;
        if (createDateStart != '' && createDateEnd != '') {
          createDateStart = moment(createDateStart).format('YYYY-MM-DD HH:mm:ss');
          createDateEnd = moment(createDateEnd).format('YYYY-MM-DD HH:mm:ss');
        }
        if (sendDateStart != '' && sendDateEnd != '') {
          sendDateStart = moment(sendDateStart).format('YYYY-MM-DD HH:mm:ss');
          sendDateEnd = moment(sendDateEnd).format('YYYY-MM-DD HH:mm:ss');
        }
        if (createDate.length === 0) {
          createDateStart = '';
          createDateEnd = '';
        }
        if (sendDate.length === 0) {
          sendDateStart = '';
          sendDateEnd = '';
        }
        dispatch({
          type: 'sendCheckRule/queryCodeSend',
          payload: {
            createDateStart,
            createDateEnd,
            sendDateStart,
            sendDateEnd,
            ...values,
          },
        });
      }
    });
  };

  handleTableChange = (pageIndex, pageSize) => {
    const { form, pageSize: prevPageSize, dispatch } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { createDate = ['', ''], sendDate = ['', ''] } = values;
        let createDateStart = '';
        let createDateEnd = '';
        let sendDateStart = '';
        let sendDateEnd = '';
        [createDateStart, createDateEnd] = createDate;
        [sendDateStart, sendDateEnd] = sendDate;
        if (createDateStart != '' && createDateEnd != '') {
          createDateStart = moment(createDateStart).format('YYYY-MM-DD HH:mm:ss');
          createDateEnd = moment(createDateEnd).format('YYYY-MM-DD HH:mm:ss');
        }
        if (sendDateStart != '' && sendDateEnd != '') {
          sendDateStart = moment(sendDateStart).format('YYYY-MM-DD HH:mm:ss');
          sendDateEnd = moment(sendDateEnd).format('YYYY-MM-DD HH:mm:ss');
        }
        if (createDate.length === 0) {
          createDateStart = '';
          createDateEnd = '';
        }
        if (sendDate.length === 0) {
          sendDateStart = '';
          sendDateEnd = '';
        }
        dispatch({
          type: 'sendCheckRule/queryCodeSend',
          payload: {
            pageIndex: prevPageSize !== pageSize ? 1 : pageIndex,
            pageSize,
            createDateStart,
            createDateEnd,
            sendDateStart,
            sendDateEnd,
            ...values,
          },
        });
      }
    });
  };

  render() {
    const { form, isLoading, data, total, pageSize = 10, pageIndex = 1 } = this.props;
    const { getFieldDecorator } = form;
    const pagination = {
      total,
      showQuickJumper: true,
      showSizeChanger: true,
      onChange: this.handleTableChange,
      onShowSizeChange: this.handleTableChange,
      current: pageIndex,
    };
    const columns = [
      {
        title: `${formatMessage({ id: 'CodeManagement.SerialNumber', defaultMessage: '序号' })}`,
        dataIndex: 'index',
        render: (text, record, index) => {
          // 当前页数减1乘以每一页页数再加当前页序号+1
          return `${(pageIndex - 1) * pageSize + (index + 1)}`;
        },
      },
      {
        title: `${formatMessage({ id: 'waterMark.createTime', defaultMessage: '生成时间' })}`,
        dataIndex: 'createDate',
        sorter: (a, b) => a.createDate - b.createDate,
        render: record => {
          return moment(record).format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        title: `${formatMessage({ id: 'CodeManagement.SendTime', defaultMessage: '发送时间' })}`,
        dataIndex: 'sendDate',
        sorter: (a, b) => a.sendDate - b.sendDate,
        render: record => {
          if (record === null) {
            return '';
          }
          return moment(record).format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        title: `${formatMessage({ id: 'auditManagement.UserCode', defaultMessage: '用户编码' })}`,
        dataIndex: 'userCode',
      },
      {
        title: `${formatMessage({
          id: 'applySysUserManagement.CellphoneNumber',
          defaultMessage: '手机号码',
        })}`,
        dataIndex: 'mobilePhone',
      },
      {
        title: `${formatMessage({
          id: 'CodeManagement.VerificationCodeType',
          defaultMessage: '验证码类型',
        })}`,
        dataIndex: 'msgType',
        render: val => {
          if (val === '1') {
            return `${formatMessage({
              id: 'CodeManagement.SystemLoginVerification',
              defaultMessage: '系统登录验证',
            })}`;
          }
          if (val === '2') {
            return `${formatMessage({
              id: 'CodeManagement.PasswordModificationVerification',
              defaultMessage: '密码修改验证',
            })}`;
          }
          if (val === '3') {
            return `${formatMessage({
              id: 'CodeManagement.TreasuryDesensitizationVerification',
              defaultMessage: '金库脱敏验证',
            })}`;
          }
        },
        sorter: (a, b) => a.msgType - b.msgType,
      },
      {
        title: `${formatMessage({
          id: 'CodeManagement.VerificationCode',
          defaultMessage: '验证码',
        })}`,
        dataIndex: 'message',
      },
      {
        title: `${formatMessage({
          id: 'CodeManagement.EffectiveTime',
          defaultMessage: '有效时间',
        })}`,
        dataIndex: 'effectiveMinutes',
      },
      {
        title: `${formatMessage({
          id: 'CodeManagement.VerificationCodeStatus',
          defaultMessage: '验证码状态',
        })}`,
        dataIndex: 'state',
        render: val => {
          if (val === '1') {
            return `${formatMessage({
              id: 'CodeManagement.Generating',
              defaultMessage: '正在生成',
            })}`;
          }
          if (val === '2') {
            return `${formatMessage({ id: 'CodeManagement.Sending', defaultMessage: '正在发送' })}`;
          }
          if (val === '3') {
            return `${formatMessage({
              id: 'CodeManagement.HasBeenSent',
              defaultMessage: '已经发送',
            })}`;
          }
          if (val === '4') {
            return `${formatMessage({
              id: 'CodeManagement.AlreadyUsed',
              defaultMessage: '已经使用',
            })}`;
          }
          if (val === '5') {
            return `${formatMessage({
              id: 'CodeManagement.FailedToSend',
              defaultMessage: '发送失败',
            })}`;
          }
          if (val === '6') {
            return `${formatMessage({
              id: 'CodeManagement.HasExpired',
              defaultMessage: '已经失效',
            })}`;
          }
        },
        sorter: (a, b) => a.state - b.state,
      },
    ];
    return (
      <div>
        <Form layout="inline" onSubmit={this.handleSubmit}>
          <Form.Item
            label={formatMessage({ id: 'auditManagement.UserCode', defaultMessage: '用户编码' })}
          >
            {getFieldDecorator('userCode', {
              // rules: [{ required: true, message: '请输入内容!' }],
            })(
              <Input
                placeholder={formatMessage({ id: 'COMMON_ENTER_TIP', defaultMessage: '请输入' })}
              />
            )}
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'applySysUserManagement.CellphoneNumber',
              defaultMessage: '手机号码',
            })}
          >
            {getFieldDecorator('mobilePhone', {
              // rules: [{ pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号码!' }],
            })(
              <Input
                placeholder={formatMessage({ id: 'COMMON_ENTER_TIP', defaultMessage: '请输入' })}
              />
            )}
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'CodeManagement.AuthenticationType',
              defaultMessage: '验证类型',
            })}
          >
            {getFieldDecorator('msgType', {
              initialValue: '',
            })(
              <Select style={{ width: 150 }}>
                <Option value="1">
                  {formatMessage({
                    id: 'CodeManagement.SystemLoginVerification',
                    defaultMessage: '系统登录验证',
                  })}
                </Option>
                <Option value="2">
                  {formatMessage({
                    id: 'CodeManagement.PasswordModificationVerification',
                    defaultMessage: '密码修改验证',
                  })}
                </Option>
                <Option value="3">
                  {formatMessage({
                    id: 'CodeManagement.TreasuryDesensitizationVerification',
                    defaultMessage: '金库脱敏验证',
                  })}
                </Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'CodeManagement.VerificationCodeStatus',
              defaultMessage: '验证码状态',
            })}
          >
            {getFieldDecorator('state', {
              initialValue: '',
            })(
              <Select style={{ width: 120 }}>
                <Option value="1">
                  {formatMessage({ id: 'CodeManagement.Generating', defaultMessage: '正在生成' })}
                </Option>
                <Option value="2">
                  {formatMessage({ id: 'CodeManagement.Sending', defaultMessage: '正在发送' })}
                </Option>
                <Option value="3">
                  {formatMessage({ id: 'CodeManagement.HasBeenSent', defaultMessage: '已经发送' })}
                </Option>
                <Option value="4">
                  {formatMessage({ id: 'CodeManagement.AlreadyUsed', defaultMessage: '已经使用' })}
                </Option>
                <Option value="5">
                  {formatMessage({ id: 'CodeManagement.FailedToSend', defaultMessage: '发送失败' })}
                </Option>
                <Option value="6">
                  {formatMessage({ id: 'CodeManagement.HasExpired', defaultMessage: '已经失效' })}
                </Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label={formatMessage({ id: 'waterMark.createTime', defaultMessage: '生成时间' })}
          >
            {getFieldDecorator('createDate', {
              // rules: [{ required: true, message: '请选择!' }],
            })(<RangePicker showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" />)}
          </Form.Item>
          <Form.Item
            label={formatMessage({ id: 'CodeManagement.SendTime', defaultMessage: '发送时间' })}
          >
            {getFieldDecorator('sendDate', {
              // rules: [{ required: true, message: '请选择!' }],
            })(<RangePicker showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" />)}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              <Icon type="search" />
              {formatMessage({ id: 'BTN_SEARCH', defaultMessage: '查询' })}
            </Button>
          </Form.Item>
        </Form>
        <div style={{ borderTop: '2px #eee solid', margin: '10px 0' }} />
        <Table
          loading={isLoading}
          rowKey={(record, index) => index}
          columns={columns}
          dataSource={data}
          pagination={pagination}
        />
      </div>
    );
  }
}

export default sendCheck;
