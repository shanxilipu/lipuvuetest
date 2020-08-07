import React from 'react';
import { Table } from 'antd';
import { formatMessage } from 'umi/locale';
import moment from 'moment';
import QueryConditions from '../../components/queryConditions';
import Pagination from '@/components/Pagination';
import { getCollectionAlarmInquireList } from '@/services/auditManagement/collectionAlarm';
import { LOGS_EVENT_TYPES } from '../../common/const';
import { defaultHandleResponse, extractSearchParams, checkLanguageIsEnglish } from '@/utils/utils';
import { storageFormatter } from '../../AuditConfig/CollectionAlarmConfig/helper';
import styles from '../../common/common.less';

const formatStr = 'YYYY-MM-DD HH:mm:ss';
const startDateTime = moment(
  moment()
    .add(-1, 'days')
    .format(formatStr)
);
const endDateTime = moment(moment().format(formatStr));
const defaultPageInfo = { pageIndex: 1, pageSize: 10, total: 0 };

class CollectionAlarmInquire extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: false,
      pageInfo: { ...defaultPageInfo },
    };
    this.columns = [
      {
        title: formatMessage({ id: 'collection.taskName', defaultMessage: '任务名称' }),
        dataIndex: 'taskName',
        className: 'model_table_ellipsis',
      },
      {
        title: formatMessage({ id: 'riskConfig.AlarmTime', defaultMessage: '告警时间' }),
        dataIndex: 'startTime',
        className: 'model_table_ellipsis',
        render: text => moment(text).format(formatStr),
      },
      {
        title: formatMessage({ id: 'collection.taskAcct', defaultMessage: '任务账期' }),
        dataIndex: 'taskDue',
        className: 'model_table_ellipsis',
      },
      {
        dataIndex: 'warnType',
        title: formatMessage({ id: 'riskConfig.alarmType', defaultMessage: '告警类型' }),
        className: 'model_table_ellipsis',
        render: type => {
          const obj = LOGS_EVENT_TYPES.find(o => o.value === type) || {};
          return obj.label || '';
        },
      },
      {
        title: formatMessage({ id: 'collection.dataTransSize', defaultMessage: '数据传输量' }),
        dataIndex: 'transSize',
        className: 'model_table_ellipsis',
        render: rows =>
          `${rows}${formatMessage({ id: 'alarmCollectionConfig.rows', defaultMessage: '行' })}${
            checkLanguageIsEnglish() && rows > 1 ? 's' : ''
          }`,
      },
      {
        title: formatMessage({ id: 'collection.dataStorageSize', defaultMessage: '数据存储量' }),
        dataIndex: 'storeSize',
        className: 'model_table_ellipsis',
        render: storageFormatter,
      },
    ];
    this.searchParams = { startTimeStart: startDateTime, startTimeEnd: endDateTime };
    this.searchArr = [
      {
        type: 'input',
        name: 'taskName',
        label: formatMessage({ id: 'collection.taskName', defaultMessage: '任务名称' }),
        colSpan: 6,
      },
      {
        type: 'input',
        name: 'taskDue',
        label: formatMessage({ id: 'collection.taskAcct', defaultMessage: '任务账期' }),
        colSpan: 6,
      },
      {
        type: 'select',
        name: 'warnType',
        label: formatMessage({ id: 'riskConfig.alarmType', defaultMessage: '告警类型' }),
        colSpan: 6,
        selArr: LOGS_EVENT_TYPES.map(o => ({ id: o.value, name: o.label })),
      },
      {
        type: 'rangePicker',
        name: 'startTime',
        defaultValue: [startDateTime, endDateTime],
        label: formatMessage({ id: 'riskConfig.AlarmTime', defaultMessage: '告警时间' }),
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
  }

  getChildCon = _this => {
    this.$childCondition = _this;
  };

  componentDidMount() {
    this.getData();
  }

  getData = (pageIndex = 1, pageSize = 10) => {
    const payload = { pageIndex, pageSize, ...this.searchParams };
    this.setState({ loading: true });
    getCollectionAlarmInquireList(payload).then(response => {
      this.setState({ loading: false });
      defaultHandleResponse(response, (resultObject = {}) => {
        const { pageInfo = { ...defaultPageInfo }, rows = [] } = resultObject;
        const data = rows.map((o, randomMarkId) => ({ ...o, randomMarkId }));
        this.setState({ pageInfo, data });
      });
    });
  };

  handleSearch = (params = {}) => {
    const { startTime } = params;
    if (startTime && startTime.length > 0) {
      const [startTimeStart, startTimeEnd] = startTime;
      params.startTimeStart = startTimeStart;
      params.startTimeEnd = startTimeEnd;
    }
    delete params.startTime;
    this.searchParams = { ...extractSearchParams(params) };
    this.getData();
  };

  handleReset = () => {
    this.handleSearch({
      startTime: [startDateTime, endDateTime],
    });
  };

  render() {
    const {
      loading,
      data,
      pageInfo: { pageIndex, pageSize, total },
    } = this.state;
    const pagination = {
      total,
      pageSize,
      current: pageIndex,
      onChange: this.getData,
      onShowSizeChange: this.getData,
    };
    return (
      <div className={styles.commonInquireCon}>
        <QueryConditions searchArr={this.searchArr} setChildCon={this.getChildCon} />
        <div className={styles.tableCon}>
          <Table
            loading={loading}
            columns={this.columns}
            dataSource={data}
            pagination={false}
            rowKey="randomMarkId"
          />
          <Pagination pageAllCount={data.length} pagination={pagination} />
        </div>
      </div>
    );
  }
}
export default CollectionAlarmInquire;
