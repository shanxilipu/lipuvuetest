import React, { Component } from 'react';
import { connect } from 'dva';
// import router from 'umi/router';
import { Tooltip, Form, Row, Col, Input, Select, DatePicker, Button, Table } from 'antd';
import { formatMessage } from 'umi/locale';
import moment from 'moment';
import AlarmSMSDetail from './AlarmSMSDetail';
import Pagination from '@/components/Pagination';
import { SEND_TYPES, SENSITIVE_EVENT_TYPES, LOGS_EVENT_TYPES } from '../../common/const';
import styles from './index.less';
import commonStyles from '../../common/common.less';

const { RangePicker } = DatePicker;
const formatStr = 'YYYY-MM-DD HH:mm:ss';
const startDateTime = moment(
  moment()
    .add(-1, 'days')
    .format(formatStr)
);
const endDateTime = moment(moment().format(formatStr));

const renderTextColumn = label =>
  label ? (
    <Tooltip title={label}>
      <span className="titleSpan">{label}</span>
    </Tooltip>
  ) : (
    '-'
  );

@Form.create()
@connect(({ alarmSMSInquire, loading }) => ({
  pageSize: alarmSMSInquire.pageSize,
  pageIndex: alarmSMSInquire.pageIndex,
  rows: alarmSMSInquire.rows,
  total: alarmSMSInquire.total,
  loading: loading.models.alarmSMSInquire,
}))
class AlarmSMSInquire extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDetailModal: false,
      searchEventTypeSelection: [],
    };
    this.currentItem = {};
    this.searchParams = {};
  }

  componentDidMount() {
    // window.onresize = this.handleResize;
    // const pageSize = this.getPageSize();
    const pageSize = 10;
    const createTimeStart = moment(startDateTime).format(formatStr);
    const createTimeEnd = moment(endDateTime).format(formatStr);
    this.getComponentList({ pageSize, createTimeStart, createTimeEnd });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    // window.onresize = null;
    dispatch({
      type: 'alarmSMSInquire/clearState',
    });
  }

  getColumns = () => [
    {
      title: formatMessage({ id: 'riskConfig.AlarmNumber', defaultMessage: '告警编号' }),
      dataIndex: 'uuid',
      className: 'model_table_ellipsis',
      render: renderTextColumn,
    },
    {
      title: formatMessage({ id: 'riskConfig.AlarmTime', defaultMessage: '告警时间' }),
      dataIndex: 'createTime',
      className: 'model_table_ellipsis',
      render: renderTextColumn,
    },
    {
      title: formatMessage({ id: 'auditManagement.EventType', defaultMessage: '事件类型' }),
      dataIndex: 'riskType',
      className: 'model_table_ellipsis',
      render: (val, record) => {
        const selection = this.getEventTypeSelection(record.warningType);
        const item = selection.find(o => o.value === val) || {};
        const { label } = item;
        return renderTextColumn(label);
      },
    },
    {
      title: formatMessage({ id: 'auditManagement.EventSource', defaultMessage: '事件来源' }),
      dataIndex: 'riskSource',
      className: 'model_table_ellipsis',
      render: val => {
        let text = '';
        if (`${val}` === '1') {
          text = `${formatMessage({ id: 'auditManagement.UnifiedPortal' })}`;
        } else if (`${val}` === '2') {
          text = `${formatMessage({ id: 'auditManagement.OperateSystem' })}`;
        } else {
          text = `${formatMessage({ id: 'auditManagement.SensitiveFieldDefinition' })}`;
        }
        return renderTextColumn(text);
      },
    },
    {
      dataIndex: 'sendType',
      title: formatMessage({ id: 'riskConfig.sendingWay', defaultMessage: '发送方式' }),
      className: 'model_table_ellipsis',
      render: sendType => {
        const obj = SEND_TYPES.find(o => o.value === sendType) || {};
        return renderTextColumn(obj.label || '');
      },
    },
    {
      title: `${formatMessage({ id: 'applySysUserManagement.Operate' })}`,
      dataIndex: 'action',
      className: 'model_table_ellipsis',
      render: (text, record) => (
        <a
          style={{ textDecoration: 'underline' }}
          onClick={() => {
            this.showDetail(record);
          }}
        >
          {formatMessage({ id: 'riskConfig.AlarmDetails' })}
        </a>
      ),
    },
  ];

  getEventTypeSelection = warningType => {
    if (!warningType) {
      return [];
    }
    return `${warningType}` === '1' ? SENSITIVE_EVENT_TYPES : LOGS_EVENT_TYPES;
  };

  handleReset = () => {
    const { form } = this.props;
    form.resetFields();
    this.handleSearch();
    this.setState({ searchEventTypeSelection: [] });
  };

  handleSearch = () => {
    const { form, pageSize } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const params = { ...values, createTimeStart: undefined, createTimeEnd: undefined };
        if (params.rangeTimePicker) {
          const { rangeTimePicker } = params;
          for (let i = 0; i < rangeTimePicker.length; i++) {
            const name = i === 0 ? 'createTimeStart' : 'createTimeEnd';
            params[name] = rangeTimePicker[i].format(formatStr);
          }
        }
        delete params.rangeTimePicker;
        this.searchParams = params;
        this.getComponentList({ pageSize, pageIndex: 1 });
      }
    });
  };

  // 获取短信列表
  getComponentList = params => {
    const { dispatch } = this.props;
    const payload = { ...params, ...this.searchParams };
    dispatch({
      type: 'alarmSMSInquire/search',
      payload,
    });
  };

  // 分页查询
  handleTableChange = (pageIndex, pageSize) => {
    const param = {
      pageIndex,
      pageSize,
    };
    this.getComponentList(param);
  };

  getExpandedContent = record => {
    return (
      <div className={styles.expandItem}>
        <span className={styles.label}>
          {`${formatMessage({ id: 'riskConfig.AlarmContent' })}:`}
        </span>
        <div className={styles.expendContentMain}>{record.content ? record.content : '-'}</div>
      </div>
    );
  };

  showDetail = record => {
    // const { warningType, riskIdArr } = record;
    // const pathname = `${warningType}` === '1'
    //   ? '/auditManagement/auditInquire/riskEventInquire'
    //   : '/auditManagement/auditInquire/collectionAlarmInquire';
    // if(THEME === 'bss') {
    //   router.push({
    //     pathname,
    //     query: {
    //       riskIdArr
    //     }
    //   });
    //   return false;
    // }
    // if(window.top !== window.self && window.parent) {
    //   const { href } = window.location;
    //   const url = `${href.substring(0, href.indexOf('/auditManagement/auditInquire/alarmSMSInquire'))}${pathname}`;
    //   window.parent.postMessage({
    //     type: 'openUrl',
    //     search: { riskIdArr },
    //     data: url,
    //   }, '*');
    // }
    this.currentItem = { ...record };
    this.setState({ showDetailModal: true });
  };

  handleSearchAlarmTypeChange = alarmType => {
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({
      warningType: undefined,
    });
    this.setState({ searchEventTypeSelection: this.getEventTypeSelection(alarmType) });
  };

  render() {
    const {
      loading,
      rows,
      total,
      pageSize,
      pageIndex,
      form: { getFieldDecorator },
    } = this.props;
    const pagination = {
      total,
      pageSize,
      current: pageIndex,
      onChange: this.handleTableChange,
      onShowSizeChange: this.handleTableChange,
    };
    const { showDetailModal, searchEventTypeSelection } = this.state;
    return (
      <div className={`${styles.indexCon} ${commonStyles.commonInquireCon}`}>
        <AlarmSMSDetail
          visible={showDetailModal}
          item={this.currentItem}
          onCancel={() => this.setState({ showDetailModal: false })}
        />
        <Form
          className={styles.alarmSmsSearchForm}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
        >
          <Row>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                label={formatMessage({ id: 'riskConfig.AlarmNumber', defaultMessage: '告警编号' })}
              >
                {getFieldDecorator('uuid')(
                  <Input
                    placeholder={formatMessage({
                      id: 'riskConfig.AlarmNumber',
                      defaultMessage: '告警编号',
                    })}
                  />
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                label={formatMessage({ id: 'riskConfig.alarmType', defaultMessage: '告警类型' })}
              >
                {getFieldDecorator('warningType', { initialValue: undefined })(
                  <Select
                    allowClear
                    placeholder={formatMessage({
                      id: 'riskConfig.alarmType',
                      defaultMessage: '告警类型',
                    })}
                    onChange={this.handleSearchAlarmTypeChange}
                  >
                    <Select.Option value={1}>
                      {formatMessage({ id: 'riskConfig.sensitiveAct', defaultMessage: '敏感操作' })}
                    </Select.Option>
                    <Select.Option value={2}>
                      {formatMessage({
                        id: 'riskConfig.logCollection',
                        defaultMessage: '日志采集',
                      })}
                    </Select.Option>
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                label={formatMessage({
                  id: 'auditManagement.EventType',
                  defaultMessage: '事件类型',
                })}
              >
                {getFieldDecorator('riskType', {
                  initialValue: undefined,
                })(
                  <Select
                    allowClear
                    placeholder={formatMessage({
                      id: 'auditManagement.EventType',
                      defaultMessage: '事件类型',
                    })}
                  >
                    {searchEventTypeSelection.map(o => (
                      <Select.Option key={o.value} value={o.value}>
                        {o.label}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                label={formatMessage({
                  id: 'auditManagement.EventSource',
                  defaultMessage: '事件来源',
                })}
              >
                {getFieldDecorator('riskSource', {
                  initialValue: undefined,
                })(
                  <Select
                    allowClear
                    placeholder={formatMessage({
                      id: 'auditManagement.EventSource',
                      defaultMessage: '事件来源',
                    })}
                  >
                    <Select.Option key="1" value="1">
                      {formatMessage({
                        id: 'auditManagement.UnifiedPortal',
                        defaultMessage: '统一门户',
                      })}
                    </Select.Option>
                    <Select.Option key="2" value="2">
                      {formatMessage({
                        id: 'auditManagement.OperateSystem',
                        defaultMessage: '应用系统',
                      })}
                    </Select.Option>
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                label={formatMessage({ id: 'riskConfig.AlarmContent', defaultMessage: '告警内容' })}
              >
                {getFieldDecorator('content')(
                  <Input
                    placeholder={formatMessage({
                      id: 'riskConfig.AlarmContent',
                      defaultMessage: '告警内容',
                    })}
                  />
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                label={formatMessage({ id: 'riskConfig.AlarmTime', defaultMessage: '告警时间' })}
              >
                {getFieldDecorator('rangeTimePicker', {
                  initialValue: [startDateTime, endDateTime],
                })(<RangePicker showTime={true} format={formatStr} style={{ width: '100%' }} />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                label={formatMessage({ id: 'riskConfig.sendingWay', defaultValue: '发送方式' })}
              >
                {getFieldDecorator('sendType', { initialValue: undefined })(
                  <Select
                    allowClear
                    placeholder={formatMessage({
                      id: 'riskConfig.sendingWay',
                      defaultValue: '发送方式',
                    })}
                  >
                    {SEND_TYPES.map(o => (
                      <Select.Option key={o.value} value={o.value}>
                        {o.label}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} style={{ textAlign: 'right' }}>
              <Button type="primary" onClick={this.handleSearch}>
                {`${formatMessage({ id: 'auditManagement.Inquire' })}`}
              </Button>
              <Button style={{ marginLeft: 10 }} onClick={this.handleReset}>
                {`${formatMessage({ id: 'auditManagement.Reset' })}`}
              </Button>
            </Col>
          </Row>
        </Form>
        <div className={commonStyles.tableCon}>
          <Table
            columns={this.getColumns()}
            // expendDiv={true}
            // expendContent={this.expendContent}
            onChange={this.handleTableChange}
            dataSource={rows}
            loading={loading}
            pagination={false}
            rowKey="id"
            expandedRowRender={this.getExpandedContent}
          />
          <Pagination pageAllCount={rows.length} pagination={pagination} />
        </div>
      </div>
    );
  }
}

export default AlarmSMSInquire;
