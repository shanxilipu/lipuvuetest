import React, { Component } from 'react';
import { connect } from 'dva';
import { Tooltip, message, Modal, Alert, DatePicker, Card, Input, Dropdown, Spin } from 'antd';
import moment from 'moment';
import MyIcon from '@/components/MyIcon';
import DataSourceTree from '@/pages/AuditManagement/components/dataSourceTree';
import SelTable from '@/pages/AuditManagement/components/SelTable';
import { getTableSensitiveFieldList } from '@/services/sensitiveManagement/fieldDefinition';

import styles from './index.less';

const { Search } = Input;

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

@connect(({ encrypeSaveStrategy, loading }) => ({
  senseLevels: encrypeSaveStrategy.senseLevels,
  loading: !!loading.effects['encrypeSaveStrategy/insertSafeEncryptStorePolicy'],
}))
class CreatEncrype extends Component {
  constructor(props) {
    super(props);
    this.state = {
      treeSelectedKeys: [],
      treeSelectedObj: {},
      visibleDropdown: false,
      noSelRowsSearchStr: '',
      noSelRows: [],
      selectedNoSelRows: [],
      selRowsSearchStr: '',
      selRows: [],
      selectedSelRows: [],
      pageLoading: false,
      timeValue: null,
    };

    this.noSelColumns = [
      {
        title: '字段编码',
        dataIndex: 'code',
        width: '40%',
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
        key: 'levelId',
        width: '60%',
        className: 'model_table_ellipsis',
        render: (record = {}) => {
          const { sensitiveFieldDto = {} } = record || {};
          const { levelId = '' } = sensitiveFieldDto || {};
          const { senseLevels = [] } = this.props;
          let text = '';
          if (levelId || `${levelId}` === '0') {
            senseLevels.forEach(item => {
              if (item.id === levelId) {
                text = item.name;
              }
            });
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
    ];

    this.selColumns = [
      {
        title: '字段编码',
        dataIndex: 'code',
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
        title: '所属数据库',
        key: 'datasourceName',
        width: '30%',
        className: 'model_table_ellipsis',
        render: () => {
          const { treeSelectedObj } = this.state;
          const { datasourceName } = treeSelectedObj;
          return datasourceName ? (
            <Tooltip title={datasourceName}>
              <span className="titleSpan">{datasourceName}</span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
      {
        title: '所属表',
        dataIndex: 'tableName',
        width: '30%',
        className: 'model_table_ellipsis',
        render: () => {
          const { treeSelectedObj } = this.state;
          const { title } = treeSelectedObj;
          return title ? (
            <Tooltip title={title}>
              <span className="titleSpan">{title}</span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
      {
        title: '敏感级别',
        key: 'levelId',
        width: '20%',
        className: 'model_table_ellipsis',
        render: (record = {}) => {
          const { sensitiveFieldDto = {} } = record || {};
          const { levelId = '' } = sensitiveFieldDto || {};
          const { senseLevels = [] } = this.props;
          let text = '';
          if (levelId || `${levelId}` === '0') {
            senseLevels.forEach(item => {
              if (item.id === levelId) {
                text = item.name;
              }
            });
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
    ];
  }

  getTableSensitiveFieldList = () => {
    const { treeSelectedObj } = this.state;
    const { datasourceId, tableId } = treeSelectedObj;
    this.setState({
      pageLoading: true,
    });
    getTableSensitiveFieldList({
      datasourceId,
      fieldCode: '',
      tableId,
      isHideEncryptStore: 0,
    }).then((res = {}) => {
      this.setState({
        pageLoading: false,
      });
      const { resultCode, resultMsg = '', resultObject = [] } = res;
      if (resultCode === '0') {
        this.setState({
          noSelRows: resultObject || [],
          selectedNoSelRows: [],
          selRows: [],
          selectedSelRows: [],
        });
      } else {
        message.error(resultMsg);
      }
    });
  };

  disabledDate = current => {
    return current && current < moment().startOf('day');
  };

  hideModal = refresh => {
    const { showModelFlag } = this.props;
    if (showModelFlag) {
      showModelFlag('showCreat', false, refresh);
    }
  };

  handleOk = () => {
    const { selRows, timeValue: executeTime } = this.state;
    const { dispatch } = this.props;
    if (selRows.length <= 0) {
      message.error('请选择字段');
      return false;
    }
    if (!executeTime) {
      message.error('请选择执行时间');
      return false;
    }
    const params = selRows.map(item => {
      return {
        executeTime,
        fieldCode: item.code,
        sensitiveFieldId: item.sensitiveFieldDto ? item.sensitiveFieldDto.id : '',
      };
    });
    dispatch({
      type: 'encrypeSaveStrategy/insertSafeEncryptStorePolicy',
      payload: params,
    }).then((res = {}) => {
      const { resultCode } = res;
      if (resultCode === '0') {
        message.success('创建成功！');
        this.hideModal(true);
      }
    });
  };

  handleTreeSelect = (selectedKeys, e) => {
    const { treeSelectedObj = {} } = this.state;
    const { datasourceId, tableId } = treeSelectedObj;
    const {
      selected = true,
      node: { props = {} },
    } = e || {};
    if (!selected) {
      return false;
    }
    const { dataRef } = props;
    const { treeIndex, datasourceId: getDatasourceId, tableId: getTableId } = dataRef;
    if (treeIndex === '2') {
      if (datasourceId && datasourceId === getDatasourceId && tableId === getTableId) {
        return false;
      }
      this.setState(
        { treeSelectedKeys: selectedKeys, treeSelectedObj: dataRef, visibleDropdown: false },
        () => {
          this.getTableSensitiveFieldList();
        }
      );
    }
  };

  handleVisibleChange = flag => {
    this.setState({ visibleDropdown: flag });
  };

  getTitle = () => {
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
        <span>选择库表：</span>
        <Dropdown
          overlay={DropdownDom}
          overlayClassName={styles.overlayDatasourceCon}
          visible={visibleDropdown}
          onVisibleChange={this.handleVisibleChange}
        >
          <Input
            placeholder="请选择"
            disabled={true}
            style={{ width: '271px' }}
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

  getNoSel = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedNoSelRows: selectedRows,
    });
  };

  getSel = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedSelRows: selectedRows,
    });
  };

  setFiled = () => {
    const { noSelRows, selectedNoSelRows, selRows } = this.state;
    if (selectedNoSelRows.length <= 0) {
      message.error('请选择左边表格里要添加的字段！');
      return false;
    }
    const selKeyArr = selectedNoSelRows.map(item => {
      return item.id;
    });
    const newNoSelRows = noSelRows.filter(item => {
      return !selKeyArr.includes(item.id);
    });
    this.setState({
      noSelRows: newNoSelRows,
      selRows: selRows.concat(selectedNoSelRows),
      selectedNoSelRows: [],
    });
  };

  cancelFiled = () => {
    const { selRows, selectedSelRows, noSelRows } = this.state;
    if (selectedSelRows.length <= 0) {
      message.error('请选择右边表格里要取消的字段！');
      return false;
    }
    const noSelKeyArr = selectedSelRows.map(item => {
      return item.id;
    });
    const newSelRows = selRows.filter(item => {
      return !noSelKeyArr.includes(item.id);
    });
    this.setState({
      selRows: newSelRows,
      noSelRows: noSelRows.concat(selectedSelRows),
      selectedSelRows: [],
    });
  };

  render() {
    const {
      noSelRows,
      selectedNoSelRows,
      selRows,
      selectedSelRows,
      pageLoading,
      timeValue,
      noSelRowsSearchStr,
      selRowsSearchStr,
    } = this.state;
    const { showModel, loading } = this.props;

    const getNoSelRows = noSelRows.filter(item => {
      return item.code.indexOf(noSelRowsSearchStr) > -1;
    });

    const noSelData = {
      list: getNoSelRows,
      pagination: {
        current: 1,
        total: getNoSelRows.length,
        pageSize: 10000,
      },
    };

    const getSelRows = selRows.filter(item => {
      return item.code.indexOf(selRowsSearchStr) > -1;
    });

    const selData = {
      list: getSelRows,
      pagination: {
        current: 1,
        total: getSelRows.length,
        pageSize: 10000,
      },
    };

    return (
      <Modal
        title="添加加密存储字段"
        visible={showModel}
        onCancel={() => {
          this.hideModal();
        }}
        onOk={this.handleOk}
        width="940px"
        className={styles.CreatKeyCon}
        confirmLoading={loading}
        bodyStyle={{ padding: '16px' }}
      >
        <div>
          <Spin spinning={pageLoading}>
            <div className={styles.timeCon}>
              <span className={styles.tip}>加密存储初始化时间</span>
              <DatePicker
                showTime={true}
                format={DATE_TIME_FORMAT}
                disabledDate={this.disabledDate}
                style={{ width: '200px', marginRight: '10px' }}
                value={timeValue}
                onChange={time => {
                  this.setState({ timeValue: time });
                }}
              />
              <Alert
                style={{ flex: 1 }}
                message="为了避免影响数据正常读取，请选择非忙时初始化加密存储"
                type="info"
                showIcon
              />
            </div>
            <div className={styles.mainCon}>
              <div className={styles.noFiledCon}>
                <Card title={this.getTitle()} size="small" style={{ width: '100%' }}>
                  <div className={styles.tableOutCon}>
                    <div>
                      <Search
                        placeholder="请输入字段编码搜索"
                        onSearch={value => console.log(value)}
                        style={{ width: '100%' }}
                        value={noSelRowsSearchStr}
                        onChange={e => {
                          const { value } = e.target;
                          this.setState({
                            noSelRowsSearchStr: value,
                          });
                        }}
                      />
                    </div>
                    <div className={styles.tableCon}>
                      <SelTable
                        data={noSelData}
                        primaryKey="id"
                        onGetSel={this.getNoSel}
                        columns={this.noSelColumns}
                        initVlaue={selectedNoSelRows}
                        btnArr={false}
                      />
                    </div>
                  </div>
                </Card>
              </div>
              <div className={styles.btnCon}>
                <MyIcon type="icon-jiantou_yemian_xiangyou" onClick={this.setFiled} />
                <MyIcon type="icon-jiantou_yemian_xiangzuo" onClick={this.cancelFiled} />
              </div>
              <div className={styles.filedCon}>
                <Card
                  title={
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                      已选字段：
                    </div>
                  }
                  size="small"
                  style={{ width: '100%' }}
                >
                  <div className={styles.tableOutCon}>
                    <div>
                      <Search
                        placeholder="请输入字段编码搜索"
                        onSearch={value => console.log(value)}
                        style={{ width: '100%' }}
                        value={selRowsSearchStr}
                        onChange={e => {
                          const { value } = e.target;
                          this.setState({
                            selRowsSearchStr: value,
                          });
                        }}
                      />
                    </div>
                    <div className={styles.tableCon}>
                      <SelTable
                        data={selData}
                        primaryKey="id"
                        onGetSel={this.getSel}
                        columns={this.selColumns}
                        initVlaue={selectedSelRows}
                        btnArr={false}
                      />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </Spin>
        </div>
      </Modal>
    );
  }
}

export default CreatEncrype;
