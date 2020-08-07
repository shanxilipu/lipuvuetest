import React, { Component } from 'react';
import { Tooltip } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import moment from 'moment';
// import PageHeader from '@/pages/AuditManagement/components/pageHeader';
import QueryConditions from '@/pages/AuditManagement/components/queryConditions';
import CommonTable from '@/pages/AuditManagement/components/commonTable';
import getLayoutPageSize from '@/utils/layoutUtils';
import styles from './index.less';

const formatStr = 'YYYY-MM-DD HH:mm:ss';

@connect(({ operateLog, loading }) => ({
  pageSize: operateLog.pageSize,
  pageIndex: operateLog.pageIndex,
  rows: operateLog.rows,
  total: operateLog.total,
  loading: loading.models.operateLog,
}))
class OperateLog extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.searchArr = [
      {
        type: 'input',
        name: 'classnameCn',
        label: `${formatMessage({ id: 'auditManagement.OperatePage' })}`,
        colSpan: 6,
      },

      {
        type: 'input',
        name: 'methodCn',
        label: `${formatMessage({ id: 'auditManagement.OperateAction' })}`,
        colSpan: 6,
      },
      {
        type: 'rangePicker',
        name: 'operateData',
        label: `${formatMessage({ id: 'auditManagement.OperateTime' })}`,
        colSpan: 8,
      },
      {
        type: 'button',
        searchBtnClick: this.searchBtnClick,
        resetBtnClick: this.resetBtnClick,
        colSpan: 4,
      },
    ];
    this.columns = [
      {
        title: `${formatMessage({ id: 'auditManagement.OperatePage' })}`,
        dataIndex: 'classnameCn',
        width: '15%',
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
        title: `${formatMessage({ id: 'auditManagement.OperateAction' })}`,
        dataIndex: 'methodCn',
        width: '15%',
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
        title: `${formatMessage({ id: 'auditManagement.Log' })}`,
        dataIndex: 'lContent',
        width: '30%',
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
        title: `${formatMessage({ id: 'auditManagement.OperateTime' })}`,
        dataIndex: 'lTime',
        width: '15%',
        className: 'model_table_ellipsis',
        render: text => {
          return text ? (
            <Tooltip title={text}>
              <span className="titleSpan">{moment(text).format(formatStr)}</span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
      {
        title: `${formatMessage({ id: 'auditManagement.OperateIP' })}`,
        dataIndex: 'cusIp',
        width: '15%',
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
        title: `${formatMessage({ id: 'auditManagement.Operator' })}`,
        dataIndex: 'staffCode',
        width: '10%',
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
    this.getComponentList({ pageSize });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    window.onresize = null;
    dispatch({
      type: 'operateLog/clearState',
    });
  }

  // 窗口变化监听事件
  handleResize = () => {
    const { pageSize } = this.props;
    const nextSize = this.getPageSize();
    if (pageSize === nextSize) return;
    this.getComponentList({ pageSize, pageIndex: 1 });
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

  // 获取日志列表
  getComponentList = payload => {
    const { dispatch } = this.props;
    dispatch({
      type: 'operateLog/search',
      payload,
    });
  };

  // 查询
  searchBtnClick = (val = {}) => {
    const { classnameCn, methodCn, operateData } = val;
    let dateStart = '';
    let dateEnd = '';
    if (operateData && operateData[0]) {
      dateStart = moment(operateData[0]).format(formatStr);
      dateEnd = moment(operateData[1]).format(formatStr);
    }
    const payload = {
      classnameCn,
      methodCn,
      dateStart,
      dateEnd,
      pageIndex: 1,
    };
    this.getComponentList(payload);
  };

  // 重置
  resetBtnClick = () => {
    const payload = {
      classnameCn: '',
      methodCn: '',
      dateStart: '',
      dateEnd: '',
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

  render() {
    const { loading, rows, total, pageSize, pageIndex } = this.props;
    const pagination = {
      total,
      pageSize,
      current: pageIndex,
    };

    return (
      <div className={styles.indexCon}>
        {/* <PageHeader titleText={`${formatMessage({ id: 'auditManagement.OperateLog' })}`} /> */}
        <QueryConditions searchArr={this.searchArr} />
        <div
          className={styles.tableCon}
          ref={c => {
            this.tableList = c;
          }}
        >
          <CommonTable
            columns={this.columns}
            expendDiv={false}
            list={rows}
            loading={loading}
            pagination={pagination}
            handleTableChange={this.handleTableChange}
            rowKey="logId"
          />
        </div>
      </div>
    );
  }
}

export default OperateLog;
