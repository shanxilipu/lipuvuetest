import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import moment from 'moment';
import { Form, Row, Col, Input, Select, DatePicker, Button, Table, message, Tooltip } from 'antd';
import MyIcon from '@/components/MyIcon';
import { getShowTotalText } from '../tools/utils';
import { getDatabaseLogs } from '../services';
import styles from '../DatabaseOperation.less';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
const EXECUTE_RESULT = [
  { value: 1, label: formatMessage({ id: 'COMMON_SUCCESS' }) },
  { value: 2, label: formatMessage({ id: 'COMMON_FAILED' }) },
  { value: 3, label: formatMessage({ id: 'COMMON_STOPPED' }) },
  { value: 4, label: formatMessage({ id: 'COMMON_OVERTIME' }) },
];

@Form.create()
class SqlHistoryLogs extends Component {
  constructor(props) {
    super(props);
    this.searchParams = {};
    this.state = {
      pageIndex: 1,
      pageSize: 5,
      loading: false,
      logs: {
        pageInfo: { total: 0 },
        rows: [],
      },
    };
  }

  componentDidMount() {
    this.getLogs();
  }

  componentWillReceiveProps(nextProps) {
    const { noteId, executionMessagesMark: nextMark } = nextProps;
    const { executionMessagesMark } = this.props;
    if (noteId && nextMark !== executionMessagesMark) {
      this.getLogs();
    }
  }

  paging = (pageIndex, pageSize) => {
    this.setState({ pageIndex, pageSize }, () => {
      this.getLogs();
    });
  };

  getLogs = () => {
    const { sourceWindow } = this.props;
    const { pageIndex, pageSize } = this.state;
    const params = { pageIndex, pageSize, sourceWindow, ...this.searchParams };
    this.setState({ loading: true });
    getDatabaseLogs(params).then(response => {
      this.setState({ loading: false });
      const { resultCode, resultMsg, resultObject } = response;
      if (resultCode === '0') {
        this.setState({ logs: resultObject });
      } else {
        message.error(resultMsg);
      }
    });
  };

  columns = [
    { title: formatMessage({ id: 'SERIAL_NUMBER' }), dataIndex: 'logId', width: 80 },
    {
      title: formatMessage({ id: 'EXECUTED_DATE' }),
      dataIndex: 'executeDatetime',
      render: text => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      width: 150,
    },
    { title: formatMessage({ id: 'USERMGR_USER_CODE' }), dataIndex: 'userCode', width: 120 },
    {
      title: formatMessage({ id: 'EXECUTE_RESULT' }),
      dataIndex: 'executeStatus',
      render: text => {
        const item = EXECUTE_RESULT.find(o => o.value === text) || {};
        const background = text === 1 ? '#52C41A' : text === 2 ? '#F5222D' : '#FAAD14';
        const label = item.label || '';
        return (
          <div>
            <div className={styles.sqlHistoryDot} style={{ background }} />
            <span>{label}</span>
          </div>
        );
      },
      width: 100,
    },
    {
      title: formatMessage({ id: 'SQL_STATEMENT' }),
      dataIndex: 'sqlScript',
      render: text => {
        const sqlScript = text.length > 100 ? `${text.substring(0, 100)}...` : text;
        return (
          <Tooltip title={sqlScript}>
            <span>{sqlScript}</span>
          </Tooltip>
        );
      },
      width: 240,
    },
  ];

  getColumns = () => {
    const { showMsg } = this.props;
    const columns = this.columns.slice();
    if (showMsg) {
      const { length } = columns;
      columns.splice(length, 0, {
        title: formatMessage({ id: 'EXECUTE_MESSAGE' }),
        dataIndex: 'executeMessage',
        width: 480,
        render: text => (
          <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>{text}</div>
        ),
      });
    }
    return columns;
  };

  handleSearch = () => {
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const params = { ...values };
        if (params.rangeTimePicker) {
          const { rangeTimePicker } = params;
          for (let i = 0; i < rangeTimePicker.length; i++) {
            const name = i === 0 ? 'executDatetimeStart' : 'executDatetimeEnd';
            params[name] = rangeTimePicker[i].format('YYYY-MM-DD HH:mm:ss');
          }
        }
        delete params.rangeTimePicker;
        this.searchParams = params;
        this.setState({ pageIndex: 1 }, () => {
          this.getLogs();
        });
      }
    });
  };

  handleReset = () => {
    const { form } = this.props;
    form.resetFields();
    this.searchParams = {};
    this.setState({ pageIndex: 1 }, () => {
      this.getLogs();
    });
  };

  onDoubleClick = record => {
    const { onDoubleClick } = this.props;
    if (onDoubleClick) {
      onDoubleClick(record.sqlScript);
    }
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const {
      loading,
      pageIndex,
      pageSize,
      logs: {
        pageInfo: { total },
        rows,
      },
    } = this.state;
    const noLabelProps = { labelCol: { span: 1 }, wrapperCol: { span: 23 } };
    const maxHeight = pageSize * 120;
    return (
      <div style={{ padding: '0 15px' }}>
        <Form {...formItemLayout}>
          <Row>
            <Col xs={24} sm={12} md={7} xxl={7}>
              <FormItem {...noLabelProps}>
                {getFieldDecorator('rangeTimePicker')(
                  <RangePicker
                    style={{ width: '100%' }}
                    showTime={true}
                    format="YYYY-MM-DD HH:mm:ss"
                    suffixIcon={<MyIcon type="iconriqix" />}
                  />
                )}
              </FormItem>
            </Col>
            <Col xs={24} sm={12} md={3} xxl={4}>
              <FormItem {...noLabelProps}>
                {getFieldDecorator('userCode', {
                  initialValue: '',
                })(<Input placeholder={formatMessage({ id: 'USERMGR_USER_CODE' })} />)}
              </FormItem>
            </Col>
            <Col xs={24} sm={12} md={3} xxl={4}>
              <FormItem {...noLabelProps}>
                {getFieldDecorator('executeResult', {
                  initialValue: undefined,
                })(
                  <Select placeholder={formatMessage({ id: 'EXECUTE_RESULT' })}>
                    {EXECUTE_RESULT.map(result => (
                      <Select.Option key={result.value} value={result.value}>
                        {result.label}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col xs={24} sm={12} md={5} xxl={5}>
              <FormItem {...noLabelProps}>
                {getFieldDecorator('sqlScript', {
                  initialValue: '',
                })(<Input placeholder={formatMessage({ id: 'SCRIPT_CONTENT' })} />)}
              </FormItem>
            </Col>
            <Col xs={24} sm={12} md={6} xxl={4} style={{ textAlign: 'right' }}>
              <FormItem {...noLabelProps}>
                <Button
                  style={{ padding: '0 30px', color: '#00C1DE', border: '1px solid #00C1DE' }}
                  onClick={this.handleSearch}
                >
                  {formatMessage({ id: 'BTN_SEARCH' })}
                </Button>
                <Button style={{ padding: '0 30px', marginLeft: 10 }} onClick={this.handleReset}>
                  {formatMessage({ id: 'BTN_RESET' })}
                </Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
        <Table
          scroll={{ x: 1300, y: maxHeight }}
          loading={loading}
          columns={this.getColumns()}
          dataSource={rows}
          rowKey="logId"
          onRow={record => ({
            onDoubleClick: () => {
              this.onDoubleClick(record);
            },
          })}
          pagination={{
            current: pageIndex,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: getShowTotalText,
            pageSizeOptions: ['5', '10', '20'],
            onChange: this.paging,
            onShowSizeChange: this.paging,
          }}
        />
      </div>
    );
  }
}
export default SqlHistoryLogs;
