import React, { Component } from 'react';
import { Tooltip, message } from 'antd';
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

@connect(({ hostLogInquire, loading }) => ({
  pageSize: hostLogInquire.pageSize,
  pageIndex: hostLogInquire.pageIndex,
  rows: hostLogInquire.rows,
  total: hostLogInquire.total,
  queryForm: hostLogInquire.form,
  loading: loading.effects['hostLogInquire/search'],
}))
class HostLogInquire extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fetchLoading: false,
    };
    this.searchArr = [
      {
        type: 'select',
        name: 'logSource',
        label: `${formatMessage({ id: 'auditManagement.LogSource' })}`,
        colSpan: 6,
        defaultValue: '1',
        selArr: [
          {
            id: 1,
            name: `${formatMessage({ id: 'auditManagement.RemoteControl' })}`,
          },
          {
            id: 2,
            name: `${formatMessage({ id: 'auditManagement.FTPOperation' })}`,
          },
        ],
      },
      {
        type: 'input',
        name: 'consoleName',
        label: `${formatMessage({ id: 'auditManagement.HostName' })}`,
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
        name: 'sourceIp',
        label: `${formatMessage({ id: 'auditManagement.SourceIp' })}`,
        colSpan: 6,
      },
      {
        type: 'input',
        name: 'consoleIp',
        label: `${formatMessage({ id: 'auditManagement.HostIP' })}`,
        colSpan: 6,
      },
      {
        type: 'input',
        name: 'consoleUserCode',
        label: `${formatMessage({ id: 'auditManagement.HostAccount' })}`,
        colSpan: 6,
      },
      {
        type: 'input',
        name: 'commandCode',
        label: `${formatMessage({ id: 'auditManagement.ExcuteOrder' })}`,
        colSpan: 6,
      },
      {
        type: 'rangePicker',
        name: 'executDatetime',
        defaultValue: [startDateTime, endDateTime],
        label: `${formatMessage({ id: 'auditManagement.OperateTime' })}`,
        colSpan: 6,
        allowClear: false,
      },
      {
        type: 'button',
        searchBtnClick: this.searchBtnClick,
        resetBtnClick: this.resetBtnClick,
        colSpan: 18,
        isExpand: true,
        handleResize: this.handleResize,
      },
    ];
    this.columns = [
      {
        title: () => {
          return (
            <span title={`${formatMessage({ id: 'auditManagement.LogSource' })}`}>
              {formatMessage({ id: 'auditManagement.LogSource' })}
            </span>
          );
        },
        dataIndex: 'logSource',
        width: '10%',
        className: 'model_table_ellipsis',
        render: val => {
          let text = '';
          if (`${val}` === '1') {
            text = `${formatMessage({ id: 'auditManagement.RemoteControl' })}`;
          } else if (`${val}` === '2') {
            text = `${formatMessage({ id: 'auditManagement.FTPOperation' })}`;
          }
          return val ? (
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
            <span title={`${formatMessage({ id: 'auditManagement.HostName' })}`}>
              {formatMessage({ id: 'auditManagement.HostName' })}
            </span>
          );
        },
        dataIndex: 'consoleName',
        width: '12%',
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
        width: '15%',
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
        width: '11%',
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
        width: '12%',
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
            <span title={`${formatMessage({ id: 'auditManagement.SourceIp' })}`}>
              {formatMessage({ id: 'auditManagement.SourceIp' })}
            </span>
          );
        },
        dataIndex: 'sourceIp',
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
      {
        title: () => {
          return (
            <span title={`${formatMessage({ id: 'auditManagement.HostIP' })}`}>
              {formatMessage({ id: 'auditManagement.HostIP' })}
            </span>
          );
        },
        dataIndex: 'consoleIp',
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
      {
        title: () => {
          return (
            <span title={`${formatMessage({ id: 'auditManagement.HostAccount' })}`}>
              {formatMessage({ id: 'auditManagement.HostAccount' })}
            </span>
          );
        },
        dataIndex: 'consoleUserCode',
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
      {
        title: () => {
          return (
            <span title={`${formatMessage({ id: 'auditManagement.ExcuteOrder' })}`}>
              {formatMessage({ id: 'auditManagement.ExcuteOrder' })}
            </span>
          );
        },
        dataIndex: 'commandCode',
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
    const { dispatch } = this.props;
    window.onresize = this.handleResize;
    const pageSize = this.getPageSize();
    const initExecuteDatetimeStart = moment(startDateTime).format(formatStr);
    const initExecuteDatetimeEnd = moment(endDateTime).format(formatStr);
    // 判断上次离开页面是否有正在查询的，有的话显示，没有的话查询前一天数据
    dispatch({
      type: 'hostLogInquire/fetchResult',
    })
      .then(response => {
        const { resultCode, resultObject } = response;
        if (resultCode === '-1') {
          // 没有正在查询的
          dispatch({
            type: 'hostLogInquire/clearState',
          });
          this.getComponentList({
            pageSize,
            executeDatetimeStart: initExecuteDatetimeStart,
            executeDatetimeEnd: initExecuteDatetimeEnd,
            logSource: '1',
          });
        } else {
          // 正在查询
          const { queryForm } = this.props;
          const {
            logSource = '',
            consoleName = '',
            userCode = '',
            userName = '',
            sourceIp = '',
            consoleIp = '',
            consoleUserCode = '',
            commandCode = '',
            executeDatetimeStart = null,
            executeDatetimeEnd = null,
            // commandScript = '',
          } = queryForm;
          const { form } = this.$childCondition.props;
          form.setFieldsValue({ logSource }, () => {
            let executDatetime = [moment(startDateTime), moment(endDateTime)];
            if (executeDatetimeStart) {
              executDatetime = [moment(executeDatetimeStart), moment(executeDatetimeEnd)];
            }
            form.setFieldsValue({
              logSource,
              consoleName,
              userCode,
              userName,
              sourceIp,
              consoleIp,
              consoleUserCode,
              commandCode,
              executDatetime,
              // commandScript,
            });
          });
          if (resultCode === '0' && resultObject === 1) {
            this.setState(
              {
                fetchLoading: true,
              },
              () => {
                this.fetchResult();
              }
            );
            this.timer = setInterval(() => {
              this.fetchResult();
            }, 2000);
          }
        }
      })
      .catch(() => {
        message.error(`${formatMessage({ id: 'auditManagement.InternalError' })}`);
      });
  }

  componentWillUnmount() {
    window.onresize = null;
    clearInterval(this.timer);
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

  // 获取日志列表
  getComponentList = payload => {
    const { dispatch } = this.props;
    dispatch({
      type: 'hostLogInquire/search',
      payload,
    }).then(response => {
      const { resultCode, resultObject } = response;
      if (resultCode === '0' && !resultObject) {
        this.setState(
          {
            fetchLoading: true,
          },
          () => {
            this.fetchResult();
          }
        );
        this.timer = setInterval(() => {
          this.fetchResult();
        }, 2000);
      }
    });
  };

  fetchResult = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'hostLogInquire/fetchResult',
    })
      .then(response => {
        const {
          resultCode,
          resultObject,
          resultMsg = `${formatMessage({ id: 'auditManagement.QueryFailed' })}`,
        } = response;
        if (resultCode === '0' && resultObject != 1) {
          this.setState({
            fetchLoading: false,
          });
          clearInterval(this.timer);
        } else if (resultCode !== '0') {
          this.setState({
            fetchLoading: false,
          });
          message.error(resultMsg);
          clearInterval(this.timer);
        }
      })
      .catch(() => {
        message.error(`${formatMessage({ id: 'auditManagement.InternalError' })}`);
        this.setState({
          fetchLoading: false,
        });
        clearInterval(this.timer);
      });
  };

  // 查询
  searchBtnClick = (val = {}) => {
    const {
      logSource,
      consoleName,
      userCode,
      userName,
      sourceIp,
      consoleIp,
      consoleUserCode,
      commandCode,
      executDatetime,
      // commandScript,
    } = val;
    let executeDatetimeStart = '';
    let executeDatetimeEnd = '';
    if (executDatetime && executDatetime[0]) {
      executeDatetimeStart = moment(executDatetime[0]).format(formatStr);
      executeDatetimeEnd = moment(executDatetime[1]).format(formatStr);
    }
    const payload = {
      logSource,
      consoleName,
      userCode,
      userName,
      sourceIp,
      consoleIp,
      consoleUserCode,
      commandCode,
      executeDatetimeStart,
      executeDatetimeEnd,
      // commandScript,
      pageIndex: 1,
    };
    this.getComponentList(payload);
  };

  // 重置
  resetBtnClick = () => {
    const payload = {
      logSource: '1',
      consoleName: '',
      userCode: '',
      userName: '',
      sourceIp: '',
      consoleIp: '',
      consoleUserCode: '',
      commandCode: '',
      executeDatetimeStart: moment(startDateTime).format(formatStr),
      executeDatetimeEnd: moment(endDateTime).format(formatStr),
      // commandScript: '',
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
          {`${formatMessage({ id: 'auditManagement.CommandScript' })}:`}
        </span>
        <div className={styles.expendContentMain}>
          {record.commandScript ? record.commandScript : '-'}
        </div>
      </div>
    );
  };

  getChildCon = _this => {
    this.$childCondition = _this;
  };

  render() {
    const { fetchLoading } = this.state;
    const { loading, rows, total, pageSize, pageIndex } = this.props;
    const pagination = {
      total,
      pageSize,
      current: pageIndex,
    };

    return (
      <div className={`${styles.indexCon} smartsafeCon`}>
        {/* <PageHeader titleText={`${formatMessage({ id: 'auditManagement.HostLogQuery' })}`} /> */}
        <QueryConditions searchArr={this.searchArr} setChildCon={this.getChildCon} />
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
            loading={loading || fetchLoading}
            pagination={pagination}
            handleTableChange={this.handleTableChange}
            rowKey="itemKey"
          />
        </div>
      </div>
    );
  }
}

export default HostLogInquire;
