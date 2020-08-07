import React from 'react';
import { formatMessage } from 'umi/locale';
import Table from '@/components/Table';
import TaskState from './TaskState';
import CutoverScript from '../components/CutoverScript';
import { TO_BE_INITIALIZED, EXECUTED_FAILED } from './const';
import { getEncryptStoreTask } from '@/pages/storageSecurityMgr/services/encryptionStrategy';
import { getCommonPagedResponse } from '@/utils/utils';
import styles from './index.less';

const MODE_NEW = 'new';
const MODE_DETAIL = 'detail';

class DetailList extends React.Component {
  constructor(props) {
    super(props);
    const { mode, Ref } = props;
    if (Ref) {
      Ref(this);
    }
    this.scriptModalProps = {};
    this.state = {
      list: [],
      pageInfo: {},
      loading: false,
      showScriptModal: false,
    };
    const columns = [
      {
        ellipsis: true,
        dataIndex: mode === MODE_NEW ? 'datasourceType' : 'dataSourcesType',
        title: formatMessage({ id: 'datasource.type', defaultMessage: '数据源类型' }),
      },
      {
        ellipsis: true,
        dataIndex: mode === MODE_NEW ? 'datasourceCode' : 'genDataSources',
        title: formatMessage({ id: 'datasource.code', defaultMessage: '数据源编码' }),
      },
      {
        ellipsis: true,
        dataIndex: mode === MODE_NEW ? 'tableCode' : 'genTabCode',
        title: formatMessage({ id: 'TABLE_CODE', defaultMessage: '表编码' }),
      },
    ];
    if (mode === MODE_DETAIL) {
      columns.push(
        {
          ellipsis: true,
          dataIndex: 'initDatetime',
          title: formatMessage({
            id: 'storage.strategy.initialTime',
            defaultMessage: '初始化时间',
          }),
        },
        {
          dataIndex: 'state',
          title: formatMessage({
            id: 'storage.strategy.initializeState',
            defaultMessage: '初始化状态',
          }),
          render: state => <TaskState state={state} />,
        }
      );
    }
    columns.push({
      isActionColumn: true,
      dataIndex: 'action',
      title: formatMessage({ id: 'OPERATE', defaultMessage: '操作' }),
      render: (t, record) => {
        const showReInit = mode === MODE_DETAIL && this.rowSelectable(record);
        return (
          <div className="buttons-group">
            <a
              className={!record.script ? 'disabled' : ''}
              onClick={() => {
                const { script, tableCode, genTabCode } = record;
                this.scriptModalProps = {
                  script,
                  fileName: mode === MODE_DETAIL ? genTabCode : tableCode,
                };
                this.setState({ showScriptModal: true });
              }}
            >
              {formatMessage({ id: 'storage.encrypt.cutoverScript', defaultMessage: '割接脚本' })}
            </a>
            {showReInit && (
              <a onClick={() => this.handleSubmitInitTask(record)}>
                {formatMessage({
                  id: 'storage.strategy.submitInitTask',
                  defaultMessage: '提交初始化任务',
                })}
              </a>
            )}
          </div>
        );
      },
    });
    this.columns = columns;
  }

  componentDidUpdate(prevProps) {
    const { mode, refreshMark } = this.props;
    if (refreshMark !== prevProps.refreshMark) {
      if (mode === MODE_DETAIL) {
        // 重新提交初始化后，要刷新列表(维持当前pageIndex)
        this.handleRefreshPage();
      } else {
        this.getPagedPage(1);
      }
    }
  }

  handleRefreshPage = () => {
    const {
      pageInfo: { pageIndex = 1 },
    } = this.state;
    this.getPagedPage(pageIndex);
  };

  getPagedPage = (pageIndex, pageSize) => {
    const {
      pageInfo: { pageSize: pz = 10 },
    } = this.state;
    if (!pageSize) {
      pageSize = pz;
    }
    const { mode } = this.props;
    if (mode === MODE_NEW) {
      this.pageByMemoryData(pageIndex, pageSize);
    } else {
      this.getStoreTaskData(pageIndex, pageSize);
    }
  };

  getStoreTaskData = (pageIndex, pageSize) => {
    const { storeFieldId } = this.props;
    if (!storeFieldId) {
      return false;
    }
    this.setState({ loading: true });
    getEncryptStoreTask({ storeFieldId, pageIndex, pageSize }).then(response => {
      this.setState({ loading: false });
      const { list, pageInfo } = getCommonPagedResponse(response);
      if (list) {
        this.setState({ list, pageInfo });
      }
    });
  };

  pageByMemoryData = (pageIndex, pageSize) => {
    const { data } = this.props;
    // 新增策略的时候，加密分析的结果不分页查询，由前端分页
    if (!data.length) {
      this.setState({ list: [], pageInfo: { pageIndex: 1, pageSize, total: 0 } });
      return false;
    }
    const idx = (pageIndex - 1) * pageSize;
    const list = data.slice(idx, idx + pageSize);
    this.setState({ list, pageInfo: { pageIndex, pageSize, total: data.length } });
  };

  rowSelectable = record => {
    const { mode } = this.props;
    const { state, datasourceType = '', dataSourcesType = '' } = record;
    const dbType = mode === MODE_NEW ? datasourceType.toLowerCase() : dataSourcesType.toLowerCase();
    const isMysqlOracle = dbType.indexOf('mysql') > -1 || dbType.indexOf('oracle') > -1;
    if (mode === MODE_NEW) {
      return isMysqlOracle;
    }
    return [TO_BE_INITIALIZED, EXECUTED_FAILED].includes(state) && isMysqlOracle;
  };

  getSelectedRowKeys = () => {
    const { mode, selectedRowKeys: pKeys } = this.props;
    if (mode === MODE_NEW) {
      return pKeys;
    }
    const { selectedRowKeys } = this.state;
    return selectedRowKeys;
  };

  onSelectRow = selectedRowKeys => {
    const { mode, onSelectRow } = this.props;
    if (mode === MODE_NEW) {
      onSelectRow(selectedRowKeys);
    } else {
      this.setState({ selectedRowKeys });
    }
  };

  onSelectAll = (checked, rows) => {
    const rowKey = this.getRowKey();
    this.setState({ selectedRowKeys: rows.map(o => o[rowKey]) });
  };

  handleSubmitInitTask = record => {
    const { list, selectedRowKeys } = this.state;
    const { handleSubmitInitTask } = this.props;
    const rowKey = this.getRowKey();
    const rows = record ? [record] : list.filter(o => selectedRowKeys.includes(o[rowKey]));
    handleSubmitInitTask(rows);
  };

  getMultiButtonList = () => {
    const { mode } = this.props;
    if (mode === MODE_NEW) {
      return [];
    }
    return [
      {
        onClick: () => this.handleSubmitInitTask(),
        text: formatMessage({
          id: 'storage.strategy.submitInitTask',
          defaultMessage: '提交初始化任务',
        }),
      },
    ];
  };

  getRowKey = () => {
    const { mode } = this.props;
    return mode === MODE_NEW ? 'rowKey' : 'storeTaskId';
  };

  render() {
    const { list, pageInfo, loading, showScriptModal } = this.state;
    const {
      mode,
      loading: propLoading = false,
      scrollYMark,
      className = 'fullHeight',
    } = this.props;
    return (
      <div className={className}>
        <Table
          checkable
          rowKey={this.getRowKey()}
          dataSource={list}
          pagination={pageInfo}
          columns={this.columns}
          scrollYMark={scrollYMark}
          onChange={this.getPagedPage}
          onSelectRow={this.onSelectRow}
          onSelectAll={this.onSelectAll}
          loading={loading || propLoading}
          rowSelectable={this.rowSelectable}
          multiBtnList={this.getMultiButtonList()}
          selectedRowKeys={this.getSelectedRowKeys()}
          tableBoxClassName={mode === MODE_NEW ? styles.noPaddingTop : ''}
          paginationProps={{ showBorderTop: mode === MODE_DETAIL }}
        />
        <CutoverScript
          {...this.scriptModalProps}
          visible={showScriptModal}
          onCancel={() => this.setState({ showScriptModal: false })}
        />
      </div>
    );
  }
}
export default DetailList;
