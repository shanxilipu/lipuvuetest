import React from 'react';
import { Alert, Popover, Button, message, Tooltip } from 'antd';
import { formatMessage } from 'umi/locale';
import Modal from '@/components/Modal';
import MyIcon from '@/components/MyIcon';
import FieldList from './FieldList';
import ExtraForm from './ExtraForm';
import DetailList from '../DetailList';
import GroupTableSelector from '../../components/GroupTableSelector';
import { getKeysList } from '@/pages/storageSecurityMgr/services/encryptionKeysMgr';
import {
  saveStrategy,
  analyseEncryption,
  getSensitiveGroupedDatasource,
} from '@/pages/storageSecurityMgr/services/encryptionStrategy';
import { randomWord, defaultHandleResponse, getCommonPagedResponse } from '@/utils/utils';
import styles from './index.less';

const initialState = {
  selectedTable: {},
  refreshMark: null,
  scrollYMark: null,
  selectedField: null,
  analysisList: [],
  analysisSelectedRowKeys: {},
  analysisLoading: false,
  popoverVisible: false,
  confirmLoading: false,
  popoverTableListLoading: false,
};

class AddStrategyModal extends React.Component {
  constructor(props) {
    super(props);
    this.pageSize = 10;
    this.state = {
      treeData: [],
      ...initialState,
    };
  }

  componentDidMount() {
    getSensitiveGroupedDatasource().then(response => {
      defaultHandleResponse(response, resultObject => {
        const treeData = [];
        (resultObject || []).forEach(o => {
          const { groupId, groupName, datasources } = o;
          const index = treeData.findIndex(t => t.groupId === groupId);
          const children = datasources.map(d => ({
            ...d,
            groupId,
            isLeaf: true,
            key: `${d.datasourceId}`,
            title: d.datasourceSourceCode,
          }));
          if (index === -1) {
            treeData.push({
              groupId,
              groupName,
              title: groupName,
              key: `${groupId}`,
              children,
            });
          } else {
            const { children: originChildren } = treeData[index];
            treeData[index].children = originChildren.concat(children);
          }
        });
        this.setState({ treeData });
      });
    });
  }

  componentDidUpdate(prevProps) {
    const { visible: preV } = prevProps;
    const { visible } = this.props;
    if (preV && !visible) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ ...initialState });
    }
  }

  getPopoverContent = () => {
    const { treeData, popoverTableListLoading } = this.state;
    return (
      <div className={styles.popoverContent}>
        <GroupTableSelector
          isGetAllTable
          treeData={treeData}
          onSelectTable={this.selectTable}
          datasourceIdKey="datasourceId"
          datasourceCodeKey="datasourceSourceCode"
          tableListLoading={popoverTableListLoading}
        />
      </div>
    );
  };

  /**
   * 选择库表之前，需要判断库表有没有配置密钥
   * @param table
   */
  selectTable = table => {
    const { tableCode: genTabCode, datasourceCode: genDataSources } = table;
    this.setState({ popoverTableListLoading: true });
    getKeysList({ pageIndex: 1, pageSize: 999999, genTabCode, genDataSources }).then(response => {
      this.setState({ popoverTableListLoading: false });
      const { list } = getCommonPagedResponse(response);
      if (list && list.length) {
        this.setState({
          selectedTable: table,
          popoverVisible: false,
          analysisList: [],
          analysisSelectedRowKeys: {},
          refreshMark: randomWord(false, 8), // 清空右侧【包含同名字段的数据源表】
        });
      } else {
        message.error(
          formatMessage({
            id: 'storage.strategy.tableNoKeyError',
            defaultMessage: '当前库表未配置密钥',
          })
        );
      }
    });
  };

  getAnalysisRowKey = o => `${o.datasourceCode}.${o.tableCode}`;

  analyse = () => {
    const { selectedField, selectedTable } = this.state;
    const { groupId } = selectedTable;
    const { fieldId, fieldCode } = selectedField;
    const payload = { groupId, fieldId, fieldCode };
    this.setState({ analysisLoading: true });
    analyseEncryption(payload).then(response => {
      this.setState({ analysisLoading: false });
      defaultHandleResponse(response, resultObject => {
        const _selectedRowKeys = {};
        const analysisList = (resultObject || []).map(o => {
          const rowKey = this.getAnalysisRowKey(o);
          const { defaultSelected } = o;
          _selectedRowKeys[rowKey] = defaultSelected;
          return { ...o, rowKey };
        });
        this.setState({
          analysisList,
          analysisSelectedRowKeys: _selectedRowKeys,
          refreshMark: randomWord(false, 8), // 刷新右侧【包含同名字段的数据源表】
        });
      });
    });
  };

  getDetailListProps = () => {
    const {
      refreshMark,
      scrollYMark,
      analysisLoading,
      analysisList,
      analysisSelectedRowKeys,
    } = this.state;
    const rowKeys = Object.keys(analysisSelectedRowKeys);
    // analysisSelectedRowKeys 可能有true，可能有false。这里selectedRowKeys当然要过滤掉false的
    const selectedRowKeys = rowKeys.filter(rowKey => !!analysisSelectedRowKeys[rowKey]);
    return {
      refreshMark,
      scrollYMark,
      selectedRowKeys,
      loading: analysisLoading,
      data: analysisList,
      onSelectRow: this.onAnalysisSelectRow,
    };
  };

  onAnalysisSelectRow = selectedKeys => {
    const { analysisSelectedRowKeys } = this.state;
    const currentSelected = { ...analysisSelectedRowKeys };
    const allRowKeys = Object.keys(analysisSelectedRowKeys);
    allRowKeys.forEach(k => {
      currentSelected[k] = selectedKeys.includes(k);
    });
    this.setState({ analysisSelectedRowKeys: currentSelected });
  };

  handleSubmit = () => {
    const formValues = this.formRef.getValues();
    if (!formValues) {
      return false;
    }
    const { analysisList, analysisSelectedRowKeys } = this.state;
    const fields = analysisList.map(o => {
      const { rowKey, ...rest } = o;
      return { ...rest, defaultSelected: analysisSelectedRowKeys[rowKey] };
    });
    const payload = { ...formValues, fields };
    this.setState({ confirmLoading: true });
    saveStrategy(payload).then(response => {
      this.setState({ confirmLoading: false });
      defaultHandleResponse(response, () => {
        const { onOk, onCancel } = this.props;
        message.success(formatMessage({ id: 'COMMON_SAVE_SUCCESS', defaultMessage: '保存成功' }));
        onCancel();
        onOk();
      });
    });
  };

  render() {
    const { visible, onCancel } = this.props;
    const {
      scrollYMark,
      selectedTable,
      selectedField,
      analysisLoading,
      popoverVisible,
      analysisList,
      confirmLoading,
    } = this.state;
    const { groupId = '', tableId = '', tableCode = '' } = selectedTable;
    return (
      <Modal
        width={800}
        visible={visible}
        onCancel={onCancel}
        noCancelConfirmLoading
        onOk={this.handleSubmit}
        confirmLoading={confirmLoading}
        okButtonProps={{ disabled: !analysisList.length }}
        bodyStyle={{ paddingTop: 0, paddingBottom: 0 }}
        height={Math.max(window.innerHeight * 0.85, 500)}
        okText={formatMessage({ id: 'storage.strategy.savePlan', defaultMessage: '保存方案' })}
        title={formatMessage({
          id: 'storage.strategy.addTitle',
          defaultMessage: '新增加密存储策略',
        })}
      >
        <div className={styles.modal}>
          <div className={styles.top}>
            <Alert
              closable
              type="info"
              afterClose={() => this.setState({ scrollYMark: randomWord(false, 8) })}
              message={formatMessage({ id: 'storage.strategy.tips2' })}
            />
          </div>
          <div className={styles.main}>
            <div className={styles.left}>
              <div className={styles.title}>
                {formatMessage({
                  id: 'storage.strategy.tips3',
                  defaultMessage: '请从分组中选择包含敏感数据源表',
                })}
              </div>
              <div className={styles.leftSelection}>
                <Popover
                  trigger="click"
                  content={this.getPopoverContent()}
                  visible={popoverVisible}
                  onVisibleChange={v => this.setState({ popoverVisible: v })}
                  overlayClassName={styles.popoverOverlay}
                >
                  <div className={styles.popoverTrigger}>
                    <Tooltip
                      title={
                        selectedTable.tableCode ||
                        formatMessage({ id: 'COMMON_SELECT_PREFIX', defaultMessage: '请选择' })
                      }
                    >
                      <span className={selectedTable.tableCode ? '' : styles.invalidSelect}>
                        {selectedTable.tableCode ||
                          formatMessage({ id: 'COMMON_SELECT_PREFIX', defaultMessage: '请选择' })}
                      </span>
                    </Tooltip>
                    <MyIcon type="icondown" />
                  </div>
                </Popover>
              </div>
              <div className={styles.leftMain}>
                <div className={styles.userList}>
                  <FieldList
                    groupId={groupId}
                    tableId={tableId}
                    tableCode={tableCode}
                    scrollYMark={scrollYMark}
                    onSelectField={o => this.setState({ selectedField: o })}
                  />
                </div>
                <div className={styles.analyseRow}>
                  <Button
                    ghost
                    type="primary"
                    disabled={!selectedField}
                    loading={analysisLoading}
                    onClick={() => this.analyse(1)}
                  >
                    {formatMessage({
                      id: 'storage.strategy.encryptionAnalysis',
                      defaultMessage: '加密分析',
                    })}
                  </Button>
                </div>
              </div>
            </div>
            <div className={styles.right}>
              <div className={styles.title}>
                {formatMessage({
                  id: 'storage.strategy.sameNameFieldCodeTables',
                  defaultMessage: '包含同名字段的数据源表',
                })}
              </div>
              <DetailList className={styles.rightList} mode="new" {...this.getDetailListProps()} />
              <ExtraForm
                groupId={groupId}
                Ref={ref => {
                  this.formRef = ref;
                }}
              />
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}
export default AddStrategyModal;
