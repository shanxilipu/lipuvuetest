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
const renderTextColumn = text =>
  text ? (
    <Tooltip title={text}>
      <span className="titleSpan">{text}</span>
    </Tooltip>
  ) : (
    '-'
  );
const executeTypes = [
  {
    id: '1',
    name: 'DDL',
  },
  {
    id: '2',
    name: 'DML',
  },
  {
    id: '3',
    name: 'DCL',
  },
  {
    id: '4',
    name: `${formatMessage({ id: 'auditManagement.ModifySensitiveAttr' })}`,
  },
];

@connect(({ sensitiveLogInquire, loading }) => ({
  pageSize: sensitiveLogInquire.pageSize,
  pageIndex: sensitiveLogInquire.pageIndex,
  rows: sensitiveLogInquire.rows,
  total: sensitiveLogInquire.total,
  queryForm: sensitiveLogInquire.form,
  loading: loading.effects['sensitiveLogInquire/search'],
}))
class SensitiveLogInquire extends Component {
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
        onchange: this.logSourceChange,
        defaultValue: '1',
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
        name: 'desensitiveFields',
        label: `${formatMessage({ id: 'auditManagement.desensitiveFields' })}`,
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
        type: 'select',
        name: 'executeType',
        label: `${formatMessage({ id: 'auditManagement.OperateType' })}`,
        colSpan: 6,
        selArr: executeTypes,
      },
      {
        type: 'input',
        name: 'executeCommand',
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
        title: () => {
          return (
            <span title={`${formatMessage({ id: 'auditManagement.systemName' })}`}>
              {formatMessage({ id: 'auditManagement.systemName' })}
            </span>
          );
        },
        dataIndex: 'systemName',
        width: '9%',
        className: 'model_table_ellipsis',
        render: renderTextColumn,
      },
      {
        title: () => {
          return (
            <span title={`${formatMessage({ id: 'auditManagement.OperateTime' })}`}>
              {formatMessage({ id: 'auditManagement.OperateTime' })}
            </span>
          );
        },
        dataIndex: 'executeDatetime',
        width: '10%',
        className: 'model_table_ellipsis',
        render: text => {
          return renderTextColumn(text ? moment(text).format(formatStr) : '');
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
        className: 'model_table_ellipsis',
        render: renderTextColumn,
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
        width: '9%',
        className: 'model_table_ellipsis',
        render: renderTextColumn,
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
        width: '9%',
        className: 'model_table_ellipsis',
        render: renderTextColumn,
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
        width: '9%',
        className: 'model_table_ellipsis',
        render: renderTextColumn,
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
        width: '9%',
        className: 'model_table_ellipsis',
        render: renderTextColumn,
      },
      {
        title: () => {
          return (
            <span title={`${formatMessage({ id: 'auditManagement.desensitiveFields' })}`}>
              {formatMessage({ id: 'auditManagement.desensitiveFields' })}
            </span>
          );
        },
        dataIndex: 'desensitiveFields',
        width: '9%',
        className: 'model_table_ellipsis',
        render: renderTextColumn,
      },
      {
        title: () => {
          return (
            <span title={`${formatMessage({ id: 'auditManagement.OperateType' })}`}>
              {formatMessage({ id: 'auditManagement.OperateType' })}
            </span>
          );
        },
        dataIndex: 'executeType',
        width: '9%',
        className: 'model_table_ellipsis',
        render: text => {
          let val = '';
          if (text) {
            const obj = executeTypes.find(o => o.id === text) || {};
            val = obj.name || '';
          }
          return renderTextColumn(val);
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
        width: '9%',
        className: 'model_table_ellipsis',
        render: renderTextColumn,
      },
    ];
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { form } = this.$childCondition.props;
    window.onresize = this.handleResize;
    const pageSize = this.getPageSize();
    const initExecuteDatetimeStart = moment(startDateTime).format(formatStr);
    const initExecuteDatetimeEnd = moment(endDateTime).format(formatStr);
    // 判断上次离开页面是否有正在查询的，有的话显示，没有的话查询前一天数据
    dispatch({
      type: 'sensitiveLogInquire/fetchResult',
    })
      .then(response => {
        const { resultCode, resultObject } = response;
        if (resultCode === '-1') {
          this.logSourceChange('1');
          // 没有正在查询的
          dispatch({
            type: 'sensitiveLogInquire/clearState',
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
            systemName = '',
            userCode = '',
            userName = '',
            databaseBelong = '',
            tablesBelong = '',
            sensitiveFields = '',
            desensitizeFields = '',
            executeDatetimeStart = null,
            executeDatetimeEnd = null,
            executeType = '',
            executeCommand = '',
          } = queryForm;
          this.logSourceChange(logSource);
          form.setFieldsValue({ logSource }, () => {
            let executDatetime = [moment(startDateTime), moment(endDateTime)];
            if (executeDatetimeStart) {
              executDatetime = [moment(executeDatetimeStart), moment(executeDatetimeEnd)];
            }
            form.setFieldsValue({
              systemName,
              userCode,
              userName,
              databaseBelong,
              tablesBelong,
              sensitiveFields,
              desensitizeFields,
              executDatetime,
              executeType,
              executeCommand,
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
        message.error('内部错误');
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
      type: 'sensitiveLogInquire/search',
      payload,
    })
      .then(response => {
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
      })
      .catch(() => {
        message.error('内部错误');
      });
  };

  fetchResult = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'sensitiveLogInquire/fetchResult',
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

  logSourceChange = val => {
    if (!val) {
      return false;
    }
    let flag = false;
    this.searchArr.forEach(item => {
      if (item.name === 'systemName') {
        flag = true;
      }
    });

    if (val !== '2' && flag) {
      this.searchArr.splice(1, 1);
    }
    if (val === '2' && !flag) {
      const addObj = {
        type: 'input',
        name: 'systemName',
        label: `${formatMessage({ id: 'auditManagement.systemName' })}`,
        colSpan: 6,
      };
      this.searchArr.splice(1, 0, addObj);
    }
    this.searchArr[this.searchArr.length - 1].colSpan = 24 - ((this.searchArr.length - 1) % 4) * 6;
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
      desensitiveFields,
      executDatetime,
      executeType,
      executeCommand,
    } = val;
    let executeDatetimeStart = '';
    let executeDatetimeEnd = '';
    if (executDatetime && executDatetime[0]) {
      executeDatetimeStart = moment(executDatetime[0]).format(formatStr);
      executeDatetimeEnd = moment(executDatetime[1]).format(formatStr);
    }
    const payload = {
      logSource,
      systemName,
      userCode,
      userName,
      databaseBelong,
      tablesBelong,
      sensitiveFields,
      desensitiveFields,
      executeDatetimeStart,
      executeDatetimeEnd,
      executeType,
      executeCommand,
      pageIndex: 1,
    };
    this.getComponentList(payload);
  };

  // 重置
  resetBtnClick = () => {
    const payload = {
      logSource: '1',
      systemName: '',
      userCode: '',
      userName: '',
      databaseBelong: '',
      tablesBelong: '',
      sensitiveFields: '',
      desensitizeFields: '',
      executeDatetimeStart: moment(startDateTime).format(formatStr),
      executeDatetimeEnd: moment(endDateTime).format(formatStr),
      executeType: '',
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
        {/* <PageHeader titleText={`${formatMessage({ id: 'auditManagement.SensitiveLogQuery' })}`} /> */}
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

export default SensitiveLogInquire;
