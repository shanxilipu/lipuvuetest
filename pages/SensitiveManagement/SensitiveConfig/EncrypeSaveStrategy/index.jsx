import React, { Component } from 'react';
import { connect } from 'dva';
import { Tooltip, Button, Dropdown, Input, DatePicker, Modal, message } from 'antd';
import { debounce } from 'lodash-decorators';
import moment from 'moment';
import getLayoutPageSize from '@/utils/layoutUtils';
import MyIcon from '@/components/MyIcon';
import QueryConditions from '@/pages/AuditManagement/components/queryConditions';
import SelTable from '@/pages/AuditManagement/components/SelTable';
import DataSourceTree from '@/pages/AuditManagement/components/dataSourceTree';
import CreatEncrype from './creatEncrype';
import styles from './index.less';

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const stateArr = [
  {
    id: '1',
    name: '加密待执行',
  },
  {
    id: '2',
    name: '加密执行中',
  },
  {
    id: '3',
    name: '加密已完成',
  },
  {
    id: '4',
    name: '加密待取消',
  },
  {
    id: '5',
    name: '加密取消中',
  },
  {
    id: '6',
    name: '加密已取消',
  },
];

@connect(({ encrypeSaveStrategy, loading }) => ({
  pageSize: encrypeSaveStrategy.pageSize,
  pageIndex: encrypeSaveStrategy.pageIndex,
  rows: encrypeSaveStrategy.rows,
  total: encrypeSaveStrategy.total,
  senseLevels: encrypeSaveStrategy.senseLevels,
  loading: !!loading.effects['encrypeSaveStrategy/search'],
  upLoading: !!loading.effects['encrypeSaveStrategy/updateStorePolicyList'],
}))
class EncrypeSaveStrategy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      treeSelectedKeys: [],
      treeSelectedObj: {},
      visibleDropdown: false,
      selectedRows: [],
      showCreat: false,
      showExcuteTime: false,
      timeValue: null,
      setStatus: '',
      batchArr: [],
    };
    this.columns = [
      {
        title: '字段编码',
        dataIndex: 'fieldCode',
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
        title: '所属数据库',
        dataIndex: 'datasourceName',
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
        title: '所属表',
        dataIndex: 'tableCode',
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
        title: '敏感级别',
        dataIndex: 'levelName',
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
        title: '加密存储状态',
        dataIndex: 'state',
        width: '20%',
        className: 'model_table_ellipsis',
        render: val => {
          const act = stateArr.filter(item => {
            return item.id === val;
          });
          return act.length > 0 ? (
            <Tooltip title={act[0].name}>
              <span className="titleSpan">{act[0].name}</span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
      {
        title: '创建时间',
        dataIndex: 'createDatetime',
        width: '20%',
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
          return <span title="操作">操作</span>;
        },
        key: 'operator',
        width: '100px',
        render: record => {
          const { state } = record;
          return state === '6' ? (
            <span
              className={styles.operator}
              onClick={() => {
                this.setState({
                  setStatus: '1',
                  showExcuteTime: true,
                  timeValue: null,
                  batchArr: [record],
                });
              }}
            >
              重新开启
            </span>
          ) : state === '3' ? (
            <span
              className={styles.operator}
              onClick={() => {
                this.setState({
                  setStatus: '4',
                  showExcuteTime: true,
                  timeValue: null,
                  batchArr: [record],
                });
              }}
            >
              取消加密存储
            </span>
          ) : (
            '-'
          );
        },
      },
    ];
  }

  componentWillMount() {
    const { dispatch } = this.props;
    // 获取敏感级别,脱敏措施
    dispatch({
      type: 'encrypeSaveStrategy/qryDictionary',
    });
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
      type: 'encrypeSaveStrategy/clearState',
    });
  }

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
      height: conHeight - 37 - 25 - 30,
      itemHeight: 43,
      minPageSize: 5,
      maxRowMargin: 0,
    };
    const { count } = getLayoutPageSize(params);
    return count || 5;
  };

  // 获取列表
  getComponentList = (payload = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'encrypeSaveStrategy/search',
      payload,
    });
  };

  // 查询
  searchBtnClick = (val = {}) => {
    const { treeSelectedObj } = this.state;
    console.log(treeSelectedObj);
    const { datasourceId = '', code = '' } = treeSelectedObj;
    const { fieldCode, levelId, state } = val;
    const payload = {
      fieldCode,
      levelId,
      state,
      datasourceId,
      tableCode: code,
      pageIndex: 1,
    };
    this.getComponentList(payload);
  };

  // 重置
  resetBtnClick = () => {
    const payload = {
      fieldCode: '',
      levelId: '',
      state: '',
      datasourceId: '',
      tableCode: '',
      pageIndex: 1,
    };
    this.setState({
      treeSelectedObj: {},
      treeSelectedKeys: [],
    });
    this.getComponentList(payload);
  };

  // 分页查询
  handleTableChange = (pageIndex, pageSize) => {
    const { pageSize: prePageSize } = this.props;
    const param = {
      pageIndex,
      pageSize,
    };
    if (prePageSize !== pageSize) {
      param.pageIndex = 1;
    }
    this.getComponentList(param);
  };

  handleOk = () => {
    const { timeValue } = this.state;
    if (!timeValue) {
      message.error('请选择执行时间！');
      return false;
    }
    this.batchSet();
  };

  batchSet = () => {
    const { batchArr, setStatus, timeValue } = this.state;
    const { dispatch } = this.props;
    const params = batchArr.map(item => {
      return {
        state: setStatus,
        storePolicyId: item.storePolicyId,
        executeTime: moment(timeValue).format(DATE_TIME_FORMAT),
      };
    });
    dispatch({
      type: 'encrypeSaveStrategy/updateStorePolicyList',
      payload: {
        state: setStatus,
        params,
      },
    }).then((res = {}) => {
      const { resultCode } = res;
      if (resultCode === '0') {
        if (setStatus === '1') {
          message.success('开启成功！');
        } else {
          message.success('取消成功！');
        }
        this.setState(
          {
            selectedRows: [],
            showCreat: false,
            showExcuteTime: false,
            timeValue: null,
            setStatus: '',
            batchArr: [],
          },
          () => {
            this.getComponentList();
          }
        );
      }
    });
  };

  getSel = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRows,
    });
  };

  showModelFlag = (key, flag, refresh) => {
    this.setState({
      [key]: flag,
    });
    if (refresh) {
      this.getComponentList();
    }
  };

  handleTreeSelect = (selectedKeys, e) => {
    const {
      selected = true,
      node: { props = {} },
    } = e || {};
    if (!selected) {
      return false;
    }
    const { dataRef } = props;
    const { treeIndex } = dataRef;
    if (treeIndex === '2') {
      this.setState({
        treeSelectedKeys: selectedKeys,
        treeSelectedObj: dataRef,
        visibleDropdown: false,
      });
    }
  };

  handleVisibleChange = flag => {
    this.setState({ visibleDropdown: flag });
  };

  customarFun = () => {
    const { treeSelectedKeys, visibleDropdown, treeSelectedObj } = this.state;
    const { title = '' } = treeSelectedObj;
    const DropdownDom = (
      <DataSourceTree
        style={{ padding: '0 10px' }}
        selectedKeys={treeSelectedKeys}
        checkable={false}
        onSelect={this.handleTreeSelect}
        getTable={true}
        showSearch={true}
        showLoading={true}
      />
    );
    return (
      <div>
        <Dropdown
          overlay={DropdownDom}
          overlayClassName={styles.overlayDatasourceCon}
          visible={visibleDropdown}
          onVisibleChange={this.handleVisibleChange}
        >
          <Input
            placeholder="请选择"
            disabled={true}
            style={{ width: '100%' }}
            value={title}
            suffix={<MyIcon type="iconjiantou" />}
            onClick={() => {
              this.setState({
                visibleDropdown: true,
              });
            }}
          />
        </Dropdown>
      </div>
    );
  };

  disabledDate = current => {
    return current && current < moment().startOf('day');
  };

  render() {
    const { selectedRows, showCreat, showExcuteTime, timeValue } = this.state;
    const { rows, total, pageIndex, pageSize, loading, senseLevels, upLoading } = this.props;
    const data = {
      list: rows,
      pagination: {
        current: pageIndex,
        total,
        pageSize,
      },
    };

    const searchArr = [
      {
        type: 'input',
        name: 'fieldCode',
        label: '字段编码',
        colSpan: 5,
      },
      {
        type: 'customar',
        name: 'tableCode',
        label: '字段归属',
        colSpan: 5,
        customarFun: this.customarFun,
      },
      {
        type: 'select',
        name: 'levelId',
        label: '敏感级别',
        colSpan: 5,
        selArr: senseLevels,
      },
      {
        type: 'select',
        name: 'state',
        label: '加密存储状态',
        colSpan: 5,
        selArr: stateArr,
      },
      {
        type: 'button',
        searchBtnClick: this.searchBtnClick,
        resetBtnClick: this.resetBtnClick,
        colSpan: 4,
        isExpand: false,
      },
    ];

    return (
      <div className={`${styles.indexCon} smartsafeCon`}>
        <QueryConditions searchArr={searchArr} />
        <div className={styles.mainCon}>
          <div className={styles.btnCon}>
            <div>
              <Button
                type="default"
                onClick={() => {
                  if (selectedRows.length <= 0) {
                    message.error('请先勾选需要操作的字段');
                    return false;
                  }
                  this.setState({
                    setStatus: '4',
                    showExcuteTime: true,
                    timeValue: null,
                    batchArr: [...selectedRows],
                  });
                }}
              >
                批量取消加密
              </Button>
              <Button
                type="default"
                onClick={() => {
                  if (selectedRows.length <= 0) {
                    message.error('请先勾选需要操作的字段');
                    return false;
                  }
                  this.setState({
                    setStatus: '1',
                    showExcuteTime: true,
                    timeValue: null,
                    batchArr: [...selectedRows],
                  });
                }}
                style={{ marginLeft: '10px' }}
              >
                批量重新开启
              </Button>
            </div>
            <Button
              type="primary"
              className={styles.mr10}
              onClick={() => {
                this.setState({ showCreat: true });
              }}
            >
              添加加密存储
            </Button>
          </div>
          <div
            className={styles.tableCon}
            ref={c => {
              this.tableList = c;
            }}
          >
            <SelTable
              data={data}
              primaryKey="storePolicyId"
              onChange={this.handleTableChange}
              onGetSel={this.getSel}
              columns={this.columns}
              initVlaue={selectedRows}
              btnArr={false}
              isLoading={loading}
            />
          </div>
          {showCreat && <CreatEncrype showModel={showCreat} showModelFlag={this.showModelFlag} />}
          {showExcuteTime && (
            <Modal
              title="处理时间选择"
              visible={showExcuteTime}
              onCancel={() => {
                this.setState({ showExcuteTime: false });
              }}
              onOk={this.handleOk}
              confirmLoading={upLoading}
              bodyStyle={{ padding: '16px' }}
              className={styles.UpdataTime}
            >
              <div>
                <div className={styles.timeCon}>
                  <span className={styles.tip}>处理时间</span>
                  <DatePicker
                    showTime={true}
                    format={DATE_TIME_FORMAT}
                    disabledDate={this.disabledDate}
                    style={{ width: '400px', marginRight: '10px' }}
                    value={timeValue}
                    onChange={time => {
                      this.setState({ timeValue: time });
                    }}
                  />
                </div>
                <div style={{ color: 'red' }}>
                  <span className={styles.tip} />* 为了避免影响数据正常读取，请选择非忙时处理
                </div>
              </div>
            </Modal>
          )}
        </div>
      </div>
    );
  }
}

export default EncrypeSaveStrategy;
