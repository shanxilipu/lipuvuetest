import React from 'react';
import { formatMessage } from 'umi/locale';
import moment from 'moment';
import { Button, Col, Form, Input, Row, DatePicker, Table, message } from 'antd';
import styles from './index.less';
import queryWaterMarksLog from './service';
import WaterMarkModal from './WaterMarkModal';

const { RangePicker } = DatePicker;
const formatStr = 'YYYY-MM-DD HH:mm:ss';
const startDateTime = moment(
  moment()
    .add(-1, 'days')
    .format(formatStr)
);
const endDateTime = moment(moment().format(formatStr));

@Form.create()
class WaterMarkInquire extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageIndex: 1,
      pageSize: 5,
      data: [],
      total: 0,
      loading: false,
      expandedRowKeys: [],
      selectedWaterMarkId: null,
    };
    this.searchParams = {
      createTimeStart: startDateTime.format(formatStr),
      createTimeEnd: endDateTime.format(formatStr),
    };
    this.columns = [
      {
        title: formatMessage({ id: 'waterMark.appCode' }),
        dataIndex: 'appCode',
        className: 'model_table_ellipsis',
      },
      {
        title: formatMessage({ id: 'waterMark.appName' }),
        dataIndex: 'appName',
        className: 'model_table_ellipsis',
      },
      {
        title: formatMessage({ id: 'waterMark.createTime' }),
        dataIndex: 'createTime',
        className: 'model_table_ellipsis',
        render: val => moment(val).format(formatStr),
      },
      {
        title: formatMessage({ id: 'USERMGR_USER_CODE' }),
        dataIndex: 'userCode',
        className: 'model_table_ellipsis',
      },
      {
        title: formatMessage({ id: 'USERMGR_USER_NAME' }),
        dataIndex: 'userName',
        className: 'model_table_ellipsis',
      },
      {
        title: formatMessage({ id: 'waterMark.type' }),
        dataIndex: 'typ',
        render: text => {
          if (!text) {
            return '';
          }
          const types = {
            '1': formatMessage({ id: 'waterMark.typeWeb' }),
            '2': formatMessage({ id: 'waterMark.typeFile' }),
          };
          return types[text] || formatMessage({ id: 'waterMark.typeElse' });
        },
        className: 'model_table_ellipsis',
      },
      {
        title: formatMessage({ id: 'waterMark.image' }),
        dataIndex: 'checkImg',
        render: (text, record) => (
          <a onClick={e => this.viewWaterMark(e, record)}>
            {formatMessage({ id: 'waterMark.view' })}
          </a>
        ),
      },
    ];
  }

  viewWaterMark = (e, record) => {
    e.stopPropagation();
    this.setState({ selectedWaterMarkId: record.id });
  };

  componentDidMount() {
    const pageSize = Math.floor(
      (window.innerHeight - 18 - this.formRef.clientHeight - 54 - 64) / 60
    );
    this.setState({ pageSize }, () => {
      this.getLogs();
    });
  }

  onPageChange = ({ current, pageSize }) => {
    this.setState(
      {
        pageIndex: current,
        pageSize,
      },
      () => {
        this.getLogs();
      }
    );
  };

  getLogs = () => {
    const { pageIndex, pageSize } = this.state;
    this.setState({ loading: true });
    const payload = { pageIndex, pageSize, ...this.searchParams };
    const keys = Object.keys(payload);
    keys.forEach(key => {
      if (typeof payload[key] === 'string' && !payload[key]) {
        delete payload[key];
      }
    });
    queryWaterMarksLog(payload).then(response => {
      this.setState({ loading: false });
      const { resultCode, resultMsg, resultObject } = response;
      if (resultCode === '0') {
        const {
          pageInfo: { total },
          rows,
        } = resultObject;
        this.setState({ total, data: rows });
      } else {
        message.error(resultMsg);
      }
    });
  };

  handleSearch = () => {
    const { form } = this.props;
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
        this.setState({ pageIndex: 1 }, () => {
          this.getLogs();
        });
      }
    });
  };

  handleReset = () => {
    const { form } = this.props;
    form.resetFields();
    this.handleSearch();
  };

  onExpandedRowsChange = expandedRowKeys => {
    this.setState({ expandedRowKeys });
  };

  getExpandedRowRender = record => {
    const { info } = record;
    if (!info) {
      return <div />;
    }
    return (
      <div className={styles.expendContentCon}>
        <div className={styles.expendItem}>
          <span className={styles.label}>{`${formatMessage({ id: 'waterMark.extraInfo' })}:`}</span>
        </div>
        <div className={styles.expendItem} style={{ marginLeft: 15 }}>
          {info.split('\n').map(o => (
            <div>{o}</div>
          ))}
        </div>
      </div>
    );
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const {
      pageIndex,
      pageSize,
      total,
      data,
      loading,
      expandedRowKeys,
      selectedWaterMarkId,
    } = this.state;
    const pagination = {
      total,
      pageSize,
      current: pageIndex,
      pageSizeOptions: ['10', '20', '30'],
      showSizeChanger: true,
    };
    return (
      <div className={`${styles.indexCon} smartsafeCon`}>
        {selectedWaterMarkId && (
          <WaterMarkModal
            logId={selectedWaterMarkId}
            onClose={() => this.setState({ selectedWaterMarkId: null })}
          />
        )}
        <div
          ref={ref => {
            this.formRef = ref;
          }}
        >
          <Form className={styles.alarmSmsSearchForm}>
            <Row>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={`${formatMessage({ id: 'waterMark.appCode' })}`}
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                >
                  {getFieldDecorator('appCode')(
                    <Input placeholder={`${formatMessage({ id: 'waterMark.appCode' })}`} />
                  )}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={`${formatMessage({ id: 'waterMark.appName' })}`}
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                >
                  {getFieldDecorator('appName')(
                    <Input placeholder={`${formatMessage({ id: 'waterMark.appName' })}`} />
                  )}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={`${formatMessage({ id: 'USERMGR_USER_CODE' })}`}
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                >
                  {getFieldDecorator('userCode')(
                    <Input placeholder={`${formatMessage({ id: 'USERMGR_USER_CODE' })}`} />
                  )}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={`${formatMessage({ id: 'USERMGR_USER_NAME' })}`}
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                >
                  {getFieldDecorator('userName')(
                    <Input placeholder={`${formatMessage({ id: 'USERMGR_USER_NAME' })}`} />
                  )}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={`${formatMessage({ id: 'waterMark.createTime' })}`}
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                >
                  {getFieldDecorator('rangeTimePicker', {
                    initialValue: [startDateTime, endDateTime],
                  })(<RangePicker showTime={true} format={formatStr} style={{ width: '100%' }} />)}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={18} style={{ textAlign: 'right' }}>
                <Button type="primary" onClick={this.handleSearch}>
                  {`${formatMessage({ id: 'auditManagement.Inquire' })}`}
                </Button>
                <Button style={{ marginLeft: 10 }} onClick={this.handleReset}>
                  {`${formatMessage({ id: 'auditManagement.Reset' })}`}
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
        <div className={styles.tableCon}>
          <Table
            loading={loading}
            columns={this.columns}
            dataSource={data}
            pagination={pagination}
            onChange={this.onPageChange}
            rowKey="id"
            expandRowByClick={true}
            onExpandedRowsChange={this.onExpandedRowsChange}
            expandedRowKeys={expandedRowKeys}
            expandedRowRender={this.getExpandedRowRender}
          />
        </div>
      </div>
    );
  }
}

export default WaterMarkInquire;
