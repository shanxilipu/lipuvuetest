import React, { Component } from 'react';
import { message, Table } from 'antd';
import { formatMessage } from 'umi/locale';
import moment from 'moment';
import QueryConditions from '../../components/queryConditions';
import Pagination from '@/components/Pagination';
import queryCollectionList from './service';
import { checkLanguageIsEnglish, extractSearchParams } from '@/utils/utils';
import { storageFormatter } from '../../AuditConfig/CollectionAlarmConfig/helper';
import commonStyles from '../../common/common.less';
import styles from './index.less';
// import PageHeader from '@/pages/AuditManagement/components/pageHeader';
// import CommonTable from '@/pages/AuditManagement/components/commonTable';

const formatStr = 'YYYY-MM-DD HH:mm:ss';
const startDateTime = moment(
  moment()
    .add(-1, 'days')
    .format(formatStr)
);
const endDateTime = moment(moment().format(formatStr));

const TASK_RESULTS = [
  { id: 'Normal', name: formatMessage({ id: 'collection.normal' }) },
  { id: 'Abnormal', name: formatMessage({ id: 'collection.abnormal' }) },
];

// const ACCT_TYPES = [
//   { id: 'realtime', name: formatMessage({ id: 'acct.realtime' }) },
//   { id: 'minute', name: formatMessage({ id: 'acct.minute' }) },
//   { id: 'hour', name: formatMessage({ id: 'acct.hour' }) },
//   { id: 'day', name: formatMessage({ id: 'acct.day' }) },
//   { id: 'month', name: formatMessage({ id: 'acct.month' }) },
//   { id: 'aperiodic', name: formatMessage({ id: 'acct.aperiodic' }) },
// ];

class CollectionLogInquire extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageIndex: 1,
      pageSize: 10,
      data: [],
      total: 0,
      loading: false,
      expandedRowKeys: [],
    };
    this.searchParams = { startTimeStart: startDateTime, startTimeEnd: endDateTime };
    this.searchArr = [
      {
        type: 'input',
        name: 'taskName',
        label: `${formatMessage({ id: 'collection.taskName' })}`,
        colSpan: 6,
      },
      {
        type: 'input',
        name: 'taskDue',
        label: `${formatMessage({ id: 'collection.taskAcct' })}`,
        colSpan: 6,
      },
      {
        type: 'input',
        name: 'transSize',
        label: `${formatMessage({ id: 'collection.dataTransSize' })}`,
        placeholder: `${formatMessage({ id: 'auditManagement.pleaseEnter' })}(${formatMessage({
          id: 'collection.unitRow',
        })})`,
        colSpan: 6,
      },
      {
        type: 'input',
        name: 'sourceIp',
        label: `${formatMessage({ id: 'collection.sourceIp' })}`,
        colSpan: 6,
      },
      {
        type: 'input',
        name: 'sourceDatabase',
        label: `${formatMessage({ id: 'collection.sourceSchemaCode' })}`,
        colSpan: 6,
      },
      {
        type: 'input',
        name: 'sourceTable',
        label: `${formatMessage({ id: 'collection.sourceTableCode' })}`,
        colSpan: 6,
      },
      {
        type: 'input',
        name: 'storeSize',
        label: `${formatMessage({ id: 'collection.dataStorageSize' })}`,
        placeholder: `${formatMessage({ id: 'auditManagement.pleaseEnter' })}(${formatMessage({
          id: 'collection.unitByte',
        })})`,
        colSpan: 6,
      },
      {
        type: 'input',
        name: 'targetIp',
        label: `${formatMessage({ id: 'collection.targetSchemaIp' })}`,
        colSpan: 6,
      },
      {
        type: 'input',
        name: 'targetDatabase',
        label: `${formatMessage({ id: 'collection.targetSchemaCode' })}`,
        colSpan: 6,
      },
      {
        type: 'input',
        name: 'targetTable',
        label: `${formatMessage({ id: 'collection.targetTableCode' })}`,
        colSpan: 6,
      },
      {
        type: 'select',
        name: 'taskResult',
        label: `${formatMessage({ id: 'collection.taskResult' })}`,
        colSpan: 6,
        selArr: [
          { id: '', name: formatMessage({ id: 'COMMON_ALL', defaultMessage: '全部' }) },
        ].concat(TASK_RESULTS),
      },
      {
        type: 'rangePicker',
        name: 'startTime',
        defaultValue: [startDateTime, endDateTime],
        label: `${formatMessage({ id: 'collection.startTime' })}`,
        colSpan: 6,
      },
      {
        type: 'button',
        searchBtnClick: this.handleSearch,
        resetBtnClick: this.handleReset,
        colSpan: 24,
        isExpand: true,
        // handleResize: this.toggleSearchArea,
      },
    ];
    this.columns = [
      {
        title: formatMessage({ id: 'collection.startTime', defaultMessage: '采集开始时间' }),
        dataIndex: 'startTime',
        width: '17%',
        className: 'model_table_ellipsis',
        render: text => moment(text).format(formatStr),
      },
      {
        title: formatMessage({ id: 'collection.taskName', defaultMessage: '任务名称' }),
        dataIndex: 'taskName',
        width: '17%',
        className: 'model_table_ellipsis',
      },
      {
        title: formatMessage({ id: 'collection.taskAcct', defaultMessage: '任务账期' }),
        dataIndex: 'taskDue',
        width: '17%',
        className: 'model_table_ellipsis',
      },
      {
        title: formatMessage({ id: 'collection.taskResult', defaultMessage: '采集任务结果' }),
        dataIndex: 'taskResult',
        width: '17%',
        className: 'model_table_ellipsis',
        render: val => {
          let text = '';
          TASK_RESULTS.forEach(o => {
            if (o.id === val) {
              text = o.name;
            }
          });
          if (!text) {
            return '';
          }
          if (val === 'Normal') {
            return text;
          }
          return (
            <div className={styles.abnormalCon}>
              <div />
              <div>{text}</div>
            </div>
          );
        },
      },
      {
        title: formatMessage({ id: 'collection.dataTransSize' }),
        dataIndex: 'transSize',
        width: '16%',
        className: 'model_table_ellipsis',
        render: rows =>
          `${rows}${formatMessage({ id: 'alarmCollectionConfig.rows', defaultMessage: '行' })}${
            checkLanguageIsEnglish() && rows > 1 ? 's' : ''
          }`,
      },
      {
        title: formatMessage({ id: 'collection.dataStorageSize' }),
        dataIndex: 'storeSize',
        width: '16%',
        className: 'model_table_ellipsis',
        render: storageFormatter,
      },
    ];
  }

  // toggleSearchArea = () => {
  //   this.getLogs();
  // };

  componentDidMount() {
    this.getLogs();
  }

  handleSearch = (params = {}) => {
    const { startTime } = params;
    if (startTime && startTime.length > 0) {
      const [startTimeStart, startTimeEnd] = startTime;
      params.startTimeStart = startTimeStart;
      params.startTimeEnd = startTimeEnd;
    }
    delete params.startTime;
    this.searchParams = { ...extractSearchParams(params) };
    this.getLogs();
  };

  handleReset = () => {
    this.handleSearch({
      startTime: [startDateTime, endDateTime],
    });
  };

  // 获取日志列表
  getLogs = (pageIndex = 1, pageSize = 10) => {
    this.setState({ loading: true });
    const payload = { pageIndex, pageSize, ...this.searchParams };
    const keys = Object.keys(payload);
    keys.forEach(key => {
      if (typeof payload[key] === 'string' && !payload[key]) {
        delete payload[key];
      }
    });
    queryCollectionList(payload).then(response => {
      this.setState({ loading: false });
      const { resultCode, resultMsg, resultObject } = response;
      if (resultCode === '0') {
        const {
          pageInfo: { total },
          rows,
        } = resultObject;
        this.setState({ total, data: rows, pageIndex, pageSize });
      } else {
        message.error(resultMsg);
      }
    });
  };

  getChildCon = _this => {
    this.$childCondition = _this;
  };

  onExpandedRowsChange = expandedRowKeys => {
    this.setState({ expandedRowKeys });
  };

  getExpandedRowRender = record => {
    const { sourceIp, sourceDatabase, sourceTable, targetIp, targetDatabase, targetTable } = record;
    return (
      <div>
        <div className={styles.expandedRow}>
          <div style={{ width: '32%' }}>
            <label>{formatMessage({ id: 'collection.sourceIp' })}</label>
            <span>{sourceIp}</span>
          </div>
          <div style={{ width: '28%', paddingLeft: 16 }}>
            <label>{formatMessage({ id: 'collection.sourceSchemaCode' })}</label>
            <span>{sourceDatabase}</span>
          </div>
          <div style={{ width: '40%', paddingLeft: 16 }}>
            <label>{formatMessage({ id: 'collection.sourceTableCode' })}</label>
            <span>{sourceTable}</span>
          </div>
        </div>
        <div className={styles.expandedRow}>
          <div style={{ width: '32%' }}>
            <label>{formatMessage({ id: 'collection.targetSchemaIp' })}</label>
            <span>{targetIp}</span>
          </div>
          <div style={{ width: '28%', paddingLeft: 16 }}>
            <label>{formatMessage({ id: 'collection.targetSchemaCode' })}</label>
            <span>{targetDatabase}</span>
          </div>
          <div style={{ width: '40%', paddingLeft: 16 }}>
            <label>{formatMessage({ id: 'collection.targetTableCode' })}</label>
            <span>{targetTable}</span>
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { data, total, loading, pageIndex, pageSize, expandedRowKeys } = this.state;
    const pagination = {
      total,
      pageSize,
      current: pageIndex,
      onChange: this.getLogs,
      onShowSizeChange: this.getLogs,
    };
    return (
      <div className={commonStyles.commonInquireCon}>
        {/* <PageHeader titleText={`${formatMessage({ id: 'auditManagement.SensitiveLogQuery' })}`} /> */}
        <QueryConditions searchArr={this.searchArr} setChildCon={this.getChildCon} />
        <div className={commonStyles.tableCon}>
          <Table
            loading={loading}
            columns={this.columns}
            dataSource={data}
            pagination={false}
            rowKey="id"
            expandRowByClick={true}
            onExpandedRowsChange={this.onExpandedRowsChange}
            expandedRowKeys={expandedRowKeys}
            expandedRowRender={this.getExpandedRowRender}
          />
          <Pagination pageAllCount={data.length} pagination={pagination} />
        </div>
      </div>
    );
  }
}

export default CollectionLogInquire;
