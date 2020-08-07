import React, { Component, Fragment } from 'react';
import { formatMessage } from 'umi/locale';
import Modal from '@/components/Modal';
import { Checkbox, message, Spin } from 'antd';
import { getAllSafeDatabaseOperation } from './utils';
import DatasourceTree from '@/components/DatasourceTree';
import styles from './index.less';

const CheckboxGroup = Checkbox.Group;
const EXECUTE_TYPE_NAMES = {
  '1': 'DDL',
  '2': 'DML',
  '3': 'DCL',
};
const _initialState = {
  dataTypeList: {}, // 以executeType为key的对象，不同类型的操作集合
  checkedList: {}, // 以executeType为key的对象，不同操作类型的勾选集合
  checkedTables: [], // 勾选的表集合
  dataTypesLoading: false,
};

class TableOperationsAuth extends Component {
  constructor(props) {
    super(props);
    this.state = { ..._initialState };
  }

  componentWillReceiveProps(nextProps) {
    const { props } = this;
    if (!props.visible && nextProps.visible) {
      this.setState({ ..._initialState });
    }
  }

  // 查询权限操作命令表
  listAllSafeDatabaseOperation = (datasourceType = '') => {
    this.setState({ dataTypesLoading: true });
    getAllSafeDatabaseOperation(datasourceType).then(dataTypeList => {
      this.setState({ dataTypesLoading: false });
      this.setState({ dataTypeList });
    });
  };

  /**
   * 选中树节点的回调
   * @param selectedTreeKeys
   * @param dataRef
   */
  handleTreeSelect = (selectedTreeKeys, dataRef) => {
    const { getCheckedOperations } = this.props;
    if (selectedTreeKeys[0] === 'root') {
      return;
    }
    this.setState({ dataTypesLoading: true });
    getCheckedOperations(dataRef, (list, valueFieldName = 'executeId') => {
      const checkedList = {};
      list.forEach(o => {
        const { executeType } = o;
        if (!checkedList[executeType]) {
          checkedList[executeType] = [];
        }
        checkedList[executeType].push(o[valueFieldName]);
      });
      this.setState({ checkedList, dataTypesLoading: false });
    });
  };

  /**
   * 勾选树节点回调
   * @param checkedTreeKeys
   * @param e
   */
  handleTreeCheck = (checkedTreeKeys, e) => {
    const { checkedNodes } = e;
    const checkedTables = [];
    if (checkedNodes && checkedNodes.length > 0) {
      checkedNodes.forEach(item => {
        const {
          props: { dataRef = {} },
        } = item;
        if (dataRef.treeIndex === '2') {
          checkedTables.push(dataRef.tableId);
        }
      });
    }
    this.setState({ checkedTables });
  };

  onSpecifyCheckboxChange = (list, executeType) => {
    const { checkedList } = this.state;
    this.setState({ checkedList: { ...checkedList, [executeType]: list } });
  };

  onCheckboxAllChange = (checked, executeType) => {
    const { checkedList, dataTypeList } = this.state;
    const allList = (dataTypeList[executeType] || []).map(o => o.id);
    this.setState({ checkedList: { ...checkedList, [executeType]: checked ? allList : [] } });
  };

  checkSubmittable = () => {
    const { checkedList, checkedTables, dataTypeList } = this.state;
    if (!checkedTables.length) {
      return false;
    }
    const executeTypes = Object.keys(dataTypeList);
    let bool = false;
    for (let i = 0; i < executeTypes.length; i++) {
      const list = checkedList[executeTypes[i]];
      if (list && list.length) {
        bool = true;
      }
    }
    return bool;
  };

  handleSubmit = () => {
    const { checkedList, checkedTables } = this.state;
    if (!this.checkSubmittable()) {
      message.warning(
        formatMessage({
          id: 'ApplySysAuthorize.NoTableSelTip',
          defaultMessage: '未选择表或操作命令',
        })
      );
      return false;
    }
    const executeTypes = Object.keys(checkedList);
    let executeIds = [];
    executeTypes.forEach(executeType => {
      executeIds = executeIds.concat(checkedList[executeType] || []);
    });
    const payload = checkedTables.map(tableId => {
      return {
        tableId,
        executeIds,
      };
    });
    const { onOk } = this.props;
    onOk(payload);
  };

  /**
   * 数据源类型切换
   * 将勾选的表、勾选的操作都清空
   * @param value
   */
  onDatasourceTypeChange = value => {
    this.listAllSafeDatabaseOperation(value);
    this.setState({ checkedList: {}, checkedTables: [] });
  };

  render() {
    const { dataTypeList, checkedList, dataTypesLoading } = this.state;
    const { title, visible, onCancel, confirmLoading } = this.props;

    return (
      <Modal
        centerFooter
        title={title}
        width={1050}
        destroyOnClose
        // style={{ top: '25px' }}
        visible={visible}
        onCancel={onCancel}
        onOk={this.handleSubmit}
        confirmLoading={confirmLoading}
      >
        <div className={styles.container}>
          <div className={styles.body}>
            <div className={styles.datasourceCon}>
              <span className={styles.require}>
                {formatMessage({
                  id: 'ApplySysAuthorize.AllowedTablesOrViews',
                  defaultMessage: '允许访问的表/视图',
                })}
                :
              </span>
              <DatasourceTree
                getView
                getTable
                checkable
                showSearch
                showLoading
                style={{ padding: '0 10px' }}
                onCheck={this.handleTreeCheck}
                onSelect={this.handleTreeSelect}
                shouldUpdateProps={['checkable']}
                onDatasourceTypeChange={this.onDatasourceTypeChange}
              />
            </div>
            <div className={styles.tableCon}>
              <div className={styles.require}>
                {formatMessage({
                  id: 'ApplySysAuthorize.AllowedOperations',
                  defaultMessage: '允许执行的操作',
                })}
                :
              </div>
              <div className={styles.tableContent}>
                <Spin spinning={dataTypesLoading}>
                  {Object.keys(dataTypeList).map(executeType => {
                    let options = dataTypeList[executeType];
                    if (!options || !options.length) {
                      return '';
                    }
                    options = options.map(o => ({ label: o.executeCommand, value: o.id }));
                    const values = checkedList[executeType] || [];
                    return (
                      <Fragment key={executeType}>
                        <Checkbox
                          onChange={e => this.onCheckboxAllChange(e.target.checked, executeType)}
                          checked={!!values.length && values.length === options.length}
                          indeterminate={!!values.length && values.length < options.length}
                        >
                          {`${EXECUTE_TYPE_NAMES[executeType]} ${formatMessage({
                            id: 'OPERATE',
                            defaultMessage: '操作',
                          })}`}
                        </Checkbox>
                        <CheckboxGroup
                          value={values}
                          options={options}
                          className={styles.CheckboxGroup}
                          onChange={l => this.onSpecifyCheckboxChange(l, executeType)}
                        />
                      </Fragment>
                    );
                  })}
                </Spin>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

export default TableOperationsAuth;
