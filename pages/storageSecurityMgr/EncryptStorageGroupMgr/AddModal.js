import React from 'react';
import { formatMessage } from 'umi/locale';
import { Alert, Spin, message } from 'antd';
import Modal from '@/components/Modal';
import Tree from '@/components/Tree';
import Search from '@/components/Search';
import Table from '@/components/Table';
import TransferBox from '@/components/TransferBox';
import CutoverScript from '../components/CutoverScript';
import {
  getGroupDatasourceList,
  getUnGroupedDatasource,
  insertDatasourceIntoGroup,
  deleteDatasourceFromGroup,
  getCutOverScriptOfDatasource,
} from '@/pages/storageSecurityMgr/services/encryptStorageGroupMgr';
import {
  getCommonPagedResponse,
  defaultHandleResponse,
  getPlaceholder,
  randomWord,
} from '@/utils/utils';
import styles from './index.less';

const initialState = {
  loading: false,
  pageInfo: {},
  treeMark: null,
  treeData: [],
  groupedDatasourceList: [],
  treeLoading: false,
  tableLoading: false,
  leftSelectedItem: {},
  rightSelectedRow: {},
  showScriptModal: false,
  scrollYMark: null, // 关闭提示后，table要重新计算scrollY
};

class AddModal extends React.Component {
  constructor(props) {
    super(props);
    this.scriptModalProps = {};
    this.state = { ...initialState };
    this.leftSearchCode = '';
    this.rightSearchCode = '';
    this.columns = [
      {
        width: '50%',
        dataIndex: 'dataSourcesCode',
        title: formatMessage({ id: 'datasource.code', defaultMessage: '数据源编码' }),
      },
      {
        dataIndex: 'dataSourcesType',
        title: formatMessage({ id: 'COMMON_TYPE', defaultMessage: '类型' }),
      },
      {
        dataIndex: 'action',
        title: formatMessage({ id: 'OPERATE', defaultMessage: '操作' }),
        render: (t, record) => (
          <span
            style={{ cursor: 'pointer' }}
            className={record.canBeDelete ? '' : 'disabled'}
            onClick={() => this.handleClickColumnDelete(record)}
          >
            {formatMessage({ id: 'COMMON_DELETE', defaultMessage: '删除' })}
          </span>
        ),
      },
    ];
  }

  componentWillReceiveProps(nextProps) {
    const { visible: preVisible } = this.props;
    if (!preVisible && nextProps.visible) {
      this.leftSearchCode = '';
      this.rightSearchCode = '';
      this.scriptModalProps = {};
      this.getTreeData();
    }
  }

  getTreeData = () => {
    const {
      activeTreeNode: { groupId },
    } = this.props;
    this.setState({ treeLoading: true });
    getUnGroupedDatasource({ groupId, datasourceCode: this.leftSearchCode }).then(response => {
      this.setState({ treeLoading: false });
      defaultHandleResponse(response, resultObject => {
        if (resultObject) {
          // { resultObject: [ { datasourceType: '', datasourceInfos: [{ datasourceCode: string, datasourceId: number, datasourceType: string, needScript: boolean }] }, {} ] }
          const treeData = resultObject.map(o => {
            const { datasourceType = '', datasourceInfos = [] } = o;
            return {
              title: datasourceType,
              key: `ROOT_KEY_${datasourceType}`,
              selectable: false,
              children: datasourceInfos.map(d => ({
                ...d,
                title: d.datasourceCode,
                key: `${d.datasourceId}`,
              })),
            };
          });
          this.setState({ treeData, leftSelectedItem: {}, treeMark: randomWord(false, 8) });
        }
      });
    });
  };

  handleSelectTreeNode = (ks, e) => {
    const {
      node: {
        props: { dataRef },
      },
    } = e;
    this.setState({ leftSelectedItem: dataRef });
  };

  renderLeftLineIcon = item => {
    const { selectable = true, needScript } = item;
    if (selectable && needScript) {
      return (
        <a className="primary-color" onClick={() => this.getScript(item)}>
          {formatMessage({
            id: 'storage.encrypt.viewCutoverScript',
            defaultMessage: '查看割接脚本',
          })}
        </a>
      );
    }
    return null;
  };

  reloadGroupedDatasource = () => {
    const {
      pageInfo: { pageSize },
    } = this.state;
    this.getGroupedDatasource(1, pageSize);
  };

  getGroupedDatasource = (pageIndex = 1, pageSize = 10) => {
    const {
      activeTreeNode: { groupId },
    } = this.props;
    this.setState({ tableLoading: true });
    getGroupDatasourceList({
      pageIndex,
      pageSize,
      groupId,
      dataSourcesCode: this.rightSearchCode,
    }).then(response => {
      this.setState({ tableLoading: false });
      const { list, pageInfo } = getCommonPagedResponse(response);
      if (list) {
        this.setState({ pageInfo, groupedDatasourceList: list, rightSelectedRow: {} });
      }
    });
  };

  handleClickColumnDelete = record => {
    const { canBeDelete } = record;
    if (!canBeDelete) {
      return false;
    }
    this.setState({ rightSelectedRow: record }, () => {
      this.handleTransfer(false);
    });
  };

  handleTransfer = toRight => {
    const {
      leftSelectedItem: { datasourceId, needScript },
      rightSelectedRow,
    } = this.state;
    const confirmText = toRight
      ? needScript
        ? formatMessage({
            id: 'storage.encrypt.confirmCutoverComplete',
            defaultMessage: '确认割接是否完成',
          })
        : ''
      : formatMessage({
          id: 'storage.encrypt.confirmDatasourceNoUse',
          defaultMessage: '确认数据源不再使用',
        });
    const onOk = () => {
      const { detailId, dataSourcesCode } = rightSelectedRow;
      const {
        reloadData,
        activeTreeNode: { groupId },
      } = this.props;
      const service = toRight ? insertDatasourceIntoGroup : deleteDatasourceFromGroup;
      const payload = toRight ? { datasourceId, groupId } : [{ detailId, dataSourcesCode }];
      this.setState({ loading: true });
      service(payload).then(response => {
        this.setState({ loading: false });
        defaultHandleResponse(response, () => {
          message.success(
            formatMessage({ id: 'COMMON_COMMAND_SUCCESS', defaultMessage: '操作成功' })
          );
          reloadData();
          this.getTreeData();
          this.reloadGroupedDatasource();
        });
      });
    };
    if (confirmText) {
      Modal.confirm({
        title: confirmText,
        onOk,
      });
    } else {
      onOk();
    }
  };

  getScript = item => {
    const { datasourceId, title } = item;
    const {
      activeTreeNode: { groupId },
    } = this.props;
    this.setState({ loading: true });
    getCutOverScriptOfDatasource({ datasourceId, groupId }).then(response => {
      this.setState({ loading: false });
      defaultHandleResponse(response, script => {
        this.scriptModalProps = { script, fileName: title };
        this.setState({ showScriptModal: true });
      });
    });
  };

  render() {
    const { visible, onCancel, activeTreeNode } = this.props;
    const {
      loading,
      pageInfo,
      treeData,
      treeMark,
      scrollYMark,
      treeLoading,
      tableLoading,
      leftSelectedItem,
      showScriptModal,
      groupedDatasourceList,
    } = this.state;
    const leftSelectedKeys = leftSelectedItem.key ? [leftSelectedItem.key] : [];
    return (
      <Modal
        width={800}
        destroyOnClose
        footer={false}
        visible={visible}
        onCancel={onCancel}
        bodyStyle={{ padding: 0 }}
        height={Math.max(window.innerHeight * 0.8, 500)}
        afterClose={() => this.setState({ ...initialState })}
        title={formatMessage({ id: 'BUTTON_ADD', defaultMessage: '新增' })}
      >
        <div className="fullHeight ub ub-ver">
          <Alert
            showIcon
            closable
            type="warning"
            message={formatMessage({ id: 'storage.encrypt.group.add.tips' })}
            afterClose={() => this.setState({ scrollYMark: randomWord(false, 8) })}
          />
          <div className={styles.selectedGroupRow}>
            <span>
              {formatMessage({ id: 'storage.encrypt.group.selected', defaultMessage: '已选分组:' })}
            </span>
            <span className="common-title">{activeTreeNode.title || ''}</span>
          </div>
          <div className={styles.transferCon}>
            <TransferBox
              bordered
              loading={loading}
              rightWidth="60%"
              showToLeftButton={false}
              transfer={this.handleTransfer}
              leftSelectedKeys={leftSelectedKeys}
              leftTitle={formatMessage({
                id: 'storage.encrypt.unGroupedDatasource',
                defaultMessage: '未分组数据源',
              })}
              rightTitle={formatMessage({
                id: 'storage.encrypt.groupedDatasource',
                defaultMessage: '已入组数据源',
              })}
              LeftComp={
                <Spin wrapperClassName="full-height-spin" spinning={treeLoading}>
                  <Tree
                    showSearch
                    highlightSearchBox
                    showIcon={false}
                    treeData={treeData}
                    treeMark={treeMark}
                    shouldUpdateProps={['treeMark']}
                    onSelect={this.handleSelectTreeNode}
                    renderLineIcon={this.renderLeftLineIcon}
                    searchBoxClass={styles.leftTreeSearchBox}
                    onAsyncSearch={code => {
                      this.leftSearchCode = code;
                      this.getTreeData();
                    }}
                    placeholder={getPlaceholder(
                      formatMessage({ id: 'datasource.code', defaultMessage: '数据源编码' })
                    )}
                  />
                </Spin>
              }
              RightComp={
                <div className="fullHeight ub ub-ver">
                  <Search
                    wrapperClassName={styles.rightSearchBox}
                    onSearch={val => {
                      this.rightSearchCode = val;
                      this.reloadGroupedDatasource();
                    }}
                    placeholder={getPlaceholder(
                      formatMessage({ id: 'datasource.code', defaultMessage: '数据源编码' })
                    )}
                  />
                  <div className="ub-f1">
                    <Table
                      rowKey="detailId"
                      pagination={pageInfo}
                      loading={tableLoading}
                      columns={this.columns}
                      dataSource={groupedDatasourceList}
                      scrollYMark={scrollYMark}
                      onChange={this.getGroupedDatasource}
                    />
                  </div>
                </div>
              }
            />
          </div>
        </div>
        <CutoverScript
          {...this.scriptModalProps}
          visible={showScriptModal}
          onCancel={() => this.setState({ showScriptModal: false })}
        />
      </Modal>
    );
  }
}
export default AddModal;
