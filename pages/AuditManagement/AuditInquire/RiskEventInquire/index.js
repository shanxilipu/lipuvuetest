import React, { Component } from 'react';
import { Tooltip } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import moment from 'moment';
import { debounce } from 'lodash-decorators';
// import PageHeader from '@/pages/AuditManagement/components/pageHeader';
import QueryConditions from '@/pages/AuditManagement/components/queryConditions';
import CommonTable from '@/pages/AuditManagement/components/commonTable';
import getLayoutPageSize from '@/utils/layoutUtils';
import styles from './index.less';

const formatStr = 'YYYY-MM-DD HH:mm:ss';
const startDateTime = moment(
  moment()
    .add(-1, 'days')
    .format(formatStr)
);
const endDateTime = moment(moment().format(formatStr));
const riskType = [
  {
    id: 1,
    name: `${formatMessage({ id: 'riskConfig.NonWorkingTimeAccess' })}`,
  },
  {
    id: 2,
    name: `${formatMessage({ id: 'riskConfig.HighNumQueries' })}`,
  },
  {
    id: 3,
    name: `${formatMessage({ id: 'riskConfig.QueryBlockingData' })}`,
  },
  {
    id: 4,
    name: `${formatMessage({ id: 'riskConfig.DownloadSensitiveData' })}`,
  },
  {
    id: 5,
    name: `${formatMessage({ id: 'auditManagement.ModifySensitiveAttr' })}`,
  },
];

@connect(({ riskEventInquire, loading }) => ({
  pageSize: riskEventInquire.pageSize,
  pageIndex: riskEventInquire.pageIndex,
  rows: riskEventInquire.rows,
  total: riskEventInquire.total,
  loading: loading.models.riskEventInquire,
}))
class RiskEventInquire extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.searchArr = [
      {
        type: 'select',
        name: 'logSource',
        label: `${formatMessage({ id: 'auditManagement.EventSource' })}`,
        colSpan: 6,
        selArr: [
          {
            id: '1',
            name: `${formatMessage({ id: 'auditManagement.UnifiedPortal' })}`,
          },
          {
            id: '2',
            name: `${formatMessage({ id: 'auditManagement.OperateSystem' })}`,
          },
          {
            id: '3',
            name: `${formatMessage({ id: 'auditManagement.SensitiveFieldDefinition' })}`,
          },
        ],
      },
      {
        type: 'input',
        name: 'systemName',
        label: `${formatMessage({ id: 'auditManagement.systemName' })}`,
        colSpan: 6,
      },
      {
        type: 'input',
        name: 'userCode',
        label: `${formatMessage({ id: 'auditManagement.UserCode' })}`,
        colSpan: 6,
      },
      {
        type: 'input',
        name: 'userName',
        label: `${formatMessage({ id: 'auditManagement.UserName' })}`,
        colSpan: 6,
      },
      {
        type: 'input',
        name: 'databaseBelong',
        label: `${formatMessage({ id: 'auditManagement.BelongDatabase' })}`,
        colSpan: 6,
      },
      {
        type: 'input',
        name: 'tablesBelong',
        label: `${formatMessage({ id: 'auditManagement.BelongTable' })}`,
        colSpan: 6,
      },
      {
        type: 'input',
        name: 'sensitiveFields',
        label: `${formatMessage({ id: 'auditManagement.SensitiveFields' })}`,
        colSpan: 6,
      },
      {
        type: 'input',
        name: 'desensitizeFields',
        label: `${formatMessage({ id: 'auditManagement.desensitiveFields' })}`,
        colSpan: 6,
      },
      {
        type: 'rangePicker',
        name: 'executDatetime',
        defaultValue: [startDateTime, endDateTime],
        label: `${formatMessage({ id: 'auditManagement.OperateTime' })}`,
        colSpan: 6,
      },
      {
        type: 'select',
        name: 'riskTypeId',
        label: `${formatMessage({ id: 'auditManagement.EventType' })}`,
        colSpan: 6,
        selArr: riskType,
      },
      {
        type: 'input',
        name: 'executeCommand',
        resetBtnClick: this.resetBtnClick,
        label: `${formatMessage({ id: 'auditManagement.OperateOrder' })}`,
        colSpan: 6,
      },

      {
        type: 'button',
        searchBtnClick: this.searchBtnClick,
        resetBtnClick: this.resetBtnClick,
        colSpan: 6,
        isExpand: true,
        handleResize: this.handleResize,
      },
    ];
    this.columns = [
      {
        title: () => {
          return (
            <span title={`${formatMessage({ id: 'auditManagement.EventSource' })}`}>
              {formatMessage({ id: 'auditManagement.EventSource' })}
            </span>
          );
        },
        dataIndex: 'logSource',
        width: '10%',
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
          return text ? (
            <Tooltip title={text}>
              <span className="titleSpan">{text}</span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
      {
        title: () => {
          return (
            <span title={`${formatMessage({ id: 'auditManagement.systemName' })}`}>
              {formatMessage({ id: 'auditManagement.systemName' })}
            </span>
          );
        },
        dataIndex: 'systemName',
        width: '8%',
        className: 'model_table_ellipsis',
        render: text => {
          return text ? (
            <Tooltip title={text}>
              <span className="titleSpan">{text}</span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
      {
        title: () => {
          return (
            <span title={`${formatMessage({ id: 'auditManagement.OperateTime' })}`}>
              {formatMessage({ id: 'auditManagement.OperateTime' })}
            </span>
          );
        },
        dataIndex: 'executDatetime',
        width: '10%',
        className: 'model_table_ellipsis',
        render: text => {
          return text ? (
            <Tooltip title={moment(text).format(formatStr)}>
              <span className="titleSpan">{moment(text).format(formatStr)}</span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
      {
        title: () => {
          return (
            <span title={`${formatMessage({ id: 'auditManagement.UserCode' })}`}>
              {formatMessage({ id: 'auditManagement.UserCode' })}
            </span>
          );
        },
        dataIndex: 'userCode',
        width: '8%',
        className: 'model_table_word',
        render: text => {
          return text ? (
            <Tooltip title={text}>
              <span className="titleSpan">{text}</span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
      {
        title: () => {
          return (
            <span title={`${formatMessage({ id: 'auditManagement.UserName' })}`}>
              {formatMessage({ id: 'auditManagement.UserName' })}
            </span>
          );
        },
        dataIndex: 'userName',
        width: '8%',
        className: 'model_table_ellipsis',
        render: text => {
          return text ? (
            <Tooltip title={text}>
              <span className="titleSpan">{text}</span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
      {
        title: () => {
          return (
            <span title={`${formatMessage({ id: 'auditManagement.BelongDatabase' })}`}>
              {formatMessage({ id: 'auditManagement.BelongDatabase' })}
            </span>
          );
        },
        dataIndex: 'databaseBelong',
        width: '8%',
        className: 'model_table_ellipsis',
        render: text => {
          return text ? (
            <Tooltip title={text}>
              <span className="titleSpan">{text}</span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
      {
        title: () => {
          return (
            <span title={`${formatMessage({ id: 'auditManagement.BelongTable' })}`}>
              {formatMessage({ id: 'auditManagement.BelongTable' })}
            </span>
          );
        },
        dataIndex: 'tablesBelong',
        width: '8%',
        className: 'model_table_ellipsis',
        render: text => {
          return text ? (
            <Tooltip title={text}>
              <span className="titleSpan">{text}</span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
      {
        title: () => {
          return (
            <span title={`${formatMessage({ id: 'auditManagement.SensitiveFields' })}`}>
              {formatMessage({ id: 'auditManagement.SensitiveFields' })}
            </span>
          );
        },
        dataIndex: 'sensitiveFields',
        width: '8%',
        className: 'model_table_ellipsis',
        render: text => {
          return text ? (
            <Tooltip title={text}>
              <span className="titleSpan">{text}</span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
      {
        title: () => {
          return (
            <span title={`${formatMessage({ id: 'auditManagement.desensitiveFields' })}`}>
              {formatMessage({ id: 'auditManagement.desensitiveFields' })}
            </span>
          );
        },
        dataIndex: 'desensitizeFields',
        width: '8%',
        className: 'model_table_ellipsis',
        render: text => {
          return text ? (
            <Tooltip title={text}>
              <span className="titleSpan">{text}</span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
      {
        title: () => {
          return (
            <span title={`${formatMessage({ id: 'auditManagement.EventType' })}`}>
              {formatMessage({ id: 'auditManagement.EventType' })}
            </span>
          );
        },
        dataIndex: 'riskTypeId',
        width: '8%',
        className: 'model_table_ellipsis',
        render: val => {
          const getItem = riskType.filter(item => {
            return `${item.id}` === `${val}`;
          });
          const text = getItem && getItem.length > 0 ? getItem[0].name : '';
          return text ? (
            <Tooltip title={text}>
              <span className="titleSpan">{text}</span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
      {
        title: () => {
          return (
            <span title={`${formatMessage({ id: 'auditManagement.OperateOrder' })}`}>
              {formatMessage({ id: 'auditManagement.OperateOrder' })}
            </span>
          );
        },
        dataIndex: 'executeCommand',
        width: '8%',
        className: 'model_table_ellipsis',
        render: text => {
          return text ? (
            <Tooltip title={text}>
              <span className="titleSpan">{text}</span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
    ];
  }

  componentDidMount() {
    window.onresize = this.handleResize;
    const pageSize = this.getPageSize();
    const executDatetimeStart = moment(startDateTime).format(formatStr);
    const executDatetimeEnd = moment(endDateTime).format(formatStr);
    this.getComponentList({ pageSize, executDatetimeStart, executDatetimeEnd });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    window.onresize = null;
    dispatch({
      type: 'riskEventInquire/clearState',
    });
  }

  // 窗口变化监听事件
  @debounce(100)
  handleResize = () => {
    const { pageSize } = this.props;
    const nextSize = this.getPageSize();
    if (pageSize === nextSize) return;
    this.getComponentList({ pageSize: nextSize, pageIndex: 1 });
  };

  // 获取当前页面的列表条数
  getPageSize = () => {
    const conHeight = this.tableList.clientHeight;
    const params = {
      height: conHeight - 20 - 37 - 25 - 32,
      itemHeight: 43,
      minPageSize: 2,
      maxRowMargin: 0,
    };
    const { count } = getLayoutPageSize(params);
    return count || 2;
  };

  // 获取风险事件列表
  getComponentList = payload => {
    const { dispatch } = this.props;
    dispatch({
      type: 'riskEventInquire/search',
      payload,
    });
  };

  // 查询
  searchBtnClick = (val = {}) => {
    const {
      logSource,
      systemName,
      userCode,
      userName,
      databaseBelong,
      tablesBelong,
      sensitiveFields,
      desensitizeFields,
      executDatetime,
      riskTypeId,
      executeCommand,
    } = val;
    let executDatetimeStart = '';
    let executDatetimeEnd = '';
    if (executDatetime && executDatetime[0]) {
      executDatetimeStart = moment(executDatetime[0]).format(formatStr);
      executDatetimeEnd = moment(executDatetime[1]).format(formatStr);
    }
    const payload = {
      logSource,
      systemName,
      userCode,
      userName,
      databaseBelong,
      tablesBelong,
      sensitiveFields,
      desensitizeFields,
      executDatetimeStart,
      executDatetimeEnd,
      riskTypeId,
      executeCommand,
      pageIndex: 1,
    };
    this.getComponentList(payload);
  };

  // 重置
  resetBtnClick = () => {
    const payload = {
      logSource: '',
      systemName: '',
      userCode: '',
      userName: '',
      databaseBelong: '',
      tablesBelong: '',
      sensitiveFields: '',
      desensitizeFields: '',
      executDatetimeStart: moment(startDateTime).format(formatStr),
      executDatetimeEnd: moment(endDateTime).format(formatStr),
      riskTypeId: '',
      executeCommand: '',
      pageIndex: 1,
    };
    this.getComponentList(payload);
  };

  // 分页查询
  handleTableChange = pagination => {
    const { pageSize: prePageSize } = this.props;
    const { current: pageIndex, pageSize } = pagination;
    const param = {
      pageIndex,
      pageSize,
    };
    if (prePageSize !== pageSize) {
      param.pageIndex = 1;
    }
    this.getComponentList(param);
  };

  expendContent = record => {
    return (
      <div className={styles.expendContentCon}>
        <span className={styles.label}>
          {`${formatMessage({ id: 'auditManagement.DataScript' })}:`}
        </span>
        <div className={styles.expendContentMain}>{record.sqlScript ? record.sqlScript : '-'}</div>
      </div>
    );
  };

  render() {
    const { loading, rows, total, pageSize, pageIndex } = this.props;
    const pagination = {
      total,
      pageSize,
      current: pageIndex,
    };

    return (
      <div className={`${styles.indexCon} smartsafeCon`}>
        {/* <PageHeader titleText={`${formatMessage({ id: 'auditManagement.RiskEventInquiry' })}`} /> */}
        <QueryConditions searchArr={this.searchArr} />
        <div
          className={styles.tableCon}
          ref={c => {
            this.tableList = c;
          }}
        >
          <CommonTable
            columns={this.columns}
            expendDiv={true}
            expendContent={this.expendContent}
            list={rows}
            loading={loading}
            pagination={pagination}
            handleTableChange={this.handleTableChange}
            rowKey="itemKey"
          />
        </div>
      </div>
    );
  }
}

export default RiskEventInquire;
