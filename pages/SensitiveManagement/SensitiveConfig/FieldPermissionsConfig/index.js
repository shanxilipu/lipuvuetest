import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import {
  Row,
  Col,
  Steps,
  Input,
  Tree,
  Switch,
  Select,
  Button,
  Table,
  Tooltip,
  Icon,
  message,
} from 'antd';
import DataSourceTree from '@/pages/AuditManagement/components/dataSourceTree';
import styles from './index.less';

const { Step } = Steps;
const { Search } = Input;
const { TreeNode } = Tree;
const { Option } = Select;

const isNiL = val => {
  return val === null || val === undefined;
};

@connect(({ fieldPermissionsConfig }) => ({ fieldPermissionsConfig }))
class FieldPermissionsConfig extends Component {
  constructor(props) {
    super(props);

    const {
      fieldPermissionsConfig: { tableDatasource },
    } = props;

    this.state = {
      expandedOperatorKeys: [],
      selectedOperators: [],
      selectedOperatorObj: {},
      selectedDatasources: [],
      selectedDatasourceObj: {},
      tableFieldCodeSearchText: '',
      tableDatasource: JSON.parse(JSON.stringify(tableDatasource)),
    };
    // 绑定this
    Object.keys(this.handles).forEach(fun => {
      this.handles[fun] = this.handles[fun].bind(this);
    }, this);

    const { dispatch } = props;
    dispatch({
      type: 'fieldPermissionsConfig/qryDictionary',
    });

    dispatch({
      type: 'fieldPermissionsConfig/getUserByComAcctId',
    });
  }

  config = () => {
    const {
      fieldPermissionsConfig: { senseLevels, senseMeasures },
    } = this.props;
    const { handleTableCellEdit } = this.handles;
    return {
      columns: [
        {
          title: `${formatMessage({
            id: 'FieldPermissionsConfig.FieldCode',
            defaultMessage: '字段编码',
          })}`,
          dataIndex: 'fieldCode',
          key: 'fieldCode',
          render: val => {
            return (
              <span
                style={{
                  width: '25%',
                  wordBreak: 'break-word',
                  wordWrap: 'break-word',
                }}
              >
                {val}
              </span>
            );
          },
        },
        {
          title: `${formatMessage({
            id: 'FieldPermissionsConfig.EnableDesensitization',
            defaultMessage: '启用脱敏',
          })}`,
          dataIndex: 'state',
          key: 'state',
          width: '25%',
          render: (val, record) => {
            return (
              <Switch
                checked={val === '1'}
                onChange={v => handleTableCellEdit(record, 'state', v ? '1' : '2')}
              />
            );
          },
        },
        {
          title: `${formatMessage({
            id: 'FieldPermissionsConfig.SensitivityLevel',
            defaultMessage: '敏感级别',
          })}`,
          dataIndex: 'levelId',
          key: 'levelId',
          width: '25%',
          render: (val, record) => {
            return (
              <Select
                style={{ width: 90 }}
                defaultValue={val}
                value={val}
                allowClear
                onChange={v => handleTableCellEdit(record, 'levelId', v)}
              >
                {senseLevels.map(o => (
                  <Option value={o.id}>{o.name}</Option>
                ))}
              </Select>
            );
          },
        },
        {
          title: `${formatMessage({
            id: 'FieldPermissionsConfig.DesensitizationMeasures',
            defaultMessage: '脱敏措施',
          })}`,
          dataIndex: 'desensitizeId',
          key: 'desensitizeId',
          width: '25%',
          render: (val, record) => {
            return (
              <Select
                style={{ width: 100 }}
                defaultValue={val}
                value={val}
                allowClear
                onChange={v => handleTableCellEdit(record, 'desensitizeId', v)}
              >
                {senseMeasures.map(o => (
                  <Option value={o.id}>{o.name}</Option>
                ))}
              </Select>
            );
          },
        },
      ],
    };
  };

  handles = {
    searchOperator: val => {
      const { dispatch } = this.props;
      dispatch({
        type: 'fieldPermissionsConfig/getUserByComAcctId',
        payload: {
          queryCode: val.trim(),
        },
      });
    },

    handleTreeSelect: (selectedKeys, e, key) => {
      const { dispatch } = this.props;
      let datasourceId = '';
      let tableId = '';
      let userId = '';
      const {
        tableFieldCodeSearchText,
        selectedOperators,
        selectedDatasources,
        selectedDatasourceObj,
      } = this.state;
      if (key === 'op') {
        this.setState({ selectedOperators: selectedKeys });
        if (selectedKeys.length === 0 || !selectedKeys[0]) {
          this.setState({ tableDatasource: [], selectedOperatorObj: {} });
          return;
        }
        this.setState({ selectedOperatorObj: e.node.props });

        if (selectedDatasources.length === 0 || !selectedDatasources[0]) {
          return;
        }
        if (selectedDatasourceObj.treeIndex !== '2') {
          this.setState({ tableDatasource: [] });
          return false;
        }
        // eslint-disable-next-line
        tableId = selectedDatasourceObj.tableId;
        // eslint-disable-next-line
        datasourceId = selectedDatasourceObj.datasourceId;
        [userId = ''] = selectedKeys;
      } else if (key === 'ds') {
        const { selectedOperatorObj } = this.state;
        const arr = Object.keys(selectedOperatorObj);
        if (arr.length === 0) {
          message.warning(
            `${formatMessage({
              id: 'FieldPermissionsConfig.SelectOperatorAccountTip',
              defaultMessage: '请先选择操作员账号!',
            })}`
          );
          return;
        }
        this.setState({ selectedDatasources: selectedKeys });
        if (selectedKeys.length === 0 || !selectedKeys[0]) {
          this.setState({ tableDatasource: [], selectedDatasourceObj: {} });
          return;
        }
        let dataRef = {};
        if (e) {
          const {
            node: { props = {} },
          } = e;
          // eslint-disable-next-line
          dataRef = props.dataRef;
          if (dataRef.treeIndex !== '2') {
            this.setState({ tableDatasource: [] });
            return false;
          }
        }
        this.setState({ selectedDatasourceObj: dataRef });
        if (selectedOperators.length === 0 || !selectedOperators[0]) {
          this.setState({ tableDatasource: [] });
          return;
        }
        // eslint-disable-next-line
        tableId = dataRef.tableId;
        // eslint-disable-next-line
        datasourceId = dataRef.datasourceId;
        [userId] = selectedOperators;
      }
      if (datasourceId && tableId && userId !== '') {
        dispatch({
          type: 'fieldPermissionsConfig/getTableSensitiveFieldList',
          payload: {
            datasourceId,
            tableId,
            fieldCode: tableFieldCodeSearchText,
            userId,
          },
        });
      }
    },

    handlePaste: userId => {
      const { dispatch } = this.props;
      const { copyUserId } = this;
      const { selectedDatasourceObj, tableFieldCodeSearchText } = this.state;
      if (copyUserId === undefined) {
        message.error(
          `${formatMessage({
            id: 'FieldPermissionsConfig.PleaseCopyFirst',
            defaultMessage: '请先复制!',
          })}`
        );
        return;
      }
      dispatch({
        type: 'fieldPermissionsConfig/copy',
        payload: {
          copyUserId,
          pasteUserId: userId,
        },
      }).then(code => {
        if (code === '0') {
          message.success(
            `${formatMessage({
              id: 'FieldPermissionsConfig.CopySuccessful',
              defaultMessage: '复制成功!',
            })}`
          );
          const { treeIndex, datasourceId, tableId: dataobjectId } = selectedDatasourceObj;
          if (treeIndex !== '2') {
            return;
          }

          dispatch({
            type: 'fieldPermissionsConfig/getTableSensitiveFieldList',
            payload: {
              datasourceId,
              tableId: dataobjectId,
              fieldCode: tableFieldCodeSearchText,
              userId,
            },
          });
        } else {
          message.error(
            `${formatMessage({
              id: 'FieldPermissionsConfig.CopyFailed',
              defaultMessage: '复制失败!',
            })}`
          );
        }
      });
    },

    handleSubmit: () => {
      const {
        tableDatasource,
        selectedOperators,
        selectedDatasourceObj,
        tableFieldCodeSearchText,
      } = this.state;
      // const updateDs = tableDatasource.filter(o => !(isNiL(o.levelId) || isNiL(o.desensitizeId)));
      const updateDs = tableDatasource;
      if (updateDs.length === 0) {
        return;
      }
      const { datasourceId, tableId: dataobjectId, treeIndex } = selectedDatasourceObj;
      if (treeIndex !== '2') {
        return;
      }
      const [userId] = selectedOperators;
      // set
      updateDs.forEach(o => {
        // if (isNiL(o.dataobjectId)) {
        o.datasourceId = datasourceId;
        o.dataobjectId = dataobjectId;
        // }
        if (isNiL(o.state)) {
          o.state = '2';
        }
        o.userId = userId;
      });
      const { dispatch } = this.props;
      dispatch({
        type: 'fieldPermissionsConfig/saveOrUpdateSensitiveField',
        payload: updateDs,
      }).then(() => {
        // refresh tableDatasource maybe unnecessary
        dispatch({
          type: 'fieldPermissionsConfig/getTableSensitiveFieldList',
          payload: {
            datasourceId,
            tableId: dataobjectId,
            fieldCode: tableFieldCodeSearchText,
            userId,
          },
        });
      });
    },

    handleTableSearchField: () => {
      const {
        selectedOperators,
        selectedDatasources,
        selectedDatasourceObj,
        tableFieldCodeSearchText,
      } = this.state;
      const { dispatch } = this.props;
      if (!selectedDatasources[0]) {
        message.error(
          `${formatMessage({
            id: 'FieldPermissionsConfig.NoDataTableSelected',
            defaultMessage: '未选择数据表',
          })}`
        );
        return;
      }
      const { datasourceId, tableId: dataobjectId, treeIndex } = selectedDatasourceObj;
      if (treeIndex !== '2') {
        return;
      }
      const [userId] = selectedOperators;
      dispatch({
        type: 'fieldPermissionsConfig/getTableSensitiveFieldList',
        payload: {
          datasourceId,
          tableId: dataobjectId,
          fieldCode: tableFieldCodeSearchText,
          userId,
        },
      });
    },

    handleTableCellEdit: (record, key, val) => {
      const { tableDatasource } = this.state;
      const {
        fieldPermissionsConfig: { senseLevels, senseMeasures },
      } = this.props;
      const alterObj = tableDatasource.filter(o => o.fieldCode === record.fieldCode)[0];
      if (key !== 'state' && alterObj.state === '1' && !val) {
        message.error(
          `${formatMessage({
            id: 'FieldPermissionsConfig.optionRequiredTip',
            defaultMessage: '启用脱敏时，该选项为必填项!',
          })}`
        );
        return;
      }
      alterObj[key] = val;
      if (key === 'state' && val === '1') {
        alterObj.levelId = senseLevels[0] && senseLevels[0].id;
        alterObj.desensitizeId = senseMeasures[0] && senseMeasures[0].id;
      }
      this.setState({ tableDatasource });
    },

    handleCancle: () => {
      const {
        fieldPermissionsConfig: { tableDatasource },
      } = this.props;
      this.setState({ tableDatasource });
    },
  };

  renderTreeNodes = data => {
    const self = this;
    const { selectedOperators } = this.state;
    const [selectedKey] = selectedOperators;
    return data.map(item => {
      if (item.children && item.children.length > 0) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          key={item.key}
          title={
            Number(selectedKey) === item.key ? (
              <div>
                <span>{item.title}</span>
                <div style={{ float: 'right' }}>
                  <Tooltip
                    placement="top"
                    title={formatMessage({
                      id: 'FieldPermissionsConfig.CopyUserInfo',
                      defaultMessage: '复制此用户信息',
                    })}
                  >
                    <Icon
                      type="copy"
                      style={{ marginRight: 5 }}
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        self.copyUserId = item.key;
                      }}
                    />
                  </Tooltip>
                  <Tooltip
                    placement="top"
                    title={formatMessage({
                      id: 'FieldPermissionsConfig.PasteUserInfo',
                      defaultMessage: '粘贴此用户信息',
                    })}
                  >
                    <Icon
                      type="file-text"
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.handles.handlePaste(item.key);
                      }}
                    />
                  </Tooltip>
                </div>
              </div>
            ) : (
              Number(selectedKey) != item.key && (
                <div>
                  <span>{item.title}</span>
                </div>
              )
            )
          }
          dataRef={item}
        />
      );
    });
  };

  componentWillReceiveProps(nextProps) {
    const {
      fieldPermissionsConfig: { tableDatasource },
    } = this.props;
    const {
      fieldPermissionsConfig: { tableDatasource: newTableDs },
    } = nextProps;
    if (tableDatasource !== newTableDs) {
      this.setState({ tableDatasource: JSON.parse(JSON.stringify(newTableDs)) });
    }
  }

  render() {
    const {
      expandedOperatorKeys,
      selectedOperators,
      selectedOperatorObj,
      selectedDatasources,
      selectedDatasourceObj,
      tableDatasource,
      tableFieldCodeSearchText,
    } = this.state;
    const {
      fieldPermissionsConfig: { operators },
    } = this.props;
    const {
      searchOperator,
      handleTreeSelect,
      handleSubmit,
      handleTableSearchField,
      handleCancle,
    } = this.handles;
    const config = this.config();
    return (
      <div className={styles.view}>
        <div className={styles.content}>
          <div className={styles.header}>
            <Row>
              <Col span={15} push={3}>
                <Steps
                  current={
                    Object.keys(selectedOperatorObj).length === 0
                      ? 0
                      : Object.keys(selectedDatasourceObj).length === 0
                      ? 1
                      : 2
                  }
                >
                  <Step />
                  <Step />
                  <Step />
                </Steps>
              </Col>
            </Row>
          </div>
          <div className={styles.tabs}>
            <div className={styles.operatorCon}>
              <span className={styles.require}>
                {formatMessage({
                  id: 'FieldPermissionsConfig.OperatorAccount',
                  defaultMessage: '操作员账号',
                })}
              </span>
              <Search
                placeholder={formatMessage({
                  id: 'FieldPermissionsConfig.searchKeyword',
                  defaultMessage: '搜索关键词',
                })}
                onSearch={searchOperator}
                enterButton
                style={{ padding: '0 10px' }}
              />
              <div className={styles.tree}>
                <Tree
                  expandedKeys={expandedOperatorKeys}
                  selectedKeys={selectedOperators}
                  onExpand={expandedKeys => this.setState({ expandedOperatorKeys: expandedKeys })}
                  onSelect={(keys, e) => handleTreeSelect(keys, e, 'op')}
                >
                  {this.renderTreeNodes(operators)}
                </Tree>
              </div>
            </div>
            <div className={styles.datasourceCon}>
              <span className={styles.require}>
                {formatMessage({
                  id: 'FieldPermissionsConfig.desensitizedSelectedTip',
                  defaultMessage: '请选择脱敏对象',
                })}
              </span>
              <DataSourceTree
                style={{ padding: '0 10px' }}
                selectedKeys={selectedDatasources}
                checkable={false}
                onSelect={(keys, e) => handleTreeSelect(keys, e, 'ds')}
                getTable={true}
                getView={true}
                showSearch={true}
              />
            </div>
            <div className={styles.tableCon}>
              <span className={styles.require}>
                {formatMessage({
                  id: 'FieldPermissionsConfig.desensitizationFieldSelectedTip',
                  defaultMessage: '请选择脱敏字段',
                })}
              </span>
              <div style={{ padding: '0 10px' }}>
                <div className={styles.selectedOperatorCon}>
                  <div className={styles.overflowTxt}>
                    {formatMessage({
                      id: 'FieldPermissionsConfig.AccountSelected',
                      defaultMessage: '已选择账号',
                    })}
                    ：
                    {selectedOperatorObj.dataRef
                      ? selectedOperatorObj.dataRef.title
                      : selectedOperatorObj.title}
                  </div>
                  <div className={styles.overflowTxt}>
                    {formatMessage({
                      id: 'FieldPermissionsConfig.SelectedObjects',
                      defaultMessage: '已选择对象',
                    })}
                    ：{selectedDatasourceObj.title}
                  </div>
                </div>
                <div style={{ padding: '10px 0' }}>
                  <Search
                    placeholder={formatMessage({
                      id: 'FieldPermissionsConfig.PleaseEnterFieldCode',
                      defaultMessage: '请输入字段编码',
                    })}
                    value={tableFieldCodeSearchText}
                    onChange={e => {
                      this.setState({ tableFieldCodeSearchText: e.target.value });
                    }}
                    onSearch={handleTableSearchField}
                  />
                </div>
              </div>
              <div className={styles.ra}>
                <Table
                  columns={config.columns}
                  dataSource={tableDatasource}
                  pagination={false}
                  rowKey="fieldCode"
                />
              </div>
              <div className={styles.rb}>
                <Button style={{ margin: '0 0 8px' }} type="primary" onClick={handleSubmit}>
                  {formatMessage({ id: 'COMMON_OK', defaultMessage: '确定' })}
                </Button>
                <Button onClick={handleCancle}>
                  {formatMessage({ id: 'COMMON_CANCEL', defaultMessage: '取消' })}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default FieldPermissionsConfig;
